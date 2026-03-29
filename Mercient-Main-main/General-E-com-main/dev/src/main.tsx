import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './context/UserContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { AlertProvider } from './context/AlertContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider>
      <CurrencyProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </CurrencyProvider>
    </AlertProvider>
  </StrictMode>,
)
