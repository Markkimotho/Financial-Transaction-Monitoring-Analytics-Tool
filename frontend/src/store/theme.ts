import { create } from 'zustand'

export interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setDarkMode: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem('theme') === 'light' ? false : true,
  toggleTheme: () => set((state) => {
    const newIsDark = !state.isDark
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    return { isDark: newIsDark }
  }),
  setDarkMode: (isDark: boolean) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    set({ isDark })
  },
}))
