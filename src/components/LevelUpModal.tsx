import { useEffect } from 'react'
import { getLevelTitle } from '../utils/gamification'
import { playSfx } from '../utils/sfx'
import { Confetti } from './Confetti'

export function LevelUpModal({
  level,
  onClose,
}: {
  level: number
  onClose: () => void
}) {
  useEffect(() => { playSfx('rank_up') }, [])

  return (
    <>
      <Confetti count={80} duration={2.2} />
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
      }}>
        <div className="card-enter" style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div className="star-pop" style={{ fontSize: '64px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ color: '#58CC02', fontSize: '28px', margin: '8px 0' }}>
            Level Up!
          </h2>
          <div style={{
            fontSize: '48px',
            fontWeight: 800,
            color: 'var(--text)',
            margin: '8px 0',
          }}>
            Level {level}
          </div>
          <div style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}>
            {getLevelTitle(level)}
          </div>
          <button
            onClick={() => { playSfx('button_click'); onClose() }}
            className="btn-pop"
            style={{
              background: '#58CC02',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 40px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #3F9A02',
              transition: 'all 0.1s',
            }}
            onMouseDown={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(2px)'
              ;(e.target as HTMLButtonElement).style.boxShadow = '0 2px 0 #3F9A02'
            }}
            onMouseUp={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
              ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 0 #3F9A02'
            }}
          >
            계속하기 Continue
          </button>
        </div>
      </div>
    </>
  )
}
