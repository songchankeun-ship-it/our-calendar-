import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, type Database } from 'firebase/database'
import { DEFAULT_WEDDING_DATA, type WeddingData } from '../types/wedding'

const firebaseConfig = {
  apiKey: "AIzaSyAkr6jMDRC6VjfIRLXvNahN0JhQIlXEaWM",
  authDomain: "couple-app-16c09.firebaseapp.com",
  databaseURL: "https://couple-app-16c09-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "couple-app-16c09",
  storageBucket: "couple-app-16c09.firebasestorage.app",
  messagingSenderId: "787816519498",
  appId: "1:787816519498:web:7c9b5f68e30fe04dd76f73"
}

const app = initializeApp(firebaseConfig)
const STORAGE_KEY = 'wedding_app_data'
const ROOM_KEY = 'wedding_room'

interface FirebaseCtx {
  data: WeddingData
  connected: boolean
  roomName: string
  updateData: (updater: (prev: WeddingData) => WeddingData) => void
  setField: <K extends keyof WeddingData>(key: K, value: WeddingData[K]) => void
  connectToRoom: (room: string) => void
  disconnectRoom: () => void
}

const Ctx = createContext<FirebaseCtx>({
  data: DEFAULT_WEDDING_DATA,
  connected: false,
  roomName: '',
  updateData: () => {},
  setField: () => {},
  connectToRoom: () => {},
  disconnectRoom: () => {},
})

export function useWedding() { return useContext(Ctx) }

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [db] = useState<Database>(() => getDatabase(app))
  const [data, setData] = useState<WeddingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_WEDDING_DATA, ...JSON.parse(saved) } : DEFAULT_WEDDING_DATA
    } catch { return DEFAULT_WEDDING_DATA }
  })
  const [connected, setConnected] = useState(false)
  const [roomName, setRoomName] = useState(() => localStorage.getItem(ROOM_KEY) || '')

  // Firebase sync
  useEffect(() => {
    if (!db || !roomName) return
    const roomRef = ref(db, `wedding/${roomName}`)
    const unsub = onValue(roomRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        const merged = { ...DEFAULT_WEDDING_DATA, ...val } as WeddingData
        setData(merged)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      }
      setConnected(true)
    }, () => { setConnected(false) })
    return () => unsub()
  }, [db, roomName])

  const saveData = useCallback((newData: WeddingData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    if (db && roomName) {
      const clean = JSON.parse(JSON.stringify(newData))
      set(ref(db, `wedding/${roomName}`), clean).catch(console.error)
    }
  }, [db, roomName])

  const updateData = useCallback((updater: (prev: WeddingData) => WeddingData) => {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }, [saveData])

  const setField = useCallback(<K extends keyof WeddingData>(key: K, value: WeddingData[K]) => {
    updateData(prev => ({ ...prev, [key]: value }))
  }, [updateData])

  const connectToRoom = useCallback((room: string) => {
    localStorage.setItem(ROOM_KEY, room)
    setRoomName(room)
  }, [])

  const disconnectRoom = useCallback(() => {
    localStorage.removeItem(ROOM_KEY)
    setRoomName('')
    setConnected(false)
  }, [])

  return (
    <Ctx.Provider value={{ data, connected, roomName, updateData, setField, connectToRoom, disconnectRoom }}>
      {children}
    </Ctx.Provider>
  )
}
