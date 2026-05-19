import { io } from 'socket.io-client'

let socket = null

export const initSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(
    'https://enterprise-task-management.onrender.com',
    {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true
    }
  )

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}