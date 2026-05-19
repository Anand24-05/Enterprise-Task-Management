import axios from 'axios'

const api = axios.create({
  baseURL: 'https://enterprise-task-management.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → refresh token
let refreshing = false
let queue = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => api(original))
      }
      original._retry = true
      refreshing = true
      try {
        const { data } = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true })
        localStorage.setItem('accessToken', data.accessToken)
        queue.forEach(p => p.resolve())
        queue = []
        return api(original)
      } catch {
        queue.forEach(p => p.reject())
        queue = []
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
