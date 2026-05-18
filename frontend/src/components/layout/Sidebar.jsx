import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdCalendarMonth, MdPeople, MdPerson,
  MdSettings, MdLogout, MdTask
} from 'react-icons/md'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: MdCalendarMonth, label: 'Calendar' },
  { to: '/collaboration', icon: MdPeople, label: 'Collaboration' },
  { to: '/profile', icon: MdPerson, label: 'Profile' },
  { to: '/settings', icon: MdSettings, label: 'Settings' },
]

export default function Sidebar() {
  const { sidebarOpen } = useSelector(s => s.ui)
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        className="w-64 min-h-full bg-white/3 border-r border-white/10 flex flex-col py-6 px-3 shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8" onClick={() => { navigate('/dashboard')}}>
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <MdTask className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight" >TaskFlow</h1>
            <p className="text-white/40 text-xs">Pro</p>
          </div>
        </div>

        {/* User info */}
        <div className="glass-card px-4 py-3 mb-6 mx-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
              {user?.userId?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{user?.userId}</p>
              <p className="text-white/40 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="text-xl shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-link text-red-400/70 hover:text-red-400 hover:bg-red-500/10 mt-4"
        >
          <MdLogout className="text-xl" />
          <span>Logout</span>
        </button>
      </motion.aside>
    </AnimatePresence>
  )
}
