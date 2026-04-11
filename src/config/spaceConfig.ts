import type { SpaceType } from '../types/data'

export type TabGroup = 'home' | 'chat' | 'record' | 'calendar' | 'more'

interface TabItem {
  id: string
  label: string
}

interface BottomTabItem {
  id: TabGroup
  label: string
  icon: string
}

interface SpaceLayout {
  bottomTabs: BottomTabItem[]
  subTabs: Record<TabGroup, TabItem[]>
}

const COUPLE_LAYOUT: SpaceLayout = {
  bottomTabs: [
    { id: 'home', label: '홈', icon: 'heart' },
    { id: 'chat', label: '채팅', icon: 'chat' },
    { id: 'record', label: '기록', icon: 'image' },
    { id: 'calendar', label: '캘린더', icon: 'calendar' },
    { id: 'more', label: '더보기', icon: 'more' },
  ],
  subTabs: {
    home: [
      { id: 'homedash', label: '✨ 홈' },
      { id: 'annivlist', label: '💝 기념일' },
      { id: 'garden', label: '🌳 정원' },
      { id: 'fortune', label: '🔮 운세' },
      { id: 'balance', label: '⚖️ 밸런스' },
      { id: 'roulette', label: '🎲 룰렛' },
      { id: 'weeklyreport', label: '📊 주간리포트' },
    ],
    chat: [
      { id: 'chat', label: '💬 채팅' },
      { id: 'memos', label: '💌 편지함' },
      { id: 'questions', label: '❓ 질문' },
    ],
    record: [
      { id: 'album', label: '🖼️ 앨범' },
      { id: 'memories', label: '📸 추억' },
      { id: 'moods', label: '😊 기분' },
      { id: 'timecapsules', label: '📬 캡슐' },
    ],
    calendar: [
      { id: 'calendar', label: '📅 캘린더' },
      { id: 'birthdays', label: '🎂 생일' },
      { id: 'wishlist', label: '🎁 위시' },
      { id: 'dates', label: '📍 데이트' },
      { id: 'savings', label: '💰 저축' },
    ],
    more: [
      { id: 'missions', label: '🏆 미션' },
      { id: 'mbti', label: '🧬 MBTI' },
      { id: 'lovelang', label: '💕 러브랭귀지' },
      { id: 'watchlist', label: '🎬 볼거리' },
      { id: 'stats', label: '📊 통계' },
      { id: 'settings', label: '⚙️ 설정' },
    ],
  },
}

const FRIENDS_LAYOUT: SpaceLayout = {
  bottomTabs: [
    { id: 'home', label: '홈', icon: 'heart' },
    { id: 'chat', label: '대화', icon: 'chat' },
    { id: 'record', label: '추억', icon: 'image' },
    { id: 'calendar', label: '일정', icon: 'calendar' },
    { id: 'more', label: '더보기', icon: 'more' },
  ],
  subTabs: {
    home: [
      { id: 'homedash', label: '✨ 홈' },
      { id: 'polls', label: '🗳️ 투표' },
      { id: 'budget', label: '💸 정산' },
      { id: 'garden', label: '🌳 정원' },
    ],
    chat: [
      { id: 'chat', label: '💬 채팅' },
      { id: 'memos', label: '📝 공지' },
    ],
    record: [
      { id: 'album', label: '🖼️ 사진첩' },
      { id: 'memories', label: '📸 추억' },
      { id: 'moods', label: '😊 기분' },
    ],
    calendar: [
      { id: 'calendar', label: '📅 일정' },
      { id: 'dates', label: '📍 장소' },
      { id: 'wishlist', label: '🎁 하고싶은것' },
    ],
    more: [
      { id: 'missions', label: '🎯 챌린지' },
      { id: 'roulette', label: '🎲 룰렛' },
      { id: 'balance', label: '⚖️ 밸런스' },
      { id: 'watchlist', label: '🎬 볼거리' },
      { id: 'settings', label: '⚙️ 설정' },
    ],
  },
}

const TRAVEL_LAYOUT: SpaceLayout = {
  bottomTabs: [
    { id: 'home', label: '홈', icon: 'heart' },
    { id: 'calendar', label: '일정', icon: 'calendar' },
    { id: 'record', label: '기록', icon: 'image' },
    { id: 'chat', label: '대화', icon: 'chat' },
    { id: 'more', label: '더보기', icon: 'more' },
  ],
  subTabs: {
    home: [
      { id: 'homedash', label: '✨ 홈' },
      { id: 'checklist', label: '✅ 체크리스트' },
      { id: 'budget', label: '💰 예산' },
    ],
    calendar: [
      { id: 'calendar', label: '📅 일정표' },
      { id: 'dates', label: '📍 장소저장' },
    ],
    record: [
      { id: 'album', label: '🖼️ 사진' },
      { id: 'memories', label: '📸 추억' },
      { id: 'moods', label: '😊 하루기분' },
    ],
    chat: [
      { id: 'chat', label: '💬 채팅' },
      { id: 'memos', label: '📝 메모' },
      { id: 'polls', label: '🗳️ 투표' },
    ],
    more: [
      { id: 'roulette', label: '🎲 룰렛' },
      { id: 'settings', label: '⚙️ 설정' },
    ],
  },
}

const WEDDING_LAYOUT: SpaceLayout = {
  bottomTabs: [
    { id: 'home', label: '홈', icon: 'heart' },
    { id: 'calendar', label: '일정', icon: 'calendar' },
    { id: 'more', label: '준비', icon: 'more' },
    { id: 'chat', label: '메모', icon: 'chat' },
    { id: 'record', label: '기록', icon: 'image' },
  ],
  subTabs: {
    home: [
      { id: 'homedash', label: '✨ 홈' },
      { id: 'checklist', label: '✅ 할일' },
      { id: 'budget', label: '💰 비용관리' },
    ],
    calendar: [
      { id: 'calendar', label: '📅 캘린더' },
      { id: 'vendors', label: '🏢 업체' },
    ],
    more: [
      { id: 'missions', label: '📋 준비목록' },
      { id: 'wishlist', label: '🎁 위시' },
      { id: 'settings', label: '⚙️ 설정' },
    ],
    chat: [
      { id: 'chat', label: '💬 채팅' },
      { id: 'memos', label: '📝 메모' },
    ],
    record: [
      { id: 'album', label: '🖼️ 사진' },
      { id: 'memories', label: '📸 추억' },
    ],
  },
}

const PROJECT_LAYOUT: SpaceLayout = {
  bottomTabs: [
    { id: 'home', label: '홈', icon: 'heart' },
    { id: 'calendar', label: '일정', icon: 'calendar' },
    { id: 'chat', label: '대화', icon: 'chat' },
    { id: 'record', label: '기록', icon: 'image' },
    { id: 'more', label: '더보기', icon: 'more' },
  ],
  subTabs: {
    home: [
      { id: 'homedash', label: '✨ 홈' },
      { id: 'todos', label: '📋 할일' },
      { id: 'roles', label: '👥 역할' },
    ],
    calendar: [
      { id: 'calendar', label: '📅 일정' },
    ],
    chat: [
      { id: 'chat', label: '💬 채팅' },
      { id: 'memos', label: '📝 메모' },
      { id: 'polls', label: '🗳️ 투표' },
    ],
    record: [
      { id: 'album', label: '📎 파일' },
      { id: 'memories', label: '📸 기록' },
    ],
    more: [
      { id: 'missions', label: '🎯 마일스톤' },
      { id: 'settings', label: '⚙️ 설정' },
    ],
  },
}

export const SPACE_LAYOUTS: Record<SpaceType, SpaceLayout> = {
  couple: COUPLE_LAYOUT,
  friends: FRIENDS_LAYOUT,
  travel: TRAVEL_LAYOUT,
  wedding: WEDDING_LAYOUT,
  project: PROJECT_LAYOUT,
}

export function getLayout(type?: SpaceType): SpaceLayout {
  return SPACE_LAYOUTS[type || 'couple']
}
