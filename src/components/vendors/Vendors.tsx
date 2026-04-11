import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'
import { VENDOR_CATEGORIES, VENDOR_STATUS_FLOW, type Vendor, type VendorCategory, type VendorStatus } from '../../types/wedding'
import VendorDetail from './VendorDetail'
import VendorAdd from './VendorAdd'

type SubView = 'list' | 'board' | 'compare'

export default function Vendors() {
  const { data } = useWedding()
  const [view, setView] = useState<SubView>('list')
  const [catFilter, setCatFilter] = useState<VendorCategory | 'all'>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const vendors = data.vendors || []
  const filtered = catFilter === 'all' ? vendors : vendors.filter(v => v.category === catFilter)

  if (detailId) {
    const vendor = vendors.find(v => v.id === detailId)
    if (vendor) return <VendorDetail vendor={vendor} onBack={() => setDetailId(null)} />
  }

  if (showAdd) return <VendorAdd onBack={() => setShowAdd(false)} />

  // Category counts
  const catCounts: Record<string, number> = { all: vendors.length }
  vendors.forEach(v => { catCounts[v.category] = (catCounts[v.category] || 0) + 1 })

  return (
    <div className="pb-24 px-5 pt-2">
      <div className="text-lg font-extrabold mb-3">🏢 업체 관리</div>

      {/* Sub tabs */}
      <div className="flex bg-stone-100 rounded-xl p-1 mb-3">
        {(['list', 'board', 'compare'] as SubView[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${view === v ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>
            {v === 'list' ? '목록' : v === 'board' ? '보드' : '비교'}
          </button>
        ))}
      </div>

      {view === 'list' && <ListView vendors={filtered} catFilter={catFilter} catCounts={catCounts} onCatChange={setCatFilter} onSelect={setDetailId} />}
      {view === 'board' && <BoardView vendors={vendors} onSelect={setDetailId} />}
      {view === 'compare' && <CompareView vendors={vendors.filter(v => v.comparing)} />}

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-[calc(50%-220px)] w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-xl shadow-lg z-40">+</button>

      {/* Empty */}
      {vendors.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏢</div>
          <div className="text-sm font-semibold text-stone-500 mb-1">아직 업체가 없어요</div>
          <div className="text-xs text-stone-400 mb-4">웨딩홀부터 등록해보세요. 보통 12개월 전에 시작해요.</div>
          <button onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[13px] font-bold">업체 등록하기 →</button>
        </div>
      )}
    </div>
  )
}

// === LIST VIEW ===
function ListView({ vendors, catFilter, catCounts, onCatChange, onSelect }: {
  vendors: Vendor[]; catFilter: string; catCounts: Record<string, number>
  onCatChange: (c: VendorCategory | 'all') => void; onSelect: (id: string) => void
}) {
  const { updateData } = useWedding()

  const toggleCompare = (id: string) => {
    updateData(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === id ? { ...v, comparing: !v.comparing } : v)
    }))
  }

  const statusBadge = (status: VendorStatus) => {
    const s = VENDOR_STATUS_FLOW.find(f => f.key === status)
    if (!s) return null
    const colors: Record<string, string> = {
      interested: 'bg-stone-100 text-stone-500',
      consult_scheduled: 'bg-blue-50 text-blue-700',
      consult_done: 'bg-purple-50 text-purple-700',
      quote_received: 'bg-blue-50 text-blue-700',
      comparing: 'bg-amber-50 text-amber-700',
      contracted: 'bg-emerald-50 text-emerald-700',
      completed: 'bg-emerald-50 text-emerald-700',
      on_hold: 'bg-stone-100 text-stone-500',
      rejected: 'bg-red-50 text-red-700',
    }
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colors[status] || ''}`}>{s.label}</span>
  }

  return (
    <>
      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        <button onClick={() => onCatChange('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold ${catFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
          전체 {catCounts.all || 0}
        </button>
        {Object.entries(VENDOR_CATEGORIES).map(([key, val]) => catCounts[key] ? (
          <button key={key} onClick={() => onCatChange(key as VendorCategory)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold ${catFilter === key ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
            {val.label} {catCounts[key]}
          </button>
        ) : null)}
      </div>

      {/* Cards */}
      {vendors.map(v => (
        <div key={v.id} onClick={() => onSelect(v.id)}
          className={`bg-white border rounded-2xl p-4 mb-2.5 cursor-pointer transition hover:shadow-sm ${v.status === 'on_hold' || v.status === 'rejected' ? 'opacity-50 border-stone-100' : 'border-stone-100'}`}>
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="text-[15px] font-bold">{v.name}</div>
              <div className="text-[11px] text-stone-400">{VENDOR_CATEGORIES[v.category]?.label}</div>
            </div>
            {statusBadge(v.status)}
          </div>
          {(v.consultDate || v.contactPerson) && (
            <div className="flex gap-3 text-[11px] text-stone-400 mt-1.5 mb-2">
              {v.consultDate && <span>📅 {v.consultDate}</span>}
              {v.contactPerson && <span>👤 {v.contactPerson}</span>}
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-base font-bold">{v.quote > 0 ? `${(v.quote / 10000).toLocaleString()}만` : '-'}</span>
            <button onClick={(e) => { e.stopPropagation(); toggleCompare(v.id) }}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold border transition ${v.comparing ? 'border-stone-900 text-stone-900' : 'border-stone-200 text-stone-400'}`}>
              {v.comparing ? '✓ 비교중' : '+ 비교'}
            </button>
          </div>
          {v.note && <div className="text-[11px] text-stone-400 mt-2 line-clamp-1">{v.note}</div>}
        </div>
      ))}
    </>
  )
}

// === BOARD VIEW (KANBAN) ===
function BoardView({ vendors, onSelect }: { vendors: Vendor[]; onSelect: (id: string) => void }) {
  const columns = VENDOR_STATUS_FLOW.filter(s => !['completed', 'rejected'].includes(s.key))

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2">
      {columns.map(col => {
        const items = vendors.filter(v => v.status === col.key)
        return (
          <div key={col.key} className="min-w-[130px] shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: col.color }}>
              {col.label} ({items.length})
            </div>
            {items.map(v => (
              <div key={v.id} onClick={() => onSelect(v.id)}
                className="bg-white border border-stone-100 rounded-xl p-3 mb-2 cursor-pointer hover:shadow-sm" style={{ borderLeftColor: col.color, borderLeftWidth: 3 }}>
                <div className="text-[12px] font-bold mb-0.5">{v.name}</div>
                <div className="text-[10px] text-stone-400">{VENDOR_CATEGORIES[v.category]?.label}</div>
                {v.quote > 0 && <div className="text-[13px] font-bold mt-1.5">{(v.quote / 10000).toLocaleString()}만</div>}
              </div>
            ))}
            {items.length === 0 && (
              <div className="border border-dashed border-stone-200 rounded-xl p-3 text-center text-[10px] text-stone-300">없음</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// === COMPARE VIEW ===
function CompareView({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">⚖️</div>
        <div className="text-sm font-semibold text-stone-500 mb-1">비교할 업체를 선택하세요</div>
        <div className="text-xs text-stone-400">목록에서 "비교" 버튼을 눌러 담아보세요</div>
      </div>
    )
  }

  // Group by category
  const grouped: Record<string, Vendor[]> = {}
  vendors.forEach(v => {
    const cat = VENDOR_CATEGORIES[v.category]?.label || '기타'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(v)
  })

  const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

  return (
    <div>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="mb-5">
          <div className="text-[13px] font-bold mb-2">{cat} 비교 ({items.length}곳)</div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="min-w-[400px] w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left p-2 font-bold text-stone-400 sticky left-0 bg-stone-50 z-10 w-20"></th>
                  {items.map(v => (
                    <th key={v.id} className={`p-2 font-bold text-left ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>
                      {v.name} {v.status === 'contracted' && '🏆'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 text-stone-400 font-semibold sticky left-0 bg-white">견적</td>
                  {items.map(v => <td key={v.id} className={`p-2 font-bold ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>{v.quote > 0 ? `${(v.quote / 10000).toLocaleString()}만` : '-'}</td>)}</tr>
                <tr className="border-t border-stone-50"><td className="p-2 text-stone-400 font-semibold sticky left-0 bg-white">추가금</td>
                  {items.map(v => <td key={v.id} className={`p-2 ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>{v.extras > 0 ? `${(v.extras / 10000).toLocaleString()}만` : '-'}</td>)}</tr>
                <tr className="border-t border-stone-50"><td className="p-2 text-stone-400 font-semibold sticky left-0 bg-white">상담일</td>
                  {items.map(v => <td key={v.id} className={`p-2 ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>{v.consultDate || '-'}</td>)}</tr>
                <tr className="border-t border-stone-50"><td className="p-2 text-stone-400 font-semibold sticky left-0 bg-white">담당자</td>
                  {items.map(v => <td key={v.id} className={`p-2 ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>{v.contactPerson || '-'}</td>)}</tr>
                <tr className="border-t border-stone-100 bg-stone-50"><td className="p-2 text-stone-400 font-bold sticky left-0 bg-stone-50">내 평가</td>
                  {items.map(v => <td key={v.id} className={`p-2 text-amber-500 font-bold ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>{v.rating1 > 0 ? stars(v.rating1) : '-'}</td>)}</tr>
                <tr className="border-t border-stone-50 bg-stone-50"><td className="p-2 text-stone-400 font-bold sticky left-0 bg-stone-50">파트너</td>
                  {items.map(v => <td key={v.id} className={`p-2 text-amber-500 font-bold ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`}>{v.rating2 > 0 ? stars(v.rating2) : '-'}</td>)}</tr>
                <tr className="border-t border-stone-100"><td className="p-2 text-stone-400 font-bold sticky left-0 bg-white">상태</td>
                  {items.map(v => {
                    const s = VENDOR_STATUS_FLOW.find(f => f.key === v.status)
                    return <td key={v.id} className={`p-2 font-bold ${v.status === 'contracted' ? 'bg-emerald-50' : ''}`} style={{ color: s?.color }}>{s?.label}</td>
                  })}</tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
