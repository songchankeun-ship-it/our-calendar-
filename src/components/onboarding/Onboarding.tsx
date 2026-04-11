import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'
import { BUDGET_CATEGORIES, type VendorCategory } from '../../types/wedding'

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '기타']
const GUEST_OPTIONS = ['50명 이하', '100명', '150명', '200명 이상']
const STAGES = ['아직 아무것도 안 함', '웨딩홀 알아보는 중', '웨딩홀 계약 완료', '스드메까지 진행 중', '거의 다 됨']
const BUDGET_OPTIONS = ['3,000만', '4,000만', '5,000만', '직접 입력']

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { updateData, connectToRoom } = useWedding()
  const [step, setStep] = useState(0)
  const [date, setDate] = useState('')
  const [region, setRegion] = useState('')
  const [guests, setGuests] = useState('')
  const [stage, setStage] = useState('')
  const [budgetStr, setBudgetStr] = useState('')
  const [customBudget, setCustomBudget] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('신부')
  const [roomCode, setRoomCode] = useState('')

  const daysLeft = date ? Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 86400000)) : 0
  const monthsLeft = Math.floor(daysLeft / 30)

  const parseBudget = () => {
    if (budgetStr === '직접 입력') return parseInt(customBudget.replace(/[^0-9]/g, '')) || 0
    return parseInt(budgetStr.replace(/[^0-9]/g, '')) * 10000 || 40000000
  }

  const guestNum = () => {
    if (guests.includes('50')) return 50
    if (guests.includes('200')) return 200
    return parseInt(guests) || 120
  }

  const finish = () => {
    const totalBudget = parseBudget()
    const cats: Record<VendorCategory, number> = {} as any
    BUDGET_CATEGORIES.forEach(c => { cats[c.key] = Math.round(totalBudget * (c.defaultBudget / 36800000)) })

    // Generate auto timeline based on stage
    const stageIndex = STAGES.indexOf(stage)
    const autoTimeline = generateTimeline(date, stageIndex)

    updateData(prev => ({
      ...prev,
      profile: {
        weddingDate: date,
        region,
        guestCount: guestNum(),
        stage,
        totalBudget,
        partner1: { name, role },
        partner2: { name: '', role: role === '신부' ? '신랑' : '신부' },
        createdAt: new Date().toISOString(),
      },
      budget: { categories: cats, items: [] },
      timeline: autoTimeline,
    }))

    if (roomCode.trim()) connectToRoom(roomCode.trim())
    onComplete()
  }

  const steps = [
    // Step 0: Wedding Date
    <div key="0" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">📅</div>
      <h2 className="text-xl font-extrabold mb-2 leading-snug">예식 예정일이<br/>언제예요?</h2>
      <p className="text-sm text-stone-400 leading-relaxed mb-6">날짜에 맞춰 체크리스트와 일정을<br/>자동으로 만들어드려요</p>
      <input type="date" value={date} onChange={e => setDate(e.target.value)}
        className="w-full p-4 border-2 border-stone-200 rounded-xl text-center text-lg font-semibold focus:border-stone-900 outline-none transition" />
      {date && <div className="mt-3 text-sm font-semibold text-emerald-600">약 {monthsLeft}개월 남았어요</div>}
    </div>,

    // Step 1: Region
    <div key="1" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">📍</div>
      <h2 className="text-xl font-extrabold mb-2">어디서 결혼식을<br/>하실 예정이에요?</h2>
      <p className="text-sm text-stone-400 mb-6">지역 기반으로 업체를 추천해드려요</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {REGIONS.map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`px-5 py-3 rounded-xl text-sm font-semibold border-2 transition ${region === r ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>{r}</button>
        ))}
      </div>
    </div>,

    // Step 2: Guest count
    <div key="2" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">👥</div>
      <h2 className="text-xl font-extrabold mb-2">하객 규모는<br/>어느 정도 생각하세요?</h2>
      <p className="text-sm text-stone-400 mb-6">예산 배분에 참고할게요</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {GUEST_OPTIONS.map(g => (
          <button key={g} onClick={() => setGuests(g)}
            className={`px-5 py-3 rounded-xl text-sm font-semibold border-2 transition ${guests === g ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>{g}</button>
        ))}
      </div>
    </div>,

    // Step 3: Stage
    <div key="3" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-xl font-extrabold mb-2">지금 어디까지<br/>준비하셨어요?</h2>
      <p className="text-sm text-stone-400 mb-6">이미 끝난 단계는 자동으로 체크할게요</p>
      <div className="flex flex-col gap-2">
        {STAGES.map(s => (
          <button key={s} onClick={() => setStage(s)}
            className={`px-5 py-3.5 rounded-xl text-sm font-semibold border-2 transition text-left ${stage === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>{s}</button>
        ))}
      </div>
    </div>,

    // Step 4: Budget
    <div key="4" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">💰</div>
      <h2 className="text-xl font-extrabold mb-2">총 예산은 얼마 정도<br/>생각하세요?</h2>
      <p className="text-sm text-stone-400 mb-6">나중에 언제든 변경할 수 있어요</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {BUDGET_OPTIONS.map(b => (
          <button key={b} onClick={() => setBudgetStr(b)}
            className={`px-5 py-3 rounded-xl text-sm font-semibold border-2 transition ${budgetStr === b ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>{b}</button>
        ))}
      </div>
      {budgetStr === '직접 입력' && (
        <input type="text" value={customBudget} onChange={e => setCustomBudget(e.target.value)}
          placeholder="예: 4500만원" className="w-full mt-4 p-4 border-2 border-stone-200 rounded-xl text-center text-lg focus:border-stone-900 outline-none" />
      )}
    </div>,

    // Step 5: Name
    <div key="5" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">👋</div>
      <h2 className="text-xl font-extrabold mb-2">이름을 알려주세요</h2>
      <p className="text-sm text-stone-400 mb-6">파트너와 구분하기 위해 필요해요</p>
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="이름 또는 닉네임" className="w-full p-4 border-2 border-stone-200 rounded-xl text-center text-lg focus:border-stone-900 outline-none mb-4" />
      <div className="flex gap-2 justify-center">
        {['신부', '신랑'].map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-6 py-3 rounded-xl text-sm font-semibold border-2 transition ${role === r ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>{r}</button>
        ))}
      </div>
    </div>,

    // Step 6: Partner Invite
    <div key="6" className="text-center px-8 pt-16">
      <div className="text-5xl mb-4">💑</div>
      <h2 className="text-xl font-extrabold mb-2">파트너를 초대할까요?</h2>
      <p className="text-sm text-stone-400 mb-6">같은 코드를 입력하면<br/>데이터가 실시간으로 동기화돼요</p>
      <input type="text" value={roomCode} onChange={e => setRoomCode(e.target.value)}
        placeholder="공유 코드 (예: 서윤촨근)" className="w-full p-4 border-2 border-stone-200 rounded-xl text-center text-lg focus:border-stone-900 outline-none" />
      <p className="text-xs text-stone-400 mt-2">파트너에게도 같은 코드를 알려주세요</p>
    </div>,
  ]

  const canNext = [
    !!date,
    !!region,
    !!guests,
    !!stage,
    !!budgetStr && (budgetStr !== '직접 입력' || !!customBudget),
    !!name,
    true, // partner is optional
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {steps[step]}
      <div className="px-8 mt-8 pb-10">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-stone-900' : i < step ? 'w-1.5 bg-stone-400' : 'w-1.5 bg-stone-200'}`} />
          ))}
        </div>
        {step < 6 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext[step]}
            className={`w-full py-4 rounded-2xl text-[15px] font-bold transition ${canNext[step] ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-400'}`}>
            다음
          </button>
        ) : (
          <button onClick={finish}
            className="w-full py-4 rounded-2xl text-[15px] font-bold bg-stone-900 text-white">
            시작하기 🎉
          </button>
        )}
        {step === 6 && (
          <button onClick={finish} className="w-full mt-3 py-3 text-sm text-stone-400 font-semibold">
            파트너 초대는 나중에
          </button>
        )}
      </div>
    </div>
  )
}

// Auto-generate timeline based on wedding date
function generateTimeline(weddingDate: string, stageIndex: number) {
  const d = new Date(weddingDate)
  const id = () => Math.random().toString(36).slice(2, 8)
  const addMonths = (months: number) => {
    const r = new Date(d)
    r.setMonth(r.getMonth() - months)
    return r.toISOString().slice(0, 10)
  }

  const items = [
    { title: '예식 날짜 결정', monthsBefore: 12, category: 'general' as const, assignee: 'both' as const },
    { title: '총 예산 설정', monthsBefore: 12, category: 'general' as const, assignee: 'both' as const },
    { title: '웨딩홀 리서치 시작', monthsBefore: 12, category: 'wedding_hall' as const, assignee: 'partner1' as const },
    { title: '웨딩홀 투어 (3~5곳)', monthsBefore: 10, category: 'wedding_hall' as const, assignee: 'both' as const },
    { title: '웨딩홀 계약', monthsBefore: 9, category: 'wedding_hall' as const, assignee: 'both' as const },
    { title: '스드메 상담 시작', monthsBefore: 9, category: 'studio' as const, assignee: 'partner1' as const },
    { title: '스드메 비교 / 선택', monthsBefore: 8, category: 'studio' as const, assignee: 'partner1' as const },
    { title: '예복 매장 방문', monthsBefore: 8, category: 'suit' as const, assignee: 'partner2' as const },
    { title: '본식 스냅/영상 예약', monthsBefore: 7, category: 'snap' as const, assignee: 'partner1' as const },
    { title: '예물 구매', monthsBefore: 6, category: 'jewelry' as const, assignee: 'both' as const },
    { title: '혼수 리스트 작성', monthsBefore: 6, category: 'general' as const, assignee: 'partner1' as const },
    { title: '신혼여행지 결정', monthsBefore: 6, category: 'honeymoon' as const, assignee: 'both' as const },
    { title: '신혼여행 예약', monthsBefore: 5, category: 'honeymoon' as const, assignee: 'both' as const },
    { title: '청첩장 제작', monthsBefore: 3, category: 'invitation' as const, assignee: 'both' as const },
    { title: '피부 관리 시작', monthsBefore: 3, category: 'general' as const, assignee: 'partner1' as const },
    { title: '하객 명단 정리', monthsBefore: 2, category: 'general' as const, assignee: 'both' as const },
    { title: '청첩장 발송', monthsBefore: 2, category: 'invitation' as const, assignee: 'both' as const },
    { title: '웨딩 촬영', monthsBefore: 2, category: 'studio' as const, assignee: 'both' as const },
    { title: '드레스 최종 피팅', monthsBefore: 1, category: 'dress' as const, assignee: 'partner1' as const },
    { title: '예복 최종 피팅', monthsBefore: 1, category: 'suit' as const, assignee: 'partner2' as const },
    { title: '본식 리허설', monthsBefore: 0, category: 'general' as const, assignee: 'both' as const },
    { title: '잔금 최종 정리', monthsBefore: 0, category: 'general' as const, assignee: 'both' as const },
  ]

  // Auto-complete items based on stage
  const completedMonths = stageIndex >= 3 ? 8 : stageIndex >= 2 ? 9 : stageIndex >= 1 ? 11 : 99

  return items.map(item => ({
    id: id(),
    ...item,
    dueDate: addMonths(item.monthsBefore),
    status: (item.monthsBefore > completedMonths ? 'done' : 'todo') as 'done' | 'todo',
    note: '',
    vendorId: '',
    budgetItemId: '',
    docIds: [],
    isCustom: false,
    completedAt: item.monthsBefore > completedMonths ? new Date().toISOString() : '',
    completedBy: 'both' as const,
  }))
}
