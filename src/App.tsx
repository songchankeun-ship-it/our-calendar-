import { useState } from 'react'
import { WeddingProvider, useWedding } from './contexts/WeddingContext'
import BottomNav, { type TabId } from './components/layout/BottomNav'
import Onboarding from './components/onboarding/Onboarding'
import Home from './components/home/Home'
import Vendors from './components/vendors/Vendors'
import Budget from './components/budget/Budget'
import Schedule from './components/schedule/Schedule'
import Documents from './components/documents/Documents'

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
      case 'vendors': return <Vendors />
      case 'budget': return <Budget />
      case 'schedule': return <Schedule />
      case 'docs': return <Documents />
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
