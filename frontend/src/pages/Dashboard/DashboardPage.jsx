import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  MdTask,
  MdCheckCircle,
  MdPending,
  MdWarning,
  MdTrendingUp,
  MdCalendarMonth
} from 'react-icons/md'
import api from '../../services/api'

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  delay
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 flex items-center gap-4"
  >
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}
    >
      <Icon className="text-2xl text-white" />
    </div>

    <div>
      <p className="text-white/50 text-sm">
        {label}
      </p>

      <p className="text-white text-3xl font-bold">
        {value ?? '—'}
      </p>
    </div>
  </motion.div>
)

export default function DashboardPage() {
  const { user } = useSelector(
    s => s.auth
  )

  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] =
    useState([])
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    api
      .get('/users/dashboard')
      .then(({ data }) => {
        setStats(data.stats)
        setRecentTasks(
          data.recentTasks || []
        )

        // Debug
        console.log(
          'Dashboard Data:',
          data.recentTasks
        )
        console.log(
          'Logged User:',
          user
        )
      })
      .finally(() =>
        setLoading(false)
      )
  }, [])

  const completionRate = stats
    ? Math.round(
        (stats.completed /
          (stats.total || 1)) *
          100
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: -10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
      >
        <h1 className="text-2xl font-bold text-white">
          Good{' '}
          {new Date().getHours() < 12
            ? 'Morning'
            : new Date().getHours() <
              17
            ? 'Afternoon'
            : 'Evening'}
          , {user?.userId}! 👋
        </h1>

        <p className="text-white/50 text-sm mt-1">
          Here's your productivity
          overview
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={MdTask}
              label="Total Tasks"
              value={stats?.total}
              color="bg-gradient-brand"
              delay={0}
            />

            <StatCard
              icon={MdCheckCircle}
              label="Completed"
              value={stats?.completed}
              color="bg-green-500/30"
              delay={0.1}
            />

            <StatCard
              icon={MdPending}
              label="Pending"
              value={stats?.pending}
              color="bg-yellow-500/30"
              delay={0.2}
            />

            <StatCard
              icon={MdWarning}
              label="Overdue"
              value={stats?.overdue}
              color="bg-red-500/30"
              delay={0.3}
            />
          </div>

          {/* Progress + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Completion */}
            <motion.div
              initial={{
                opacity: 0,
                x: -20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: 0.4
              }}
              className="glass-card p-6"
            >
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <MdTrendingUp className="text-primary-500" />
                Completion Rate
              </h2>

              <div className="relative flex items-center justify-center py-4">
                <svg
                  viewBox="0 0 120 120"
                  className="w-36 h-36 -rotate-90"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="10"
                    strokeDasharray={`${completionRate * 3.14} 314`}
                    strokeLinecap="round"
                  />

                  <defs>
                    <linearGradient
                      id="grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--theme-from,#667eea)"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--theme-to,#764ba2)"
                      />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute text-center">
                  <p className="text-white text-3xl font-bold">
                    {completionRate}%
                  </p>

                  <p className="text-white/40 text-xs">
                    Done
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="glass-card p-3 text-center">
                  <p className="text-white text-xl font-bold">
                    {stats?.thisWeek}
                  </p>

                  <p className="text-white/40 text-xs">
                    This Week
                  </p>
                </div>

                <div className="glass-card p-3 text-center">
                  <p className="text-white text-xl font-bold">
                    {stats?.total}
                  </p>

                  <p className="text-white/40 text-xs">
                    All Time
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recent Tasks */}
            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: 0.5
              }}
              className="glass-card p-6"
            >
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <MdCalendarMonth className="text-primary-500" />
                Recent Tasks
              </h2>

              {recentTasks.length === 0 ? (
                <p className="text-white/40 text-center py-6 text-sm">
                  No tasks yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map(
                    task => {
                      const isCollaborator =
                        task.collaborators?.some(
                          c =>
                            c.userId?._id?.toString() ===
                            user?._id?.toString()
                        )

                      const isAssignedTask =
                        isCollaborator &&
                        task.owner?._id?.toString() !==
                          user?._id?.toString()

                      return (
                        <div
                          key={task._id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all"
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              task.isDone
                                ? 'bg-green-400'
                                : task.priority ===
                                  'high'
                                ? 'bg-red-400'
                                : task.priority ===
                                  'medium'
                                ? 'bg-yellow-400'
                                : 'bg-blue-400'
                            }`}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`text-sm font-medium truncate ${
                                  task.isDone
                                    ? 'line-through text-white/40'
                                    : 'text-white'
                                }`}
                              >
                                {task.title}
                              </p>

                              {isAssignedTask && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-500/20 text-primary-300">
                                  Assigned
                                </span>
                              )}
                            </div>

                            <p className="text-white/30 text-xs">
                              {new Date(
                                task.taskDate
                              ).toLocaleDateString()}
                            </p>

                            {isAssignedTask && (
                              <p className="text-primary-300 text-[11px] mt-1">
                                Assigned by{' '}
                                {task.owner
                                  ?.userId ||
                                  'Company'}
                              </p>
                            )}
                          </div>

                          <span
                            className={`badge shrink-0 ${
                              task.priority ===
                              'high'
                                ? 'badge-high'
                                : task.priority ===
                                  'medium'
                                ? 'badge-medium'
                                : 'badge-low'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Account Info */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.6
            }}
            className="glass-card p-6"
          >
            <h2 className="text-white font-bold text-lg mb-4">
              Account Info
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: 'User ID',
                  value:
                    user?.userId
                },
                {
                  label: 'Role',
                  value:
                    user?.role
                },
                {
                  label: 'Company',
                  value:
                    user?.companyName ||
                    '—'
                },
                {
                  label: 'Email',
                  value:
                    user?.email
                }
              ].map(
                ({
                  label,
                  value
                }) => (
                  <div
                    key={label}
                    className="bg-white/5 rounded-xl p-4"
                  >
                    <p className="text-white/40 text-xs mb-1">
                      {label}
                    </p>

                    <p className="text-white text-sm font-semibold truncate">
                      {value}
                    </p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}