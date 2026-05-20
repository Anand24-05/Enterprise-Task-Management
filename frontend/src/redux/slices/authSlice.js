import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('accessToken', data.accessToken)
      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Login failed'
      )
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/signup', userData)
      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Signup failed'
      )
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken')

      // No token → stop request
      if (!token) {
        return rejectWithValue('No token')
      }

      const { data } = await api.get('/auth/me')
      return data.user
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Unauthorized'
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // Ignore backend logout error
    } finally {
      localStorage.removeItem('accessToken')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false
  },

  reducers: {
    clearError: (state) => {
      state.error = null
    },

    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },

    // ADD THIS
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
      state.initialized = true
    }
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.initialized = true
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // SIGNUP
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(signup.fulfilled, (state) => {
        state.loading = false
      })

      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // FETCH USER
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.initialized = true
      })

      .addCase(fetchMe.rejected, (state) => {
        state.loading = false
        state.initialized = true
        state.isAuthenticated = false
        state.user = null
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.initialized = true
      })
  }
})

export const {
  clearError,
  setUser,
  clearAuth
} = authSlice.actions

export default authSlice.reducer