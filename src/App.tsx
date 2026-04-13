import { useState } from 'react'
import { WeddingProvider, useWedding } from './contexts/WeddingContext'
import BottomNav, { type TabId } from './components/layout/BottomNav'
import Onboarding from './components/onboarding/Onboarding'
import Home from './components/home/Home'
import Vendors from './components/vendors/Vendors'
import Budget from './components/budget/Budget'
import Schedule from './components/schedule/Schedule'
import Documents from './components/documents/Documents'
import Settings from './components/settings/Settings'

function AppContent() {
  const { data } = useWedding()
  const [tab, setTab] = useState<TabId>('home')
  const [showOnboarding, setShowOnboarding] = useState(!data.profile.weddingDate)
  const [showSettings, setShowSettings] = useState(false)

  if (showOnboarding) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-[#FAFAF8]">
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </div>
    )
  }

  if (showSettings) {
    return (
      <div className="max-w-[480px] mx-auto h-screen bg-[#FAFAF8] flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <div className="px-5 pt-2 mb-2">
            <button onClick={() => setShowSettings(false)} className="text-[12px] text-stone-400">← 돌아가기</button>
          </div>
          <Settings onReset={() => { setShowSettings(false); setShowOnboarding(true) }} />
        </main>
      </div>
    )
  }

  const handleTabChange = (t: string) => {
    if (t === 'settings') { setShowSettings(true); return }
    setTab(t as TabId)
  }

  const renderTab = () => {
    switch (tab) {
      case 'home': return <Home onTabChange={handleTabChange} />
      case 'vendors': return <Vendors />
      case 'budget': return <Budget />
      case 'schedule': return <Schedule />
      case 'docs': return <Documents />
      default: return <Home onTabChange={handleTabChange} />
    }
  }

  return (
    <div className="max-w-[480px] mx-auto h-screen bg-[#FAFAF8] flex flex-col relative">
      <main className="flex-1 overflow-y-auto">{renderTab()}</main>
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
