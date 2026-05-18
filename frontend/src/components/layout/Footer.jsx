export default function Footer() {
  return (
    <footer className="bg-white/3 border-t border-white/10 py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-white/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white/60">TaskFlow Pro</span>
          <span>•</span>
          <span>Secure Enterprise Task Management</span>
        </div>
        <div className="flex items-center gap-4">
          <span>© 2025 TaskFlow Inc. All rights reserved.</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  )
}
