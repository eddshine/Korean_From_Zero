const audioCache = new Map<string, HTMLAudioElement>()

function getAudio(name: string): HTMLAudioElement {
  let a = audioCache.get(name)
  if (!a) {
    a = new Audio(`/sfx/${name}.mp3`)
    audioCache.set(name, a)
  }
  a.currentTime = 0
  return a
}

export function playSfx(name: string, volume?: number) {
  try {
    const a = getAudio(name)
    a.volume = volume ?? 1
    a.play().catch(() => {})
  } catch {}
}
