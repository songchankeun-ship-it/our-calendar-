import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'

const QUESTIONS = [
  { cat: '일상', text: '오늘 하루 중 가장 좋았던 순간은?', emoji: '🌤️' },
  { cat: '일상', text: '요즘 가장 자주 듣는 노래는?', emoji: '🎵' },
  { cat: '일상', text: '지금 이 순간 먹고 싶은 것은?', emoji: '🤤' },
  { cat: '일상', text: '이번 주말에 뭐 하고 싶어?', emoji: '🏖️' },
  { cat: '일상', text: '오늘 하루를 이모지 하나로 표현한다면?', emoji: '😊' },
  { cat: '우리 관계', text: '내가 가장 매력적으로 보이는 순간은?', emoji: '💕' },
  { cat: '우리 관계', text: '우리가 함께할 때 가장 행복한 순간은?', emoji: '🥰' },
  { cat: '우리 관계', text: '가장 기억에 남는 데이트는?', emoji: '🎡' },
  { cat: '우리 관계', text: '오늘 상대방한테 점수를 준다면 몇 점?', emoji: '💯' },
  { cat: '우리 관계', text: '상대방에게 감사한 점 3가지는?', emoji: '🙏' },
  { cat: '재미', text: '100억이 생기면 제일 먼저 뭐 할 거야?', emoji: '💰' },
  { cat: '재미', text: '나를 동물로 표현한다면?', emoji: '🦊' },
  { cat: '재미', text: '우리 둘을 영화 장르로 표현한다면?', emoji: '🎬' },
  { cat: '재미', text: '상대방을 이모지 3개로 표현한다면?', emoji: '😏' },
  { cat: '재미', text: '우리 커플 유튜브 채널을 만든다면 주제는?', emoji: '📹' },
  { cat: '미래', text: '5년 뒤 우리는 어디에 있을까?', emoji: '🔮' },
  { cat: '미래', text: '같이 살게 되면 가장 기대되는 것은?', emoji: '🏠' },
  { cat: '미래', text: '함께 여행하고 싶은 나라 TOP 3는?', emoji: '🌍' },
  { cat: '깊은 대화', text: '관계에서 가장 중요한 가치는 뭐야?', emoji: '🧠' },
  { cat: '깊은 대화', text: '내가 힘들 때 어떻게 해주면 좋겠어?', emoji: '🤗' },
  { cat: '깊은 대화', text: '사랑이란 뭐라고 생각해?', emoji: '💌' },
  { cat: 'TMI', text: '상대방 폰에서 가장 먼저 볼 것은?', emoji: '📱' },
  { cat: 'TMI', text: '상대방이 잘 때 귀여운 습관은?', emoji: '😴' },
  { cat: 'TMI', text: '상대방 때문에 새로 좋아하게 된 것은?', emoji: '💡' },
]

const CAT_EMOJI: Record<string, string> = { '일상': '🌤️', '우리 관계': '💕', '재미': '🎮', '미래': '🔮', '깊은 대화': '🧠', 'TMI': '🔥' }

export default function DailyQuestion() {
  const { data, updateData } = useFirebase()
  const [answer, setAnswer] = useState('')

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dayIdx = Math.floor((today.getTime() - new Date(2024, 0, 1).getTime()) / 86400000)
  const todayQ = QUESTIONS[dayIdx % QUESTIONS.length]

  const dailyData = data.questions?.daily?.[todayStr] || {}
  const myAnswer = dailyData.me || ''
  const yourAnswer = dailyData.you || ''
  const bothDone = !!(myAnswer && yourAnswer)

  // Streak calc
  const dates = Object.keys(data.questions?.daily || {}).sort().reverse()
  let streak = 0
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    if (dates[i] === expected.toISOString().split('T')[0]) {
      const e = data.questions.daily[dates[i]]
      if (e?.me || e?.you) streak++
      else break
    } else break
  }

  const submitAnswer = () => {
    if (!answer.trim()) return
    updateData(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        daily: {
          ...prev.questions.daily,
          [todayStr]: { ...prev.questions.daily?.[todayStr], me: answer.trim() }
        }
      }
    }))
    setAnswer('')
  }

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
          <span className="text-lg">{streak > 0 ? '🔥' : '💤'}</span>
          <span className="text-lg font-black text-teal-dark">{streak}</span>
          <span className="text-[11px] font-semibold text-gray-500">일 연속</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card p-7 text-center mb-4 bg-gradient-to-br from-mint-bg/80 via-green-50/60 to-white border-teal/10">
        <div className="inline-block px-3 py-1 rounded-full bg-teal/10 text-teal-dark text-[11px] font-bold mb-2">
          {CAT_EMOJI[todayQ.cat] || '❓'} {todayQ.cat}
        </div>
        <div className="text-[11px] text-gray-400 font-semibold mb-4">
          오늘의 질문 · {today.getMonth() + 1}/{today.getDate()}
        </div>
        <div className="text-xl font-black text-gray-800 leading-relaxed tracking-tight mb-3">
          {todayQ.text}
        </div>
        <div className="text-4xl opacity-30">{todayQ.emoji}</div>
      </div>

      {/* Answers */}
      <div className="space-y-3 mb-4">
        {/* My answer */}
        <div className="glass-card p-4">
          <div className="text-[12px] font-bold text-gray-500 mb-2">{data.names.me || '나'}의 답변</div>
          {myAnswer ? (
            <div className="bg-gradient-to-br from-mint-bg to-green-50 rounded-2xl px-4 py-3 text-[14px] font-medium text-teal-dark">
              {myAnswer}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="답변을 적어주세요..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-teal focus:ring-4 focus:ring-teal/10 outline-none text-[14px] bg-gray-50 focus:bg-white resize-none transition"
              />
              <button onClick={submitAnswer}
                disabled={!answer.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-extrabold text-[15px] shadow-[0_4px_16px_rgba(13,148,136,0.3)] disabled:opacity-30 active:scale-[0.97] transition">
                답변하기
              </button>
            </div>
          )}
        </div>

        {/* Partner's answer */}
        <div className="glass-card p-4">
          <div className="text-[12px] font-bold text-gray-500 mb-2">{data.names.you || '너'}의 답변</div>
          {yourAnswer ? (
            myAnswer ? (
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl px-4 py-3 text-[14px] font-medium text-rose-800">
                {yourAnswer}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-400 text-center">
                🔒 내 답변을 먼저 작성하면 공개돼요
              </div>
            )
          ) : (
            <div className="bg-gray-50 rounded-2xl px-4 py-3 text-[13px] font-semibold text-gray-400 text-center animate-pulse-soft">
              ⏳ 아직 답변을 기다리고 있어요...
            </div>
          )}
        </div>

        {bothDone && (
          <div className="text-center py-3 px-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 text-[13px] font-bold text-amber-800">
            ✨ 둘 다 답변 완료! 서로의 생각을 확인해보세요
          </div>
        )}
      </div>
    </div>
  )
}
