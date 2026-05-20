import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import {
  MdPeople, MdAdd, MdCalendarMonth
} from 'react-icons/md'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ─── Month Picker ─────────────────────────────────────────────
function MonthPicker({ selectedMonth, onMonthChange }) {
  const isCurrentMonth = isSameMonth(selectedMonth, new Date())

  return (
    <div className="glass-card p-5 flex items-center justify-between">
      <button onClick={() => onMonthChange(subMonths(selectedMonth, 1))}>
        ◀
      </button>

      <div className="text-center">
        <p className="text-white text-xl font-bold">
          {format(selectedMonth, 'MMMM yyyy')}
        </p>
      </div>

      <button onClick={() => onMonthChange(addMonths(selectedMonth, 1))}>
        ▶
      </button>

      {!isCurrentMonth && (
        <button onClick={() => onMonthChange(new Date())}>
          Today
        </button>
      )}
    </div>
  )
}

// ─── Member Chips ─────────────────────────────────────────────
function MemberChips({ groups, selectedMemberId, onSelect }) {
  if (!groups.length) return <p>No members</p>

  return (
    <div className="glass-card p-5 flex flex-wrap gap-3">
      {groups.map(g => (
        <button
          key={g.user._id}
          onClick={() =>
            onSelect(selectedMemberId === g.user._id ? null : g.user._id)
          }
          className="px-4 py-2 bg-white/10 rounded-xl text-white"
        >
          {g.user.userId} ({g.tasks.length})
        </button>
      ))}
    </div>
  )
}

// ─── Task Row ────────────────────────────────────────────────
function TaskRow({ task }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg text-white">
      <div className="flex justify-between">
        <p>{task.title}</p>
        <span>{task.isDone ? "Done" : "Pending"}</span>
      </div>

      {task.description && (
        <p className="text-white/50 text-sm">{task.description}</p>
      )}
    </div>
  )
}

// ─── Member Panel ─────────────────────────────────────────────
function MemberPanel({ group, onClose }) {
  return (
    <div className="glass-card p-5 mt-4">
      <div className="flex justify-between mb-3">
        <h2 className="text-white font-bold">{group.user.userId}</h2>
        <button onClick={onClose}>X</button>
      </div>

      <div className="space-y-2">
        {group.tasks.map(task => (
          <TaskRow key={task._id} task={task} />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function CollaborationPage() {
  const { user } = useSelector(s => s.auth)

  const [collaboration, setCollaboration] = useState([])
  const [personalTasks, setPersonalTasks] = useState([])   // ⭐ NEW
  const [members, setMembers] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [loading, setLoading] = useState(false)

  // ─── LOAD DATA ─────────────────────────────────────────────
  const load = useCallback(async (month) => {
    setLoading(true)

    try {
      const y = month.getFullYear()
      const m = month.getMonth() + 1

      const [collabRes, membersRes, personalRes] = await Promise.all([
        api.get(`/collaboration?year=${y}&month=${m}`),
        api.get('/collaboration/members'),
        api.get(`/tasks/personal?year=${y}&month=${m}`) // ⭐ NEW
      ])

      setCollaboration(collabRes.data.collaboration || [])
      setMembers(membersRes.data.members || [])
      setPersonalTasks(personalRes.data.tasks || [])

    } catch (err) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(selectedMonth)
  }, [selectedMonth])

  // ─── MERGE PERSONAL + COLLAB TASKS PER USER ────────────────
  const enrichedGroups = members.map(member => {
    const personal = personalTasks.filter(
      t => t.owner?._id === member._id
    )

    const collabGroup = collaboration.find(
      g => g.user._id === member._id
    )

    const collab = collabGroup?.tasks || []

    return {
      user: member,
      tasks: [...personal, ...collab]
    }
  })

  const selectedGroup = enrichedGroups.find(
    g => g.user._id === selectedMemberId
  )

  // ─── UI ────────────────────────────────────────────────────
  return (
    <div className="space-y-5 text-white">

      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Collaboration</h1>
      </div>

      {/* Month */}
      <MonthPicker
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* Loading */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Member chips */}
          {!selectedMemberId && (
            <MemberChips
              groups={enrichedGroups}
              selectedMemberId={selectedMemberId}
              onSelect={setSelectedMemberId}
            />
          )}

          {/* Member panel */}
          {selectedMemberId && selectedGroup && (
            <MemberPanel
              group={selectedGroup}
              onClose={() => setSelectedMemberId(null)}
            />
          )}
        </>
      )}
    </div>
  )
}