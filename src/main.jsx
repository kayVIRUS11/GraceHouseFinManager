import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SchoolProvider } from './context/SchoolContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthGate from './components/AuthGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SchoolProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </SchoolProvider>
    </AuthProvider>
  </StrictMode>
)
