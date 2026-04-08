import type { Card } from '@/types'

export const DEFAULT_CARDS: Card[] = [
  {
    id: 'tickets',
    icon: '🎟️',
    category: 'Tickets',
    title: 'World Cup Tickets at Lumen Field',
    preview: 'Official prices, resale market, and tips to secure your spot.',
    accent: '#1a5c3a',
  },
  {
    id: 'food-trucks',
    icon: '🍜',
    category: 'Food & Drink',
    title: 'Top Food Trucks Near the Stadium',
    preview: "Seattle's best street food within walking distance of Lumen Field.",
    accent: '#c9a84c',
  },
  {
    id: 'weather',
    icon: '🌧️',
    category: 'Weather',
    title: 'Game-Day Weather in Seattle',
    preview: 'What to pack and how to dress for a Pacific Northwest match day.',
    accent: '#4a90b8',
  },
  {
    id: 'transport',
    icon: '🚇',
    category: 'Transport',
    title: 'Getting to Lumen Field',
    preview: 'Light rail, buses, rideshare, and parking — all your options.',
    accent: '#2e4057',
  },
  {
    id: 'stay',
    icon: '🏨',
    category: 'Stay',
    title: 'Best Neighborhoods to Stay In',
    preview: 'Capitol Hill, Belltown, South Lake Union — fan-friendly picks.',
    accent: '#7b5ea7',
  },
  {
    id: 'activities',
    icon: '🌲',
    category: 'Explore',
    title: 'Rainy Day Activities in Seattle',
    preview: 'Pike Place, Space Needle, museums, and hidden local gems.',
    accent: '#2d8a58',
  },
]
