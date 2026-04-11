export type SpaceType = 'couple' | 'friends' | 'travel' | 'wedding' | 'project'

export interface SpaceConfig {
  type: SpaceType
  name: string
  emoji: string
  members: string[]
}

export const SPACE_PRESETS: Record<SpaceType, { label: string; emoji: string; desc: string; color: string }> = {
  couple: { label: '커플', emoji: '💑', desc: '우리 둘만의 공간', color: '#E8837C' },
  friends: { label: '친구모임', emoji: '👯', desc: '함께하는 추억 공간', color: '#38B2AC' },
  travel: { label: '여행모임', emoji: '✈️', desc: '여행 계획과 기록', color: '#4299E1' },
  wedding: { label: '결혼준비', emoji: '💒', desc: '우리의 결혼 준비', color: '#D69E2E' },
  project: { label: '프로젝트', emoji: '🚀', desc: '함께 만드는 프로젝트', color: '#805AD5' },
}

export interface CoupleData {
  spaceType?: SpaceType
  spaceName?: string
  names: { me: string; you: string }
  members?: string[]
  ddayDate: string | null
  events: CalendarEvent[]
  birthdays: Birthday[]
  wishes: WishItem[]
  spots: SpotItem[]
  memos: Memo[]
  roulette: { categories: Record<string, string[]>; history: string[] }
  moods: { today: Record<string, number>; history: MoodEntry[] }
  savings: SavingsItem[]
  questions: { daily: Record<string, { me?: string; you?: string }>; history: any[] }
  memories: Memory[]
  missions: Mission[]
  timecapsules: Timecapsule[]
  watchlist: WatchlistItem[]
  balance: Record<string, any>
  chat: ChatMessage[]
  album: AlbumPhoto[]
  mbti: { me?: string; you?: string }
  loveLang: { me?: string; you?: string }
  streak: { current: number; lastDate: string | null; best: number }
  weeklyReport: Record<string, any>
  garden: { feeds: number; lastFeed: string | null }
  rewards: Record<string, any>
  couplePhoto?: string
  todos?: TodoItem[]
  polls?: PollItem[]
  budget?: BudgetItem[]
  checklist?: ChecklistItem[]
  vendors?: VendorItem[]
  roles?: RoleItem[]
}

export interface TodoItem {
  title: string
  done: boolean
  assignee?: string
  dueDate?: string
  category?: string
}

export interface PollItem {
  question: string
  options: string[]
  votes: Record<string, string>
  createdAt: string
}

export interface BudgetItem {
  title: string
  amount: number
  paid?: boolean
  paidBy?: string
  category?: string
  date: string
}

export interface ChecklistItem {
  title: string
  checked: boolean
  category?: string
}

export interface VendorItem {
  name: string
  category: string
  phone?: string
  note?: string
  price?: number
  confirmed?: boolean
}

export interface RoleItem {
  name: string
  role: string
  tasks?: string[]
}

export interface CalendarEvent {
  title: string
  date: string
  note?: string
  color?: string
}

export interface Birthday {
  name: string
  date: string
  relation?: string
  group?: string
}

export interface WishItem {
  title: string
  price?: string
  link?: string
  url?: string
  done?: boolean
}

export interface SpotItem {
  name: string
  address?: string
  note?: string
  category?: string
  rating?: number
  visited?: boolean
}

export interface Memo {
  title?: string
  body?: string
  text?: string
  date: string
  from?: string
}

export interface MoodEntry {
  date: string
  na?: number
  you?: number
}

export interface SavingsItem {
  title: string
  target: number
  current: number
  date: string
}

export interface Memory {
  title: string
  date: string
  desc?: string
  photos?: string[]
}

export interface Mission {
  title: string
  done?: boolean
  completed?: boolean
  category?: string
  points?: number
  custom?: boolean
}

export interface Timecapsule {
  message: string
  openDate: string
  from: string
  createdAt: string
  opened?: boolean
}

export interface WatchlistItem {
  title: string
  type: string
  watched?: boolean
  rating?: number
}

export interface ChatMessage {
  text: string
  from: string
  time: string
  date: string
}

export interface AlbumPhoto {
  src: string
  caption?: string
  date?: string
}

export const DEFAULT_DATA: CoupleData = {
  spaceType: undefined,
  spaceName: undefined,
  names: { me: '', you: '' },
  members: [],
  ddayDate: null,
  events: [],
  birthdays: [],
  wishes: [],
  spots: [],
  memos: [],
  roulette: { categories: {}, history: [] },
  moods: { today: {}, history: [] },
  savings: [],
  questions: { daily: {}, history: [] },
  memories: [],
  missions: [],
  timecapsules: [],
  watchlist: [],
  balance: {},
  chat: [],
  album: [],
  mbti: {},
  loveLang: {},
  streak: { current: 0, lastDate: null, best: 0 },
  weeklyReport: {},
  garden: { feeds: 0, lastFeed: null },
  rewards: {},
  couplePhoto: undefined,
  todos: [],
  polls: [],
  budget: [],
  checklist: [],
  vendors: [],
  roles: [],
}
