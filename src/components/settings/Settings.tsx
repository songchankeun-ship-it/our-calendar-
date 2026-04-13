import { useState } from 'react'
import { useWedding } from '../../contexts/WeddingContext'

export default function Settings({ onReset }: { onReset: () => void }) {
  const { data, updateData, connected, roomName, connectToRoom, disconnectRoom } = useWedding()
  const { profile } = data
  const [editing, setEditing] = useState<string | null>(null)
  const [tempVal, setTempVal] = useState('')
  const [showRoom, setShowRoom] = useState(false)
  const [roomInput, setRoomInput] = useState(roomName)

  const daysLeft = profile.weddingDate
    ? Math.max(0, Math.floor((new Date(profile.weddingDate).getTime() - Date.now()) / 86400000))
    : 0

  const startEdit = (field: string, current: string) => {
    setEditing(field)
    setTempVal(current)
  }

  const saveEdit = () => {
    if (!editing) return
    updateData(prev => {
      const next = { ...prev, profile: { ...prev.profile } }
      switch (editing) {
        case 'name1': next.profile.partner1 = { ...next.profile.partner1, name: tempVal }; break
        case 'name2': next.profile.partner2 = { ...next.profile.partner2, name: tempVal }; break
        case 'date': next.profile.weddingDate = tempVal; break
        case 'budget': next.profile.totalBudget = parseInt(tempVal.replace(/[^0-9]/g, '')) || 0; break
        case 'region': next.profile.region = tempVal; break
      }
      return next
    })
    setEditing(null)
  }

  const handleRoom = () => {
    if (roomInput.trim()) {
      connectToRoom(roomInput.trim())
    } else {
      disconnectRoom()
    }
    setShowRoom(false)
  }

  const resetApp = () => {
    if (confirm('모든 데이터가 삭제됩니다. 정말 초기화할까요?')) {
      localStorage.removeItem('wedding_app_data')
      localStorage.removeItem('wedding_room')
      onReset()
    }
  }

  const fmt = (n: number) => n > 0 ? `${(n / 10000).toLocaleString()}만원` : '미설정'

  return (
    <div className="pb-6 px-5 pt-2">
      <div className="text-lg font-extrabold mb-4">⚙️ 설정</div>

      {/* Profile card */}
      <div className="bg-white border border-stone-100 rounded-2xl p-5 text-center mb-4">
        <div className="text-2xl mb-1">💒</div>
        <div className="text-base font-extrabold">{profile.partner1.name || '나'} & {profile.partner2.name || '파트너'}</div>
        <div className="text-xs text-stone-400 mt-1">D-{daysLeft} · {profile.weddingDate || '날짜 미설정'}</div>
      </div>

      {/* Settings list */}
      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">기본 정보</div>
      <div className="bg-white border border-stone-100 rounded-xl divide-y divide-stone-50">
        <SettingRow label="내 이름" value={profile.partner1.name || '-'} onEdit={() => startEdit('name1', profile.partner1.name)} />
        <SettingRow label="파트너 이름" value={profile.partner2.name || '-'} onEdit={() => startEdit('name2', profile.partner2.name)} />
        <SettingRow label="예식일" value={profile.weddingDate || '-'} onEdit={() => startEdit('date', profile.weddingDate)} />
        <SettingRow label="총 예산" value={fmt(profile.totalBudget)} onEdit={() => startEdit('budget', profile.totalBudget > 0 ? String(profile.totalBudget) : '')} />
        <SettingRow label="지역" value={profile.region || '-'} onEdit={() => startEdit('region', profile.region)} />
        <SettingRow label="하객 수" value={profile.guestCount > 0 ? `${profile.guestCount}명` : '-'} />
      </div>

      {/* Sync */}
      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-5">실시간 동기화</div>
      <div className="bg-white border border-stone-100 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[13px] font-semibold">🔗 파트너 연결</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {connected ? `● ${roomName} 연결됨` : '미연결'}
            </div>
          </div>
          <button onClick={() => setShowRoom(!showRoom)}
            className="text-[12px] text-blue-600 font-semibold">
            {connected ? '변경' : '연결'}
          </button>
        </div>
        {showRoom && (
          <div className="mt-3 flex gap-2">
            <input value={roomInput} onChange={e => setRoomInput(e.target.value)}
              placeholder="공유 코드 입력"
              className="flex-1 p-2.5 border-2 border-stone-200 rounded-xl text-[13px] focus:border-stone-900 outline-none" />
            <button onClick={handleRoom}
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-[12px] font-bold shrink-0">
              {roomInput.trim() ? '연결' : '해제'}
            </button>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 mt-5">앱 정보</div>
      <div className="bg-white border border-stone-100 rounded-xl divide-y divide-stone-50">
        <div className="flex justify-between p-4 text-[13px]">
          <span className="text-stone-400">버전</span><span className="font-semibold">Wedding v1.0</span>
        </div>
        <div className="flex justify-between p-4 text-[13px]">
          <span className="text-stone-400">데이터</span>
          <span className="font-semibold">
            {data.vendors.length}개 업체 · {data.timeline.length}개 일정 · {(data.documents || []).length}개 문서
          </span>
        </div>
        <div className="flex justify-between p-4 text-[13px]">
          <span className="text-stone-400">Firebase</span>
          <span className={`font-semibold ${connected ? 'text-emerald-600' : 'text-stone-400'}`}>
            {connected ? '✅ 연결됨' : '미연결'}
          </span>
        </div>
      </div>

      {/* Reset */}
      <button onClick={resetApp}
        className="w-full mt-6 py-3 text-[13px] text-red-500 font-semibold">
        앱 데이터 초기화
      </button>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setEditing(null)}>
          <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-base font-bold mb-4">
              {editing === 'name1' ? '내 이름' : editing === 'name2' ? '파트너 이름' : editing === 'date' ? '예식일' : editing === 'budget' ? '총 예산' : '지역'} 수정
            </div>
            {editing === 'date' ? (
              <input type="date" value={tempVal} onChange={e => setTempVal(e.target.value)}
                className="w-full p-4 border-2 border-stone-200 rounded-xl text-[15px] focus:border-stone-900 outline-none" />
            ) : (
              <input value={tempVal} onChange={e => setTempVal(e.target.value)}
                placeholder={editing === 'budget' ? '예: 40000000' : '입력'}
                className="w-full p-4 border-2 border-stone-200 rounded-xl text-[15px] focus:border-stone-900 outline-none" />
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 text-[14px] font-semibold text-stone-400">취소</button>
              <button onClick={saveEdit} className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-[14px] font-bold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="flex justify-between items-center p-4 text-[13px]">
      <span className="text-stone-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        {onEdit && <button onClick={onEdit} className="text-blue-600 text-[12px] font-semibold">변경</button>}
      </div>
    </div>
  )
}
