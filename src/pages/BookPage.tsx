import { useGameStore } from '../store/gameStore'
import { useBook } from '../data/useBook'
import { playSfx } from '../utils/sfx'

export function BookPage() {
  const { nav, selectUnit, navigate, selectBook, game } = useGameStore()
  const { book, loading } = useBook(nav.selectedBookId)

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
  if (!book) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Book not found</div>

  const bookCompleted = book.units.reduce(
    (sum, u) => sum + u.chapters.reduce(
      (s, c) => s + c.lessons.filter(l => {
        return game.completedLessons[`${book.id}-${u.id}-${c.id}-${l.id}`]
      }).length, 0), 0)
  const bookTotal = book.units.reduce(
    (sum, u) => sum + u.chapters.reduce(
      (s, c) => s + c.lessons.length, 0), 0)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <button
        onClick={() => { playSfx('button_click'); navigate('home') }}
        className="btn-pop"
        style={{
          background: 'none',
          border: 'none',
          color: '#1CB0F6',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 600,
          padding: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        ← Back to Courses
      </button>

      <div style={{
        background: book.color,
        borderRadius: '24px',
        padding: '32px',
        color: 'white',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9, marginBottom: '4px' }}>
          Volume {book.volume}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0' }}>
          {book.title}
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.8, margin: 0 }}>
          {book.subtitle}
        </p>
        <div style={{ marginTop: '16px' }}>
          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${bookTotal > 0 ? (bookCompleted / bookTotal) * 100 : 0}%`,
              height: '100%',
              background: 'var(--bg-card)',
              borderRadius: '6px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            marginTop: '6px',
            opacity: 0.85,
          }}>
            {bookCompleted} / {bookTotal} lessons
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px 0' }}>
        Units
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {book.units.map((unit, idx) => {
          const unitCompleted = unit.chapters.reduce(
            (s, c) => s + c.lessons.filter(l =>
              game.completedLessons[`${book.id}-${unit.id}-${c.id}-${l.id}`]
            ).length, 0)
          const unitTotal = unit.chapters.reduce((s, c) => s + c.lessons.length, 0)

          return (
            <button
              key={unit.id}
              className="card-enter-stagger btn-pop"
              onClick={() => { playSfx('button_click'); selectUnit(unit.id) }}
              style={{
                animationDelay: `${idx * 55}ms`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: book.color + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                color: book.color,
                flexShrink: 0,
              }}>
                {unit.id}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                  {unit.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {unit.description}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  marginTop: '4px',
                  fontWeight: 600,
                }}>
                  {unitCompleted}/{unitTotal} lessons
                </div>
              </div>
              <div style={{ fontSize: '20px', color: 'var(--text-dim)', }}>→</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
