export function isElectron() {
  return !!(typeof window !== 'undefined' && (window as any).electronAPI)
}

export function isNative() {
  return !!(typeof window !== 'undefined' && (window as any).Capacitor)
}

export function isWeb() {
  return !isElectron() && !isNative()
}
