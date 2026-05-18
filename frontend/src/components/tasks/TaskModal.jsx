import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdAdd } from 'react-icons/md'
import { createTask, updateTask } from '../../redux/slices/taskSlice'
import toast from 'react-hot-toast'

const priorities = ['low', 'medium', 'high']

export default function TaskModal({ isOpen, onClose, task = null, dateStr, readOnly = false }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' })
  const [loading, setLoading] = useState(false)
  const isEdit = !!task

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: (task.tags || []).join(', ')
      })
    } else {
      setForm({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' })
    }
  }, [task, isOpen])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title required')
    setLoading(true)
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      taskDate: dateStr || new Date().toISOString().split('T')[0]
    }
    try {
      let result
      if (isEdit) {
        result = await dispatch(updateTask({ id: task._id, updates: payload }))
        if (updateTask.fulfilled.match(result)) toast.success('Task updated!')
      } else {
        result = await dispatch(createTask(payload))
        if (createTask.fulfilled.match(result)) toast.success('Task created!')
      }
      onClose()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-card p-6 w-full max-w-md z-10 bg-[#1a1a2e]/95"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">
                {readOnly ? 'View Task' : isEdit ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title" required disabled={readOnly} className="input-field disabled:opacity-60" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Task description..." rows={3} disabled={readOnly}
                  className="input-field resize-none disabled:opacity-60" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    disabled={readOnly} className="input-field disabled:opacity-60">
                    {priorities.map(p => <option className="bg-black" key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                    disabled={readOnly} className="input-field disabled:opacity-60" />
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="work, urgent, backend" disabled={readOnly} className="input-field disabled:opacity-60" />
              </div>

              {!readOnly && (
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : isEdit ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
