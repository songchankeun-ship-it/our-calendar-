import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'

const QUESTIONS = [
  { a: '포옹이나 손잡기가 좋다', b: '칭찬이나 응원의 말이 좋다', la: 'touch', lb: 'words' },
  { a: '함께 시간을 보내는 게 중요하다', b: '깜짝 선물을 받으면 기쁘다', la: 'time', lb: 'gifts' },
  { a: '내 일을 도와주면 사랑을 느낀다', b: '스킨십이 많으면 안정감을 느낀다', la: 'service', lb: 'touch' },
  { a: '격려의 문자를 받으면 힘이 난다', b: '함께 산책하는 시간이 좋다', la: 'words', lb: 'time' },
  { a: '기념일에 선물을 챙겨주면 감동이다', b: '집안일을 대신 해주면 고맙다', la: 'gifts', lb: 'service' },
  { a: '눈을 맞추며 대화하는 시간이 좋다', b: '어깨를 감싸주면 위로가 된다', la: 'time', lb: 'touch' },
  { a: '사랑한다는 말을 자주 듣고 싶다', b: '의미 있는 선물을 받고 싶다', la: 'words', lb: 'gifts' },
  { a: '같이 요리하거나 청소하면 행복하다', b: '따뜻한 말 한마디가 좋다', la: 'service', lb: 'words' },
  { a: '손을 잡고 걷는 게 좋다', b: '내 취향 기억해서 선물해주면 감동', la: 'touch', lb: 'gifts' },
  { a: '같이 여행 계획을 세우는 게 즐겁다', b: '아플 때 간호해주면 사랑을 느낀다', la: 'time', lb: 'service' },
]

const LANGS: Record<string, { name: string; emoji: string; color: string; tip: string }> = {
  touch: { name: '스킨십', emoji: '🤗', color: '#F56565', tip: '자주 안아주고, 손을 잡아주세요.' },
  words: { name: '칭찬/격려', emoji: '💬', color: '#38B2AC', tip: '매일 사랑한다고 말해주세요.' },
  time: { name: '함께하는 시간', emoji: '⏰', color: '#805AD5', tip: '휴대폰 내려놓고 집중해서 대화해주세요.' },
  gifts: { name: '선물', emoji: '🎁', color: '#DD6B20', tip: '취향을 기억한 작은 선물이 최고예요.' },
  service: { name: '봉사/행동', emoji: '🤝', color: '#38A169', tip: '행동이 곧 사랑이에요.' },
}

export default function LoveLangTest() {
  const { data, updateData } = useFirebase()
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({ touch: 0, words: 0, time: 0, gifts: 0, service: 0 })

  const meResult = data.loveLang?.me
  const youResult = data.loveLang?.you

  // Both have results
  if (meResult && youResult) {
    const meInfo = LANGS[meResult]
    const youInfo = LANGS[youResult]
    return (
      <div className="px-4 pb-24 animate-fade-in-up">
        <div className="glass-card p-6">
          <h3 className="text-lg font-black text-center mb-6">💕 우리의 러브 랭귀지</h3>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2" style={{ background: meInfo.color + '20' }}>{meInfo.emoji}</div>
              <div className="text-xs font-bold text-gray-500">{data.names.me || '나'}</div>
              <div className="text-sm font-black mt-1" style={{ color: meInfo.color }}>{meInfo.name}</div>
            </div>
            <span className="text-xl animate-heartbeat">♥</span>
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2" style={{ background: youInfo.color + '20' }}>{youInfo.emoji}</div>
              <div className="text-xs font-bold text-gray-500">{data.names.you || '너'}</div>
              <div className="text-sm font-black mt-1" style={{ color: youInfo.color }}>{youInfo.name}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs font-bold text-teal-dark mb-1">💡 {data.names.me || '나'}에게</div>
              <div className="text-sm text-gray-600">{meInfo.tip}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs font-bold text-teal-dark mb-1">💡 {data.names.you || '너'}에게</div>
              <div className="text-sm text-gray-600">{youInfo.tip}</div>
            </div>
          </div>
          <button onClick={() => updateData(p => ({ ...p, loveLang: {} }))}
            className="mt-4 w-full py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition">
            다시 테스트
          </button>
        </div>
      </div>
    )
  }

  // Test in progress
  const who = meResult ? 'you' : 'me'
  const whoName = who === 'me' ? (data.names.me || '나') : (data.names.you || '너')

  if (step >= QUESTIONS.length) {
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    updateData(p => ({ ...p, loveLang: { ...p.loveLang, [who]: top } }))
    setStep(0)
    setScores({ touch: 0, words: 0, time: 0, gifts: 0, service: 0 })
    return null
  }

  const q = QUESTIONS[step]
  const progress = Math.round((step / QUESTIONS.length) * 100)

  const choose = (lang: string) => {
    setScores(s => ({ ...s, [lang]: (s[lang] || 0) + 1 }))
    setStep(s => s + 1)
  }

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      <div className="glass-card p-6">
        <h3 className="text-lg font-black text-center mb-1">💕 러브 랭귀지 테스트</h3>
        <p className="text-xs text-gray-400 text-center mb-5">{whoName}의 사랑 언어를 알아보세요</p>
        <div className="h-1.5 bg-gray-100 rounded-full mb-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-coral to-teal rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-[11px] text-gray-400 text-center mb-6">{step + 1} / {QUESTIONS.length}</div>
        <button onClick={() => choose(q.la)}
          className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 text-[15px] font-semibold text-center mb-2 hover:bg-mint-bg hover:border-teal active:scale-[0.97] transition-all">
          {q.a}
        </button>
        <div className="text-center text-xs text-gray-400 font-bold py-1">or</div>
        <button onClick={() => choose(q.lb)}
          className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 text-[15px] font-semibold text-center hover:bg-mint-bg hover:border-teal active:scale-[0.97] transition-all">
          {q.b}
        </button>
      </div>
    </div>
  )
}
