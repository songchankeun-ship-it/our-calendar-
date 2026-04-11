import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '../../types/data'

const EVENT_COLORS = ['#4a90d9', '#1a365d', '#81E6D9', '#48BB78', '#ECC94B', '#B794F4']

export default function CalendarView() {
  const { data, updateData } = useFirebase()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; event?: CalendarEvent; index?: number; date?: string } | null>(null)
  const [form, setForm] = useState({ title: '', date: '', note: '', color: EVENT_COLORS[0] })

  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const prevLastDate = new Date(year, month, 0).getDate()

  const eventDates = new Set(data.events.map(e => e.date))

  const changeMonth = (dir: number) => {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y)
  }

  const dayStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const openAdd = (date?: string) => {
    const d = date || today.toISOString().split('T')[0]
    setForm({ title: '', date: d, note: '', color: EVENT_COLORS[0] })
    setModal({ type: 'add', date: d })
  }

  const openEdit = (idx: number) => {
    const ev = data.events[idx]
    setForm({ title: ev.title, date: ev.date, note: ev.note || '', color: ev.color || EVENT_COLORS[0] })
    setModal({ type: 'edit', index: idx, event: ev })
  }

  const save = () => {
    if (!form.title || !form.date) return
    updateData(prev => {
      const events = [...prev.events]
      if (modal?.type === 'edit' && modal.index !== undefined) {
        events[modal.index] = { ...form }
      } else {
        events.push({ ...form })
      }
      return { ...prev, events }
    })
    setModal(null)
  }

  const remove = (idx: number) => {
    updateData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== idx)
    }))
    setModal(null)
  }

  const monthEvents = data.events
    .filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .sort((a, b) => a.date.localeCompare(b.date))

  const days: { day: number; current: boolean; isToday: boolean; hasEvent: boolean; dateStr: string }[] = []
  for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevLastDate - i, current: false, isToday: false, hasEvent: false, dateStr: '' })
  for (let d = 1; d <= lastDate; d++) {
    const ds = dayStr(d)
    days.push({
      day: d, current: true,
      isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
      hasEvent: eventDates.has(ds),
      dateStr: ds,
    })
  }
  const rem = (7 - days.length % 7) % 7
  for (let i = 1; i <= rem; i++) days.push({ day: i, current: false, isToday: false, hasEvent: false, dateStr: '' })

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {/* Calendar grid */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <h2 className="text-[15px] font-extrabold text-gray-800">{year}년 {month + 1}월</h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-bold py-1.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
          ))}
          {days.map((d, i) => (
            <button key={i}
              onClick={() => d.current && openAdd(d.dateStr)}
              className={`aspect-square flex flex-col items-center justify-center text-[13px] font-medium rounded-lg relative transition-all
                ${!d.current ? 'text-gray-300' : ''}
                ${d.isToday ? 'bg-gradient-to-br from-teal to-teal-dark text-white font-bold rounded-full shadow-[0_3px_12px_rgba(13,148,136,0.3)]' : ''}
                ${d.current && !d.isToday && i % 7 === 0 ? 'text-red-400' : ''}
                ${d.current && !d.isToday && i % 7 === 6 ? 'text-blue-400' : ''}
                ${d.current && !d.isToday ? 'hover:bg-mint-bg active:scale-95' : ''}
              `}
            >
              {d.day}
              {d.hasEvent && (
                <span className={`absolute bottom-1 w-[5px] h-[5px] rounded-full ${d.isToday ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.5)]' : 'bg-teal shadow-[0_0_4px_rgba(56,178,172,0.4)]'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      {monthEvents.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[15px] font-extrabold text-gray-800 mb-3 px-1">📅 이번 달 일정</h3>
          {monthEvents.map((ev, idx) => {
            const realIdx = data.events.indexOf(ev)
            return (
              <div key={idx} onClick={() => openEdit(realIdx)}
                className="glass-card p-4 mb-2 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ev.color || '#4a90d9' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-gray-800 truncate">{ev.title}</div>
                  <div className="text-[11px] text-gray-400">{ev.date}{ev.note ? ` · ${ev.note}` : ''}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(realIdx) }}
                  className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => openAdd()}
        className="fixed bottom-20 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-light to-teal-dark text-white shadow-[0_4px_16px_rgba(13,148,136,0.35)] flex items-center justify-center active:scale-90 transition-transform z-40">
        <Plus size={22} />
      </button>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setModal(null)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-12px_48px_rgba(0,0,0,0.12)]"
            onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-center mb-5">
              {modal.type === 'edit' ? '✏️ 일정 수정' : '📅 일정 추가'}
            </h3>
            <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">일정 이름</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="예: 100일 기념일"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal focus:ring-4 focus:ring-teal/10 outline-none text-[14px] mb-4 transition" />
            <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">날짜</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal focus:ring-4 focus:ring-teal/10 outline-none text-[14px] mb-4 transition" />
            <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">메모 (선택)</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="짧은 메모"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal focus:ring-4 focus:ring-teal/10 outline-none text-[14px] mb-4 transition" />
            <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">색상</label>
            <div className="flex gap-2 mb-6">
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-teal scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-[14px] hover:bg-gray-50 transition">취소</button>
              <button onClick={save} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-[14px] shadow-[0_4px_14px_rgba(13,148,136,0.25)] active:scale-[0.97] transition">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
