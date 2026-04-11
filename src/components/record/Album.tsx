import { useState } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import { Plus } from 'lucide-react'

export default function Album() {
  const { data, updateData } = useFirebase()
  const [viewIdx, setViewIdx] = useState<number | null>(null)

  const addPhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const max = 800
          let w = img.width, h = img.height
          if (w > max) { h = h * max / w; w = max }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
          const src = canvas.toDataURL('image/jpeg', 0.7)
          updateData(prev => ({ ...prev, album: [...prev.album, { src, date: new Date().toISOString().split('T')[0] }] }))
        }
        img.src = ev.target!.result as string
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const remove = (idx: number) => {
    updateData(prev => ({ ...prev, album: prev.album.filter((_, i) => i !== idx) }))
    setViewIdx(null)
  }

  return (
    <div className="px-4 pb-24 animate-fade-in-up">
      {data.album.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4 animate-bounce">🖼️</span>
          <h3 className="text-lg font-extrabold text-gray-800 mb-2">아직 사진이 없어요</h3>
          <p className="text-sm text-gray-400 mb-4">우리의 소중한 순간을 남겨보세요</p>
          <button onClick={addPhoto} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-light to-teal-dark text-white font-bold text-sm shadow-lg">첫 사진 추가</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          <div onClick={addPhoto} className="aspect-square rounded-2xl bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-mint-bg transition gap-1">
            <Plus size={24} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">추가</span>
          </div>
          {[...data.album].reverse().map((photo, i) => (
            <div key={i} onClick={() => setViewIdx(data.album.length - 1 - i)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition">
              <img src={photo.src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      {viewIdx !== null && data.album[viewIdx] && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" onClick={() => setViewIdx(null)}>
          <img src={data.album[viewIdx].src} alt="" className="max-w-full max-h-[70vh] rounded-2xl" />
          <div className="flex gap-4 mt-6">
            <button onClick={(e) => { e.stopPropagation(); remove(viewIdx) }} className="px-6 py-3 rounded-xl bg-red-500/80 text-white font-bold text-sm">삭제</button>
            <button onClick={() => setViewIdx(null)} className="px-6 py-3 rounded-xl bg-white/20 text-white font-bold text-sm">닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
