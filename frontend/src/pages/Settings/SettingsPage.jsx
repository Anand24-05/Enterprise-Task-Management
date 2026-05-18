import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdLock, MdEmail, MdPalette, MdPerson,
  MdChevronRight, MdSave, MdVisibility, MdVisibilityOff,
  MdCheck, MdBrush, MdPreview
} from 'react-icons/md'
import api from '../../services/api'
import { setUser } from '../../redux/slices/authSlice'
import { THEMES, applyTheme, getStoredTheme } from '../../hooks/useTheme'
import toast from 'react-hot-toast'

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
)

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
        {Icon && <Icon className="text-xl text-primary-500" />}
        <h2 className="text-white font-bold text-base">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function LivePreviewCard({ theme }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300"
      style={{ background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2})` }}
    >
      {/* Mock header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-white/10"
        style={{ background: `${theme.bg2}cc` }}
      >
        <div className="w-4 h-4 rounded-md"
          style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }} />
        <div className="h-2 w-16 rounded-full bg-white/20" />
        <div className="ml-auto flex gap-1.5 items-center">
          <div className="h-1.5 w-10 rounded-full bg-white/10" />
          <div className="w-5 h-5 rounded-full"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }} />
        </div>
      </div>
      {/* Mock body */}
      <div className="flex gap-2 p-3">
        <div className="w-14 space-y-2">
          {[100, 75, 85, 65].map((w, i) => (
            <div key={i} className="h-2 rounded-full"
              style={{
                background: i === 0
                  ? `linear-gradient(135deg, ${theme.from}55, ${theme.to}55)`
                  : 'rgba(255,255,255,0.08)',
                width: `${w}%`
              }} />
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-2.5 rounded-full bg-white/20 w-3/4" />
          <div className="grid grid-cols-3 gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg border border-white/10 p-1.5"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-1.5 rounded-full mb-1"
                  style={{ background: `linear-gradient(135deg, ${theme.from}66, ${theme.to}66)` }} />
                <div className="h-1 rounded-full bg-white/10 w-2/3" />
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-white/10 w-full" />
          <div className="h-1.5 rounded-full bg-white/10 w-2/3" />
        </div>
      </div>
      <div className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }} />
    </div>
  )
}

function ThemeCard({ theme, isActive, isPreviewing, onSelect, onHover, onLeave }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(theme.id)}
      onMouseEnter={() => onHover(theme.id)}
      onMouseLeave={onLeave}
      className={`relative p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
        isActive
          ? 'border-white/50 shadow-lg'
          : isPreviewing
            ? 'border-white/25 bg-white/5'
            : 'border-white/10 hover:border-white/25 bg-white/3'
      }`}
      style={isActive ? { boxShadow: `0 0 24px ${theme.from}40` } : {}}
    >
      <div className="w-full h-12 rounded-xl mb-3 transition-all duration-300"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }} />
      <div className="flex gap-1 mb-3">
        {[theme.bg1, theme.bg2, theme.bg3].map((c, i) => (
          <div key={i} className="flex-1 h-3 rounded-md border border-white/10"
            style={{ background: c }} />
        ))}
      </div>
      <p className="text-white text-xs font-semibold">{theme.label}</p>
      <p className="text-white/40 text-xs mt-0.5 leading-tight">{theme.description}</p>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
          >
            <MdCheck className="text-white text-sm" />
          </motion.div>
        )}
        {isPreviewing && !isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5"
          >
            <MdPreview className="text-white/60 text-xs" />
            <span className="text-white/60 text-xs">Preview</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function AppearanceSection({ user, dispatch }) {
  const [appliedTheme, setAppliedTheme] = useState(user?.backgroundTheme || getStoredTheme())
  const [previewTheme, setPreviewTheme] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const displayId = previewTheme || appliedTheme
  const displayThemeObj = THEMES.find(t => t.id === displayId) || THEMES[0]

  useEffect(() => {
    applyTheme(appliedTheme)
  }, [])

  const handleHover = useCallback((id) => {
    setPreviewTheme(id)
    applyTheme(id)
  }, [])

  const handleLeave = useCallback(() => {
    setPreviewTheme(null)
    applyTheme(appliedTheme)
  }, [appliedTheme])

  const handleSelect = useCallback((id) => {
    setAppliedTheme(id)
    setPreviewTheme(null)
    applyTheme(id)
    setSaved(false)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.put('/users/profile', { backgroundTheme: appliedTheme })
      dispatch(setUser({ ...user, backgroundTheme: appliedTheme }))
      applyTheme(appliedTheme)
      setSaved(true)
      toast.success(`"${displayThemeObj.label}" theme saved!`)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Failed to save theme')
      const prev = user?.backgroundTheme || 'default'
      setAppliedTheme(prev)
      applyTheme(prev)
    } finally {
      setLoading(false)
    }
  }

  const hasUnsaved = appliedTheme !== (user?.backgroundTheme || getStoredTheme())

  return (
    <SettingsSection title="Appearance" icon={MdBrush}>
      <div className="space-y-6">

        {/* Live preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/70 text-sm font-medium">Live Preview</p>
            <motion.span
              key={displayId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-3 py-1 rounded-full font-medium transition-all"
              style={{
                background: `linear-gradient(135deg, ${displayThemeObj.from}22, ${displayThemeObj.to}22)`,
                color: displayThemeObj.from,
                border: `1px solid ${displayThemeObj.from}44`
              }}
            >
              {previewTheme ? '👁 Previewing: ' : '✓ Selected: '}{displayThemeObj.label}
            </motion.span>
          </div>
          <motion.div
            key={displayId}
            initial={{ opacity: 0.6, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <LivePreviewCard theme={displayThemeObj} />
          </motion.div>
        </div>

        {/* Theme grid */}
        <div>
          <p className="text-white/70 text-sm font-medium mb-3">
            Choose Theme
            <span className="text-white/30 text-xs ml-2">— hover to preview, click to select</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={appliedTheme === theme.id}
                isPreviewing={previewTheme === theme.id}
                onSelect={handleSelect}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            ))}
          </div>
        </div>

        {/* Save bar */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={loading || (!hasUnsaved && !saved)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            style={{
              background: hasUnsaved || loading
                ? `linear-gradient(135deg, ${displayThemeObj.from}, ${displayThemeObj.to})`
                : 'rgba(255,255,255,0.1)'
            }}
          >
            {loading ? <Spinner /> : saved ? <MdCheck /> : <MdSave />}
            {loading ? 'Saving…' : saved ? 'Saved!' : 'Apply Theme'}
          </button>

          <AnimatePresence mode="wait">
            {hasUnsaved && !loading && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-amber-400/70 text-xs"
              >
                Unsaved changes — click Apply to persist
              </motion.p>
            )}
            {!hasUnsaved && !loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/30 text-xs"
              >
                Current: <span className="text-white/50">{displayThemeObj.label}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SettingsSection>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'account', icon: MdPerson, label: 'Account' },
  { id: 'password', icon: MdLock, label: 'Password' },
  { id: 'email', icon: MdEmail, label: 'Email' },
  { id: 'appearance', icon: MdPalette, label: 'Appearance' },
]

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [activeSection, setActiveSection] = useState('account')
  const [loading, setLoading] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  const [accountForm, setAccountForm] = useState({ companyName: user?.companyName || '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [emailForm, setEmailForm] = useState({ newEmail: '' })

  const handleAccountSave = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/users/profile', accountForm)
      dispatch(setUser({ ...user, ...data.user }))
      toast.success('Account settings saved!')
    } catch { toast.error('Failed to save settings') }
    finally { setLoading(false) }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error('Passwords do not match')
    if (passwordForm.newPassword.length < 8)
      return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.put('/users/change-password', passwordForm)
      toast.success('Password changed!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const handleEmailChange = async () => {
    if (!emailForm.newEmail.includes('@')) return toast.error('Enter a valid email')
    setLoading(true)
    try {
      await api.put('/users/change-email', emailForm)
      dispatch(setUser({ ...user, email: emailForm.newEmail }))
      toast.success('Email updated! Please verify your new address.')
      setEmailForm({ newEmail: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update email')
    } finally { setLoading(false) }
  }

  const passwordStrength = (pw) => {
    if (!pw) return 0
    return Math.min(
      (pw.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(pw) ? 1 : 0) +
      (/[0-9]/.test(pw) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(pw) ? 1 : 0),
      4
    )
  }
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-400', 'bg-green-400']

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/50 text-sm mt-0.5">Customize your TaskFlow Pro experience</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[200px,1fr] gap-6 items-start">
        {/* Nav */}
        <div className="glass-card p-3 sticky top-4">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1 last:mb-0 ${
                activeSection === id
                  ? 'bg-gradient-brand text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <span className="flex items-center gap-3"><Icon className="text-lg shrink-0" />{label}</span>
              <MdChevronRight className={`transition-transform duration-200 ${activeSection === id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          <AnimatePresence mode="wait">

            {activeSection === 'account' && (
              <SettingsSection key="account" title="Account Settings" icon={MdPerson}>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm font-medium block mb-1.5">User ID</label>
                    <input value={user?.userId} disabled className="input-field opacity-50 cursor-not-allowed" />
                    <p className="text-white/30 text-xs mt-1">User ID cannot be changed</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm font-medium block mb-1.5">Company Name</label>
                    <input value={accountForm.companyName}
                      onChange={e => setAccountForm(p => ({ ...p, companyName: e.target.value }))}
                      placeholder="Your company name" className="input-field" />
                  </div>
                  <button onClick={handleAccountSave} disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Spinner /> : <MdSave />} Save Changes
                  </button>
                </div>
              </SettingsSection>
            )}

            {activeSection === 'password' && (
              <SettingsSection key="password" title="Change Password" icon={MdLock}>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-white/70 text-sm font-medium block mb-1.5">Current Password</label>
                    <input type={showCurrentPass ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Enter current password" className="input-field pr-12" />
                    <button type="button" onClick={() => setShowCurrentPass(v => !v)}
                      className="absolute right-3 bottom-3 text-white/40 hover:text-white/70 transition-colors">
                      {showCurrentPass ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="text-white/70 text-sm font-medium block mb-1.5">New Password</label>
                    <input type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min. 8 characters" className="input-field pr-12" />
                    <button type="button" onClick={() => setShowNewPass(v => !v)}
                      className="absolute right-3 bottom-3 text-white/40 hover:text-white/70 transition-colors">
                      {showNewPass ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                    </button>
                    {passwordForm.newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(lvl => {
                            const s = passwordStrength(passwordForm.newPassword)
                            return (
                              <div key={lvl}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${lvl <= s ? strengthColor[s] : 'bg-white/10'}`} />
                            )
                          })}
                        </div>
                        <p className="text-white/40 text-xs">{strengthLabel[passwordStrength(passwordForm.newPassword)]}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-white/70 text-sm font-medium block mb-1.5">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password"
                      className={`input-field ${passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword ? 'border-red-500/60' : ''}`} />
                    {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <button onClick={handlePasswordChange} disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Spinner /> : <MdLock />} Change Password
                  </button>
                </div>
              </SettingsSection>
            )}

            {activeSection === 'email' && (
              <SettingsSection key="email" title="Change Email" icon={MdEmail}>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm font-medium block mb-1.5">Current Email</label>
                    <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm font-medium block mb-1.5">New Email</label>
                    <input type="email" value={emailForm.newEmail}
                      onChange={e => setEmailForm({ newEmail: e.target.value })}
                      placeholder="new@email.com" className="input-field" />
                    <p className="text-white/30 text-xs mt-1">A verification link will be sent to your new address.</p>
                  </div>
                  <button onClick={handleEmailChange} disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Spinner /> : <MdEmail />} Update Email
                  </button>
                </div>
              </SettingsSection>
            )}

            {activeSection === 'appearance' && (
              <AppearanceSection key="appearance" user={user} dispatch={dispatch} />
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}