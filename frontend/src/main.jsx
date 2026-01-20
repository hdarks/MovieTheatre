import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RoleProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </RoleProvider>
    </AuthProvider>
  </StrictMode>,
)
