import { useState, useRef, useEffect } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { Send } from 'lucide-react'

export default function Chat() {
  const { data, updateData } = useFirebase()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const myName = data.names.me || '나'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data.chat.length])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    updateData(prev => ({
      ...prev,
      chat: [...prev.chat, {
        text,
        from: myName,
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        date: now.toISOString().split('T')[0],
      }]
    }))
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {data.chat.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-4xl mb-3 animate-bounce">💬</span>
            <p className="text-sm font-semibold">첫 메시지를 보내보세요!</p>
          </div>
        )}
        {data.chat.map((msg, i) => {
          const isMe = msg.from === myName || msg.from === '나' || msg.from === 'me'
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed
                ${isMe
                  ? 'bg-gradient-to-br from-teal-light to-teal-dark text-white rounded-[20px_20px_6px_20px] shadow-[0_2px_12px_rgba(13,148,136,0.2)]'
                  : 'bg-white text-gray-800 rounded-[20px_20px_20px_6px] shadow-[0_2px_10px_rgba(26,44,53,0.06)] border border-gray-50'
                }`}>
                <p>{msg.text}</p>
                <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom)+60px)] pt-2">
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 pl-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none outline-none text-[14px] py-2 max-h-24 bg-transparent"
          />
          <button onClick={send}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-light to-teal-dark text-white flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-90 transition">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
