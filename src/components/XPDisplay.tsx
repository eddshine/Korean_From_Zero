import { formatXp } from '../utils/gamification'

export function XPDisplay({ xp }: { xp: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      background: '#F0F0FF',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#4B4BFF',
    }}>
      ⭐ {formatXp(xp)} XP
    </div>
  )
}
