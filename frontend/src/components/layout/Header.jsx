import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MdSearch, MdNotifications, MdClose, MdTask } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { searchTasks, clearSearchResults } from '../../redux/slices/taskSlice'
import { fetchNotifications, markAllRead } from '../../redux/slices/notificationSlice'
import { toggleNotifications, closeNotifications } from '../../redux/slices/uiSlice'
import { logout } from '../../redux/slices/authSlice'
import toast from 'react-hot-toast'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { items: notifications, unreadCount } = useSelector(s => s.notifications)
  const { notificationOpen } = useSelector(s => s.ui)
  const { searchResults } = useSelector(s => s.tasks)
  const [searchQ, setSearchQ] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQ.trim().length >= 2) dispatch(searchTasks(searchQ))
      else dispatch(clearSearchResults())
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQ, dispatch])

  const handleNotifToggle = () => {
    dispatch(toggleNotifications())
    dispatch(fetchNotifications())
  }

  const handleMarkAllRead = () => {
    dispatch(markAllRead())
  }

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white/3 border-b border-white/10 flex items-center px-6 gap-4 relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2" onClick={() => { navigate('/dashboard')}}>
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
          <MdTask className="text-white text-base" />
        </div>
        <span className="text-white font-bold text-lg hidden sm:block" >TaskFlow Pro</span>
      </div>

      {/* Company name */}
      {user?.companyName && (
        <div className="hidden md:flex items-center gap-2 glass-card px-3 py-1.5">
          <span className="text-white/40 text-xs">Company:</span>
          <span className="text-primary-500 text-sm font-semibold">{user.companyName}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xl" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-primary-500 transition-all"
          />
          {searchQ && (
            <button onClick={() => { setSearchQ(''); dispatch(clearSearchResults()) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <MdClose />
            </button>
          )}
        </div>
        {/* Search results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {searchResults.map(task => (
                <div key={task._id} className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
                  <p className="text-white text-sm font-medium">{task.title}</p>
                  <p className="text-white/40 text-xs">{new Date(task.taskDate).toLocaleDateString()}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifToggle}
            className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <MdNotifications className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  <button onClick={handleMarkAllRead} className="text-primary-500 text-xs hover:text-primary-400">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-white/40 text-center py-6 text-sm">No notifications</p>
                  ) : notifications.map(n => (
                    <div key={n._id} className={`px-4 py-3 border-b border-white/5 ${!n.isRead ? 'bg-primary-500/10' : ''}`}>
                      <p className="text-white text-sm">{n.message}</p>
                      <p className="text-white/40 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 glass-card px-3 py-1.5 hover:border-primary-500/40 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {user?.userId?.[0]?.toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">{user?.userId}</span>
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <button onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                  className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm">
                  View Profile
                </button>
                <button onClick={() => { navigate('/dashboard'); setProfileOpen(false) }}
                  className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm">
                  Dashboard
                </button>
                <hr className="border-white/10" />
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm">
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
