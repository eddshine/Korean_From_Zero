import { useGameStore, getLevel, getXpForNextLevel } from '../store/gameStore'
import { XPDisplay } from './XPDisplay'
import { playSfx } from '../utils/sfx'
import { isNative } from '../utils/platform'

export function Header() {
  const { game, navigate, resetNav, requestLeave } = useGameStore()
  const xpProgress = getXpForNextLevel(game.xp)
  const mob = isNative()

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: mob ? '12px 16px' : '8px 20px',
      background: 'var(--bg-header)',
      borderBottom: '2px solid var(--border)',
      zIndex: 100,
      gap: mob ? '8px' : '12px',
      flexWrap: mob ? 'nowrap' : 'wrap',
    }}>
      <button
        onClick={() => { resetNav(); navigate('home') }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: mob ? '16px' : '20px',
          color: '#58CC02',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        <img src="img/kfz_ico.png" alt="" style={{ height: mob ? '24px' : '32px', width: mob ? '24px' : '32px', margin: mob ? '-2px 0' : '-4px 0' }} />
        {mob ? 'KFZ' : 'Korean From Zero'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '6px' : '16px', flexShrink: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '3px' : '8px' }}>
          <div style={{
            background: '#E6F7E6',
            borderRadius: '12px',
            padding: mob ? '2px 8px' : '4px 12px',
            fontSize: mob ? '11px' : '13px',
            fontWeight: 600,
            color: '#58CC02',
            whiteSpace: 'nowrap',
          }}>
            Lv.{game.level}
          </div>
          <div style={{
            width: mob ? '50px' : '80px',
            height: mob ? '8px' : '12px',
            background: '#E5E5E5',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <div style={{
              width: `${(100 - xpProgress)}%`,
              height: '100%',
              background: '#58CC02',
              borderRadius: '10px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          {!mob && (
            <span style={{ fontSize: '11px', color: '#999', fontWeight: 600 }}>
              +{game.xp % 100}/100 XP
            </span>
          )}
        </div>

        <XPDisplay xp={game.xp} />

        {game.streak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: mob ? '2px' : '4px',
            background: mob ? 'transparent' : '#FFF3E0',
            borderRadius: '12px',
            padding: mob ? '2px 6px' : '4px 10px',
            fontSize: mob ? '11px' : '13px',
            fontWeight: 600,
            color: '#FF9600',
            whiteSpace: 'nowrap',
          }}>
            🔥{game.streak}
          </div>
        )}

        <button
          onClick={() => { playSfx('button_click'); requestLeave('profile') }}
          style={{
            background: 'var(--bg)',
            border: '2px solid var(--border)',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            borderRadius: '50%',
            width: mob ? '32px' : '34px',
            height: mob ? '32px' : '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-1px)' }}>👤</span>
        </button>
      </div>
    </header>
  )
}
