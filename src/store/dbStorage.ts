import type { PersistStorage } from 'zustand/middleware'
import { isElectron, isNative } from '../utils/platform'

const STORAGE_PREFIX = 'korean-app:'

declare global {
  interface Window {
    dbAPI: {
      load: (key: string) => Promise<string | null>
      save: (key: string, value: string) => Promise<void>
      remove: (key: string) => Promise<void>
    }
  }
}

async function electronGet(key: string) {
  const data = await window.dbAPI.load(key)
  return data ? JSON.parse(data) : null
}

async function electronSet(key: string, value: unknown) {
  await window.dbAPI.save(key, JSON.stringify(value))
}

async function electronRemove(key: string) {
  await window.dbAPI.remove(key)
}

async function capacitorGet(key: string) {
  const { Preferences } = await import('@capacitor/preferences')
  const { value } = await Preferences.get({ key: STORAGE_PREFIX + key })
  return value ? JSON.parse(value) : null
}

async function capacitorSet(key: string, value: unknown) {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key: STORAGE_PREFIX + key, value: JSON.stringify(value) })
}

async function capacitorRemove(key: string) {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.remove({ key: STORAGE_PREFIX + key })
}

function webGet(key: string) {
  const raw = localStorage.getItem(STORAGE_PREFIX + key)
  return raw ? JSON.parse(raw) : null
}

function webSet(key: string, value: unknown) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
}

function webRemove(key: string) {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

export const dbStorage: PersistStorage<unknown> = {
  getItem: async (name: string) => {
    try {
      if (isElectron()) return await electronGet(name)
      if (isNative()) return await capacitorGet(name)
      return webGet(name)
    } catch {
      return webGet(name)
    }
  },
  setItem: async (name: string, value: unknown) => {
    try {
      if (isElectron()) await electronSet(name, value)
      else if (isNative()) await capacitorSet(name, value)
      else webSet(name, value)
    } catch {
      webSet(name, value)
    }
  },
  removeItem: async (name: string) => {
    try {
      if (isElectron()) await electronRemove(name)
      else if (isNative()) await capacitorRemove(name)
      else webRemove(name)
    } catch {
      webRemove(name)
    }
  },
}
