import { useState, useEffect } from 'react'
import { useFirebase } from './contexts/FirebaseContext'
import { getLayout } from './config/spaceConfig'
import type { TabGroup } from './config/spaceConfig'
import BottomNav from './components/layout/BottomNav'
import SubNav from './components/layout/SubNav'
import SpaceOnboarding from './components/onboarding/SpaceOnboarding'
import SpaceHome from './components/home/SpaceHome'
import HomeDashboard from './components/home/HomeDashboard'
import AnniversaryList from './components/home/AnniversaryList'
import CalendarView from './components/calendar/CalendarView'
import { Birthdays, Wishlist, DateSpots, Savings } from './components/calendar/CalendarFeatures'
import Chat from './components/chat/Chat'
import DailyQuestion from './components/chat/DailyQuestion'
import Memos from './components/chat/Memos'
import MoodTracker from './components/record/MoodTracker'
import Album from './components/record/Album'
import { Memories, Timecapsules } from './components/record/RecordFeatures'
import LoveLangTest from './components/more/LoveLangTest'
import { BalanceGame, Fortune, Roulette, Garden, WeeklyReport, Missions, MBTICompat } from './components/more/Features'
import { Watchlist, Stats } from './components/more/MoreFeatures'
import Settings from './components/more/Settings'
import { Todos, Polls, Budget, Checklist, Vendors, Roles } from './components/space/SpaceFeatures'

function Content({ tab }: { tab: string }) {
  switch (tab) {
    case 'homedash': return <SpaceHome />
    case 'annivlist': return <AnniversaryList />
    case 'garden': return <Garden />
    case 'fortune': return <Fortune />
    case 'balance': return <BalanceGame />
    case 'roulette': return <Roulette />
    case 'weeklyreport': return <WeeklyReport />
    case 'chat': return <Chat />
    case 'memos': return <Memos />
    case 'questions': return <DailyQuestion />
    case 'album': return <Album />
    case 'memories': return <Memories />
    case 'moods': return <MoodTracker />
    case 'timecapsules': return <Timecapsules />
    case 'calendar': return <CalendarView />
    case 'birthdays': return <Birthdays />
    case 'wishlist': return <Wishlist />
    case 'dates': return <DateSpots />
    case 'savings': return <Savings />
    case 'missions': return <Missions />
    case 'mbti': return <MBTICompat />
    case 'lovelang': return <LoveLangTest />
    case 'watchlist': return <Watchlist />
    case 'stats': return <Stats />
    case 'settings': return <Settings />
    case 'todos': return <Todos />
    case 'polls': return <Polls />
    case 'budget': return <Budget />
    case 'checklist': return <Checklist />
    case 'vendors': return <Vendors />
    case 'roles': return <Roles />
    default: return <HomeDashboard />
  }
}

export default function App() {
  const { data } = useFirebase()
  const layout = getLayout(data.spaceType)
  const [mainTab, setMainTab] = useState<TabGroup>(layout.bottomTabs[0].id)
  const [subTab, setSubTab] = useState(layout.subTabs[layout.bottomTabs[0].id]?.[0]?.id || 'homedash')

  // Reset tabs when spaceType changes
  useEffect(() => {
    const newLayout = getLayout(data.spaceType)
    const newMain = newLayout.bottomTabs[0].id
    const newSub = newLayout.subTabs[newMain]?.[0]?.id || 'homedash'
    setMainTab(newMain)
    setSubTab(newSub)
  }, [data.spaceType])

  if (!data.spaceType) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen relative">
        <SpaceOnboarding />
      </div>
    )
  }

  const handleMainTab = (tab: TabGroup) => {
    setMainTab(tab)
    const subs = layout.subTabs[tab]
    if (subs?.length) setSubTab(subs[0].id)
  }

  const currentSubs = layout.subTabs[mainTab] || []

  return (
    <div className="max-w-[480px] mx-auto min-h-screen relative">
      {currentSubs.length > 1 && (
        <div className={subTab === 'homedash' ? 'pt-3' : 'pt-4'}>
          <SubNav tabs={currentSubs} active={subTab} onChange={setSubTab} />
        </div>
      )}
      <main>
        <Content tab={subTab} />
      </main>
      <BottomNav
        tabs={layout.bottomTabs}
        active={mainTab}
        onChange={handleMainTab}
      />
    </div>
  )
}
