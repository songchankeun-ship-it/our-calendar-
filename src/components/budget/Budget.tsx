import { useWedding } from '../../contexts/WeddingContext'
import { BUDGET_CATEGORIES, type VendorCategory } from '../../types/wedding'

import { useState } from 'react'

export default function Budget() {
  const { data, updateData } = useWedding()
  const [showAdd, setShowAdd] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addCat, setAddCat] = useState('wedding_hall')
  const [addAmount, setAddAmount] = useState('')
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const { budget, vendors, profile } = data
  const items = budget.items || []

  const totalBudget = profile.totalBudget || 0
  const confirmed = items.filter(i => i.status !== 'estimated').reduce((s, i) => s + i.amount + i.extras, 0)
  const paid = items.filter(i => i.depositPaid).reduce((s, i) => s + i.deposit, 0)
  const upcoming = items.filter(i => i.balance > 0).reduce((s, i) => s + i.balance, 0)
    + vendors.filter(v => v.balance > 0).reduce((s, v) => s + v.balance, 0)
  const paidFromVendors = vendors.filter(v => v.depositPaid).reduce((s, v) => s + v.deposit, 0)
  const totalPaid = paid + paidFromVendors

  // Upcoming payments from vendors
  const payments = vendors
    .filter(v => v.balance > 0 && v.balanceDue)
    .map(v => ({ name: v.name, amount: v.balance, due: v.balanceDue, month: new Date(v.balanceDue).getMonth() + 1 }))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())

  // Category breakdown - use vendor data to calculate spent
  const catData = BUDGET_CATEGORIES.map(cat => {
    const planned = budget.categories[cat.key] || 0
    const fromItems = items.filter(i => i.category === cat.key).reduce((s, i) => s + i.amount + i.extras, 0)
    const fromVendors = vendors.filter(v => v.category === cat.key && (v.status === 'contracted' || v.status === 'completed'))
      .reduce((s, v) => s + v.quote + v.extras, 0)
    const spent = Math.max(fromItems, fromVendors)
    const pct = planned > 0 ? Math.round((spent / planned) * 100) : 0
    const over = spent > planned
    return { ...cat, planned, spent, pct, over }
  }).filter(c => c.planned > 0)

  const overCats = catData.filter(c => c.over)

  const fmt = (n: number) => `${(n / 10000).toLocaleString()}만`

  return (
    <div className="pb-6 px-5 pt-2">
      <div className="text-lg font-extrabold mb-3">💰 예산 관리</div>

      {/* 4-box */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => { setBudgetInput(String(totalBudget)); setEditingBudget(true) }}
          className="bg-white border border-stone-100 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-stone-400 mb-0.5">목표 예산 ✏️</div>
          <div className="text-xl font-extrabold">{fmt(totalBudget)}</div>
          <div className="text-[10px] text-stone-400">설정 총액</div>
        </button>
        <div className="bg-white border border-stone-100 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-stone-400 mb-0.5">확정 예산</div>
          <div className="text-xl font-extrabold">{fmt(confirmed)}</div>
          <div className="text-[10px] text-stone-400">계약 확정</div>
        </div>
        <div className="bg-white border border-stone-100 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-stone-400 mb-0.5">이미 낸 돈</div>
          <div className="text-xl font-extrabold text-emerald-600">{fmt(totalPaid)}</div>
          <div className="text-[10px] text-stone-400">계약금 등</div>
        </div>
        <div className="bg-white border border-stone-100 rounded-xl p-3 text-center">
          <div className="text-[10px] font-semibold text-stone-400 mb-0.5">앞으로 나갈 돈</div>
          <div className="text-xl font-extrabold text-red-600">{fmt(upcoming)}</div>
          <div className="text-[10px] text-stone-400">잔금 등</div>
        </div>
      </div>

      {/* Payment timeline */}
      {payments.length > 0 && (
        <>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-4">잔금 일정</div>
          <div className="bg-stone-50 rounded-xl p-4 mb-3">
            <div className="flex items-end gap-0 overflow-x-auto">
              {payments.map((p, i) => (
                <div key={i} className="flex-1 min-w-[60px] text-center">
                  <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${p.amount >= 5000000 ? 'w-3.5 h-3.5 bg-red-600' : 'bg-stone-900'}`} />
                  <div className="text-[11px] font-bold">{fmt(p.amount)}</div>
                  <div className="text-[9px] text-stone-400 mt-0.5">{p.name}</div>
                  <div className="text-[8px] text-stone-300">{p.month}월</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Over budget alert */}
      {overCats.map(cat => (
        <div key={cat.key} className="flex items-center gap-2 bg-red-50 text-red-800 rounded-xl px-3 py-2.5 text-[12px] font-medium mb-2">
          🔴 {cat.label} {fmt(cat.spent - cat.planned)} 초과 — 예산 조정 필요
        </div>
      ))}

      {/* Category breakdown */}
      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-4">카테고리별</div>
      {catData.map(cat => (
        <div key={cat.key} className={`bg-white border rounded-xl p-3.5 mb-2 ${cat.over ? 'border-red-200' : 'border-stone-100'}`}>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-base">{cat.emoji}</span>
            <span className="text-[14px] font-bold flex-1">{cat.label}</span>
            <span className={`text-[14px] font-bold ${cat.over ? 'text-red-600' : ''}`}>{fmt(cat.spent)}</span>
            <span className="text-[11px] text-stone-400">/ {fmt(cat.planned)}{cat.over && <span className="text-red-600 font-bold"> +{fmt(cat.spent - cat.planned)}</span>}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${cat.over ? 'bg-red-500' : cat.pct > 70 ? 'bg-amber-500' : 'bg-stone-900'}`}
              style={{ width: `${Math.min(cat.pct, 100)}%` }} />
          </div>
        </div>
      ))}

      {/* Empty */}
      {catData.every(c => c.spent === 0) && (
        <div className="text-center py-8">
          <div className="text-sm text-stone-400">업체를 등록하고 계약하면<br/>예산이 자동으로 반영돼요</div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-base font-bold mb-4">예산 항목 추가</div>
            <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="항목명 (예: 웨딩홀 대관료)"
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none mb-3" />
            <select value={addCat} onChange={e => setAddCat(e.target.value)}
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none mb-3 bg-white">
              {BUDGET_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
            <input value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="금액 (원)"
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none mb-4" />
            <button onClick={() => {
              if (!addTitle.trim()) return
              updateData(prev => ({
                ...prev,
                budget: { ...prev.budget, items: [...prev.budget.items, {
                  id: Math.random().toString(36).slice(2,8), title: addTitle.trim(),
                  category: addCat as VendorCategory, amount: parseInt(addAmount.replace(/[^0-9]/g,'')) || 0,
                  status: 'estimated', deposit: 0, depositPaid: false, balance: 0,
                  balanceDue: '', extras: 0, note: '', vendorId: '', createdBy: 'partner1',
                  updatedAt: new Date().toISOString()
                }]}
              }))
              setAddTitle(''); setAddAmount(''); setShowAdd(false)
            }} className="w-full py-3 bg-stone-900 text-white rounded-xl text-[14px] font-bold">추가</button>
          </div>
        </div>
      )}

      {/* Budget edit modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setEditingBudget(false)}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-base font-bold mb-4">목표 예산 수정</div>
            <input value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="예: 40000000"
              className="w-full p-4 border-2 border-stone-200 rounded-xl text-[15px] focus:border-stone-900 outline-none" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingBudget(false)} className="flex-1 py-3 text-[14px] font-semibold text-stone-400">취소</button>
              <button onClick={() => {
                const val = parseInt(budgetInput.replace(/[^0-9]/g, '')) || 0
                if (val > 0) updateData(prev => ({ ...prev, profile: { ...prev.profile, totalBudget: val } }))
                setEditingBudget(false)
              }} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-[14px] font-bold">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-xl shadow-lg z-40">+</button>
    </div>
  )
}
