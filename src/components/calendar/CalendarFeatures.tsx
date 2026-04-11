import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { Plus, Trash2, MapPin, Gift, Cake, PiggyBank } from 'lucide-react'

// ===== BIRTHDAYS =====
export function Birthdays() {
  const { data, updateData } = useFirebase()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', relation: '' })

  const save = () => {
    if (!form.name.trim() || !form.date) return
    updateData(prev => ({ ...prev, birthdays: [...prev.birthdays, { ...form }] }))
    setForm({ name: '', date: '', relation: '' })
    setModal(false)
  }

  const remove = (idx: number) => updateData(prev => ({ ...prev, birthdays: prev.birthdays.filter((_, i) => i !== idx) }))

  const getDday = (dateStr: string) => {
    const [, m, d] = dateStr.split('-').map(Number)
    const today = new Date()
    let next = new Date(today.getFullYear(), m - 1, d)
    if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d)
    return Math.ceil((next.getTime() - today.getTime()) / 86400000)
  }

  const sorted = [...data.birthdays].sort((a, b) => getDday(a.date) - getDday(b.date))

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">🎂</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">생일을 등록해보세요</h3>
          <button onClick={() => setModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg mt-2">생일 등록</button>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((b, i) => {
            const dd = getDday(b.date)
            const realIdx = data.birthdays.indexOf(b)
            return (
              <div key={i} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><Cake size={18} className="text-amber-500" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-gray-800 truncate">{b.name} {b.relation && <span className="text-gray-400 font-normal">({b.relation})</span>}</div>
                  <div className="text-[11px] text-gray-400">{b.date.split('-').slice(1).join('월 ')}일</div>
                </div>
                <div className="text-sm font-extrabold text-teal">{dd === 0 ? '🎉 오늘!' : `D-${dd}`}</div>
                <button onClick={() => remove(realIdx)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            )
          })}
        </div>
      )}
      <button onClick={() => setModal(true)} className="fixed bottom-20 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-light to-teal-dark text-white shadow-lg flex items-center justify-center active:scale-90 transition z-40"><Plus size={22} /></button>
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setModal(false)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-center mb-5">🎂 생일 등록</h3>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="이름" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} placeholder="관계 (예: 엄마, 친구)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm">취소</button>
              <button onClick={save} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== WISHLIST =====
export function Wishlist() {
  const { data, updateData } = useFirebase()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', price: '', link: '' })

  const save = () => {
    if (!form.title.trim()) return
    updateData(prev => ({ ...prev, wishes: [...prev.wishes, { ...form, done: false }] }))
    setForm({ title: '', price: '', link: '' })
    setModal(false)
  }

  const toggle = (idx: number) => updateData(prev => ({ ...prev, wishes: prev.wishes.map((w, i) => i === idx ? { ...w, done: !w.done } : w) }))
  const remove = (idx: number) => updateData(prev => ({ ...prev, wishes: prev.wishes.filter((_, i) => i !== idx) }))

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {data.wishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">🎁</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">위시리스트가 비어있어요</h3>
          <button onClick={() => setModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg mt-2">위시 추가</button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.wishes.map((w, i) => (
            <div key={i} onClick={() => toggle(i)} className={`glass-card p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition ${w.done ? 'opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center"><Gift size={18} className="text-pink-500" /></div>
              <div className="flex-1">
                <div className={`text-[14px] font-bold ${w.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{w.title}</div>
                {w.price && <div className="text-[11px] text-gray-400">{w.price}</div>}
              </div>
              <span>{w.done ? '✅' : '⬜'}</span>
              <button onClick={e => { e.stopPropagation(); remove(i) }} className="p-1 text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setModal(true)} className="fixed bottom-20 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-light to-teal-dark text-white shadow-lg flex items-center justify-center active:scale-90 transition z-40"><Plus size={22} /></button>
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setModal(false)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-center mb-5">🎁 위시 추가</h3>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="갖고 싶은 것" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="가격 (선택)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm">취소</button>
              <button onClick={save} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== DATE SPOTS =====
export function DateSpots() {
  const { data, updateData } = useFirebase()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', note: '' })

  const save = () => {
    if (!form.name.trim()) return
    updateData(prev => ({ ...prev, spots: [...prev.spots, { ...form, visited: false }] }))
    setForm({ name: '', address: '', note: '' })
    setModal(false)
  }

  const toggle = (idx: number) => updateData(prev => ({ ...prev, spots: prev.spots.map((s, i) => i === idx ? { ...s, visited: !s.visited } : s) }))

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {data.spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">📍</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">가고 싶은 곳을 추가해요</h3>
          <button onClick={() => setModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg mt-2">장소 추가</button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.spots.map((s, i) => (
            <div key={i} onClick={() => toggle(i)} className={`glass-card p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition ${s.visited ? 'opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center"><MapPin size={18} className="text-teal" /></div>
              <div className="flex-1">
                <div className={`text-[14px] font-bold ${s.visited ? 'line-through text-gray-400' : 'text-gray-800'}`}>{s.name}</div>
                {s.address && <div className="text-[11px] text-gray-400">{s.address}</div>}
              </div>
              <span>{s.visited ? '✅' : '📍'}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setModal(true)} className="fixed bottom-20 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-light to-teal-dark text-white shadow-lg flex items-center justify-center active:scale-90 transition z-40"><Plus size={22} /></button>
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setModal(false)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-center mb-5">📍 데이트 장소 추가</h3>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="장소명" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="주소 (선택)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="메모 (선택)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm">취소</button>
              <button onClick={save} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== SAVINGS =====
export function Savings() {
  const { data, updateData } = useFirebase()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', target: '', current: '' })

  const save = () => {
    if (!form.title.trim() || !form.target) return
    updateData(prev => ({
      ...prev,
      savings: [...prev.savings, { title: form.title, target: Number(form.target), current: Number(form.current) || 0, date: new Date().toISOString().split('T')[0] }]
    }))
    setForm({ title: '', target: '', current: '' })
    setModal(false)
  }

  const addAmount = (idx: number, amount: number) => {
    updateData(prev => ({
      ...prev,
      savings: prev.savings.map((s, i) => i === idx ? { ...s, current: Math.min(s.target, s.current + amount) } : s)
    }))
  }

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {data.savings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">💰</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">함께 저축을 시작해요</h3>
          <button onClick={() => setModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg mt-2">저축 목표 만들기</button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.savings.map((s, i) => {
            const pct = Math.round(s.current / s.target * 100)
            return (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank size={18} className="text-teal" />
                  <span className="text-[15px] font-extrabold text-gray-800">{s.title}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{s.current.toLocaleString()}원</span>
                  <span>{s.target.toLocaleString()}원</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-teal-light to-teal rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2">
                  {[1000, 5000, 10000].map(amt => (
                    <button key={amt} onClick={() => addAmount(i, amt)} className="flex-1 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 hover:bg-mint-bg active:scale-95 transition">+{(amt/1000)}천</button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <button onClick={() => setModal(true)} className="fixed bottom-20 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-light to-teal-dark text-white shadow-lg flex items-center justify-center active:scale-90 transition z-40"><Plus size={22} /></button>
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setModal(false)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-center mb-5">💰 저축 목표</h3>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="목표 (예: 여행 자금)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="목표 금액 (원)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm">취소</button>
              <button onClick={save} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">시작</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
