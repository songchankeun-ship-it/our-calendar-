import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'
import { VENDOR_CATEGORIES, type VendorCategory, type VendorStatus } from '../../types/wedding'

export default function VendorAdd({ onBack }: { onBack: () => void }) {
  const { updateData } = useWedding()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<VendorCategory>('wedding_hall')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [consultDate, setConsultDate] = useState('')
  const [quote, setQuote] = useState('')
  const [note, setNote] = useState('')
  const [status] = useState<VendorStatus>('interested')

  const save = () => {
    if (!name.trim()) return
    const id = Math.random().toString(36).slice(2, 8)
    updateData(prev => ({
      ...prev,
      vendors: [...prev.vendors, {
        id, name: name.trim(), category, contactPerson, contactPhone,
        consultDate, quote: parseInt(quote.replace(/[^0-9]/g, '')) || 0,
        status, note, pros: [], cons: [], concerns: [],
        rating1: 0, rating2: 0, comparing: false,
        deposit: 0, depositPaid: false, balance: 0, balanceDue: '', extras: 0,
        files: [], createdBy: 'partner1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }],
      activity: [...(prev.activity || []), {
        id: Math.random().toString(36).slice(2, 8),
        type: 'vendor_added', actor: 'partner1',
        actorName: prev.profile.partner1.name || '나',
        target: name.trim(),
        detail: `${VENDOR_CATEGORIES[category].label} 업체 "${name.trim()}" 추가`,
        timestamp: new Date().toISOString(),
      }]
    }))
    onBack()
  }

  return (
    <div className="pb-24 px-5 pt-2">
      <button onClick={onBack} className="text-[12px] text-stone-400 mb-3">← 돌아가기</button>
      <div className="text-lg font-extrabold mb-4">업체 등록</div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-stone-500 mb-1 block">업체명 *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 더클래식500"
            className="w-full p-3.5 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none" />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-stone-500 mb-2 block">카테고리</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(VENDOR_CATEGORIES).map(([key, val]) => (
              <button key={key} onClick={() => setCategory(key as VendorCategory)}
                className={`px-3 py-2 rounded-xl text-[12px] font-semibold border-2 transition ${category === key ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>
                {val.emoji} {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-stone-500 mb-1 block">담당자</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="김담당"
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-500 mb-1 block">연락처</label>
            <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="010-0000-0000"
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-stone-500 mb-1 block">상담일</label>
            <input type="date" value={consultDate} onChange={e => setConsultDate(e.target.value)}
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-500 mb-1 block">견적 (원)</label>
            <input value={quote} onChange={e => setQuote(e.target.value)} placeholder="12,000,000"
              className="w-full p-3 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-stone-500 mb-1 block">메모</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="상담 내용, 분위기, 특이사항..."
            className="w-full p-3 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none resize-none" />
        </div>

        <button onClick={save} disabled={!name.trim()}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold transition ${name.trim() ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}>
          업체 등록하기
        </button>
      </div>
    </div>
  )
}
