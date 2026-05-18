import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { MdEdit, MdDelete, MdCheck, MdRadioButtonUnchecked, MdExpandMore } from 'react-icons/md'
import { toggleTaskDone, deleteTask } from '../../redux/slices/taskSlice'
import TaskModal from './TaskModal'
import toast from 'react-hot-toast'

const priorityClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const priorityBar = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' }

export default function TaskItem({ task, canEdit = true, canDelete = true, canCreate = false }) {
  const dispatch = useDispatch()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleToggle = async () => {
    const r = await dispatch(toggleTaskDone(task._id))
    if (toggleTaskDone.fulfilled.match(r)) {
      toast.success(r.payload.isDone ? 'Task done!' : 'Task marked undone')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return }
    const r = await dispatch(deleteTask(task._id))
    if (deleteTask.fulfilled.match(r)) toast.success('Task deleted')
    setConfirmDelete(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`task-card group ${task.isDone ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start gap-3">
          {/* Priority bar */}
          <div className={`w-1 h-full min-h-8 rounded-full shrink-0 ${priorityBar[task.priority]}`} />

          {/* Checkbox */}
          <button onClick={handleToggle} className="mt-0.5 shrink-0 text-white/40 hover:text-primary-500 transition-colors">
            {task.isDone
              ? <MdCheck className="text-xl text-green-400" />
              : <MdRadioButtonUnchecked className="text-xl" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-white font-medium text-sm leading-snug ${task.isDone ? 'line-through text-white/50' : ''}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit && (
                  <button onClick={() => setEditOpen(true)}
                    className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 hover:bg-primary-500/30 transition-all"
                    title="Edit">
                    <MdEdit className="text-sm" />
                  </button>
                )}
                {canDelete && (
                  <button onClick={handleDelete}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${confirmDelete ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                    title={confirmDelete ? 'Click again to confirm' : 'Delete'}>
                    <MdDelete className="text-sm" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={priorityClass[task.priority]}>{task.priority}</span>
              {task.tags?.map(tag => (
                <span key={tag} className="badge bg-white/5 text-white/50 border border-white/10">#{tag}</span>
              ))}
              {task.dueDate && (
                <span className="text-white/30 text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
            {task.description && (
              <div>
                <button onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-white/30 text-xs mt-1 hover:text-white/50">
                  <MdExpandMore className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? 'Hide' : 'Show'} description
                </button>
                {expanded && <p className="text-white/50 text-xs mt-1">{task.description}</p>}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <TaskModal isOpen={editOpen} onClose={() => setEditOpen(false)} task={task} />
    </>
  )
}
