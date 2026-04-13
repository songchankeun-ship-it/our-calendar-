import { useWedding } from '../../contexts/WeddingContext'
import { BUDGET_CATEGORIES } from '../../types/wedding'

export default function Home({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { data, updateData } = useWedding()
  const { profile, vendors, budget, timeline, activity } = data

  const daysLeft = profile.weddingDate
    ? Math.max(0, Math.floor((new Date(profile.weddingDate).getTime() - Date.now()) / 86400000))
    : 0
  const dateStr = profile.weddingDate
    ? new Date(profile.weddingDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
    : ''

  // Budget calculations
  const totalBudget = profile.totalBudget || 0
  const confirmedBudget = budget.items.filter(i => i.status !== 'estimated').reduce((s, i) => s + i.amount + i.extras, 0)

  // Timeline progress
  const totalTasks = timeline.length
  const doneTasks = timeline.filter(t => t.status === 'done').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // Vendor counts by status
  const contracted = vendors.filter(v => v.status === 'contracted' || v.status === 'completed').length
  const comparing = vendors.filter(v => v.status === 'comparing').length
  const consulting = vendors.filter(v => ['consult_scheduled', 'consult_done', 'quote_received'].includes(v.status)).length
  const onHold = vendors.filter(v => v.status === 'on_hold' || v.status === 'rejected').length

  // Budget over categories
  const overBudgetCats = BUDGET_CATEGORIES.filter(cat => {
    const spent = budget.items.filter(i => i.category === cat.key).reduce((s, i) => s + i.amount + i.extras, 0)
    const planned = budget.categories[cat.key] || 0
    return spent > planned && planned > 0
  })

  // Upcoming balance payments
  const upcomingPayments = vendors
    .filter(v => v.balance > 0 && v.balanceDue)
    .map(v => ({ name: v.name, amount: v.balance, due: v.balanceDue, daysLeft: Math.floor((new Date(v.balanceDue).getTime() - Date.now()) / 86400000) }))
    .filter(p => p.daysLeft > 0 && p.daysLeft <= 60)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  // This week's tasks
  const now = new Date()
  const weekLater = new Date(now.getTime() + 7 * 86400000)
  const weekTasks = timeline
    .filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) <= weekLater)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)

  // Priority task (first incomplete urgent one)
  const priorityTask = timeline.find(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) <= weekLater)
    || timeline.find(t => t.status === 'in_progress')
    || timeline.find(t => t.status === 'todo')

  // Recent activity
  const recentActivity = (activity || []).slice(-5).reverse()

  return (
    <div className="pb-6 px-5 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-[11px] font-semibold text-stone-400">D-{daysLeft} · {dateStr}</div>
          <div className="text-lg font-extrabold mt-0.5">{profile.partner1.name || '나'} & {profile.partner2.name || '파트너'}</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-sm">⚙️</div>
      </div>

      {/* Hero CTA */}
      {priorityTask && (
        <div className="bg-stone-900 rounded-2xl p-5 text-white mb-3">
          <div className="text-[10px] opacity-50 font-bold tracking-wider uppercase mb-1.5">🔥 지금 해야 할 일</div>
          <div className="text-[17px] font-bold leading-snug mb-3">{priorityTask.title}</div>
          {priorityTask.vendorId && (
            <div className="text-xs opacity-60 mb-3">
              관련 업체: {vendors.find(v => v.id === priorityTask.vendorId)?.name || ''}
            </div>
          )}
          <button onClick={() => onTabChange('schedule')}
            className="inline-block px-5 py-2.5 bg-white text-stone-900 rounded-xl text-[13px] font-bold">
            일정 확인하기 →
          </button>
        </div>
      )}

      {/* Alerts */}
      {upcomingPayments.map((p, i) => (
        <div key={i} className="flex items-center gap-2 bg-red-50 text-red-800 rounded-xl px-3 py-2.5 text-[12px] font-medium mb-2">
          🔴 {p.name} 잔금 {(p.amount / 10000).toLocaleString()}만 — D-{p.daysLeft}
        </div>
      ))}
      {overBudgetCats.map((cat, i) => {
        const spent = budget.items.filter(it => it.category === cat.key).reduce((s, it) => s + it.amount + it.extras, 0)
        const over = spent - (budget.categories[cat.key] || 0)
        return (
          <div key={i} className="flex items-center gap-2 bg-amber-50 text-amber-800 rounded-xl px-3 py-2.5 text-[12px] font-medium mb-2">
            ⚠️ {cat.label} 예산 {(over / 10000).toLocaleString()}만 초과
          </div>
        )
      })}

      {/* Summary 2-col */}
      <div className="grid grid-cols-2 gap-2 mb-3 mt-1">
        <div className="bg-white border border-stone-100 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-stone-400 mb-0.5">확정 예산</div>
          <div className="text-lg font-extrabold">{(confirmedBudget / 10000).toLocaleString()}만</div>
          <div className="text-[10px] text-stone-400">/ {(totalBudget / 10000).toLocaleString()}만</div>
        </div>
        <div className="bg-white border border-stone-100 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-stone-400 mb-0.5">체크리스트</div>
          <div className="text-lg font-extrabold">{progress}%</div>
          <div className="text-[10px] text-stone-400">{doneTasks} / {totalTasks} 완료</div>
        </div>
      </div>

      {/* This week todos */}
      {weekTasks.length > 0 && (
        <>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-4">이번 주 할 일</div>
          <div className="bg-white border border-stone-100 rounded-xl p-3">
            {weekTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
                <button onClick={() => updateData(prev => ({
                    ...prev,
                    timeline: prev.timeline.map(item => item.id === t.id
                      ? { ...item, status: item.status === 'done' ? 'todo' : 'done', completedAt: item.status === 'done' ? '' : new Date().toISOString() }
                      : item)
                  }))}
                  className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 ${t.status === 'done' ? 'bg-emerald-600 border-emerald-600' : t.status === 'in_progress' ? 'border-amber-400 bg-amber-50' : 'border-stone-300'}`} />
                <div className="flex-1">
                  <div className={`text-[13px] font-semibold ${t.status === 'done' ? 'line-through text-stone-300' : ''}`}>{t.title}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    <span className="inline-block px-2 py-0.5 bg-stone-100 rounded text-[9px] font-semibold">
                      {t.assignee === 'both' ? '둘 다' : t.assignee === 'partner1' ? profile.partner1.role : profile.partner2.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Vendor status */}
      {vendors.length > 0 && (
        <>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-4">업체 현황</div>
          <button onClick={() => onTabChange('vendors')}
            className="w-full bg-stone-50 rounded-xl p-4 flex justify-around text-center">
            <div><div className="text-lg font-extrabold text-emerald-600">{contracted}</div><div className="text-[10px] text-stone-400">계약</div></div>
            <div><div className="text-lg font-extrabold text-amber-500">{comparing}</div><div className="text-[10px] text-stone-400">비교중</div></div>
            <div><div className="text-lg font-extrabold text-blue-600">{consulting}</div><div className="text-[10px] text-stone-400">상담</div></div>
            <div><div className="text-lg font-extrabold text-stone-400">{onHold}</div><div className="text-[10px] text-stone-400">보류</div></div>
          </button>
        </>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-4">최근 활동</div>
          <div className="bg-stone-50 rounded-xl p-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-2.5 py-2 border-b border-stone-100 last:border-0 text-[12px]">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {a.actorName?.[0] || '?'}
                </div>
                <div className="flex-1 leading-relaxed">
                  <strong>{a.actorName}</strong> {a.detail}
                  <div className="text-[10px] text-stone-300 mt-0.5">{a.timestamp ? new Date(a.timestamp).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {vendors.length === 0 && timeline.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">💒</div>
          <div className="text-sm font-semibold text-stone-500 mb-1">결혼준비를 시작해볼까요?</div>
          <div className="text-xs text-stone-400 mb-4">업체를 등록하거나 일정을 확인해보세요</div>
          <button onClick={() => onTabChange('vendors')}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[13px] font-bold">
            업체 등록하기 →
          </button>
        </div>
      )}
    </div>
  )
}
