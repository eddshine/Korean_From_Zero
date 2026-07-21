import { useGameStore, getLevel, getXpForNextLevel } from '../store/gameStore'
import { XPDisplay } from './XPDisplay'
import { playSfx } from '../utils/sfx'

export function Header() {
  const { game, navigate, resetNav, requestLeave } = useGameStore()
  const xpProgress = getXpForNextLevel(game.xp)

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 20px',
      background: 'var(--bg-header)',
      borderBottom: '2px solid var(--border)',
      zIndex: 100,
      gap: '12px',
    }}>
      <button
        onClick={() => { resetNav(); navigate('home') }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '20px',
          color: '#58CC02',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        <img src="img/kfz_ico.png" alt="" style={{ height: '32px', width: '32px', margin: '-4px 0' }} />
        Korean From Zero
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            background: '#E6F7E6',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#58CC02',
            whiteSpace: 'nowrap',
          }}>
            Lv.{game.level}
          </div>
          <div style={{
            width: '60px',
            height: '10px',
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
        </div>

        <XPDisplay xp={game.xp} />

        {game.streak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '12px',
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
            width: '34px',
            height: '34px',
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
