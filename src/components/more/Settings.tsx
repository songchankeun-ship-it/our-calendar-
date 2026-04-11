import { useState, useRef } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { SPACE_PRESETS } from '../../types/data'
import type { SpaceType } from '../../types/data'

export default function Settings() {
  const { data, updateData, setField, connected, roomName, connectToRoom, disconnect } = useFirebase()
  const [editNames, setEditNames] = useState(false)
  const [myName, setMyName] = useState(data.names.me || '')
  const [yourName, setYourName] = useState(data.names.you || '')
  const [editDday, setEditDday] = useState(false)
  const [ddayInput, setDdayInput] = useState(data.ddayDate || '')
  const [roomInput, setRoomInput] = useState('')
  const [showRoom, setShowRoom] = useState(false)
  const [showSpaceType, setShowSpaceType] = useState(false)
  const [toast, setToast] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const changeSpaceType = (type: SpaceType) => {
    localStorage.removeItem('couple_space_reset')
    updateData(prev => ({ ...prev, spaceType: type, spaceName: SPACE_PRESETS[type].label }))
    setShowSpaceType(false)
    showToast(`${SPACE_PRESETS[type].emoji} ${SPACE_PRESETS[type].label} 공간으로 변경됨!`)
  }

  const resetToOnboarding = () => {
    try {
      localStorage.setItem('couple_space_reset', 'true')
    } catch {}
    updateData(prev => {
      const next = { ...prev }
      delete (next as any).spaceType
      return next
    })
    showToast('공간 유형을 선택해주세요')
  }

  const saveNames = () => {
    updateData(prev => ({ ...prev, names: { me: myName.trim() || '나', you: yourName.trim() || '너' } }))
    setEditNames(false)
    showToast('이름이 변경되었어요!')
  }

  const saveDday = () => {
    if (!ddayInput) return
    setField('ddayDate', ddayInput)
    setEditDday(false)
    showToast('사귄 날짜가 설정되었어요!')
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 400
        let w = img.width, h = img.height
        const ratio = Math.min(size / w, size / h)
        w *= ratio; h *= ratio
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const src = canvas.toDataURL('image/jpeg', 0.8)
        updateData(prev => ({ ...prev, couplePhoto: src }))
        showToast('사진이 변경되었어요!')
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleConnect = () => {
    const room = roomInput.trim()
    if (!room) return
    connectToRoom(room)
    setShowRoom(false)
    setRoomInput('')
    showToast(`"${room}" 방에 연결했어요!`)
  }

  const diffDays = data.ddayDate
    ? Math.floor((Date.now() - new Date(data.ddayDate).getTime()) / 86400000) + 1
    : 0

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}

      {/* Profile Section */}
      <div className="glass-card p-6 mb-3 text-center">
        <div className="relative inline-block mb-3">
          <div 
            onClick={() => photoRef.current?.click()}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-light to-teal-dark flex items-center justify-center mx-auto cursor-pointer hover:opacity-80 transition overflow-hidden border-4 border-white shadow-lg"
          >
            {data.couplePhoto ? (
              <img src={data.couplePhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">💑</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
            onClick={() => photoRef.current?.click()}>
            📷
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div className="text-lg font-black text-gray-800">
          {data.names.me || '나'} ❤️ {data.names.you || '너'}
        </div>
        {data.ddayDate && (
          <div className="text-xs text-gray-400 mt-1">만난 지 {diffDays}일</div>
        )}
      </div>

      {/* Name Setting */}
      <div className="glass-card p-4 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-gray-800">👤 이름 설정</div>
          <button onClick={() => { setEditNames(!editNames); setMyName(data.names.me || ''); setYourName(data.names.you || '') }}
            className="text-xs text-teal font-bold">{editNames ? '취소' : '변경'}</button>
        </div>
        {editNames ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">나</span>
              <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="내 이름"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">너</span>
              <input value={yourName} onChange={e => setYourName(e.target.value)} placeholder="상대방 이름"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal" />
            </div>
            <button onClick={saveNames}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm active:scale-[0.97]">저장</button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-1">
            {data.names.me || '(미설정)'} & {data.names.you || '(미설정)'}
          </div>
        )}
      </div>

      {/* D-day Setting */}
      <div className="glass-card p-4 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-gray-800">💕 사귄 날짜</div>
          <button onClick={() => { setEditDday(!editDday); setDdayInput(data.ddayDate || '') }}
            className="text-xs text-teal font-bold">{editDday ? '취소' : '변경'}</button>
        </div>
        {editDday ? (
          <div className="mt-3 space-y-2">
            <input type="date" value={ddayInput} onChange={e => setDdayInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal" />
            <button onClick={saveDday}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm active:scale-[0.97]">저장</button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-1">
            {data.ddayDate ? `${data.ddayDate} (${diffDays}일째)` : '아직 설정하지 않았어요'}
          </div>
        )}
      </div>

      {/* Firebase Room Connection */}
      <div className="glass-card p-4 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-gray-800">🔗 실시간 동기화</div>
          <button onClick={() => setShowRoom(!showRoom)}
            className="text-xs text-teal font-bold">{showRoom ? '닫기' : '설정'}</button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : roomName ? 'bg-yellow-400' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {connected ? `${roomName} 연결됨` : roomName ? `${roomName} 연결 중...` : '연결 안 됨'}
          </span>
        </div>
        {showRoom && (
          <div className="mt-3 space-y-2">
            {roomName ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-600">현재: {roomName}</div>
                <button onClick={() => { disconnect(); showToast('연결 해제됨') }}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-500 font-bold text-xs">해제</button>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input value={roomInput} onChange={e => setRoomInput(e.target.value)}
                placeholder="방 이름 입력 (예: 우리집)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal" />
              <button onClick={handleConnect}
                className="px-4 py-2 rounded-lg bg-teal text-white font-bold text-xs active:scale-95">연결</button>
            </div>
          </div>
        )}
      </div>

      {/* Space Type */}
      <div className="glass-card p-4 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-gray-800">🏠 공간 유형</div>
          <button onClick={() => setShowSpaceType(!showSpaceType)}
            className="text-xs text-teal font-bold">{showSpaceType ? '닫기' : '변경'}</button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {data.spaceType ? `${SPACE_PRESETS[data.spaceType].emoji} ${SPACE_PRESETS[data.spaceType].label}` : '미설정'}
        </div>
        {showSpaceType && (
          <div className="mt-3 space-y-2">
            {(Object.entries(SPACE_PRESETS) as [SpaceType, typeof SPACE_PRESETS[SpaceType]][]).map(([type, preset]) => (
              <button key={type} onClick={() => changeSpaceType(type)}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition border-2 ${data.spaceType === type ? 'border-teal bg-teal/5' : 'border-gray-100 hover:border-teal/30'}`}>
                <span className="text-2xl">{preset.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{preset.label}</div>
                  <div className="text-[10px] text-gray-400">{preset.desc}</div>
                </div>
                {data.spaceType === type && <span className="ml-auto text-teal text-xs font-bold">현재</span>}
              </button>
            ))}
            <button onClick={resetToOnboarding}
              className="w-full p-3 rounded-xl text-center text-xs text-gray-400 border-2 border-dashed border-gray-200 hover:border-gray-300 transition mt-2">
              🏠 처음 화면으로 돌아가기
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="glass-card p-4 mb-3">
        <div className="text-sm font-bold text-gray-800 mb-2">📱 앱 정보</div>
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>버전</span><span className="font-semibold">React 2.0</span>
          </div>
          <div className="flex justify-between">
            <span>데이터</span><span className="font-semibold">{data.chat.length}개 채팅 · {data.events.length}개 일정 · {data.album.length}장 사진</span>
          </div>
          <div className="flex justify-between">
            <span>Firebase</span><span className="font-semibold">{connected ? '✅ 연결됨' : '❌ 미연결'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
