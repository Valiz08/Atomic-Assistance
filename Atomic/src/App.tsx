import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/landing.tsx'
import Login from './pages/login/login.tsx'
import Dashboard from './pages/dashboard/dashboard.tsx'
import ProtectedRoute from './components/protectedRoute.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import Settings from './pages/settings/settings.tsx'

import { pdfjs } from 'react-pdf';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
  )
}

export default App
