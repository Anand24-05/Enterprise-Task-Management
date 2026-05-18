import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdTask } from 'react-icons/md'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e] p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-brand mb-6 shadow-2xl shadow-primary-500/30">
          <MdTask className="text-white text-4xl" />
        </div>
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-white/60 text-xl mb-8">Page not found</p>
        <Link to="/calendar" className="btn-primary inline-block">Go to Calendar</Link>
      </motion.div>
    </div>
  )
}
