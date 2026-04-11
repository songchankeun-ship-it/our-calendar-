import { useFirebase } from '../../contexts/FirebaseContext'
import { SPACE_PRESETS } from '../../types/data'

export default function HomeDashboard() {
  const { data, connected, roomName } = useFirebase()
  const spaceType = data.spaceType || 'couple'
  const preset = SPACE_PRESETS[spaceType]

  const diffDays = data.ddayDate
    ? Math.floor((Date.now() - new Date(data.ddayDate).getTime()) / 86400000) + 1
    : 0

  const streakEmoji = data.streak.current >= 365 ? '👑' :
    data.streak.current >= 100 ? '💎' :
    data.streak.current >= 30 ? '🔥' :
    data.streak.current >= 7 ? '⚡' :
    data.streak.current >= 3 ? '✨' : '💤'

  const lastPhoto = data.album[data.album.length - 1]
  const lastMsg = data.chat[data.chat.length - 1]
  const lastMemo = data.memos[data.memos.length - 1]

  // Non-couple space types get a different home
  if (spaceType !== 'couple') {
    const todosDone = (data.todos || []).filter(t => t.done).length
    const todosTotal = (data.todos || []).length
    const budgetTotal = (data.budget || []).reduce((s: number, b: any) => s + (b.amount || 0), 0)
    const checkDone = (data.checklist || []).filter((c: any) => c.checked).length
    const checkTotal = (data.checklist || []).length

    return (
      <div className="animate-fade-in-up">
        {/* Hero */}
        <div className="relative rounded-[28px] overflow-hidden mx-4 mt-2 mb-4 px-5 py-8 text-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${preset.color}DD, ${preset.color}99)` }}>
          <div className="relative z-10">
            <div className="text-5xl mb-2">{preset.emoji}</div>
            <div className="text-xl font-black text-white">{data.spaceName || preset.label}</div>
            <div className="text-xs text-white/70 mt-1">{data.names.me || '나'}{(data.members || []).length > 0 ? ` 외 ${data.members!.length}명` : ''}</div>
            {connected && roomName && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white/90 border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  🔗 {roomName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mx-4 mb-4">
          <div className="glass-card p-3 text-center">
            <div className="text-xl mb-0.5">💬</div>
            <div className="text-lg font-black text-gray-800">{data.chat.length}</div>
            <div className="text-[10px] text-gray-400 font-bold">대화</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-xl mb-0.5">📸</div>
            <div className="text-lg font-black text-gray-800">{data.album.length}</div>
            <div className="text-[10px] text-gray-400 font-bold">사진</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-xl mb-0.5">📅</div>
            <div className="text-lg font-black text-gray-800">{data.events.length}</div>
            <div className="text-[10px] text-gray-400 font-bold">일정</div>
          </div>
        </div>

        {/* Space-specific cards */}
        <div className="mx-4 space-y-3">
          {todosTotal > 0 && (
            <div className="glass-card p-4">
              <div className="text-[11px] font-bold text-teal mb-1.5">📋 할 일</div>
              <div className="text-[22px] font-black text-gray-800">{todosDone} / {todosTotal}</div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-teal rounded-full" style={{ width: `${todosTotal ? todosDone / todosTotal * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {budgetTotal > 0 && (
            <div className="glass-card p-4">
              <div className="text-[11px] font-bold text-coral mb-1.5">💰 총 지출</div>
              <div className="text-[22px] font-black text-gray-800">{budgetTotal.toLocaleString()}원</div>
            </div>
          )}

          {checkTotal > 0 && (
            <div className="glass-card p-4">
              <div className="text-[11px] font-bold text-purple-500 mb-1.5">✅ 체크리스트</div>
              <div className="text-[22px] font-black text-gray-800">{checkDone} / {checkTotal}</div>
            </div>
          )}

          {lastMsg && (
            <div className="glass-card p-4">
              <div className="text-[11px] font-bold text-teal mb-1.5">💬 최근 대화</div>
              <div className="text-[13px] font-semibold text-gray-800">{lastMsg.text}</div>
              <div className="text-[10px] text-gray-400 mt-1">{lastMsg.time}</div>
            </div>
          )}

          {todosTotal === 0 && budgetTotal === 0 && checkTotal === 0 && !lastMsg && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-3">{preset.emoji}</div>
              <p className="text-sm font-semibold">공간을 채워보세요!</p>
              <p className="text-xs mt-1">채팅, 일정, 사진을 추가해보세요</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <div className="hero-gradient relative rounded-[28px] overflow-hidden mx-4 mt-2 mb-4 px-5 py-10 text-center shadow-[0_12px_40px_rgba(13,148,136,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)]" />
        <div className="relative z-10">
          {data.ddayDate ? (
            <>
              <div className="text-[64px] font-black text-white tracking-tighter leading-none mb-1.5 drop-shadow-lg">
                {diffDays}
              </div>
              <div className="text-[13px] font-semibold text-white/80 tracking-[2.5px] uppercase mb-3">
                days together
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold text-white border border-white/20">
                  {streakEmoji} {data.streak.current}일 연속
                </span>
              </div>
            </>
          ) : (
            <div className="text-white text-lg font-bold">💕 사귄 날짜를 설정해주세요</div>
          )}
        </div>
        {/* Connection badge */}
        {roomName && (
          <div className="relative z-10 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${connected ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30' : 'bg-yellow-400/20 text-yellow-100 border border-yellow-300/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-300 animate-pulse' : 'bg-yellow-300'}`} />
              {connected ? `🔗 ${roomName}` : '⏳ 연결 중...'}
            </span>
          </div>
        )}
        {/* Sparkles */}
        {[12, 78, 45, 88].map((left, i) => (
          <span key={i}
            className="absolute w-2 h-2 rounded-full bg-white animate-sparkle shadow-[0_0_6px_rgba(255,255,255,0.5)]"
            style={{ left: `${left}%`, top: `${15 + i * 15}%`, animationDelay: `${i * 0.7}s` }} />
        ))}
        {/* Wave curve */}
        <div className="absolute -bottom-px left-0 right-0 h-7 bg-bg rounded-t-[24px] z-20" />
      </div>

      {/* Mood section */}
      <div className="flex items-center justify-center gap-5 py-3">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-mint-bg to-teal-light flex items-center justify-center text-2xl border-[3px] border-white shadow-[0_4px_16px_rgba(56,178,172,0.15)] overflow-hidden">
            {data.couplePhoto ? <img src={data.couplePhoto} alt="" className="w-full h-full object-cover" /> : '🧑'}
          </div>
          <div className="text-xs font-bold text-gray-500 mt-1.5">{data.names.me || '나'}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-gradient-to-r from-transparent via-coral/30 to-transparent" />
          <span className="text-sm animate-heartbeat">❤️</span>
          <div className="w-4 h-px bg-gradient-to-r from-transparent via-coral/30 to-transparent" />
        </div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-mint-bg to-teal-light flex items-center justify-center text-2xl border-[3px] border-white shadow-[0_4px_16px_rgba(56,178,172,0.15)] overflow-hidden">
            {data.couplePhoto ? <img src={data.couplePhoto} alt="" className="w-full h-full object-cover" /> : '👩'}
          </div>
          <div className="text-xs font-bold text-gray-500 mt-1.5">{data.names.you || '너'}</div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-24">
        {/* Photo */}
        <div className="glass-card col-span-2 h-[140px] overflow-hidden cursor-pointer active:scale-[0.97] transition-transform">
          {lastPhoto ? (
            <div className="relative w-full h-full">
              <img src={lastPhoto.src} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-4 pt-5 pb-3">
                <span className="text-white text-xs font-bold">📷 {data.album.length}장의 추억</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 text-sm font-semibold bg-gradient-to-br from-mint-bg via-green-50 to-yellow-50 rounded-[20px]">
              <span className="text-3xl opacity-35 animate-bounce">📷</span>
              <span>첫 사진을 남겨보세요</span>
            </div>
          )}
        </div>

        {/* Last message */}
        <div className="glass-card p-4 min-h-[100px] cursor-pointer active:scale-[0.97] transition-transform">
          <div className="text-[11px] font-bold text-teal mb-1.5">💬 마지막 대화</div>
          {lastMsg ? (
            <>
              <div className="text-[13px] font-semibold text-gray-800 line-clamp-2">{lastMsg.text}</div>
              <div className="text-[10px] text-gray-400 mt-1">{lastMsg.time}</div>
            </>
          ) : (
            <div className="text-[13px] font-semibold text-gray-400 opacity-40">아직 대화가 없어요</div>
          )}
        </div>

        {/* Letter */}
        <div className="glass-card p-4 min-h-[100px] cursor-pointer active:scale-[0.97] transition-transform">
          <div className="text-[11px] font-bold text-coral mb-1.5">💌 편지함</div>
          {lastMemo ? (
            <div className="text-[13px] font-semibold text-gray-800 italic line-clamp-2">
              "{(lastMemo.title || lastMemo.body || lastMemo.text || '').substring(0, 30)}..."
            </div>
          ) : (
            <div className="text-[13px] font-semibold text-gray-400 opacity-40">첫 편지를 써보세요</div>
          )}
        </div>

        {/* Garden */}
        <div className="glass-card col-span-2 p-4 flex items-center justify-center gap-3 bg-gradient-to-br from-mint-bg/90 to-green-50/90 cursor-pointer active:scale-[0.97] transition-transform">
          <span className="text-3xl">🌳</span>
          <div>
            <div className="text-[13px] font-extrabold text-teal-dark">정원</div>
            <div className="text-[11px] font-semibold text-gray-500">XP {data.garden?.feeds ? data.garden.feeds * 10 : 0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
