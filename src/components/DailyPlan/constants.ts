import type { DPPriority, DPTaskSortBy } from './DailyPlan.types'

export const MOTIVATIONAL_QUOTES: Array<{ text: string; author: string }> = [
  { text: "The only way to do great work is to love what you do.", author: 'Steve Jobs' },
  { text: `Your time is limited, don't waste it living someone else's life.`, author: 'Steve Jobs' },
  { text: "Stay hungry, stay foolish.", author: 'Steve Jobs' },
  { text: `Life is what happens when you're busy making other plans.`, author: 'John Lennon' },
  { text: "Imagination is more important than knowledge.", author: 'Albert Einstein' },
  { text: "Strive not to be a success, but rather to be of value.", author: 'Albert Einstein' },
  { text: "The secret of getting ahead is getting started.", author: 'Mark Twain' },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: 'Mark Twain' },
  { text: `Nothing is impossible, the word itself says "I'm possible"!`, author: 'Audrey Hepburn' },
  { text: "If you look at what you have in life, you'll always have more.", author: 'Oprah Winfrey' },
  { text: "The biggest adventure you can take is to live the life of your dreams.", author: 'Oprah Winfrey' },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: 'Winston Churchill' },
  { text: "We make a living by what we get, but we make a life by what we give.", author: 'Winston Churchill' },
  { text: `I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.`, author: 'Maya Angelou' },
  { text: "Do the best you can until you know better. Then when you know better, do better.", author: 'Maya Angelou' },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: 'Confucius' },
  { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: 'Confucius' },
  { text: "A journey of a thousand miles begins with a single step.", author: 'Lao Tzu' },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: 'Chinese Proverb' },
  { text: "Setting goals is the first step in turning the invisible into the visible.", author: 'Tony Robbins' },
  { text: "The path to success is to take massive, determined action.", author: 'Tony Robbins' },
  { text: "When something is important enough, you do it even if the odds are not in your favor.", author: 'Elon Musk' },
  { text: "Persistence is very important. You should not give up unless you are forced to give up.", author: 'Elon Musk' },
  { text: `A professional is someone who can do his best work when he doesn't feel like it.`, author: 'Alistair Cooke' },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: 'James Clear' },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: 'James Clear' },
  { text: "Habits are the compound interest of self-improvement.", author: 'James Clear' },
  { text: "A deep life is a good life, any way you look at it.", author: 'Cal Newport' },
  { text: "Clarity about what matters provides clarity about what does not.", author: 'Cal Newport' },
  { text: "Focus is the new IQ. Manage your attention, not your time.", author: 'Cal Newport' },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: 'Stephen King' },
  { text: "The way to get started is to quit talking and begin doing.", author: 'Walt Disney' },
  { text: `Don't watch the clock; do what it does. Keep going.`, author: 'Sam Levenson' },
  { text: "Action is the foundational key to all success.", author: 'Pablo Picasso' },
  { text: "Either you run the day or the day runs you.", author: 'Jim Rohn' },
]

export const DEFAULT_CATEGORIES = [
  { id: 'cat-work', name: 'Work', color: '#3b82f6', icon: 'briefcase' },
  { id: 'cat-personal', name: 'Personal', color: '#22c55e', icon: 'user' },
  { id: 'cat-health', name: 'Health & Fitness', color: '#ef4444', icon: 'heart' },
  { id: 'cat-learning', name: 'Learning', color: '#a855f7', icon: 'book' },
  { id: 'cat-errands', name: 'Errands', color: '#f59e0b', icon: 'shopping-cart' },
] as const

export const PRIORITY_CONFIG: Record<DPPriority, { label: string; color: string; bgColor: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  high: { label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  low: { label: 'Low', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
}

export const TIMELINE_HOURS = Array.from({ length: 24 }, (_, i) => i)

export const SORT_OPTIONS: Array<{ value: DPTaskSortBy; label: string; icon: string }> = [
  { value: 'manual', label: 'Manual', icon: 'GripVertical' },
  { value: 'priority', label: 'Priority', icon: 'Flag' },
  { value: 'time', label: 'Scheduled time', icon: 'Clock' },
  { value: 'created', label: 'Date created', icon: 'CalendarPlus' },
  { value: 'title', label: 'Title', icon: 'ArrowDownAZ' },
  { value: 'status', label: 'Status', icon: 'CircleCheck' },
]

// Default sort direction applied the first time a sort field is selected.
export const SORT_DEFAULT_DIRECTION: Record<DPTaskSortBy, 'asc' | 'desc'> = {
  manual: 'asc',
  priority: 'desc',
  time: 'asc',
  created: 'desc',
  title: 'asc',
  status: 'asc',
}

export const BUILT_IN_TEMPLATES = [
  {
    id: 'tmpl-professional',
    name: 'Professional',
    description: 'Structured day for office workers and team leads',
    templateType: 'professional' as const,
    isBuiltIn: true,
    sortOrder: 0,
    content: JSON.stringify({
      tasks: [
        { title: 'Check and respond to emails', priority: 'medium', scheduledTime: '09:00', durationMinutes: 30, categoryId: 'cat-work' },
        { title: 'Deep work block', priority: 'high', scheduledTime: '10:00', durationMinutes: 120, categoryId: 'cat-work' },
        { title: 'Review pull requests', priority: 'medium', scheduledTime: '14:00', durationMinutes: 60, categoryId: 'cat-work' },
        { title: 'EOD status update', priority: 'low', scheduledTime: '17:00', durationMinutes: 15, categoryId: 'cat-work' },
      ],
      meetings: [
        { title: 'Daily Standup', startTime: '09:30', endTime: '09:45', location: 'Teams' },
      ],
      statusTemplate: '## Yesterday\n- \n\n## Today\n- \n\n## Blockers\n- None',
    }),
  },
  {
    id: 'tmpl-student',
    name: 'Student',
    description: 'Balanced schedule for classes, study, and assignments',
    templateType: 'student' as const,
    isBuiltIn: true,
    sortOrder: 1,
    content: JSON.stringify({
      tasks: [
        { title: 'Review lecture notes', priority: 'high', scheduledTime: '08:00', durationMinutes: 45, categoryId: 'cat-learning' },
        { title: 'Complete assignment', priority: 'urgent', scheduledTime: '10:00', durationMinutes: 120, categoryId: 'cat-learning' },
        { title: 'Study session', priority: 'high', scheduledTime: '14:00', durationMinutes: 90, categoryId: 'cat-learning' },
        { title: 'Exercise / Sports', priority: 'medium', scheduledTime: '17:00', durationMinutes: 60, categoryId: 'cat-health' },
        { title: 'Group project work', priority: 'medium', scheduledTime: '19:00', durationMinutes: 60, categoryId: 'cat-learning' },
      ],
      meetings: [],
      statusTemplate: '## Classes Today\n- \n\n## Homework / Assignments\n- \n\n## Goals for the Day\n- ',
    }),
  },
  {
    id: 'tmpl-freelancer',
    name: 'Freelancer',
    description: 'Flexible day for independent professionals',
    templateType: 'freelancer' as const,
    isBuiltIn: true,
    sortOrder: 2,
    content: JSON.stringify({
      tasks: [
        { title: 'Client communication', priority: 'high', scheduledTime: '09:00', durationMinutes: 30, categoryId: 'cat-work' },
        { title: 'Project work -- Client A', priority: 'urgent', scheduledTime: '09:30', durationMinutes: 180, categoryId: 'cat-work' },
        { title: 'Lunch break', priority: 'low', scheduledTime: '12:30', durationMinutes: 60, categoryId: 'cat-personal' },
        { title: 'Project work -- Client B', priority: 'high', scheduledTime: '13:30', durationMinutes: 120, categoryId: 'cat-work' },
        { title: 'Invoice / Billing', priority: 'medium', scheduledTime: '16:00', durationMinutes: 30, categoryId: 'cat-errands' },
        { title: 'Learning / Upskilling', priority: 'low', scheduledTime: '16:30', durationMinutes: 60, categoryId: 'cat-learning' },
      ],
      meetings: [],
      statusTemplate: '## Client Work\n- \n\n## Personal Projects\n- \n\n## Admin / Business\n- ',
    }),
  },
]
