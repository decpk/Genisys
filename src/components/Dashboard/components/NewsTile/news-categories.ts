import {
  Cpu, Briefcase, TrendingUp, Newspaper, Trophy, Lightbulb,
  DollarSign, Bitcoin, FlaskConical, Palette, Sparkles,
  Globe, Rocket, Clapperboard, HeartPulse, Wrench,
} from 'lucide-react'

export type NewsCategoryKey =
  | 'tech'
  | 'business'
  | 'productivity'
  | 'news'
  | 'sports'
  | 'money'
  | 'crypto'
  | 'science'
  | 'design'
  | 'ai'
  | 'world'
  | 'startups'
  | 'entertainment'
  | 'health'
  | 'custom'

export interface NewsCategoryEntry {
  key: NewsCategoryKey
  label: string
  icon: typeof Cpu
  color: string // tailwind gradient stops for the icon circle
  defaultSourceHint: string
}

export const NEWS_CATEGORIES: NewsCategoryEntry[] = [
  { key: 'tech', label: 'Tech', icon: Cpu, color: 'from-blue-500/20 to-cyan-500/20', defaultSourceHint: 'TechCrunch, The Verge, Ars Technica' },
  { key: 'ai', label: 'AI & ML', icon: Sparkles, color: 'from-violet-500/20 to-purple-500/20', defaultSourceHint: 'OpenAI blog, AI news aggregators' },
  { key: 'business', label: 'Business', icon: Briefcase, color: 'from-amber-500/20 to-orange-500/20', defaultSourceHint: 'Bloomberg, Financial Times, Reuters Business' },
  { key: 'startups', label: 'Startups', icon: Rocket, color: 'from-rose-500/20 to-pink-500/20', defaultSourceHint: 'TechCrunch Startups, Y Combinator news' },
  { key: 'money', label: 'Finance', icon: DollarSign, color: 'from-emerald-500/20 to-green-500/20', defaultSourceHint: 'Bloomberg Markets, CNBC' },
  { key: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'from-yellow-500/20 to-amber-500/20', defaultSourceHint: 'CoinDesk, CoinGecko news' },
  { key: 'productivity', label: 'Productivity', icon: Lightbulb, color: 'from-sky-500/20 to-blue-500/20', defaultSourceHint: 'Lifehacker, Zapier blog' },
  { key: 'news', label: 'Current Affairs', icon: Newspaper, color: 'from-slate-500/20 to-zinc-500/20', defaultSourceHint: 'Reuters, AP News, BBC' },
  { key: 'world', label: 'World', icon: Globe, color: 'from-teal-500/20 to-cyan-500/20', defaultSourceHint: 'BBC World, Al Jazeera, Reuters World' },
  { key: 'science', label: 'Science', icon: FlaskConical, color: 'from-indigo-500/20 to-blue-500/20', defaultSourceHint: 'Nature, Science Daily, New Scientist' },
  { key: 'sports', label: 'Sports', icon: Trophy, color: 'from-orange-500/20 to-red-500/20', defaultSourceHint: 'ESPN, BBC Sport' },
  { key: 'design', label: 'Design', icon: Palette, color: 'from-pink-500/20 to-fuchsia-500/20', defaultSourceHint: 'Dribbble, Behance, Smashing Magazine' },
  { key: 'entertainment', label: 'Entertainment', icon: Clapperboard, color: 'from-fuchsia-500/20 to-purple-500/20', defaultSourceHint: 'Variety, Hollywood Reporter' },
  { key: 'health', label: 'Health', icon: HeartPulse, color: 'from-red-500/20 to-rose-500/20', defaultSourceHint: 'WebMD, Healthline, WHO news' },
  { key: 'custom', label: 'Custom', icon: Wrench, color: 'from-gray-500/20 to-slate-500/20', defaultSourceHint: '' },
]

export function getCategoryEntry(key: string): NewsCategoryEntry {
  return NEWS_CATEGORIES.find((c) => c.key === key) ?? NEWS_CATEGORIES[NEWS_CATEGORIES.length - 1]
}
