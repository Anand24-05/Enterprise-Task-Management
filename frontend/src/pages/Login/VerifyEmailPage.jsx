import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdCheckCircle, MdError, MdTask } from 'react-icons/md'
import api from '../../services/api'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return }
    api.get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => { setStatus('success'); setMessage(data.message) })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.error || 'Verification failed.') })
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4">
          <MdTask className="text-white text-3xl" />
        </div>
        {status === 'loading' && <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />}
        {status === 'success' && <>
          <MdCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-white/60 mb-6">{message}</p>
          <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
        </>}
        {status === 'error' && <>
          <MdError className="text-red-400 text-5xl mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="text-white/60 mb-6">{message}</p>
          <Link to="/signup" className="btn-ghost inline-block">Back to Signup</Link>
        </>}
      </motion.div>
    </div>
  )
}
