export type TabId = 'home' | 'vendors' | 'budget' | 'schedule' | 'docs'

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'home', label: '홈', emoji: '🏠' },
  { id: 'vendors', label: '업체', emoji: '🏢' },
  { id: 'budget', label: '예산', emoji: '💰' },
  { id: 'schedule', label: '일정', emoji: '📅' },
  { id: 'docs', label: '문서함', emoji: '📁' },
]

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-stone-100 flex items-center justify-around pb-5 pt-2 z-50">
      {TABS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex flex-col items-center gap-0.5 transition-opacity ${active === t.id ? 'opacity-100' : 'opacity-30'}`}>
          <span className="text-lg">{t.emoji}</span>
          <span className="text-[9px] font-bold tracking-wide">{t.label}</span>
          {active === t.id && <span className="w-1 h-1 rounded-full bg-stone-900 mt-0.5" />}
        </button>
      ))}
    </nav>
  )
}
