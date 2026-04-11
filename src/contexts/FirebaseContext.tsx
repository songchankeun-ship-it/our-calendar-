import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'
import type { Database } from 'firebase/database'
import type { CoupleData } from '../types/data'
import { DEFAULT_DATA } from '../types/data'

interface FirebaseContextType {
  data: CoupleData
  updateData: (updater: (prev: CoupleData) => CoupleData) => void
  setField: <K extends keyof CoupleData>(key: K, value: CoupleData[K]) => void
  connected: boolean
  roomName: string | null
  connectToRoom: (room: string) => void
  disconnect: () => void
}

const FirebaseContext = createContext<FirebaseContextType | null>(null)

const STORAGE_KEY = 'couple_app_data'
const ROOM_KEY = 'couple_room_name'
const CONFIG_KEY = 'couple_firebase_config'

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CoupleData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = { ...DEFAULT_DATA, ...JSON.parse(saved) }
        // Auto-set spaceType for existing users (unless explicitly reset)
        const wasReset = localStorage.getItem('couple_space_reset') === 'true'
        if (!parsed.spaceType && !wasReset && (parsed.ddayDate || parsed.names?.me)) {
          parsed.spaceType = 'couple'
        }
        if (wasReset) {
          localStorage.removeItem('couple_space_reset')
        }
        return parsed
      }
      return DEFAULT_DATA
    } catch {
      return DEFAULT_DATA
    }
  })
  const [connected, setConnected] = useState(false)
  const [roomName, setRoomName] = useState<string | null>(() => localStorage.getItem(ROOM_KEY))
  const [db, setDb] = useState<Database | null>(null)

  // Initialize Firebase from saved config
  useEffect(() => {
    try {
      const configStr = localStorage.getItem(CONFIG_KEY)
      if (configStr) {
        const config = JSON.parse(configStr)
        const app = initializeApp(config)
        setDb(getDatabase(app))
      }
    } catch (e) {
      console.error('Firebase init error:', e)
    }
  }, [])

  // Connect to room and sync
  useEffect(() => {
    if (!db || !roomName) return

    const roomRef = ref(db, `rooms/${roomName}`)
    const unsub = onValue(roomRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        const merged = { ...DEFAULT_DATA, ...val } as CoupleData
        // Preserve local spaceType - don't let Firebase overwrite it
        const localSpaceType = (() => {
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved).spaceType : undefined
          } catch { return undefined }
        })()
        if (localSpaceType) {
          merged.spaceType = localSpaceType
        } else if (!merged.spaceType && (merged.ddayDate || merged.names?.me)) {
          const wasReset = localStorage.getItem('couple_space_reset') === 'true'
          if (!wasReset) merged.spaceType = 'couple'
        }
        setData(merged)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      }
      setConnected(true)
    }, () => {
      setConnected(false)
    })

    return () => unsub()
  }, [db, roomName])

  const saveData = useCallback((newData: CoupleData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    if (db && roomName) {
      set(ref(db, `rooms/${roomName}`), newData).catch(console.error)
    }
  }, [db, roomName])

  const updateData = useCallback((updater: (prev: CoupleData) => CoupleData) => {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }, [saveData])

  const setField = useCallback(<K extends keyof CoupleData>(key: K, value: CoupleData[K]) => {
    updateData(prev => ({ ...prev, [key]: value }))
  }, [updateData])

  const connectToRoom = useCallback((room: string) => {
    localStorage.setItem(ROOM_KEY, room)
    setRoomName(room)
  }, [])

  const disconnect = useCallback(() => {
    localStorage.removeItem(ROOM_KEY)
    setRoomName(null)
    setConnected(false)
  }, [])

  return (
    <FirebaseContext.Provider value={{ data, updateData, setField, connected, roomName, connectToRoom, disconnect }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext)
  if (!ctx) throw new Error('useFirebase must be used within FirebaseProvider')
  return ctx
}
