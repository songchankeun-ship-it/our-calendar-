import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'
import { VENDOR_CATEGORIES, VENDOR_STATUS_FLOW, type Vendor, type VendorStatus } from '../../types/wedding'

export default function VendorDetail({ vendor: v, onBack }: { vendor: Vendor; onBack: () => void }) {
  const { data, updateData } = useWedding()
  const statusIdx = VENDOR_STATUS_FLOW.findIndex(s => s.key === v.status)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempVal, setTempVal] = useState('')
  const [showProsCons, setShowProsCons] = useState(false)
  const [prosInput, setProsInput] = useState('')
  const [consInput, setConsInput] = useState('')
  const [concernsInput, setConcernsInput] = useState('')

  const setStatus = (status: VendorStatus) => {
    updateData(prev => ({
      ...prev,
      vendors: prev.vendors.map(vn => vn.id === v.id ? { ...vn, status, updatedAt: new Date().toISOString() } : vn)
    }))
  }

  const setRating = (which: 'rating1' | 'rating2', val: number) => {
    updateData(prev => ({
      ...prev,
      vendors: prev.vendors.map(vn => vn.id === v.id ? { ...vn, [which]: val } : vn)
    }))
  }

  const deleteVendor = () => {
    if (!confirm(`"${v.name}" 업체를 삭제할까요?`)) return
    updateData(prev => ({ ...prev, vendors: prev.vendors.filter(vn => vn.id !== v.id) }))
    onBack()
  }

  const updateField = (field: string, value: string | number) => {
    updateData(prev => ({
      ...prev,
      vendors: prev.vendors.map(vn => vn.id === v.id ? { ...vn, [field]: value, updatedAt: new Date().toISOString() } : vn)
    }))
  }

  const editField = (field: string, current: string) => {
    setEditingField(field)
    setTempVal(current)
  }

  const saveField = () => {
    if (!editingField) return
    const numFields = ['quote', 'deposit', 'balance', 'extras']
    const val = numFields.includes(editingField) ? parseInt(tempVal.replace(/[^0-9]/g, '')) || 0 : tempVal
    updateField(editingField, val)
    setEditingField(null)
  }

  const addProsCons = () => {
    updateData(prev => ({
      ...prev,
      vendors: prev.vendors.map(vn => {
        if (vn.id !== v.id) return vn
        return {
          ...vn,
          pros: prosInput ? [...vn.pros, prosInput] : vn.pros,
          cons: consInput ? [...vn.cons, consInput] : vn.cons,
          concerns: concernsInput ? [...vn.concerns, concernsInput] : vn.concerns,
        }
      })
    }))
    setProsInput('')
    setConsInput('')
    setConcernsInput('')
    setShowProsCons(false)
  }

  const removeProsCons = (type: 'pros' | 'cons' | 'concerns', idx: number) => {
    updateData(prev => ({
      ...prev,
      vendors: prev.vendors.map(vn => {
        if (vn.id !== v.id) return vn
        return { ...vn, [type]: vn[type].filter((_: string, i: number) => i !== idx) }
      })
    }))
  }

  // Related docs
  const relatedDocs = (data.documents || []).filter(d => d.vendorId === v.id)
  // Related timeline
  const relatedTasks = (data.timeline || []).filter(t => t.vendorId === v.id)

  // Next action suggestion
  const nextAction = v.status === 'interested' ? '상담을 예약해보세요'
    : v.status === 'consult_scheduled' ? '상담일을 확인하세요'
    : v.status === 'consult_done' ? '견적을 요청하세요'
    : v.status === 'quote_received' ? '비교 목록에 추가하세요'
    : v.status === 'comparing' ? '최종 결정을 내려보세요'
    : v.status === 'contracted' && v.balance > 0 ? `잔금 ${(v.balance / 10000).toLocaleString()}만원 납부 ${v.balanceDue ? `(${v.balanceDue})` : ''}`
    : v.status === 'contracted' ? '계약이 완료되었어요'
    : ''

  const nextCta = v.status === 'interested' ? { label: '상담 예약으로 변경', action: () => setStatus('consult_scheduled') }
    : v.status === 'consult_done' ? { label: '견적 받음으로 변경', action: () => setStatus('quote_received') }
    : v.status === 'quote_received' ? { label: '비교중으로 변경', action: () => setStatus('comparing') }
    : v.status === 'comparing' ? { label: '계약 완료로 변경', action: () => setStatus('contracted') }
    : null

  return (
    <div className="pb-6 pt-2">
      {/* Back + Delete */}
      <div className="px-5 mb-2 flex justify-between items-center">
        <button onClick={onBack} className="text-[12px] text-stone-400">← 업체 목록</button>
        <button onClick={deleteVendor} className="text-[12px] text-red-400 font-semibold">삭제</button>
      </div>

      {/* Header */}
      <div className="px-5">
        <div className="text-[22px] font-extrabold">{v.name}</div>
        <div className="text-[12px] text-stone-400 mt-0.5">
          {VENDOR_CATEGORIES[v.category]?.emoji} {VENDOR_CATEGORIES[v.category]?.label}
          {' · '}
          <span className="font-semibold" style={{ color: VENDOR_STATUS_FLOW.find(s => s.key === v.status)?.color }}>
            {VENDOR_STATUS_FLOW.find(s => s.key === v.status)?.label}
          </span>
        </div>

        {/* Pipeline */}
        <div className="flex gap-1 mt-3">
          {VENDOR_STATUS_FLOW.filter(s => !['completed', 'rejected'].includes(s.key)).map((s, i) => (
            <div key={s.key} className={`h-1 flex-1 rounded-full ${i <= statusIdx ? 'bg-stone-900' : 'bg-stone-200'}`} />
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-stone-300 mt-1 px-0.5">
          {VENDOR_STATUS_FLOW.filter(s => !['completed', 'rejected'].includes(s.key)).map(s => (
            <span key={s.key}>{s.label}</span>
          ))}
        </div>
      </div>

      {/* Next Action */}
      {nextAction && (
        <div className="mx-5 mt-4 bg-gradient-to-r from-stone-900 to-stone-700 rounded-2xl p-4 text-white">
          <div className="text-[10px] opacity-50 font-bold mb-1">📌 다음 액션</div>
          <div className="text-[14px] font-bold mb-3">{nextAction}</div>
          {nextCta && (
            <button onClick={nextCta.action}
              className="inline-block px-4 py-2 bg-white text-stone-900 rounded-xl text-[12px] font-bold">
              {nextCta.label} →
            </button>
          )}
        </div>
      )}

      {/* Pros / Cons / Concerns */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">장점 / 단점 / 우려</div>
          <button onClick={() => setShowProsCons(!showProsCons)} className="text-[11px] text-blue-600 font-semibold">
            {showProsCons ? '닫기' : '+ 추가'}
          </button>
        </div>
        {showProsCons && (
          <div className="bg-stone-50 rounded-xl p-3 mb-3 space-y-2">
            <input value={prosInput} onChange={e => setProsInput(e.target.value)} placeholder="장점 입력"
              className="w-full p-2 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-stone-900" />
            <input value={consInput} onChange={e => setConsInput(e.target.value)} placeholder="단점 입력"
              className="w-full p-2 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-stone-900" />
            <input value={concernsInput} onChange={e => setConcernsInput(e.target.value)} placeholder="우려 입력"
              className="w-full p-2 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-stone-900" />
            <button onClick={addProsCons} className="w-full py-2 bg-stone-900 text-white rounded-lg text-[12px] font-bold">추가</button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="text-[10px] font-bold text-stone-400 mb-1.5">👍 장점</div>
            {v.pros.map((p, i) => <div key={i} className="text-[11px] leading-relaxed flex justify-between">{p}<button onClick={() => removeProsCons('pros', i)} className="text-stone-300 text-[10px]">×</button></div>)}
            {v.pros.length === 0 && <div className="text-[10px] text-stone-300">없음</div>}
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="text-[10px] font-bold text-stone-400 mb-1.5">👎 단점</div>
            {v.cons.map((c, i) => <div key={i} className="text-[11px] leading-relaxed flex justify-between">{c}<button onClick={() => removeProsCons('cons', i)} className="text-stone-300 text-[10px]">×</button></div>)}
            {v.cons.length === 0 && <div className="text-[10px] text-stone-300">없음</div>}
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="text-[10px] font-bold text-stone-400 mb-1.5">⚠️ 우려</div>
            {v.concerns.map((c, i) => <div key={i} className="text-[11px] leading-relaxed flex justify-between">{c}<button onClick={() => removeProsCons('concerns', i)} className="text-stone-300 text-[10px]">×</button></div>)}
            {v.concerns.length === 0 && <div className="text-[10px] text-stone-300">없음</div>}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        {/* Basic info */}
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">기본 정보</div>
        <div className="bg-white border border-stone-100 rounded-xl p-3 mb-4">
          {[
            ['contactPerson', '담당자', v.contactPerson],
            ['contactPhone', '연락처', v.contactPhone],
            ['consultDate', '상담일', v.consultDate],
            ['quote', '견적', v.quote > 0 ? `${(v.quote / 10000).toLocaleString()}만원` : '-'],
          ].map(([field, l, val]) => (
            <div key={String(l)} className="flex justify-between py-2 border-b border-stone-50 last:border-0 text-[13px]">
              <span className="text-stone-400">{l}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{val || '-'}</span>
                <button onClick={() => editField(String(field), String(field === 'quote' ? v.quote : val || ''))} className="text-[11px] text-blue-600">수정</button>
              </div>
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">평가</div>
        <div className="bg-white border border-stone-100 rounded-xl p-4 mb-4 flex justify-around">
          <div className="text-center">
            <div className="text-[10px] text-stone-400 font-semibold mb-1">나의 평가</div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating('rating1', n)}
                  className={`text-lg ${n <= v.rating1 ? 'text-amber-400' : 'text-stone-200'}`}>★</button>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-stone-400 font-semibold mb-1">파트너 평가</div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating('rating2', n)}
                  className={`text-lg ${n <= v.rating2 ? 'text-amber-400' : 'text-stone-200'}`}>★</button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget link */}
        {(v.deposit > 0 || v.balance > 0 || v.extras > 0) && (
          <>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">예산 연동</div>
            <div className="bg-white border border-stone-100 rounded-xl p-3 mb-4">
              {v.deposit > 0 && (
                <div className="flex justify-between py-2 border-b border-stone-50 text-[13px]">
                  <span className="text-stone-400">계약금</span>
                  <span className="font-semibold">{(v.deposit / 10000).toLocaleString()}만 {v.depositPaid && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">납부</span>}</span>
                </div>
              )}
              {v.balance > 0 && (
                <div className="flex justify-between py-2 border-b border-stone-50 text-[13px]">
                  <span className="text-stone-400">잔금</span>
                  <span className="font-semibold">{(v.balance / 10000).toLocaleString()}만 {v.balanceDue && <span className="text-[11px] text-red-600">{v.balanceDue}</span>}</span>
                </div>
              )}
              {v.extras > 0 && (
                <div className="flex justify-between py-2 text-[13px]">
                  <span className="text-stone-400">추가금</span>
                  <span className="font-semibold text-red-600">+{(v.extras / 10000).toLocaleString()}만</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Related docs */}
        {relatedDocs.length > 0 && (
          <>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">📎 관련 문서</div>
            <div className="bg-stone-50 rounded-xl p-3 mb-4">
              {relatedDocs.map(d => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  <span className="text-lg">{d.type === 'contract' ? '📄' : d.type === 'quote' ? '📄' : '📸'}</span>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold">{d.title}</div>
                    <div className="text-[10px] text-stone-400">{d.uploadedAt?.slice(0, 10)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Related tasks */}
        {relatedTasks.length > 0 && (
          <>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">✅ 관련 체크리스트</div>
            <div className="bg-stone-50 rounded-xl p-3 mb-4">
              {relatedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${t.status === 'done' ? 'bg-emerald-600 border-emerald-600' : 'border-stone-300'}`} />
                  <span className={`text-[12px] font-semibold ${t.status === 'done' ? 'line-through text-stone-300' : ''}`}>{t.title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Note */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">메모</div>
          <button onClick={() => editField('note', v.note)} className="text-[11px] text-blue-600 font-semibold">수정</button>
        </div>
        <div className="bg-stone-50 rounded-xl p-3 text-[12px] text-stone-600 leading-relaxed mb-4">
          {v.note || '메모를 추가해보세요'}
        </div>
      </div>

      {/* Edit modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setEditingField(null)}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-base font-bold mb-4">
              {editingField === 'contactPerson' ? '담당자' : editingField === 'contactPhone' ? '연락처' : editingField === 'consultDate' ? '상담일' : editingField === 'quote' ? '견적 (원)' : editingField === 'note' ? '메모' : editingField} 수정
            </div>
            {editingField === 'note' ? (
              <textarea value={tempVal} onChange={e => setTempVal(e.target.value)} rows={4}
                className="w-full p-4 border-2 border-stone-200 rounded-xl text-[14px] focus:border-stone-900 outline-none resize-none" />
            ) : editingField === 'consultDate' ? (
              <input type="date" value={tempVal} onChange={e => setTempVal(e.target.value)}
                className="w-full p-4 border-2 border-stone-200 rounded-xl text-[15px] focus:border-stone-900 outline-none" />
            ) : (
              <input value={tempVal} onChange={e => setTempVal(e.target.value)}
                className="w-full p-4 border-2 border-stone-200 rounded-xl text-[15px] focus:border-stone-900 outline-none" />
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingField(null)} className="flex-1 py-3 text-[14px] font-semibold text-stone-400">취소</button>
              <button onClick={saveField} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-[14px] font-bold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
