import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    notificationOpen: false,
    theme: 'default'
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    toggleNotifications: (state) => { state.notificationOpen = !state.notificationOpen },
    closeNotifications: (state) => { state.notificationOpen = false },
    setTheme: (state, action) => { state.theme = action.payload }
  }
})

export const { toggleSidebar, toggleNotifications, closeNotifications, setTheme } = uiSlice.actions
export default uiSlice.reducer
