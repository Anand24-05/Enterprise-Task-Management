import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import {
  MdPeople, MdAdd, MdClose, MdEdit, MdDelete, MdCheck,
  MdCalendarMonth, MdFlag, MdInfo, MdExpandMore,
  MdRadioButtonUnchecked, MdChevronLeft, MdChevronRight,
  MdArrowBack, MdTask, MdShare, MdPerson
} from 'react-icons/md'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ─── helpers ──────────────────────────────────────────────────────────────────
const priorityClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
const priorityBar   = { high: 'bg-red-500',  medium: 'bg-yellow-500', low: 'bg-green-500' }

const Spinner = () => (
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
)

// ─── Month Picker ─────────────────────────────────────────────────────────────
function MonthPicker({ selectedMonth, onMonthChange }) {
  const isCurrentMonth = isSameMonth(selectedMonth, new Date())
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all shrink-0"
        >
          <MdChevronLeft className="text-xl" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-white text-xl font-bold">{format(selectedMonth, 'MMMM')}</p>
          <p className="text-white/40 text-sm">{format(selectedMonth, 'yyyy')}</p>
        </div>
        <button
          onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all shrink-0"
        >
          <MdChevronRight className="text-xl" />
        </button>
      </div>
      {!isCurrentMonth && (
        <div className="mt-3 text-center">
          <button
            onClick={() => onMonthChange(new Date())}
            className="text-primary-400 text-xs hover:text-primary-300 transition-colors underline underline-offset-2"
          >
            Jump to current month
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Member Chips ─────────────────────────────────────────────────────────────
function MemberChips({ groups, selectedMemberId, onSelect, currentUserId, selectedMonth }) {
  const activeGroups = groups.filter(g => g.tasks.length > 0)

  if (activeGroups.length === 0) return (
    <div className="glass-card p-10 text-center">
      <MdCalendarMonth className="text-white/15 text-5xl mx-auto mb-3" />
      <p className="text-white font-semibold mb-1">No tasks in {format(selectedMonth, 'MMMM yyyy')}</p>
      <p className="text-white/40 text-sm">Nobody on your team has tasks this month.</p>
    </div>
  )

  return (
    <div className="glass-card p-5">
      <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
        <MdPeople className="text-primary-400 text-base" />
        {activeGroups.length} member{activeGroups.length !== 1 ? 's' : ''} active in {format(selectedMonth, 'MMMM')}
        <span className="text-white/20">·</span>
        <span className="normal-case font-normal">click a member to view their tasks</span>
      </p>
      <div className="flex gap-3 flex-wrap">
        {activeGroups.map(({ user: member, tasks }) => {
          const isSelected  = selectedMemberId === member._id
          const isYou       = member._id === currentUserId
          const doneCount   = tasks.filter(t => t.isDone).length
          const total       = tasks.length
          const allDone     = doneCount === total
          const sharedCount = tasks.filter(t => t.isCollaborative || t.owner?._id !== member._id).length
          const personalCount = tasks.filter(t => !t.isCollaborative && t.owner?._id === member._id).length

          return (
            <motion.button
              key={member._id}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(isSelected ? null : member._id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left
                ${isSelected
                  ? 'bg-gradient-brand text-white border-transparent shadow-lg shadow-primary-500/20'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/25'
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                isSelected ? 'bg-white/25' : 'bg-gradient-brand'
              } text-white`}>
                {member.userId[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm">{member.userId}</span>
                  {isYou && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isSelected ? 'bg-white/20' : 'bg-primary-500/20 text-primary-400'
                    }`}>you</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-white/40'}`}>
                    {total} task{total !== 1 ? 's' : ''}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    isSelected
                      ? allDone ? 'bg-green-400/30 text-green-200' : 'bg-white/15 text-white/80'
                      : allDone ? 'bg-green-500/20 text-green-400' : 'bg-white/8 text-white/40'
                  }`}>
                    {allDone ? '✓ all done' : `${doneCount}/${total} done`}
                  </span>
                  {personalCount > 0 && (
                    <span className={`text-xs flex items-center gap-0.5 ${isSelected ? 'text-white/70' : 'text-white/35'}`}>
                      <MdPerson className="text-xs" />{personalCount}
                    </span>
                  )}
                  {sharedCount > 0 && (
                    <span className={`text-xs flex items-center gap-0.5 ${isSelected ? 'text-white/70' : 'text-primary-400/70'}`}>
                      <MdShare className="text-xs" />{sharedCount}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Single task row ──────────────────────────────────────────────────────────
function CollabTaskRow({ task, currentUserId, onEdit, onToggle, onDelete }) {
  const taskOwnerId    = task.owner?._id?.toString() || task.owner?.toString()
  const curId          = currentUserId?.toString()
  const isOwner        = taskOwnerId === curId
  const isCollaborator = task.collaborators?.some(c => (c._id || c).toString() === curId)
  const canEdit        = isOwner || isCollaborator
  // Can delete: only the task owner OR the person who assigned it
  const assignedById   = task.assignedBy?._id?.toString() || task.assignedBy?.toString()
  const canDelete      = isOwner || assignedById === curId
  const isShared       = task.isCollaborative || (task.collaborators?.length > 0)
  const isAssigned     = !!task.assignedBy && assignedById !== taskOwnerId

  const [expanded, setExpanded]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(task._id)
    setConfirmDelete(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={`task-card group ${task.isDone ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Priority bar */}
        <div className={`w-1 self-stretch rounded-full shrink-0 ${priorityBar[task.priority]}`} />

        {/* Done toggle */}
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 shrink-0 text-white/40 hover:text-primary-500 transition-colors"
        >
          {task.isDone
            ? <MdCheck className="text-xl text-green-400" />
            : <MdRadioButtonUnchecked className="text-xl" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-white font-medium text-sm leading-snug ${task.isDone ? 'line-through text-white/50' : ''}`}>
              {task.title}
            </p>

            {/* Action buttons — show on hover */}
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
                  onClick={handleDelete}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    confirmDelete
                      ? 'bg-red-500 text-white scale-110'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={confirmDelete ? 'Click again to confirm delete' : 'Delete task'}
                >
                  <MdDelete className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Confirm delete hint */}
          {confirmDelete && (
            <p className="text-red-400 text-xs mt-1 animate-pulse">Click delete again to confirm</p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={priorityClass[task.priority]}>{task.priority}</span>

            {/* Personal vs Shared indicator */}
            {isShared ? (
              <span className="badge bg-primary-500/15 text-primary-400 border border-primary-500/20 flex items-center gap-1">
                <MdShare className="text-xs" /> Shared
              </span>
            ) : (
              <span className="badge bg-white/8 text-white/40 border border-white/10 flex items-center gap-1">
                <MdPerson className="text-xs" /> Personal
              </span>
            )}

           {/* Assignment info */}
{(task.assignedBy || task.owner || task.collaborators?.length > 0) && (
  <div className="flex flex-col gap-1 mt-1">

    {/* Assigned By */}
    {task.assignedBy && (
      <span className="text-white/35 text-xs flex items-center gap-1">
        <MdFlag className="text-xs" />
        Assigned by
        <span className="text-white/60 font-medium">
          {task.assignedBy?.userId ||
           task.assignedBy?.companyName ||
           'company'}
        </span>
      </span>
    )}

    {/* Assigned To */}
    <span className="text-white/35 text-xs flex items-center gap-1 flex-wrap">
      <MdPerson className="text-xs" />
      Assigned to

      {/* Collaborators */}
      {task.collaborators?.length > 0 &&
        task.collaborators.map((c, i) => (
          <span
            key={c._id || i}
            className="text-primary-400 font-medium"
          >
            {i === 0 && task.owner?.userId ? '' : ''}
            {c.userId}
            {i < task.collaborators.length - 1 ? ',' : ''}
          </span>
        ))
      }
    </span>

  </div>
)}

            {/* Task date */}
            <span className="text-white/25 text-xs flex items-center gap-1">
              <MdCalendarMonth className="text-xs" />
              {format(new Date(task.taskDate), 'MMM d')}
            </span>

            {task.dueDate && (
              <span className="text-white/25 text-xs">
                · Due {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {/* Collaborator avatars */}
            {task.collaborators?.length > 0 && (
              <div className="flex -space-x-1.5">
                {task.collaborators.slice(0, 3).map((c, i) => {
                  const cId     = c._id || c
                  const cUserId = c.userId || '?'
                  return (
                    <div key={i} title={cUserId}
                      className="w-5 h-5 rounded-full bg-gradient-brand border border-[#1a1a2e] flex items-center justify-center text-white text-xs font-bold">
                      {cUserId[0]?.toUpperCase()}
                    </div>
                  )
                })}
                {task.collaborators.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-[#1a1a2e] flex items-center justify-center text-white/50 text-xs">
                    +{task.collaborators.length - 3}
                  </div>
                )}
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
              {expanded && <p className="text-white/50 text-xs mt-1 leading-relaxed">{task.description}</p>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Member Task Panel ────────────────────────────────────────────────────────
function MemberTaskPanel({ memberGroup, selectedMonth, currentUser, onEdit, onToggle, onDelete, onClose }) {
  const { user: member, tasks } = memberGroup
  const [activeFilter, setActiveFilter] = useState(null)

  const toggleFilter   = f => setActiveFilter(p => p === f ? null : f)
  const doneCount      = tasks.filter(t => t.isDone).length
  const sharedCount    = tasks.filter(t => t.isCollaborative || t.owner?._id !== member._id).length
  const personalCount  = tasks.filter(t => !t.isCollaborative && t.owner?._id === member._id).length
  const pendingCount   = tasks.filter(t => !t.isDone).length
  const isYou          = member._id === currentUser?._id?.toString()

  const filteredTasks =
    activeFilter === 'done'     ? tasks.filter(t => t.isDone) :
    activeFilter === 'pending'  ? tasks.filter(t => !t.isDone) :
    activeFilter === 'shared'   ? tasks.filter(t => t.isCollaborative || t.owner?._id !== member._id) :
    activeFilter === 'personal' ? tasks.filter(t => !t.isCollaborative && t.owner?._id === member._id) :
    tasks

  // Group by date
 const tasksByDate = filteredTasks.reduce((acc, task) => {
  const key = format(new Date(task.taskDate), 'yyyy-MM-dd')

  if (!acc[key]) acc[key] = []

  acc[key].push(task)

  // newest created task first
  acc[key].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return acc
}, {})
  const sortedDates = Object.keys(tasksByDate).sort(
  (a, b) => new Date(b) - new Date(a)
)

  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/3">
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all shrink-0">
          <MdArrowBack className="text-lg" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shrink-0">
          {member.userId[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold truncate">{member.userId}</p>
            {isYou && <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 text-xs">You</span>}
          </div>
          <p className="text-white/40 text-xs">
            {format(selectedMonth, 'MMMM yyyy')} · {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {personalCount > 0 && <span className="ml-1">· {personalCount} personal</span>}
            {sharedCount > 0  && <span className="ml-1">· {sharedCount} shared</span>}
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {[
            { key: null,       label: `All ${tasks.length}`,   cls: 'bg-white/15 text-white border-white/30', inactiveCls: 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10' },
            { key: 'personal', label: `${personalCount} personal`, cls: 'bg-white/15 text-white border-white/30', inactiveCls: 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10', icon: <MdPerson className="text-xs" /> },
            { key: 'shared',   label: `${sharedCount} shared`,  cls: 'bg-primary-500/25 text-primary-300 border-primary-500/50', inactiveCls: 'bg-white/5 text-white/50 border-white/10 hover:bg-primary-500/10 hover:text-primary-400', icon: <MdShare className="text-xs" /> },
            { key: 'pending',  label: `${pendingCount} pending`, cls: 'bg-yellow-500/25 text-yellow-200 border-yellow-500/50', inactiveCls: 'bg-white/5 text-white/50 border-white/10 hover:bg-yellow-500/10 hover:text-yellow-400' },
            { key: 'done',     label: `${doneCount} done`,      cls: 'bg-green-500/25 text-green-300 border-green-500/50',    inactiveCls: 'bg-white/5 text-white/50 border-white/10 hover:bg-green-500/10 hover:text-green-400' },
          ].map(({ key, label, cls, inactiveCls, icon }) => (
            <button key={String(key)} onClick={() => setActiveFilter(key)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                activeFilter === key ? cls : inactiveCls
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-2.5 border-b border-white/5 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-gradient-brand" />
        </div>
        <span className="text-white/40 text-xs shrink-0">{completionRate}% complete</span>
      </div>

      {/* Task list grouped by date */}
      <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">
        {activeFilter && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs">
              Showing <span className="text-white/70 font-medium">{activeFilter}</span> ({filteredTasks.length})
            </p>
            <button onClick={() => setActiveFilter(null)} className="text-white/30 text-xs hover:text-white/60 underline">Clear</button>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-8">
              <MdTask className="text-white/15 text-4xl mx-auto mb-2" />
              <p className="text-white/30 text-sm italic">
                {activeFilter === 'done'     ? 'No completed tasks this month' :
                 activeFilter === 'shared'   ? 'No shared tasks this month' :
                 activeFilter === 'personal' ? 'No personal tasks this month' :
                 activeFilter === 'pending'  ? 'All tasks are done! 🎉' :
                 'No tasks this month'}
              </p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5">
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white/35 text-xs font-semibold">
                      {format(new Date(dateKey + 'T00:00:00'), 'EEEE, MMMM d')}
                    </span>
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-white/20 text-xs">{tasksByDate[dateKey].length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {tasksByDate[dateKey].map(task => (
                      <CollabTaskRow
                        key={task._id}
                        task={task}
                        currentUserId={currentUser?._id}
                        onEdit={onEdit}
                        onToggle={onToggle}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function TaskFormModal({ isOpen, onClose, members, onSaved, existingTask = null, currentUserId, selectedMonth }) {
  const isEdit  = !!existingTask
  const isOwner = isEdit ? (existingTask.owner?._id || existingTask.owner)?.toString() === currentUserId?.toString() : true
  const blank   = { title: '', description: '', priority: 'medium', dueDate: '',
                    taskDate: format(selectedMonth || new Date(), 'yyyy-MM-dd'), collaboratorIds: [] }
  const [form, setForm]       = useState(blank)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit && existingTask) {
      setForm({
        title:           existingTask.title || '',
        description:     existingTask.description || '',
        priority:        existingTask.priority || 'medium',
        dueDate:         existingTask.dueDate ? existingTask.dueDate.split('T')[0] : '',
        taskDate:        existingTask.taskDate ? existingTask.taskDate.split('T')[0] : '',
        collaboratorIds: existingTask.collaborators?.map(c => c._id || c) || [],
      })
    } else {
      setForm({ ...blank, taskDate: format(selectedMonth || new Date(), 'yyyy-MM-dd') })
    }
  }, [existingTask, isOpen])

  const toggleCollab = id => setForm(p => ({
    ...p,
    collaboratorIds: p.collaboratorIds.includes(id)
      ? p.collaboratorIds.filter(c => c !== id)
      : [...p.collaboratorIds, id]
  }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setLoading(true)
    try {
      if (isEdit) {
        const payload = { title: form.title, description: form.description,
                          priority: form.priority, dueDate: form.dueDate || undefined,
                          taskDate: form.taskDate || undefined }
        if (isOwner) payload.collaboratorIds = form.collaboratorIds
        await api.put(`/collaboration/task/${existingTask._id}`, payload)
        toast.success('Task updated!')
      } else {
        await api.post('/collaboration/task', form)
        toast.success('Collaborative task created!')
      }
      onSaved(); onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} task`)
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-card p-6 w-full max-w-md z-10 bg-[#1a1a2e]/97 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-xl font-bold">{isEdit ? 'Edit Task' : 'New Collaborative Task'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title" required className="input-field" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What needs to be done?" rows={3} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="input-field">
                    {['low','medium','high'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Task Date</label>
                  <input type="date" value={form.taskDate} onChange={e => setForm(p => ({ ...p, taskDate: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Due Date (optional)</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="input-field" />
              </div>
              {(!isEdit || isOwner) && (
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    {isEdit ? 'Collaborators (owner only)' : 'Assign Collaborators'}
                  </label>
                  {members.length === 0
                    ? <p className="text-white/30 text-sm italic">No other members in your company yet.</p>
                    : (
                      <div className="space-y-2 max-h-44 overflow-y-auto">
                        {members.map(m => (
                          <label key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                            <input type="checkbox" checked={form.collaboratorIds.includes(m._id)}
                              onChange={() => toggleCollab(m._id)} className="accent-primary-500 w-4 h-4 shrink-0" />
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
                    )
                  }
                </div>
              )}
              {isEdit && !isOwner && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <MdInfo className="text-primary-400 text-lg shrink-0 mt-0.5" />
                  <p className="text-white/60 text-xs">You are a collaborator — you can edit task details, but only the owner can change the collaborator list.</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? <span className="flex items-center justify-center gap-2"><Spinner />{isEdit ? 'Saving…' : 'Creating…'}</span>
                           : isEdit ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CollaborationPage() {
  const { user }                          = useSelector(s => s.auth)
  const [collaboration, setCollaboration] = useState([])   // company collab tasks
   // all tasks for current user
  const [members, setMembers]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [createOpen, setCreateOpen]       = useState(false)
  const [editTask, setEditTask]           = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  const load = useCallback(async (month) => {
    setLoading(true)
    setError(null)
    try {
      const y = (month || selectedMonth).getFullYear()
      const m = (month || selectedMonth).getMonth() + 1

      const [tasksRes, membersRes] = await Promise.all([
  api.get(`/collaboration/all-tasks?year=${y}&month=${m}`),
  api.get('/collaboration/members')
])

setCollaboration(tasksRes.data.collaboration || [])
setMembers(membersRes.data.members || [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => { load(selectedMonth) }, [selectedMonth])

  const handleMonthChange = useCallback((newMonth) => {
    setSelectedMonth(newMonth)
    setSelectedMemberId(null)
  }, [])

  // Merge personal tasks into each member's collaboration group
  // Personal tasks = tasks owned by that member OR tasks where that member is a collaborator
  // Show shared tasks in every involved user's tile
const enrichedGroups = members.map(member => {
  const memberId = member._id?.toString()

  // collect tasks where:
  // 1. member is owner
  // 2. member is collaborator
  const tasks = collaboration.flatMap(group =>
    (group.tasks || []).filter(task => {
      const ownerId =
        task.owner?._id?.toString() ||
        task.owner?.toString()

      const collaboratorIds =
        task.collaborators?.map(c =>
          (c._id || c).toString()
        ) || []

      return (
        ownerId === memberId ||
        collaboratorIds.includes(memberId)
      )
    })
  )

  // remove duplicates
  const uniqueTasks = Array.from(
    new Map(tasks.map(t => [t._id, t])).values()
  )

  return {
    user: member,
    tasks: uniqueTasks
  }
})

  const selectedGroup = enrichedGroups.find(g => g.user._id?.toString() === selectedMemberId)

  const handleToggle = useCallback(async (task) => {
    try {
      // Use collaboration endpoint for collab tasks, regular endpoint for personal
      if (task.isCollaborative) {
        await api.put(`/collaboration/task/${task._id}`, { isDone: !task.isDone })
      } else {
        await api.patch(`/tasks/${task._id}/toggle-done`)
      }
      toast.success(task.isDone ? 'Marked undone' : 'Task done!')
      // Refresh
      load(selectedMonth)
    } catch { toast.error('Failed to update task') }
  }, [selectedMonth, load])

  const handleDelete = useCallback(async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Task deleted')
      load(selectedMonth)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task')
    }
  }, [selectedMonth, load])

  const hasCompany = user?.companyId || user?.role === 'company'

  if (!hasCompany) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <MdPeople className="text-white/20 text-8xl mb-4" />
      <h2 className="text-white text-xl font-bold mb-2">No Company Association</h2>
      <p className="text-white/50 max-w-sm">Collaboration is available for users who belong to a company. Join a company by entering a Company ID during signup.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Collaboration</h1>
          <p className="text-white/50 text-sm mt-0.5">Team tasks for {format(selectedMonth, 'MMMM yyyy')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <MdAdd className="text-lg" /> New Collab Task
        </motion.button>
      </div>

      {/* Month picker */}
      <MonthPicker selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button onClick={() => load(selectedMonth)} className="btn-ghost text-sm">Retry</button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* Member chips */}
          {!selectedMemberId && (
            <motion.div key="chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MemberChips
                groups={enrichedGroups}
                selectedMemberId={selectedMemberId}
                onSelect={setSelectedMemberId}
                currentUserId={user?._id}
                selectedMonth={selectedMonth}
              />
            </motion.div>
          )}

          {/* Member task panel */}
          {selectedMemberId && selectedGroup && (
            <motion.div
              key={`panel-${selectedMemberId}-${format(selectedMonth, 'yyyy-MM')}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <MemberTaskPanel
                memberGroup={selectedGroup}
                selectedMonth={selectedMonth}
                currentUser={user}
                onEdit={setEditTask}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onClose={() => setSelectedMemberId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        members={members}
        onSaved={() => load(selectedMonth)}
        currentUserId={user?._id}
        selectedMonth={selectedMonth}
      />
      <TaskFormModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        members={members}
        onSaved={() => { load(selectedMonth); setEditTask(null) }}
        existingTask={editTask}
        currentUserId={user?._id}
        selectedMonth={selectedMonth}
      />
    </div>
  )
}