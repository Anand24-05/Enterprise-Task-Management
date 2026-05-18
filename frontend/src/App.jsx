import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from './redux/slices/authSlice'
import { fetchNotifications, addNotification } from './redux/slices/notificationSlice'
import { initSocket, disconnectSocket } from './services/socket'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/Login/LoginPage'
import SignupPage from './pages/Signup/SignupPage'
import VerifyEmailPage from './pages/Login/VerifyEmailPage'
import CalendarPage from './pages/Calendar/CalendarPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CollaborationPage from './pages/Collaboration/CollaborationPage'
import ProfilePage from './pages/Profile/ProfilePage'
import SettingsPage from './pages/Settings/SettingsPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useSelector(s => s.auth)
  if (!initialized) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useSelector(s => s.auth)
  if (!initialized) return null
  return isAuthenticated ? <Navigate to="/calendar" replace /> : children
}

export default function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications())
      const token = localStorage.getItem('accessToken')
      if (token) {
        const socket = initSocket(token)
        socket.on('notification', (n) => dispatch(addNotification(n)))
      }
    } else {
      disconnectSocket()
    }
    return () => {}
  }, [isAuthenticated, dispatch])

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/calendar" replace />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="collaboration" element={<CollaborationPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
