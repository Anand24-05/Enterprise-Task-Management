import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { MdPerson, MdEmail, MdBusiness, MdTask, MdCheckCircle, MdPending, MdEdit, MdSave } from 'react-icons/md'
import api from '../../services/api'
import { setUser } from '../../redux/slices/authSlice'
import toast from 'react-hot-toast'

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-4 text-center">
    <Icon className={`text-3xl mx-auto mb-2 ${color}`} />
    <p className="text-white text-2xl font-bold">{value}</p>
    <p className="text-white/40 text-xs mt-0.5">{label}</p>
  </div>
)

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [stats, setStats] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ companyName: '', profilePicture: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setStats(data.stats)
      setForm({ companyName: data.user.companyName || '', profilePicture: data.user.profilePicture || '' })
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/users/profile', form)
      dispatch(setUser({ ...user, ...data.user }))
      toast.success('Profile updated!')
      setEditMode(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.userId?.[0]?.toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-white/50 text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-brand flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-primary-500/30">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover rounded-3xl" />
                : initials
              }
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-[#1a1a2e]" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
              <h2 className="text-white text-2xl font-bold">{user?.userId}</h2>
              <span className="inline-flex self-center items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-brand text-white">
                {user?.role}
              </span>
            </div>
            <p className="text-white/50 text-sm mb-3">{user?.email}</p>
            {user?.companyName && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-white/60 text-sm">
                <MdBusiness className="text-primary-500" />
                <span>{user.companyName}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            disabled={loading}
            className={`shrink-0 ${editMode ? 'btn-primary' : 'btn-ghost'} flex items-center gap-2`}
          >
            {editMode ? (
              loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave />
            ) : <MdEdit />}
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit fields */}
        {editMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-white/10 space-y-4">
            <div>
              <label className="text-white/70 text-sm font-medium block mb-1.5">Company Name</label>
              <input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                placeholder="Your company name" className="input-field" />
            </div>
            <div>
              <label className="text-white/70 text-sm font-medium block mb-1.5">Profile Picture URL</label>
              <input value={form.profilePicture} onChange={e => setForm(p => ({ ...p, profilePicture: e.target.value }))}
                placeholder="https://example.com/photo.jpg" className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditMode(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-white font-bold text-lg mb-3">Task Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatBadge icon={MdTask} label="Total Tasks" value={stats.total} color="text-primary-500" />
            <StatBadge icon={MdCheckCircle} label="Completed" value={stats.completed} color="text-green-400" />
            <StatBadge icon={MdPending} label="Pending" value={stats.pending} color="text-yellow-400" />
          </div>
        </motion.div>
      )}

      {/* Info table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-6">
        <h2 className="text-white font-bold text-lg mb-4">Account Details</h2>
        <div className="space-y-3">
          {[
            { icon: MdPerson, label: 'User ID', value: user?.userId },
            { icon: MdEmail, label: 'Email', value: user?.email },
            { icon: MdBusiness, label: 'Company', value: user?.companyName || 'Not set' },
            { icon: MdBusiness, label: 'Company ID', value: user?.companyId || 'Not associated' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
              <Icon className="text-primary-500 text-xl shrink-0" />
              <div>
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
