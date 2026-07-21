import { useState, useMemo, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { playSfx } from '../utils/sfx'

export function ReviewPage() {
  const { srs, reviewCard, getDueCards, navigate } = useGameStore()
  const dueCards = useMemo(() => getDueCards(), [srs.cards])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 })

  const card = dueCards[currentIdx]

  const handleRate = useCallback((quality: 1 | 2 | 3 | 4) => {
    if (!card) return
    reviewCard(card.id, quality)
    setStats(prev => ({ reviewed: prev.reviewed + 1, correct: prev.correct + (quality >= 3 ? 1 : 0) }))
    setFlipped(false)
    if (currentIdx + 1 >= dueCards.length) {
      setFinished(true)
    } else {
      setCurrentIdx(prev => prev + 1)
    }
  }, [card, reviewCard, currentIdx, dueCards.length])

  if (dueCards.length === 0) {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '20px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '60px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ color: 'var(--text)', fontSize: '22px', margin: '0 0 8px 0' }}>
            All caught up!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px 0' }}>
            No cards due for review. Complete some lessons to add cards.
          </p>
          <button
            onClick={() => { playSfx('button_click'); navigate('home') }}
            style={{
              padding: '14px 32px',
              background: '#58CC02',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #3F9A02',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const pct = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '20px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ color: 'var(--text)', fontSize: '22px', margin: '0 0 8px 0' }}>
            Review Complete!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px 0' }}>
            {stats.reviewed} card{stats.reviewed !== 1 ? 's' : ''} reviewed
          </p>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `6px solid ${pct >= 80 ? '#58CC02' : '#FF9600'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px',
            fontWeight: 800,
            color: pct >= 80 ? '#58CC02' : '#FF9600',
          }}>
            {pct}%
          </div>
          <button
            onClick={() => { playSfx('button_click'); navigate('home') }}
            style={{
              padding: '14px 32px',
              background: '#58CC02',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #3F9A02',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      {/* Progress */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Review • {currentIdx + 1} of {dueCards.length}
        </div>
        <button
          onClick={() => { playSfx('leave_game'); navigate('home') }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '10px',
        background: 'var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <div style={{
          width: `${((currentIdx) / dueCards.length) * 100}%`,
          height: '100%',
          background: '#CE82FF',
          borderRadius: '10px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '48px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          cursor: flipped ? 'default' : 'pointer',
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.2s',
          marginBottom: '20px',
        }}
      >
        {!flipped ? (
          <>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#CE82FF', marginBottom: '12px' }}>
              Tap to reveal answer
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
              {card.front}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              {card.front}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#58CC02', lineHeight: 1.4, marginBottom: '8px' }}>
              {card.back}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {card.interval > 1 ? `Next review in ${card.interval} days` : 'New card'}
            </div>
          </>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Again', quality: 1 as const, color: '#FF4B4B', desc: 'Forgot' },
            { label: 'Hard', quality: 2 as const, color: '#FF9600', desc: 'Difficult' },
            { label: 'Medium', quality: 3 as const, color: '#1CB0F6', desc: 'Correct' },
            { label: 'Easy', quality: 4 as const, color: '#58CC02', desc: 'Easy' },
          ].map(btn => (
            <button
              key={btn.quality}
              onClick={() => handleRate(btn.quality)}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: btn.color,
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 3px 0 ${btn.color}99`,
                transition: 'all 0.1s',
              }}
            >
              <div>{btn.label}</div>
              <div style={{ fontSize: '10px', fontWeight: 500, opacity: 0.8, marginTop: '2px' }}>
                {btn.desc}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
