import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchTasksByDate = createAsyncThunk('tasks/byDate', async (date) => {
  const { data } = await api.get(`/tasks/date/${date}`)
  return { date, tasks: data.tasks }
})

export const fetchTasksByMonth = createAsyncThunk('tasks/byMonth', async ({ year, month }) => {
  const { data } = await api.get(`/tasks/month/${year}/${month}`)
  return data.tasks
})

export const createTask = createAsyncThunk('tasks/create', async (taskData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/tasks', taskData)
    return data.task
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

export const updateTask = createAsyncThunk('tasks/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/tasks/${id}`, updates)
    return data.task
  } catch (err) {
    return rejectWithValue(err.response?.data?.error)
  }
})

export const toggleTaskDone = createAsyncThunk('tasks/toggleDone', async (id) => {
  const { data } = await api.patch(`/tasks/${id}/toggle-done`)
  return data.task
})

export const deleteTask = createAsyncThunk('tasks/delete', async (id) => {
  await api.delete(`/tasks/${id}`)
  return id
})

export const searchTasks = createAsyncThunk('tasks/search', async (q) => {
  const { data } = await api.get(`/tasks/search?q=${q}`)
  return data.tasks
})

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    byDate: {},
    monthTasks: [],
    searchResults: [],
    loading: false,
    error: null,
    selectedDate: new Date().toISOString().split('T')[0],
  },
  reducers: {
    setSelectedDate: (state, action) => { state.selectedDate = action.payload },
    clearSearchResults: (state) => { state.searchResults = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByDate.pending, (state) => { state.loading = true })
      .addCase(fetchTasksByDate.fulfilled, (state, action) => {
        state.loading = false
        state.byDate[action.payload.date] = action.payload.tasks
      })
      .addCase(fetchTasksByMonth.fulfilled, (state, action) => {
        state.monthTasks = action.payload
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload
        const dateKey = task.taskDate.split('T')[0]
        if (!state.byDate[dateKey]) state.byDate[dateKey] = []
        state.byDate[dateKey].unshift(task)
        state.monthTasks.push(task)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const task = action.payload
        const dateKey = task.taskDate.split('T')[0]
        if (state.byDate[dateKey]) {
          const idx = state.byDate[dateKey].findIndex(t => t._id === task._id)
          if (idx !== -1) state.byDate[dateKey][idx] = task
        }
        const mIdx = state.monthTasks.findIndex(t => t._id === task._id)
        if (mIdx !== -1) state.monthTasks[mIdx] = task
      })
      .addCase(toggleTaskDone.fulfilled, (state, action) => {
        const task = action.payload
        const dateKey = task.taskDate.split('T')[0]
        if (state.byDate[dateKey]) {
          const idx = state.byDate[dateKey].findIndex(t => t._id === task._id)
          if (idx !== -1) state.byDate[dateKey][idx] = task
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const id = action.payload
        Object.keys(state.byDate).forEach(date => {
          state.byDate[date] = state.byDate[date].filter(t => t._id !== id)
        })
        state.monthTasks = state.monthTasks.filter(t => t._id !== id)
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })
  }
})

export const { setSelectedDate, clearSearchResults } = taskSlice.actions
export default taskSlice.reducer
