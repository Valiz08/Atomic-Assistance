import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/landing.tsx'
import Login from './pages/login/login.tsx'
import Dashboard from './pages/dashboard/dashboard.tsx'
import ProtectedRoute from './components/protectedRoute.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import Settings from './pages/settings/settings.tsx'
import Chat from './pages/chat/chat.tsx'

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const App = () => {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
  )
}

export default App
