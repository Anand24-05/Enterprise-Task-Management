import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture, isPast, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import { MdChevronLeft, MdChevronRight, MdAdd, MdTask } from 'react-icons/md'
import { fetchTasksByDate, fetchTasksByMonth, setSelectedDate } from '../../redux/slices/taskSlice'
import TaskItem from '../../components/tasks/TaskItem'
import TaskModal from '../../components/tasks/TaskModal'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const dispatch = useDispatch()
  const { byDate, monthTasks, selectedDate, loading } = useSelector(s => s.tasks)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [createOpen, setCreateOpen] = useState(false)

  const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date()
  const tasksForDay = byDate[selectedDate] || []

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  useEffect(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth() + 1
    dispatch(fetchTasksByMonth({ year: y, month: m }))
  }, [currentMonth, dispatch])

  useEffect(() => {
  const today = format(new Date(), 'yyyy-MM-dd')

  if (!selectedDate) {
    dispatch(setSelectedDate(today))
    dispatch(fetchTasksByDate(today))
  } else {
    dispatch(fetchTasksByDate(selectedDate))
  }
}, [selectedDate, dispatch])

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    dispatch(setSelectedDate(dateStr))
  }

  const getTasksForDay = (day) => {
    return monthTasks.filter(t => isSameDay(new Date(t.taskDate), day))
  }

  const dayType = (day) => {
    if (isToday(day)) return 'today'
    if (isFuture(day)) return 'future'
    return 'past'
  }

  const canCreate = () => {
    const t = dayType(selectedDateObj)
    return t === 'today' || t === 'future'
  }

  const canEdit = () => true
  const canDelete = () => true

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-white/50 text-sm mt-0.5">Manage your tasks by date</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-4">
  {/* Calendar */}
  <div className="glass-card p-4">
    {/* Month navigation */}
    <div className="flex items-center justify-between mb-3">
      <button
        onClick={() => setCurrentMonth(d => subMonths(d, 1))}
        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
      >
        <MdChevronLeft className="text-lg" />
      </button>

      <h2 className="text-white text-base font-bold">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>

      <button
        onClick={() => setCurrentMonth(d => addMonths(d, 1))}
        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
      >
        <MdChevronRight className="text-lg" />
      </button>
    </div>

    {/* Weekday headers */}
    <div className="grid grid-cols-7 mb-1">
      {WEEKDAYS.map(d => (
        <div
          key={d}
          className="text-center text-white/40 text-[11px] font-semibold py-1"
        >
          {d}
        </div>
      ))}
    </div>

    {/* Calendar grid */}
    <div className="grid grid-cols-7 gap-0.5">
      {calDays.map(day => {
        const dayTasks = getTasksForDay(day)
        const isSelected = isToday(day)
        const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
        const type = dayType(day)

        return (
          <motion.button
            key={day.toISOString()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleDayClick(day)}
            className={`
              relative h-12 rounded-lg flex flex-col items-center justify-start
              p-1 pt-1 transition-all text-sm font-medium
              ${!isCurrentMonth ? 'opacity-25' : ''}

              ${
                isSelected
                  ? 'bg-gradient-brand text-white shadow-lg shadow-primary-500/30'
                  : ''
              }

              ${
                !isSelected && isCurrentMonth
                  ? 'hover:bg-white/10 text-white/70'
                  : ''
              }
            `}
          >
            <span
              className={`text-[11px] leading-none ${
                isSelected ? 'text-white' : ''
              }`}
            >
              {format(day, 'd')}
            </span>

            {dayTasks.length > 0 && (
              <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                {dayTasks.slice(0, 3).map((t, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                      t.isDone
                        ? 'bg-green-400'
                        : t.priority === 'high'
                        ? 'bg-red-400'
                        : t.priority === 'medium'
                        ? 'bg-yellow-400'
                        : 'bg-blue-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.button>
        )
      })}
    </div>

    {/* Legend */}
    <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-white/10 text-[11px] text-white/40">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <span>High</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <span>Medium</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <span>Low</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span>Done</span>
      </div>
    </div>
  </div>

  {/* Task Panel */}
  <div className="space-y-2">
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-base">
            {selectedDate
              ? format(selectedDateObj, 'MMMM d, yyyy')
              : 'Select a date'}
          </h3>

          <p className="text-white/40 text-[11px] mt-0.5">
            {dayType(selectedDateObj) === 'today' && '📅 Today'}
            {dayType(selectedDateObj) === 'past' &&
              '📖 Past — view, edit & delete only'}
            {dayType(selectedDateObj) === 'future' &&
              '🔮 Future — all operations available'}
          </p>
        </div>

        {canCreate() && selectedDate && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setCreateOpen(true)}
            className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
          >
            <MdAdd className="text-base" />
            Add Task
          </motion.button>
        )}
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasksForDay.length === 0 ? (
        <div className="text-center py-4">
          <MdTask className="text-white/20 text-4xl mx-auto mb-2" />
          <p className="text-white/40 text-sm">No tasks for this day</p>
          {canCreate() && (
            <p className="text-white/30 text-xs mt-1">
              Click "Add Task" to create one
            </p>
          )}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {tasksForDay.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                canEdit={true}
                canDelete={true}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  </div>
</div>

      <TaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        dateStr={selectedDate}
      />
    </div>
  )
}
