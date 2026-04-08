/**
 * Knowledge Base Ingestion Script
 *
 * Reads files (PDF, HTML, TXT, MD, JSON), chunks them, embeds with
 * all 3 providers, and stores in the knowledge_chunks table.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts <path-to-file-or-directory>
 *   npx tsx scripts/ingest.ts --drive              # pull from Google Drive folder
 *   npx tsx scripts/ingest.ts --drive --category food
 *
 * Supported formats:
 *   .json  — pre-structured array of { source, category, title, content, metadata? }
 *   .txt   — plain text, auto-chunked by paragraphs
 *   .md    — markdown, auto-chunked by paragraphs
 *   .html  — HTML, stripped to text, auto-chunked
 *   .pdf   — PDF, extracted to text, auto-chunked
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { resolve, extname, basename, join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { embedTextAllProviders } from '../src/lib/embeddings'

// ─── Types ────────────────────────────────────────────────────

interface SourceChunk {
  source: string
  category: string
  title: string
  content: string
  metadata?: Record<string, unknown>
}

// ─── Config ───────────────────────────────────────────────────

const CHUNK_MAX_CHARS = 1500
const CHUNK_OVERLAP = 200
const SUPPORTED_EXTENSIONS = ['.json', '.txt', '.md', '.html', '.htm', '.pdf']

// ─── Supabase client (service role) ───────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ─── Text chunking ────────────────────────────────────────────

function chunkText(text: string, source: string, category: string): SourceChunk[] {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0)

  const chunks: SourceChunk[] = []
  let buffer = ''
  let chunkIndex = 0

  for (const para of paragraphs) {
    if (buffer.length + para.length > CHUNK_MAX_CHARS && buffer.length > 0) {
      chunks.push({
        source,
        category,
        title: `${source} — chunk ${chunkIndex + 1}`,
        content: buffer.trim(),
      })
      buffer = buffer.slice(-CHUNK_OVERLAP) + '\n\n' + para
      chunkIndex++
    } else {
      buffer += (buffer ? '\n\n' : '') + para
    }
  }

  if (buffer.trim().length > 0) {
    chunks.push({
      source,
      category,
      title: `${source} — chunk ${chunkIndex + 1}`,
      content: buffer.trim(),
    })
  }

  return chunks
}

// ─── Format-specific parsers ──────────────────────────────────

async function extractTextFromPDF(filePath: string): Promise<string> {
  // pdf-parse v1 exports a single function
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
  const buffer = readFileSync(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

function extractTextFromHTML(raw: string): string {
  const { load } = require('cheerio') as typeof import('cheerio')
  const $ = load(raw)
  // Remove script and style tags
  $('script, style, nav, footer, header').remove()
  // Get text content, preserving some structure
  return $('body').text().replace(/\s{3,}/g, '\n\n').trim()
}

// ─── Parse a single file ──────────────────────────────────────

async function parseFile(filePath: string, category: string): Promise<SourceChunk[]> {
  const abs = resolve(filePath)
  const ext = extname(abs).toLowerCase()
  const source = basename(abs, ext)

  if (ext === '.json') {
    const raw = readFileSync(abs, 'utf-8')
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) throw new Error('JSON file must be an array of chunks')
    return data as SourceChunk[]
  }

  let text: string

  if (ext === '.pdf') {
    text = await extractTextFromPDF(abs)
  } else if (ext === '.html' || ext === '.htm') {
    const raw = readFileSync(abs, 'utf-8')
    text = extractTextFromHTML(raw)
  } else {
    // .txt, .md, or other text files
    text = readFileSync(abs, 'utf-8')
  }

  return chunkText(text, source, category)
}

// ─── Scan a directory for supported files ─────────────────────

function collectFiles(dirPath: string): string[] {
  const abs = resolve(dirPath)
  const entries = readdirSync(abs)
  const files: string[] = []

  for (const entry of entries) {
    const full = join(abs, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      files.push(...collectFiles(full))
    } else if (SUPPORTED_EXTENSIONS.includes(extname(entry).toLowerCase())) {
      files.push(full)
    }
  }

  return files
}

// ─── Google Drive fetcher ─────────────────────────────────────

async function fetchFromGoogleDrive(downloadDir: string): Promise<string[]> {
  const { google } = await import('googleapis')

  const keyPath = resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ?? './google-service-account.json')
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in .env.local')
  }

  console.log(`\n📁 Connecting to Google Drive folder: ${folderId}`)

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  const drive = google.drive({ version: 'v3', auth })

  // List files in the folder
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 100,
  })

  const files = res.data.files ?? []
  console.log(`   Found ${files.length} file(s) in Drive\n`)

  const downloaded: string[] = []

  for (const file of files) {
    const name = file.name ?? 'untitled'
    const mimeType = file.mimeType ?? ''
    const fileId = file.id!

    let outPath: string
    let content: Buffer | string

    if (mimeType === 'application/vnd.google-apps.document') {
      // Export Google Docs as plain text
      console.log(`   📝 Exporting Google Doc: ${name}`)
      const exported = await drive.files.export(
        { fileId, mimeType: 'text/plain' },
        { responseType: 'text' }
      )
      content = exported.data as string
      outPath = join(downloadDir, `${name}.txt`)
      writeFileSync(outPath, content, 'utf-8')
    } else if (
      mimeType === 'application/pdf' ||
      mimeType === 'text/plain' ||
      mimeType === 'text/html' ||
      mimeType === 'text/markdown' ||
      name.match(/\.(pdf|txt|md|html|htm|json)$/i)
    ) {
      // Download binary/text files directly
      console.log(`   ⬇️  Downloading: ${name}`)
      const downloaded_file = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      )
      content = Buffer.from(downloaded_file.data as ArrayBuffer)
      outPath = join(downloadDir, name)
      writeFileSync(outPath, content)
    } else {
      console.log(`   ⏭️  Skipping unsupported type: ${name} (${mimeType})`)
      continue
    }

    downloaded.push(outPath)
  }

  return downloaded
}

// ─── Embed and store chunks ───────────────────────────────────

async function ingestChunks(chunks: SourceChunk[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const label = `[${i + 1}/${chunks.length}] "${chunk.title}"`

    try {
      console.log(`⏳ Embedding ${label} ...`)
      const embeddings = await embedTextAllProviders(chunk.content)

      const { error } = await supabase.from('knowledge_chunks').insert({
        source: chunk.source,
        category: chunk.category,
        title: chunk.title,
        content: chunk.content,
        metadata: chunk.metadata ?? {},
        embedding_openai: embeddings.openai,
        embedding_hf: embeddings.huggingface,
        embedding_gte: embeddings.gte,
      })

      if (error) {
        console.error(`   ❌ DB error: ${error.message}`)
        failed++
      } else {
        console.log(`   ✅ Stored`)
        success++
      }
    } catch (err) {
      console.error(`   ❌ ${err instanceof Error ? err.message : err}`)
      failed++
    }
  }

  return { success, failed }
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const useDrive = args.includes('--drive')
  const categoryIdx = args.indexOf('--category')
  const category = categoryIdx !== -1 ? args[categoryIdx + 1] : 'general'

  let allChunks: SourceChunk[] = []

  if (useDrive) {
    // Fetch from Google Drive → temp directory → parse
    const tmpDir = resolve('.drive-downloads')
    const { mkdirSync } = await import('fs')
    mkdirSync(tmpDir, { recursive: true })

    const filePaths = await fetchFromGoogleDrive(tmpDir)
    console.log(`\n📄 Parsing ${filePaths.length} downloaded file(s)...\n`)

    for (const fp of filePaths) {
      try {
        const chunks = await parseFile(fp, category)
        console.log(`   ${basename(fp)}: ${chunks.length} chunk(s)`)
        allChunks.push(...chunks)
      } catch (err) {
        console.error(`   ❌ Failed to parse ${basename(fp)}: ${err instanceof Error ? err.message : err}`)
      }
    }
  } else {
    // Local file or directory
    const inputPath = args.find((a) => !a.startsWith('--'))
    if (!inputPath) {
      console.error('Usage:')
      console.error('  npx tsx scripts/ingest.ts <file-or-directory>')
      console.error('  npx tsx scripts/ingest.ts --drive [--category food]')
      process.exit(1)
    }

    const abs = resolve(inputPath)
    const stat = statSync(abs)

    if (stat.isDirectory()) {
      const files = collectFiles(abs)
      console.log(`\n📂 Found ${files.length} file(s) in ${inputPath}\n`)
      for (const fp of files) {
        try {
          const chunks = await parseFile(fp, category)
          console.log(`   ${basename(fp)}: ${chunks.length} chunk(s)`)
          allChunks.push(...chunks)
        } catch (err) {
          console.error(`   ❌ Failed to parse ${basename(fp)}: ${err instanceof Error ? err.message : err}`)
        }
      }
    } else {
      allChunks = await parseFile(abs, category)
    }
  }

  console.log(`\n── Total: ${allChunks.length} chunk(s) to embed ──\n`)

  if (allChunks.length === 0) {
    console.log('Nothing to ingest.')
    return
  }

  const { success, failed } = await ingestChunks(allChunks)

  console.log(`\n── Done ──────────────────────────`)
  console.log(`   ✅ ${success} inserted`)
  if (failed > 0) console.log(`   ❌ ${failed} failed`)
  console.log()
}

main()
