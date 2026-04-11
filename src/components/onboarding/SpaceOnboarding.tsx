import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { SPACE_PRESETS } from '../../types/data'
import type { SpaceType } from '../../types/data'

export default function SpaceOnboarding() {
  const { updateData, connectToRoom } = useFirebase()
  const [step, setStep] = useState<'type' | 'setup'>('type')
  const [selected, setSelected] = useState<SpaceType | null>(null)
  const [spaceName, setSpaceName] = useState('')
  const [myName, setMyName] = useState('')
  const [roomName, setRoomName] = useState('')

  const handleSelect = (type: SpaceType) => {
    setSelected(type)
    setStep('setup')
  }

  const handleFinish = () => {
    if (!selected || !myName.trim()) return
    const preset = SPACE_PRESETS[selected]
    // Clear reset flag
    localStorage.removeItem('couple_space_reset')
    updateData(prev => ({
      ...prev,
      spaceType: selected,
      spaceName: spaceName.trim() || preset.label,
      names: { ...prev.names, me: myName.trim() },
    }))
    if (roomName.trim()) {
      connectToRoom(roomName.trim())
    }
  }

  const types = Object.entries(SPACE_PRESETS) as [SpaceType, typeof SPACE_PRESETS[SpaceType]][]

  if (step === 'type') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 animate-fade-in-up">
        <div className="text-5xl mb-3 animate-bounce">🏠</div>
        <h1 className="text-2xl font-black text-gray-800 mb-1">우리의 공간</h1>
        <p className="text-sm text-gray-400 mb-8">어떤 공간을 만들까요?</p>

        <div className="w-full max-w-[380px] space-y-3">
          {types.map(([type, preset]) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="w-full p-5 rounded-2xl bg-white border-2 border-gray-100 hover:border-teal/50 active:scale-[0.97] transition-all text-left flex items-center gap-4 shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: preset.color + '15' }}>
                {preset.emoji}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-gray-800">{preset.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{preset.desc}</div>
              </div>
              <div className="text-gray-300 text-lg">›</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const preset = selected ? SPACE_PRESETS[selected] : null
  if (!preset || !selected) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 animate-fade-in-up">
      <div className="text-5xl mb-3">{preset.emoji}</div>
      <h1 className="text-xl font-black text-gray-800 mb-1">{preset.label} 공간 만들기</h1>
      <p className="text-sm text-gray-400 mb-8">기본 정보를 설정해주세요</p>

      <div className="w-full max-w-[380px] space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block">공간 이름</label>
          <input
            value={spaceName}
            onChange={e => setSpaceName(e.target.value)}
            placeholder={`예: ${selected === 'couple' ? '우리 둘' : selected === 'friends' ? '절친 모임' : selected === 'travel' ? '제주도 여행' : selected === 'wedding' ? '결혼 준비' : '사이드 프로젝트'}`}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block">내 이름 (닉네임)</label>
          <input
            value={myName}
            onChange={e => setMyName(e.target.value)}
            placeholder="이름 또는 닉네임"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block">실시간 동기화 (선택)</label>
          <input
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            placeholder="같은 방 이름을 입력하면 실시간 공유"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal outline-none text-sm"
          />
          <p className="text-[10px] text-gray-400 mt-1">함께 쓸 사람과 같은 방 이름을 입력하세요</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setStep('type')}
            className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-500 font-bold text-sm"
          >
            ← 뒤로
          </button>
          <button
            onClick={handleFinish}
            disabled={!myName.trim()}
            className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm active:scale-[0.97] disabled:opacity-40 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${preset.color}, ${preset.color}CC)` }}
          >
            시작하기 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
