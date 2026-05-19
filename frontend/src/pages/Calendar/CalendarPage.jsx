import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isFuture,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths
} from 'date-fns'

import {
  MdChevronLeft,
  MdChevronRight,
  MdAdd,
  MdTask
} from 'react-icons/md'

import {
  fetchTasksByDate,
  fetchTasksByMonth,
  setSelectedDate
} from '../../redux/slices/taskSlice'

import TaskItem from '../../components/tasks/TaskItem'
import TaskModal from '../../components/tasks/TaskModal'

const WEEKDAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
]

export default function CalendarPage() {
  const dispatch = useDispatch()

  const {
    byDate,
    monthTasks,
    selectedDate,
    loading
  } = useSelector(s => s.tasks)

  const today = format(
    new Date(),
    'yyyy-MM-dd'
  )

  const [currentMonth, setCurrentMonth] =
    useState(new Date())

  const [createOpen, setCreateOpen] =
    useState(false)

  // ALWAYS default to today on refresh
  useEffect(() => {
    dispatch(setSelectedDate(today))
    dispatch(fetchTasksByDate(today))
  }, [dispatch])

  // Fetch tasks whenever selected date changes
  useEffect(() => {
    if (selectedDate) {
      dispatch(
        fetchTasksByDate(selectedDate)
      )
    }
  }, [selectedDate, dispatch])

  // Fetch month tasks
  useEffect(() => {
    const y =
      currentMonth.getFullYear()

    const m =
      currentMonth.getMonth() + 1

    dispatch(
      fetchTasksByMonth({
        year: y,
        month: m
      })
    )
  }, [currentMonth, dispatch])

  const selectedDateObj =
    selectedDate
      ? new Date(selectedDate)
      : new Date()

  const tasksForDay =
    byDate[selectedDate] || []

  // Calendar grid
  const monthStart =
    startOfMonth(currentMonth)

  const monthEnd =
    endOfMonth(currentMonth)

  const calStart =
    startOfWeek(monthStart)

  const calEnd =
    endOfWeek(monthEnd)

  const calDays =
    eachDayOfInterval({
      start: calStart,
      end: calEnd
    })

  const handleDayClick = day => {
    const dateStr = format(
      day,
      'yyyy-MM-dd'
    )

    dispatch(
      setSelectedDate(dateStr)
    )
  }

  const getTasksForDay = day => {
    return monthTasks.filter(t =>
      isSameDay(
        new Date(t.taskDate),
        day
      )
    )
  }

  const dayType = day => {
    if (isToday(day))
      return 'today'

    if (isFuture(day))
      return 'future'

    return 'past'
  }

  const canCreate = () => {
    const t =
      dayType(selectedDateObj)

    return (
      t === 'today' ||
      t === 'future'
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Calendar
          </h1>

          <p className="text-white/50 text-sm mt-0.5">
            Manage your tasks by
            date
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-4">

        {/* Calendar */}
        <div className="glass-card p-4">

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() =>
                setCurrentMonth(d =>
                  subMonths(d, 1)
                )
              }
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
            >
              <MdChevronLeft />
            </button>

            <h2 className="text-white font-bold">
              {format(
                currentMonth,
                'MMMM yyyy'
              )}
            </h2>

            <button
              onClick={() =>
                setCurrentMonth(d =>
                  addMonths(d, 1)
                )
              }
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
            >
              <MdChevronRight />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div
                key={d}
                className="text-center text-white/40 text-[11px]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map(day => {
              const dayTasks =
                getTasksForDay(day)

              // FIXED
              const isSelected =
                selectedDate &&
                isSameDay(
                  day,
                  new Date(
                    selectedDate
                  )
                )

              const isCurrentMonth =
                day.getMonth() ===
                currentMonth.getMonth()

              return (
                <motion.button
                  key={day.toISOString()}
                  whileHover={{
                    scale: 1.03
                  }}
                  whileTap={{
                    scale: 0.96
                  }}
                  onClick={() =>
                    handleDayClick(
                      day
                    )
                  }
                  className={`
                    relative h-12 rounded-lg flex flex-col items-center justify-start
                    p-1 text-sm transition-all
                    ${
                      !isCurrentMonth
                        ? 'opacity-25'
                        : ''
                    }

                    ${
                      isSelected
                        ? 'bg-gradient-brand text-white shadow-lg'
                        : 'hover:bg-white/10 text-white/70'
                    }
                  `}
                >
                  <span>
                    {format(day, 'd')}
                  </span>

                  {dayTasks.length >
                    0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayTasks
                        .slice(0, 3)
                        .map(
                          (
                            t,
                            i
                          ) => (
                            <div
                              key={
                                i
                              }
                              className="w-1 h-1 rounded-full bg-blue-400"
                            />
                          )
                        )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Task Panel */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-bold">
                {format(
                  selectedDateObj,
                  'MMMM d, yyyy'
                )}
              </h3>

              <p className="text-white/40 text-xs">
                {dayType(
                  selectedDateObj
                ) ===
                  'today' &&
                  '📅 Today'}

                {dayType(
                  selectedDateObj
                ) ===
                  'past' &&
                  '📖 Past'}

                {dayType(
                  selectedDateObj
                ) ===
                  'future' &&
                  '🔮 Future'}
              </p>
            </div>

            {canCreate() && (
              <motion.button
                whileHover={{
                  scale: 1.04
                }}
                whileTap={{
                  scale: 0.96
                }}
                onClick={() =>
                  setCreateOpen(
                    true
                  )
                }
                className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
              >
                <MdAdd />
                Add Task
              </motion.button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tasksForDay.length ===
            0 ? (
            <div className="text-center py-4">
              <MdTask className="text-4xl text-white/20 mx-auto mb-2" />

              <p className="text-white/40">
                No tasks for this day
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {tasksForDay.map(
                  task => (
                    <TaskItem
                      key={
                        task._id
                      }
                      task={task}
                      canEdit
                      canDelete
                    />
                  )
                )}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        dateStr={selectedDate}
      />
    </div>
  )
}