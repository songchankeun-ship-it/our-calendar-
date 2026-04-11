import { useFirebase } from '../../contexts/FirebaseContext'
import { SPACE_PRESETS } from '../../types/data'

export default function SpaceHome() {
  const { data, connected, roomName } = useFirebase()
  const type = data.spaceType || 'couple'
  const preset = SPACE_PRESETS[type]
  const name = data.spaceName || preset.label

  // Common stats
  const chatCount = data.chat?.length || 0
  const albumCount = data.album?.length || 0
  const eventCount = data.events?.length || 0
  const todoCount = (data.todos || []).filter(t => !t.done).length
  const memoCount = data.memos?.length || 0

  // Couple-specific
  const diffDays = data.ddayDate
    ? Math.floor((Date.now() - new Date(data.ddayDate).getTime()) / 86400000) + 1
    : 0

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <div className="relative rounded-[28px] overflow-hidden mx-4 mt-2 mb-4 px-5 py-8 text-center shadow-lg"
        style={{ background: `linear-gradient(135deg, ${preset.color}CC, ${preset.color}99)` }}>
        <div className="relative z-10">
          {type === 'couple' && data.ddayDate ? (
            <>
              <div className="text-[56px] font-black text-white tracking-tighter leading-none mb-1">
                {diffDays}
              </div>
              <div className="text-[12px] font-semibold text-white/80 tracking-[2px] uppercase mb-2">
                days together
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">{preset.emoji}</div>
              <div className="text-xl font-black text-white mb-1">{name}</div>
            </>
          )}
          {connected && roomName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-semibold text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              🔗 {roomName}
            </div>
          )}
        </div>
        {/* Sparkles */}
        {[15, 75, 40, 85].map((left, i) => (
          <span key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/40 animate-sparkle"
            style={{ left: `${left}%`, top: `${20 + i * 15}%`, animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>

      {/* Members */}
      {type === 'couple' ? (
        <div className="flex items-center justify-center gap-5 py-2">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-bg to-teal-light flex items-center justify-center text-xl border-[3px] border-white shadow overflow-hidden">
              {data.couplePhoto ? <img src={data.couplePhoto} alt="" className="w-full h-full object-cover" /> : '🧑'}
            </div>
            <div className="text-[10px] font-bold text-gray-500 mt-1">{data.names.me || '나'}</div>
          </div>
          <span className="text-sm">❤️</span>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-bg to-teal-light flex items-center justify-center text-xl border-[3px] border-white shadow overflow-hidden">
              {data.couplePhoto ? <img src={data.couplePhoto} alt="" className="w-full h-full object-cover" /> : '👩'}
            </div>
            <div className="text-[10px] font-bold text-gray-500 mt-1">{data.names.you || '너'}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-2 px-4 flex-wrap">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-light to-teal-dark flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow">
              {(data.names.me || '나')[0]}
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">{data.names.me || '나'}</div>
          </div>
          {(data.members || []).map((m, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold border-2 border-white shadow">
                {m[0]}
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5">{m}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mx-4 mb-3">
        {type === 'couple' && (
          <>
            <QuickCard emoji="💬" label="마지막 대화" value={chatCount > 0 ? (data.chat[data.chat.length-1]?.text || '').substring(0, 20) : '대화를 시작해보세요'} sub={data.chat[data.chat.length-1]?.time} />
            <QuickCard emoji="💌" label="편지함" value={memoCount > 0 ? `${memoCount}통` : '편지를 써보세요'} />
          </>
        )}
        {type === 'friends' && (
          <>
            <QuickCard emoji="💬" label="대화" value={`${chatCount}개`} />
            <QuickCard emoji="🗳️" label="투표" value={`${(data.polls || []).length}개`} />
            <QuickCard emoji="💰" label="총 지출" value={`${((data.budget || []).reduce((s: number, b: any) => s + (b.amount || 0), 0)).toLocaleString()}원`} />
            <QuickCard emoji="📅" label="일정" value={`${eventCount}개`} />
          </>
        )}
        {type === 'travel' && (
          <>
            <QuickCard emoji="✅" label="체크리스트" value={`${(data.checklist || []).filter((c: any) => c.checked).length} / ${(data.checklist || []).length}`} />
            <QuickCard emoji="💰" label="예산" value={`${((data.budget || []).reduce((s: number, b: any) => s + (b.amount || 0), 0)).toLocaleString()}원`} />
            <QuickCard emoji="📍" label="장소" value={`${(data.spots || []).length}곳`} />
            <QuickCard emoji="📸" label="사진" value={`${albumCount}장`} />
          </>
        )}
        {type === 'wedding' && (
          <>
            <QuickCard emoji="✅" label="준비현황" value={`${(data.checklist || []).filter((c: any) => c.checked).length} / ${(data.checklist || []).length}`} />
            <QuickCard emoji="💰" label="비용" value={`${((data.budget || []).reduce((s: number, b: any) => s + (b.amount || 0), 0)).toLocaleString()}원`} />
            <QuickCard emoji="🏢" label="업체" value={`${(data.vendors || []).length}곳`} />
            <QuickCard emoji="📅" label="일정" value={`${eventCount}개`} />
          </>
        )}
        {type === 'project' && (
          <>
            <QuickCard emoji="📋" label="할 일" value={todoCount > 0 ? `${todoCount}개 남음` : '모두 완료!'} />
            <QuickCard emoji="👥" label="역할" value={`${(data.roles || []).length}명`} />
            <QuickCard emoji="💬" label="대화" value={`${chatCount}개`} />
            <QuickCard emoji="📅" label="일정" value={`${eventCount}개`} />
          </>
        )}
      </div>

      {/* Recent Album */}
      {albumCount > 0 && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden shadow relative h-[160px]">
          <img src={data.album[data.album.length - 1].src} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
            <span className="text-white text-xs font-bold">🖼 {albumCount}장의 추억</span>
          </div>
        </div>
      )}

      {/* Garden (couple only) */}
      {type === 'couple' && (
        <div className="glass-card mx-4 mb-3 p-4 flex items-center justify-center gap-3">
          <span className="text-3xl">🌳</span>
          <div>
            <div className="text-sm font-bold text-gray-800">정원</div>
            <div className="text-xs text-gray-400">XP {(data.chat?.length || 0) * 5 + (data.album?.length || 0) * 10}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuickCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card p-3.5">
      <div className="text-[10px] font-bold text-gray-400 mb-1">{emoji} {label}</div>
      <div className="text-[13px] font-semibold text-gray-800 line-clamp-1">{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
