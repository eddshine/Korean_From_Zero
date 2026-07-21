import type { PersistStorage } from 'zustand/middleware'

declare global {
  interface Window {
    dbAPI: {
      load: (key: string) => Promise<string | null>
      save: (key: string, value: string) => Promise<void>
      remove: (key: string) => Promise<void>
    }
  }
}

export const dbStorage: PersistStorage<unknown> = {
  getItem: async (name: string) => {
    const data = await window.dbAPI.load(name)
    return data ? JSON.parse(data) : null
  },
  setItem: async (name: string, value: unknown) => {
    await window.dbAPI.save(name, JSON.stringify(value))
  },
  removeItem: async (name: string) => {
    await window.dbAPI.remove(name)
  },
}
