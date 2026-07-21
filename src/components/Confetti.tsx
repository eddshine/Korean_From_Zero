import { useMemo } from 'react'

interface ConfettiProps {
  count?: number
  colors?: string[]
  duration?: number
}

const DEFAULT_COLORS = ['#58CC02', '#1CB0F6', '#CE82FF', '#FF9600', '#FF4B4B', '#FFC800', '#7AE03A']

export function Confetti({ count = 120, colors = DEFAULT_COLORS, duration = 2.6 }: ConfettiProps) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100
      const delay = Math.random() * (duration * 0.45)
      const dur = duration * (0.7 + Math.random() * 0.6)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = 6 + Math.random() * 8
      const rounded = Math.random() > 0.5
      return {
        id: i,
        left,
        delay,
        dur,
        color,
        width: size,
        height: size * (0.6 + Math.random() * 0.8),
        borderRadius: rounded ? '50%' : '2px',
      }
    })
  }, [count, colors, duration])

  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            background: p.color,
            borderRadius: p.borderRadius,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
