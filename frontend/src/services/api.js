import axios from 'axios'

// Backend URL
const BASE_URL = 'https://enterprise-task-management.onrender.com/api'

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---------------- REQUEST INTERCEPTOR ----------------

// Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ---------------- RESPONSE INTERCEPTOR ----------------

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // Network/server down
    if (!error.response) {
      return Promise.reject(error)
    }

    const status = error.response.status

    // Prevent refresh loop
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/logout')

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      // If already refreshing → queue requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh token request
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true
          }
        )

        const newAccessToken = data.accessToken

        // Save new token
        localStorage.setItem(
          'accessToken',
          newAccessToken
        )

        // Update axios defaults
        api.defaults.headers.common.Authorization =
          `Bearer ${newAccessToken}`

        // Retry queued requests
        processQueue(null, newAccessToken)

        // Retry original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)

        // Clear session
        localStorage.removeItem('accessToken')

        // Notify React app
        window.dispatchEvent(
          new CustomEvent('auth:expired')
        )

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api