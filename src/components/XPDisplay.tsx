import { formatXp } from '../utils/gamification'
import { isNative } from '../utils/platform'

export function XPDisplay({ xp }: { xp: number }) {
  const mob = isNative()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: mob ? '2px' : '4px',
      padding: mob ? '3px 8px' : '4px 10px',
      background: '#F0F0FF',
      borderRadius: '12px',
      fontSize: mob ? '11px' : '13px',
      fontWeight: 600,
      color: '#4B4BFF',
      whiteSpace: 'nowrap',
    }}>
      ⭐ {formatXp(xp)} XP
    </div>
  )
}
