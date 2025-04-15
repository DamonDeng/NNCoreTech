import { useState, useEffect } from 'react'

export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Get initial value from localStorage or use default
  const [value, setValue] = useState<T>(() => {
    const persistedValue = localStorage.getItem(key)
    return persistedValue ? JSON.parse(persistedValue) : defaultValue
  })

  // Update localStorage when value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
} 