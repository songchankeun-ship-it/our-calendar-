import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'
import { VENDOR_CATEGORIES, type DocType } from '../../types/wedding'

const DOC_TYPES: { key: DocType | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: '전체', emoji: '' },
  { key: 'contract', label: '계약서', emoji: '📄' },
  { key: 'quote', label: '견적서', emoji: '📋' },
  { key: 'capture', label: '캡처', emoji: '📸' },
  { key: 'image', label: '이미지', emoji: '🖼️' },
  { key: 'memo', label: '메모', emoji: '📝' },
]

export default function Documents() {
  const { data, updateData } = useWedding()
  const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all')
  const [search, setSearch] = useState('')

  const docs = (data.documents || [])
    .filter(d => typeFilter === 'all' || d.type === typeFilter)
    .filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  const typeCounts: Record<string, number> = { all: (data.documents || []).length }
  ;(data.documents || []).forEach(d => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1 })

  const vendors = data.vendors || []

  const handleUpload = () => {
    const title = prompt('문서 제목을 입력하세요:')
    if (!title) return
    const type = (prompt('유형을 선택하세요 (contract/quote/capture/image/memo):') || 'memo') as DocType
    const vendorName = prompt('관련 업체 (없으면 비워두세요):')
    const vendor = vendorName ? vendors.find(v => v.name.includes(vendorName)) : null

    updateData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), {
        id: Math.random().toString(36).slice(2, 8),
        title,
        type,
        vendorId: vendor?.id || '',
        category: vendor?.category || 'general',
        file: '',
        note: '',
        uploadedBy: 'partner1',
        uploadedAt: new Date().toISOString(),
      }],
      activity: [...(prev.activity || []), {
        id: Math.random().toString(36).slice(2, 8),
        type: 'doc_uploaded', actor: 'partner1',
        actorName: prev.profile.partner1.name || '나',
        target: title,
        detail: `문서 "${title}" 업로드`,
        timestamp: new Date().toISOString(),
      }]
    }))
  }

  const docEmoji = (type: DocType) => {
    const t = DOC_TYPES.find(d => d.key === type)
    return t?.emoji || '📄'
  }

  const docBg = (type: DocType) => {
    switch (type) {
      case 'contract': return 'bg-emerald-50'
      case 'quote': return 'bg-blue-50'
      case 'capture': return 'bg-amber-50'
      case 'image': return 'bg-purple-50'
      case 'memo': return 'bg-stone-100'
      default: return 'bg-stone-100'
    }
  }

  return (
    <div className="pb-24 px-5 pt-2">
      <div className="flex justify-between items-center mb-3">
        <div className="text-lg font-extrabold">📁 문서함</div>
        <div className="text-[12px] text-stone-400 font-semibold">{(data.documents || []).length}개 문서</div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {DOC_TYPES.map(t => (
          <button key={t.key} onClick={() => setTypeFilter(t.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold ${typeFilter === t.key ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
            {t.label} {typeCounts[t.key] || 0}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 문서 검색..."
        className="w-full p-3 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none mb-3" />

      {/* Document list */}
      {docs.length > 0 ? (
        <div className="bg-white border border-stone-100 rounded-xl p-3">
          {docs.map(d => {
            const vendor = d.vendorId ? vendors.find(v => v.id === d.vendorId) : null
            return (
              <div key={d.id} className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${docBg(d.type)}`}>
                  {docEmoji(d.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{d.title}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {DOC_TYPES.find(t => t.key === d.type)?.label || d.type}
                    {vendor && ` · ${vendor.name}`}
                    {d.category !== 'general' && ` · ${VENDOR_CATEGORIES[d.category]?.label || ''}`}
                    {` · ${new Date(d.uploadedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📁</div>
          <div className="text-sm font-semibold text-stone-500 mb-1">
            {search ? '검색 결과가 없어요' : '아직 문서가 없어요'}
          </div>
          <div className="text-xs text-stone-400 mb-4">견적서, 계약서, 상담 캡처를 보관하세요</div>
          {!search && (
            <button onClick={handleUpload}
              className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[13px] font-bold">문서 추가하기 →</button>
          )}
        </div>
      )}

      {/* FAB */}
      <button onClick={handleUpload}
        className="fixed bottom-24 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-xl shadow-lg z-40">+</button>
    </div>
  )
}
