import { useFirebase } from '../../contexts/FirebaseContext'

const SPECIAL_DAYS = [
  { d: 50, name: '50일', emoji: '🎀', tag: '기본' },
  { d: 77, name: '럭키데이', emoji: '🎰', desc: '7×2! 행운이 두 배', tag: '센스' },
  { d: 100, name: '100일', emoji: '💐', desc: '백일잔치는 커플도!', tag: '특별' },
  { d: 200, name: '200일', emoji: '🎈', tag: '기본' },
  { d: 222, name: '투투투데이', emoji: '💑', desc: '2가 세 번! 우리 둘의 날', tag: '센스' },
  { d: 256, name: '개발자 기념일', emoji: '💻', desc: '2⁸=256 바이트 커플', tag: '유니크' },
  { d: 300, name: '300일', emoji: '🎪', tag: '기본' },
  { d: 314, name: '파이데이', emoji: '🥧', desc: 'π처럼 끝없는 사랑', tag: '유니크' },
  { d: 365, name: '1년', emoji: '🎂', desc: '봄여름가을겨울 함께!', tag: '특별' },
  { d: 500, name: '500일', emoji: '🎯', tag: '기본' },
  { d: 555, name: '오오오데이', emoji: '🖐️', desc: '하이파이브 트리플!', tag: '센스' },
  { d: 700, name: '700일', emoji: '🌟', tag: '기본' },
  { d: 730, name: '2년', emoji: '🎊', tag: '특별' },
  { d: 777, name: '트리플 럭키', emoji: '🎰', desc: '잭팟! 777', tag: '유니크' },
  { d: 888, name: '팔팔팔데이', emoji: '🧧', desc: '發! 풍요로운 사랑', tag: '센스' },
  { d: 999, name: '구구구데이', emoji: '🔥', desc: '천일 전야제!', tag: '센스' },
  { d: 1000, name: '천일', emoji: '🏆', desc: '1000일의 사랑!', tag: '특별' },
  { d: 1004, name: '천사데이', emoji: '👼', desc: '1004=천사', tag: '유니크' },
  { d: 1095, name: '3년', emoji: '🌳', tag: '특별' },
  { d: 1111, name: '빼빼로데이', emoji: '🥢', desc: '나란히 서있는 우리', tag: '센스' },
  { d: 1314, name: '일생일세', emoji: '💒', desc: '永远在一起', tag: '유니크' },
  { d: 1825, name: '5년', emoji: '💎', tag: '특별' },
  { d: 2000, name: '2000일', emoji: '🚀', tag: '기본' },
  { d: 3000, name: '3000일', emoji: '👑', tag: '기본' },
  { d: 3650, name: '10년', emoji: '🏰', desc: '성을 쌓은 사랑', tag: '특별' },
]

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  '기본': { bg: 'bg-teal-50', text: 'text-teal-800' },
  '특별': { bg: 'bg-amber-50', text: 'text-amber-800' },
  '센스': { bg: 'bg-purple-50', text: 'text-purple-800' },
  '유니크': { bg: 'bg-rose-50', text: 'text-rose-800' },
}

export default function AnniversaryList() {
  const { data } = useFirebase()

  if (!data.ddayDate) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <span className="text-5xl mb-4">💝</span>
        <h3 className="text-lg font-extrabold text-gray-800 mb-2">사귄 날짜를 먼저 설정해주세요</h3>
        <p className="text-sm text-gray-400 text-center px-8">설정에서 D-day를 설정하면 기념일이 자동으로 계산돼요!</p>
      </div>
    )
  }

  const start = new Date(data.ddayDate)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000)

  const milestones = SPECIAL_DAYS.map(s => {
    const date = new Date(start)
    date.setDate(date.getDate() + s.d)
    const daysLeft = Math.floor((date.getTime() - today.getTime()) / 86400000)
    return { ...s, date, daysLeft }
  }).sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      <div className="glass-card text-center p-5 mb-4">
        <span className="text-sm text-gray-500">오늘은 만난 지</span>
        <div className="text-4xl font-black text-teal-dark tracking-tight">{diffDays}일</div>
      </div>

      <div className="space-y-2">
        {milestones.map((m, i) => {
          const dateStr = `${m.date.getFullYear()}.${String(m.date.getMonth() + 1).padStart(2, '0')}.${String(m.date.getDate()).padStart(2, '0')}`
          const isToday = m.daysLeft === 0
          const isPast = m.daysLeft < 0
          const tc = TAG_COLORS[m.tag] || TAG_COLORS['기본']

          return (
            <div key={i}
              className={`glass-card p-4 flex items-center gap-3 transition-all
                ${isToday ? 'bg-gradient-to-r from-mint-bg to-green-50 border-teal/20 shadow-[0_4px_20px_rgba(56,178,172,0.12)]' : ''}
                ${isPast ? 'opacity-50' : ''}
                ${i % 2 === 0 ? 'border-l-[3px] border-l-mint' : 'border-l-[3px] border-l-lavender'}
                `}
              style={{ borderRadius: i % 2 === 0 ? '0 22px 22px 0' : '0 22px 22px 0' }}>
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-extrabold text-gray-800">{m.name}</span>
                  {m.tag !== '기본' && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tc.bg} ${tc.text}`}>{m.tag}</span>
                  )}
                </div>
                {m.desc && <div className="text-[11px] text-gray-400 mt-0.5">{m.desc}</div>}
                <div className="text-[11px] text-gray-400">{dateStr}</div>
              </div>
              <div className={`text-[13px] font-extrabold tracking-tight ${isToday ? 'text-teal' : isPast ? 'text-gray-400' : 'text-teal'}`}>
                {isToday ? '🎉 오늘!' : isPast ? `${Math.abs(m.daysLeft)}일 전` : `D-${m.daysLeft}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
