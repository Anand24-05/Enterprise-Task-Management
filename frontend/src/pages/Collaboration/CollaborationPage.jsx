import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPeople, MdAdd, MdClose, MdEdit, MdCheck,
  MdCalendarMonth, MdFlag, MdPerson, MdInfo,
  MdExpandMore, MdRadioButtonUnchecked, MdDelete
} from 'react-icons/md'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ─── helpers ─────────────────────────────────────────────────────────────────
const priorityClass = { high: 'inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 inset-ring inset-ring-red-400/20', medium: 'badge-medium', low: 'badge-low' }
const priorityBar   = { high: 'bg-red-500',  medium: 'bg-yellow-500', low: 'bg-green-500' }

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
)

// ─── Create / Edit modal (shared) ────────────────────────────────────────────
function TaskFormModal({ isOpen, onClose, members, onSaved, existingTask = null, currentUserId }) {
  const isEdit = !!existingTask
  const isOwner = isEdit ? existingTask.owner?._id === currentUserId : true

  const blank = { title: '', description: '', priority: 'medium', dueDate: '', taskDate: '', collaboratorIds: [] }
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingTask) {
      setForm({
        title:           existingTask.title || '',
        description:     existingTask.description || '',
        priority:        existingTask.priority || 'medium',
        dueDate:         existingTask.dueDate ? existingTask.dueDate.split('T')[0] : '',
        taskDate:        existingTask.taskDate ? existingTask.taskDate.split('T')[0] : '',
        collaboratorIds: existingTask.collaborators?.map(c => c._id) || [],
      })
    } else {
      setForm(blank)
    }
  }, [existingTask, isOpen])


  const toggleCollab = (id) => {
    setForm(p => ({
      ...p,
      collaboratorIds: p.collaboratorIds.includes(id)
        ? p.collaboratorIds.filter(c => c !== id)
        : [...p.collaboratorIds, id]
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setLoading(true)
    try {
      if (isEdit) {
        const payload = {
          title:       form.title,
          description: form.description,
          priority:    form.priority,
          dueDate:     form.dueDate || undefined,
          taskDate:    form.taskDate || undefined,
        }
        // Only owner may update collaborators
        if (isOwner) payload.collaboratorIds = form.collaboratorIds
        await api.put(`/collaboration/task/${existingTask._id}`, payload)
        toast.success('Task updated!')
      } else {
        await api.post('/collaboration/task', form)
        toast.success('Collaborative task created!')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} task`)
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
            className="relative glass-card p-6 w-full max-w-md z-10 bg-[#1a1a2e]/97 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-xl font-bold">
                {isEdit ? 'Edit Collaborative Task' : 'New Collaborative Task'}
              </h2>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title" required className="input-field" />
              </div>

              {/* Description */}
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What needs to be done?" rows={3} className="input-field resize-none" />
              </div>

              {/* Priority + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="input-field">
                    {['low', 'medium', 'high'].map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Task Date</label>
                  <input type="date" value={form.taskDate}
                    onChange={e => setForm(p => ({ ...p, taskDate: e.target.value }))} className="input-field" />
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Due Date (optional)</label>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="input-field" />
              </div>

              {/* Collaborators — owner only when editing */}
              {(!isEdit || isOwner) && (
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    {isEdit ? 'Collaborators (owner only)' : 'Assign Collaborators'}
                  </label>
                  {members.length === 0 ? (
                    <p className="text-white/30 text-sm italic">No other members in your company yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {members.map(m => (
                        <label key={m._id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                          <input type="checkbox" checked={form.collaboratorIds.includes(m._id)}
                            onChange={() => toggleCollab(m._id)}
                            className="accent-primary-500 w-4 h-4 shrink-0" />
                          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {m.userId[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{m.userId}</p>
                            <p className="text-white/40 text-xs truncate">{m.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Non-owner collaborator notice */}
              {isEdit && !isOwner && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <MdInfo className="text-primary-400 text-lg shrink-0 mt-0.5" />
                  <p className="text-white/60 text-xs">
                    You are a collaborator — you can update the task details, but only the owner can change the collaborator list.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><Spinner />{isEdit ? 'Saving…' : 'Creating…'}</span>
                    : isEdit ? 'Save Changes' : 'Create Task'
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Single task list row (matches calendar TaskItem style) ──────────────────
function CollabTaskRow({ task, currentUserId, onEdit, onToggle, onDelete }) {
  const isOwner       = task.owner?._id === currentUserId
  const isCollaborator = task.collaborators?.some(c => c._id === currentUserId)
  const canEdit       = isOwner || isCollaborator
  const canDelete = isOwner
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`task-card group ${task.isDone ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Priority bar */}
        <div className={`w-1 self-stretch rounded-full shrink-0 ${priorityBar[task.priority]}`} />

        {/* Checkbox / done toggle */}
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 shrink-0 text-white/40 hover:text-primary-500 transition-colors"
          title={task.isDone ? 'Mark undone' : 'Mark done'}
        >
          {task.isDone
            ? <MdCheck className="text-xl text-green-400" />
            : <MdRadioButtonUnchecked className="text-xl" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-white font-medium text-sm leading-snug ${task.isDone ? 'line-through text-white/50' : ''}`}>
              {task.title}
            </p>

            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 hover:bg-primary-500/30 transition-all"
                  title="Edit task"
                >
                  <MdEdit className="text-sm" />
                </button>
              )}
             {canDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                  title="Delete task"
                >
                  <MdDelete className="text-sm" />
                </button>
              )}              
            </div>
          </div>

          {/* Badges */}
          <div className=" flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={priorityClass[task.priority]} >{task.priority}</span>

            {task.assignedBy && (
              <span className="badge bg-primary-500/15 text-primary-400 border border-primary-500/20 flex items-center gap-1">
                <MdPeople className="text-xs" /> Assigned by {task.assignedBy?.userId} 
              </span>
            )}

            {task.collaborators?.length > 0 && (
              <span className="text-white/30 text-xs flex items-center gap-1 flex-wrap">
                <MdFlag className="text-xs" />
                   Assigned to{' '}
                    {task.collaborators
                    .map(c => c.userId)
                    .join(', ')}
              </span>
            )}

            {task.dueDate && (
              <span className="text-white/30 text-xs flex items-center gap-1">
                <MdCalendarMonth className="text-xs" />
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}

            {/* Collaborator avatars inline */}
            {task.collaborators?.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1.5">
                  {task.collaborators.slice(0, 3).map(c => (
                    <div key={c._id} title={c.userId}
                      className="w-5 h-5 rounded-full bg-gradient-brand border border-[#1a1a2e] flex items-center justify-center text-white text-xs font-bold">
                      {c.userId?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {task.collaborators.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-white/10 border border-[#1a1a2e] flex items-center justify-center text-white/50 text-xs">
                      +{task.collaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Expandable description */}
          {task.description && (
            <div>
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-white/30 text-xs mt-1 hover:text-white/50 transition-colors"
              >
                <MdExpandMore className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Hide' : 'Show'} description
              </button>
              {expanded && (
                <p className="text-white/50 text-xs mt-1 leading-relaxed">{task.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Per-member row with its own filter state ─────────────────────────────────
function MemberRow({ member, tasks, doneCount, sharedCount, currentUser, idx, onEdit, onToggle, onDelete }) {
  // null = show all, 'done' = only done, 'shared' = only collaborative
  const [activeFilter, setActiveFilter] = useState(null)

  const toggleFilter = (f) => setActiveFilter(prev => prev === f ? null : f)

  const filteredTasks =
    activeFilter === 'done'   ? tasks.filter(t => t.isDone) :
    activeFilter === 'shared' ? tasks.filter(t => t.isCollaborative) :
    tasks

  const isYou = member._id === currentUser?._id?.toString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07 }}
      className="glass-card overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-white/3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shrink-0">
          {member.userId[0].toUpperCase()}
        </div>

        {/* Name / email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold truncate">{member.userId}</p>
            {isYou && (
              <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs">You</span>
            )}
          </div>
          <p className="text-white/40 text-xs truncate">{member.email}</p>
        </div>

        {/* ── Filter chips ── */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* All tasks — resets filter */}
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
              activeFilter === null
                ? 'bg-white/15 text-white border-white/30'
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </button>

          {/* Done filter */}
          <button
            onClick={() => toggleFilter('done')}
            title="Show only completed tasks"
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              activeFilter === 'done'
                ? 'bg-green-500/25 text-green-300 border-green-500/50 shadow-sm shadow-green-500/20'
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/25'
            }`}
          >
            <MdCheck className="text-sm" />
            {doneCount} done
          </button>

          {/* Shared filter */}
          {sharedCount > 0 && (
            <button
              onClick={() => toggleFilter('shared')}
              title="Show only shared/collaborative tasks"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                activeFilter === 'shared'
                  ? 'bg-primary-500/25 text-primary-300 border-primary-500/50 shadow-sm'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/25'
              }`}
            >
              <MdPeople className="text-sm" />
              {sharedCount} shared
            </button>
          )}
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="px-6 py-4">
        {/* Active filter label */}
        {activeFilter && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs">
              Showing{' '}
              <span className={activeFilter === 'done' ? 'text-green-400 font-medium' : 'text-primary-400 font-medium'}>
                {activeFilter}
              </span>
              {' '}tasks ({filteredTasks.length})
            </p>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-white/30 text-xs hover:text-white/60 transition-colors underline"
            >
              Clear filter
            </button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/25 text-sm text-center py-4 italic"
            >
              {activeFilter === 'done'   ? 'No completed tasks this month' :
               activeFilter === 'shared' ? 'No shared tasks this month' :
               'No tasks this month'}
            </motion.p>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredTasks.map(task => (
                <CollabTaskRow
                  key={task._id}
                  task={task}
                  currentUserId={currentUser?._id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CollaborationPage() {
  const { user } = useSelector(s => s.auth)
  const [collaboration, setCollaboration] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)   // task being edited

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [collabRes, membersRes] = await Promise.all([
        api.get('/collaboration'),
        api.get('/collaboration/members'),
      ])
      setCollaboration(collabRes.data.collaboration)
      setMembers(membersRes.data.members)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load collaboration data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle done/undone for a collaborative task
  const handleToggle = useCallback(async (task) => {
    try {
      await api.put(`/collaboration/task/${task._id}`, { isDone: !task.isDone })
      toast.success(task.isDone ? 'Marked undone' : 'Task done!')
      // Update local state optimistically instead of full reload
      setCollaboration(prev => prev.map(group => ({
        ...group,
        tasks: group.tasks.map(t =>
          t._id === task._id
            ? { ...t, isDone: !t.isDone, status: t.isDone ? 'pending' : 'completed' }
            : t
        )
      })))
    } catch {
      toast.error('Failed to update task')
    }
  }, [])

  const handleDelete = useCallback(async (task) => {
  if (!window.confirm('Delete this task?')) return

  try {
    await api.delete(`/collaboration/task/${task._id}`)

    toast.success('Task deleted')

    // update UI without reload
    setCollaboration(prev =>
      prev.map(group => ({
        ...group,
        tasks: group.tasks.filter(t => t._id !== task._id)
      }))
    )
  } catch (err) {
    toast.error(
      err.response?.data?.error || 'Failed to delete task'
    )
  }
}, [])

  useEffect(() => { load() }, [load])

  const hasCompany = user?.companyId || user?.role === 'company'

  if (!hasCompany) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <MdPeople className="text-white/20 text-8xl mb-4" />
      <h2 className="text-white text-xl font-bold mb-2">No Company Association</h2>
      <p className="text-white/50 max-w-sm">
        Collaboration is available for users who belong to a company.
        Join a company by entering a Company ID during signup.
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Collaboration</h1>
          <p className="text-white/50 text-sm mt-0.5">
            Tasks are shown under every member who owns or collaborates on them
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setCreateOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <MdAdd className="text-lg" /> New Collab Task
        </motion.button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={load} className="btn-ghost text-sm">Retry</button>
        </div>
      ) : collaboration.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MdPeople className="text-white/20 text-6xl mx-auto mb-4" />
          <p className="text-white/50">No team members found under your company.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {collaboration.map(({ user: member, tasks }, idx) => {
            const doneCount       = tasks.filter(t => t.isDone).length
            const sharedCount     = tasks.filter(t => t.isCollaborative).length
            const memberId        = member._id

            return (
              <MemberRow
                key={memberId}
                member={member}
                tasks={tasks}
                doneCount={doneCount}
                sharedCount={sharedCount}
                currentUser={user}
                idx={idx}
                onEdit={setEditTask}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <TaskFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        members={members}
        onSaved={load}
        currentUserId={user?._id}
      />

      {/* Edit modal */}
      <TaskFormModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        members={members}
        onSaved={() => { load(); setEditTask(null) }}
        existingTask={editTask}
        currentUserId={user?._id}
      />
    </div>
  )
}
