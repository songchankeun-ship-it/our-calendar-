import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'
import type { Assignee } from '../../types/wedding'

export default function Schedule() {
  const { data, updateData } = useWedding()
  const [view, setView] = useState<'timeline' | 'checklist'>('timeline')
  const [filter, setFilter] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addAssignee, setAddAssignee] = useState<Assignee>('both')
  const [addDue, setAddDue] = useState('')
  const timeline = data.timeline || []
  const vendors = data.vendors || []

  const total = timeline.length
  const done = timeline.filter(t => t.status === 'done').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const toggleDone = (id: string) => {
    updateData(prev => ({
      ...prev,
      timeline: prev.timeline.map(t => {
        if (t.id !== id) return t
        const newStatus = t.status === 'done' ? 'todo' : 'done'
        return { ...t, status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : '' }
      })
    }))
  }

  // Group by monthsBefore for timeline view
  const grouped: Record<number, typeof timeline> = {}
  timeline.forEach(t => {
    const m = t.monthsBefore
    if (!grouped[m]) grouped[m] = []
    grouped[m].push(t)
  })
  const months = Object.keys(grouped).map(Number).sort((a, b) => b - a)

  // Checklist filtered
  const filtered = filter === 'all' ? timeline
    : filter === 'todo' ? timeline.filter(t => t.status !== 'done')
    : filter === 'urgent' ? timeline.filter(t => {
        if (t.status === 'done') return false
        if (!t.dueDate) return false
        const days = Math.floor((new Date(t.dueDate).getTime() - Date.now()) / 86400000)
        return days <= 14 && days >= 0
      })
    : filter === 'partner1' ? timeline.filter(t => t.assignee === 'partner1' || t.assignee === 'both')
    : filter === 'partner2' ? timeline.filter(t => t.assignee === 'partner2' || t.assignee === 'both')
    : timeline

  const monthLabel = (m: number) => {
    if (m === 0) return 'D-day'
    return `${m}개월 전`
  }

  const monthStatus = (items: typeof timeline) => {
    if (items.every(t => t.status === 'done')) return 'done'
    if (items.some(t => t.status === 'done' || t.status === 'in_progress')) return 'progress'
    return 'todo'
  }

  const assigneeLabel = (a: string) => {
    if (a === 'both') return '둘 다'
    if (a === 'partner1') return data.profile.partner1.role || '신부'
    return data.profile.partner2.role || '신랑'
  }

  return (
    <div className="pb-6 px-5 pt-2">
      <div className="text-lg font-extrabold mb-3">📅 일정</div>

      {/* Sub tabs */}
      <div className="flex bg-stone-100 rounded-xl p-1 mb-3">
        <button onClick={() => setView('timeline')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${view === 'timeline' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>
          타임라인
        </button>
        <button onClick={() => setView('checklist')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${view === 'checklist' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>
          체크리스트
        </button>
      </div>

      {/* Progress */}
      <div className="text-[12px] text-stone-400 mb-2">{done} / {total} 완료 ({pct}%)</div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-stone-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {view === 'checklist' && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
          {[
            { key: 'all', label: '전체' },
            { key: 'todo', label: '미완료' },
            { key: 'urgent', label: '마감임박' },
            { key: 'partner1', label: data.profile.partner1.role || '신부' },
            { key: 'partner2', label: data.profile.partner2.role || '신랑' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold ${filter === f.key ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {view === 'timeline' && months.map(m => {
        const items = grouped[m]
        const status = monthStatus(items)
        const statusBadge = status === 'done' ? 'bg-emerald-50 text-emerald-700'
          : status === 'progress' ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-500'
        const statusLabel = status === 'done' ? '완료' : status === 'progress' ? '진행중' : '예정'
        const isPast = items.every(t => t.status === 'done')

        return (
          <div key={m} className={`mb-4 ${isPast && m > 6 ? 'opacity-40' : ''}`}>
            <div className="text-[13px] font-bold mb-2 flex items-center gap-2">
              {monthLabel(m)}
              {items[0]?.dueDate && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-semibold">
                {new Date(items[0].dueDate).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit' })}
              </span>}
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${statusBadge}`}>{statusLabel}</span>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              {items.map(t => {
                const vendor = t.vendorId ? vendors.find(v => v.id === t.vendorId) : null
                const daysLeft = t.dueDate ? Math.floor((new Date(t.dueDate).getTime() - Date.now()) / 86400000) : null
                const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && t.status !== 'done'

                return (
                  <div key={t.id} className="flex items-start gap-2.5 py-2 border-b border-stone-100 last:border-0">
                    <button onClick={() => toggleDone(t.id)}
                      className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 mt-0.5 transition ${t.status === 'done' ? 'bg-emerald-600 border-emerald-600' : t.status === 'in_progress' ? 'border-amber-400 bg-amber-50' : 'border-stone-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-semibold ${t.status === 'done' ? 'line-through text-stone-300' : ''}`}>{t.title}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-block px-2 py-0.5 bg-stone-100 rounded text-[9px] font-semibold text-stone-500">{assigneeLabel(t.assignee)}</span>
                        {vendor && <span className="text-[10px] text-stone-400">🏢 {vendor.name}</span>}
                        {urgent && <span className="text-[10px] text-red-600 font-bold">⚠️ D-{daysLeft}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Checklist View */}
      {view === 'checklist' && (
        <div className="bg-stone-50 rounded-xl p-3">
          {filtered.map(t => {
            const daysLeft = t.dueDate ? Math.floor((new Date(t.dueDate).getTime() - Date.now()) / 86400000) : null
            const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && t.status !== 'done'
            return (
              <div key={t.id} className="flex items-start gap-2.5 py-2.5 border-b border-stone-100 last:border-0">
                <button onClick={() => toggleDone(t.id)}
                  className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 mt-0.5 ${t.status === 'done' ? 'bg-emerald-600 border-emerald-600' : 'border-stone-300'}`} />
                <div className="flex-1">
                  <div className={`text-[13px] font-semibold ${t.status === 'done' ? 'line-through text-stone-300' : ''}`}>{t.title}</div>
                  <div className="flex gap-1.5 mt-1">
                    <span className="inline-block px-2 py-0.5 bg-stone-100 rounded text-[9px] font-semibold text-stone-500">{assigneeLabel(t.assignee)}</span>
                    <span className="text-[10px] text-stone-400">{monthLabel(t.monthsBefore)}</span>
                    {urgent && <span className="text-[10px] text-red-600 font-bold">D-{daysLeft}</span>}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center py-6 text-sm text-stone-400">해당하는 항목이 없어요</div>}
        </div>
      )}

      {/* Add task modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-base font-bold mb-4">할 일 추가</div>
            <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="할 일 (예: 예복 매장 방문)"
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none mb-3" />
            <input type="date" value={addDue} onChange={e => setAddDue(e.target.value)}
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none mb-3" />
            <div className="flex gap-2 mb-4">
              {(['both', 'partner1', 'partner2'] as Assignee[]).map(a => (
                <button key={a} onClick={() => setAddAssignee(a)}
                  className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition ${addAssignee === a ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>
                  {a === 'both' ? '둘 다' : a === 'partner1' ? (data.profile.partner1.role || '신부') : (data.profile.partner2.role || '신랑')}
                </button>
              ))}
            </div>
            <button onClick={() => {
              if (!addTitle.trim()) return
              const dueDate = addDue || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
              const monthsBefore = data.profile.weddingDate
                ? Math.max(0, Math.round((new Date(data.profile.weddingDate).getTime() - new Date(dueDate).getTime()) / (30 * 86400000)))
                : 0
              updateData(prev => ({
                ...prev,
                timeline: [...prev.timeline, {
                  id: Math.random().toString(36).slice(2, 8),
                  title: addTitle.trim(), category: 'general', monthsBefore,
                  dueDate, status: 'todo', assignee: addAssignee,
                  note: '', vendorId: '', budgetItemId: '', docIds: [],
                  isCustom: true, completedAt: '', completedBy: 'both',
                }]
              }))
              setAddTitle(''); setAddDue(''); setShowAdd(false)
            }} className={`w-full py-3 rounded-xl text-[14px] font-bold transition ${addTitle.trim() ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}>
              추가
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-xl shadow-lg z-40">+</button>
    </div>
  )
}
