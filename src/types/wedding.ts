// Wedding Planning Workspace — Data Types

export type VendorCategory = 'wedding_hall' | 'studio' | 'dress' | 'makeup' | 'suit' | 'snap' | 'jewelry' | 'honeymoon' | 'invitation' | 'etc'
export type VendorStatus = 'interested' | 'consult_scheduled' | 'consult_done' | 'quote_received' | 'comparing' | 'contracted' | 'completed' | 'on_hold' | 'rejected'
export type BudgetStatus = 'estimated' | 'confirmed' | 'paid'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type Assignee = 'partner1' | 'partner2' | 'both'
export type DocType = 'contract' | 'quote' | 'capture' | 'image' | 'memo'

export const VENDOR_CATEGORIES: Record<VendorCategory, { label: string; emoji: string }> = {
  wedding_hall: { label: '웨딩홀', emoji: '🏛️' },
  studio: { label: '스튜디오', emoji: '📸' },
  dress: { label: '드레스', emoji: '👗' },
  makeup: { label: '메이크업', emoji: '💄' },
  suit: { label: '예복', emoji: '🤵' },
  snap: { label: '본식스냅', emoji: '📷' },
  jewelry: { label: '예물/예단', emoji: '💍' },
  honeymoon: { label: '신혼여행', emoji: '✈️' },
  invitation: { label: '청첩장', emoji: '💌' },
  etc: { label: '기타', emoji: '📋' },
}

export const VENDOR_STATUS_FLOW: { key: VendorStatus; label: string; color: string }[] = [
  { key: 'interested', label: '관심', color: '#aaa' },
  { key: 'consult_scheduled', label: '상담예정', color: '#1565C0' },
  { key: 'consult_done', label: '상담완료', color: '#6A1B9A' },
  { key: 'quote_received', label: '견적', color: '#1565C0' },
  { key: 'comparing', label: '비교중', color: '#F57F17' },
  { key: 'contracted', label: '계약', color: '#2E7D32' },
  { key: 'completed', label: '완료', color: '#2E7D32' },
  { key: 'on_hold', label: '보류', color: '#999' },
  { key: 'rejected', label: '탈락', color: '#C62828' },
]

export const BUDGET_CATEGORIES: { key: VendorCategory; label: string; emoji: string; defaultBudget: number }[] = [
  { key: 'wedding_hall', label: '웨딩홀', emoji: '🏛️', defaultBudget: 15000000 },
  { key: 'studio', label: '스튜디오', emoji: '📸', defaultBudget: 2000000 },
  { key: 'dress', label: '드레스', emoji: '👗', defaultBudget: 1500000 },
  { key: 'makeup', label: '메이크업', emoji: '💄', defaultBudget: 800000 },
  { key: 'suit', label: '예복', emoji: '🤵', defaultBudget: 1500000 },
  { key: 'snap', label: '본식스냅', emoji: '📷', defaultBudget: 1000000 },
  { key: 'jewelry', label: '예물/예단', emoji: '💍', defaultBudget: 5000000 },
  { key: 'honeymoon', label: '신혼여행', emoji: '✈️', defaultBudget: 5000000 },
  { key: 'invitation', label: '청첩장/답례품', emoji: '💌', defaultBudget: 1000000 },
  { key: 'etc', label: '기타', emoji: '📋', defaultBudget: 3000000 },
]

// === Data Interfaces ===

export interface Vendor {
  id: string
  name: string
  category: VendorCategory
  contactPerson: string
  contactPhone: string
  consultDate: string
  quote: number
  status: VendorStatus
  note: string
  pros: string[]
  cons: string[]
  concerns: string[]
  rating1: number  // partner1 rating (0-5)
  rating2: number  // partner2 rating (0-5)
  comparing: boolean  // in compare list
  deposit: number
  depositPaid: boolean
  balance: number
  balanceDue: string
  extras: number
  files: string[]  // doc IDs
  createdBy: Assignee
  createdAt: string
  updatedAt: string
}

export interface BudgetItem {
  id: string
  title: string
  category: VendorCategory
  amount: number
  status: BudgetStatus
  deposit: number
  depositPaid: boolean
  balance: number
  balanceDue: string
  extras: number
  note: string
  vendorId: string
  createdBy: Assignee
  updatedAt: string
}

export interface TimelineItem {
  id: string
  title: string
  category: VendorCategory | 'general'
  monthsBefore: number
  dueDate: string
  status: TaskStatus
  assignee: Assignee
  note: string
  vendorId: string
  budgetItemId: string
  docIds: string[]
  isCustom: boolean
  completedAt: string
  completedBy: Assignee
}

export interface DocItem {
  id: string
  title: string
  type: DocType
  vendorId: string
  category: VendorCategory | 'general'
  file: string  // base64 or URL
  note: string
  uploadedBy: Assignee
  uploadedAt: string
}

export interface ActivityItem {
  id: string
  type: string
  actor: Assignee
  actorName: string
  target: string
  detail: string
  timestamp: string
}

export interface WeddingProfile {
  weddingDate: string
  region: string
  guestCount: number
  stage: string
  totalBudget: number
  partner1: { name: string; role: string }
  partner2: { name: string; role: string }
  createdAt: string
}

export interface WeddingData {
  profile: WeddingProfile
  vendors: Vendor[]
  budget: {
    categories: Record<VendorCategory, number>  // planned amounts
    items: BudgetItem[]
  }
  timeline: TimelineItem[]
  documents: DocItem[]
  activity: ActivityItem[]
}

// === Default Data ===

export const DEFAULT_WEDDING_DATA: WeddingData = {
  profile: {
    weddingDate: '',
    region: '',
    guestCount: 0,
    stage: '',
    totalBudget: 0,
    partner1: { name: '', role: '신부' },
    partner2: { name: '', role: '신랑' },
    createdAt: '',
  },
  vendors: [],
  budget: {
    categories: {
      wedding_hall: 15000000,
      studio: 2000000,
      dress: 1500000,
      makeup: 800000,
      suit: 1500000,
      snap: 1000000,
      jewelry: 5000000,
      honeymoon: 5000000,
      invitation: 1000000,
      etc: 3000000,
    },
    items: [],
  },
  timeline: [],
  documents: [],
  activity: [],
}
