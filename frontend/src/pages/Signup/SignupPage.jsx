import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { signup, clearError } from '../../redux/slices/authSlice'
import { MdTask, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [role, setRole] = useState('user')
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    userId: '', email: '', companyName: '', companyId: '', password: '', confirmPassword: ''
  })

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (error) dispatch(clearError())
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    const payload = { ...form, role }
    if (role === 'company') delete payload.companyId
    const result = await dispatch(signup(payload))
    if (signup.fulfilled.match(result)) {
      setDone(true)
    } else {
      toast.error(result.payload || 'Signup failed')
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center max-w-md w-full">
        <MdCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-2">Account Created!</h2>
        <p className="text-white/60 mb-6">We've sent a verification link to <strong className="text-white">{form.email}</strong>. Please verify your email before logging in.</p>
        <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] p-4">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand mb-4 shadow-2xl shadow-primary-500/30">
            <MdTask className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 mt-1">Join TaskFlow Pro today</p>
        </div>

        <div className="glass-card p-8">
          {/* Role toggle */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            {['user', 'company'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === r ? 'bg-gradient-brand text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                {r === 'user' ? 'Regular User' : 'Company'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  {role === 'company' ? 'Company ID' : 'User ID'} *
                </label>
                <input name="userId" value={form.userId} onChange={handleChange}
                  placeholder={role === 'company' ? 'company_id' : 'user_id'}
                  required className="input-field text-sm py-2.5" />
              </div>
              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="email@example.com" required className="input-field text-sm py-2.5" />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-xs font-medium block mb-1.5">Company Name</label>
              <input name="companyName" value={form.companyName} onChange={handleChange}
                placeholder="Your company name" className="input-field text-sm py-2.5" />
            </div>

            {role === 'user' && (
              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">Company ID (optional)</label>
                <input name="companyId" value={form.companyId} onChange={handleChange}
                  placeholder="Join a company by its ID" className="input-field text-sm py-2.5" />
              </div>
            )}

            <div className="relative">
              <label className="text-white/70 text-xs font-medium block mb-1.5">Password *</label>
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={handleChange} placeholder="Min. 8 characters" required className="input-field text-sm py-2.5 pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 bottom-2.5 text-white/40 hover:text-white/70">
                {showPass ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
              </button>
            </div>

            <div>
              <label className="text-white/70 text-xs font-medium block mb-1.5">Confirm Password *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} placeholder="Repeat password" required className="input-field text-sm py-2.5" />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
