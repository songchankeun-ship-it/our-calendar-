import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { Plus, Trash2 } from 'lucide-react'

// ===== MEMORIES =====
export function Memories() {
  const { data, updateData } = useFirebase()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', desc: '' })

  const save = () => {
    if (!form.title.trim()) return
    updateData(prev => ({
      ...prev,
      memories: [...prev.memories, { ...form, date: form.date || new Date().toISOString().split('T')[0] }]
    }))
    setForm({ title: '', date: '', desc: '' })
    setModal(false)
  }

  const remove = (idx: number) => {
    updateData(prev => ({ ...prev, memories: prev.memories.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {data.memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">📸</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">아직 추억이 없어요</h3>
          <p className="text-sm text-gray-400 mb-4">소중한 순간을 기록해보세요</p>
          <button onClick={() => setModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">추억 기록하기</button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data.memories].reverse().map((m, i) => (
            <div key={i} className="glass-card p-4 border-l-[3px] border-l-coral" style={{ borderRadius: '0 22px 22px 0' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[15px] font-extrabold text-gray-800">{m.title}</div>
                  {m.desc && <div className="text-[13px] text-gray-500 mt-1">{m.desc}</div>}
                  <div className="text-[11px] text-gray-400 mt-1">{m.date}</div>
                </div>
                <button onClick={() => remove(data.memories.length - 1 - i)} className="p-1.5 text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setModal(true)} className="fixed bottom-20 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-light to-teal-dark text-white shadow-lg flex items-center justify-center active:scale-90 transition z-40"><Plus size={22} /></button>
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setModal(false)}>
          <div className="bg-white rounded-t-[28px] w-full max-w-[480px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-black text-center mb-5">📸 추억 기록</h3>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="제목 (예: 첫 여행)" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3" />
            <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="어떤 순간이었나요?" rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-4 resize-none" />
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

// ===== TIME CAPSULES =====
export function Timecapsules() {
  const { data, updateData } = useFirebase()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ message: '', openDate: '', from: 'me' })
  const today = new Date().toISOString().split('T')[0]

  const save = () => {
    if (!form.message.trim() || !form.openDate) return
    updateData(prev => ({
      ...prev,
      timecapsules: [...prev.timecapsules, { ...form, createdAt: today, opened: false }]
    }))
    setForm({ message: '', openDate: '', from: 'me' })
    setModal(false)
  }

  const openCapsule = (idx: number) => {
    updateData(prev => ({
      ...prev,
      timecapsules: prev.timecapsules.map((t, i) => i === idx ? { ...t, opened: true } : t)
    }))
  }

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {data.timecapsules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">📬</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">타임캡슐을 묻어보세요</h3>
          <p className="text-sm text-gray-400 mb-4">미래의 우리에게 메시지를 보내요</p>
          <button onClick={() => setModal(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">캡슐 만들기</button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.timecapsules.map((t, i) => {
            const canOpen = today >= t.openDate
            return (
              <div key={i} className={`glass-card p-4 border-l-[3px] ${canOpen ? 'border-l-gold' : 'border-l-lavender'}`} style={{ borderRadius: '0 22px 22px 0' }}>
                {t.opened ? (
                  <div>
                    <div className="text-[13px] text-gray-600 leading-relaxed">{t.message}</div>
                    <div className="text-[11px] text-gray-400 mt-2">작성: {t.createdAt} · 개봉: {t.openDate}</div>
                  </div>
                ) : canOpen ? (
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎁</div>
                    <div className="text-sm font-bold text-gray-800 mb-2">캡슐을 열 수 있어요!</div>
                    <button onClick={() => openCapsule(i)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-white font-bold text-xs shadow">열어보기</button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="text-sm font-bold text-gray-500">{t.openDate}에 열 수 있어요</div>
                    <div className="text-xs text-gray-400 mt-1">D-{Math.ceil((new Date(t.openDate).getTime() - Date.now()) / 86400000)}</div>
                  </div>
                )}
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
            <h3 className="text-lg font-black text-center mb-5">📬 타임캡슐 만들기</h3>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="미래의 우리에게 메시지를 남겨주세요..." rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-3 resize-none" />
            <label className="text-xs font-bold text-gray-500 mb-1 block">개봉일</label>
            <input type="date" value={form.openDate} onChange={e => setForm(f => ({ ...f, openDate: e.target.value }))} min={today} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm">취소</button>
              <button onClick={save} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">묻기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
