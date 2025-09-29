import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
}

const defaultContext: ThemeContextType = {
  theme: 'light',
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from what was set in _document.tsx script
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
    }
    return 'light'
  })

  // Initialize theme and handle system preference changes
  useEffect(() => {
    // Get theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme') as Theme | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'
    const initialTheme = storedTheme || systemTheme

    setTheme(initialTheme)
    localStorage.setItem('theme', initialTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(initialTheme)
    document.documentElement.style.backgroundColor =
      initialTheme === 'dark' ? '#111827' : '#ffffff'
    document.body.style.backgroundColor =
      initialTheme === 'dark' ? '#111827' : '#ffffff'

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newTheme)
      document.documentElement.style.backgroundColor =
        newTheme === 'dark' ? '#111827' : '#ffffff'
      document.body.style.backgroundColor =
        newTheme === 'dark' ? '#111827' : '#ffffff'
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const value = {
    theme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
