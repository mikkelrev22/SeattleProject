/**
 * Embedding Provider Comparison Script
 *
 * Runs the same query against all 3 embedding providers and displays
 * results side by side so you can evaluate retrieval quality.
 *
 * Usage:
 *   npx tsx scripts/compare-embeddings.ts "best food near the stadium"
 *   npm run compare-embeddings "where can I buy tickets"
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { retrieveChunksAllProviders } from '../src/lib/retrieval'
import type { RetrievalResult } from '../src/types'

function printResult(result: RetrievalResult) {
  const { provider, chunks, queryTimeMs } = result
  const label = provider.toUpperCase().padEnd(12)

  console.log(`\n┌─── ${label} (${queryTimeMs}ms) ───`)

  if (chunks.length === 0) {
    console.log('│  No results above threshold')
  } else {
    for (const chunk of chunks) {
      const sim = chunk.similarity?.toFixed(4) ?? 'n/a'
      const preview = chunk.content.slice(0, 120).replace(/\n/g, ' ')
      console.log(`│  [${sim}] ${chunk.title}`)
      console.log(`│          ${preview}...`)
      console.log(`│          category: ${chunk.category} | source: ${chunk.source}`)
    }
  }

  console.log('└' + '─'.repeat(50))
}

async function main() {
  const query = process.argv[2]
  if (!query) {
    console.error('Usage: npx tsx scripts/compare-embeddings.ts "<query>"')
    process.exit(1)
  }

  console.log(`\n🔍 Query: "${query}"\n`)
  console.log('Embedding query with all 3 providers and searching...\n')

  const results = await retrieveChunksAllProviders(query, {
    matchCount: 3,
    matchThreshold: 0.2,  // low threshold during comparison to see all results
  })

  for (const result of results) {
    printResult(result)
  }

  // Summary
  console.log('\n── Summary ────────────────────────')
  for (const r of results) {
    console.log(`  ${r.provider.padEnd(12)} → ${r.chunks.length} results in ${r.queryTimeMs}ms`)
  }
  console.log()
}

main()
