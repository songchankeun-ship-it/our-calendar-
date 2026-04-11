import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FirebaseProvider } from './contexts/FirebaseContext'
import App from './App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </StrictMode>,
)
