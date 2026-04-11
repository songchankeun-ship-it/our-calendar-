import { useState } from 'react'
import { WeddingProvider, useWedding } from './contexts/WeddingContext'
import BottomNav, { type TabId } from './components/layout/BottomNav'
import Onboarding from './components/onboarding/Onboarding'
import Home from './components/home/Home'

function Placeholder({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="pb-24 px-5 pt-4 text-center">
      <div className="text-4xl mb-3 mt-16">{emoji}</div>
      <div className="text-lg font-extrabold mb-1">{title}</div>
      <div className="text-sm text-stone-400">곧 만들어질 화면이에요</div>
    </div>
  )
}

function AppContent() {
  const { data } = useWedding()
  const [tab, setTab] = useState<TabId>('home')
  const [showOnboarding, setShowOnboarding] = useState(!data.profile.weddingDate)

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  const renderTab = () => {
    switch (tab) {
      case 'home': return <Home onTabChange={(t) => setTab(t as TabId)} />
      case 'vendors': return <Placeholder title="업체 관리" emoji="🏢" />
      case 'budget': return <Placeholder title="예산 관리" emoji="💰" />
      case 'schedule': return <Placeholder title="일정" emoji="📅" />
      case 'docs': return <Placeholder title="문서함" emoji="📁" />
      default: return <Home onTabChange={(t) => setTab(t as TabId)} />
    }
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen relative bg-[#FAFAF8]">
      <main>{renderTab()}</main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <WeddingProvider>
      <AppContent />
    </WeddingProvider>
  )
}
