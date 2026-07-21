import { useGameStore } from '../store/gameStore'
import { playSfx } from '../utils/sfx'
import { getMotivationalMessage } from '../utils/gamification'
import { getLevel } from '../store/gameStore'
import { useBooks } from '../data/useBook'

export function HomePage() {
  const { game, selectBook, navigate, getDueCards } = useGameStore()
  const { books, loading } = useBooks()
  const level = getLevel(game.xp)
  const dueCards = getDueCards()

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>

  const totalLessons = books.reduce(
    (sum, b) => sum + b.units.reduce(
      (s, u) => s + u.chapters.reduce(
        (ss, c) => ss + c.lessons.length, 0), 0), 0
  )
  const completedCount = Object.keys(game.completedLessons).length
  const totalPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      {/* Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, #58CC02 0%, #46A302 100%)',
        borderRadius: '24px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0' }}>
            Welcome back!
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
            {getMotivationalMessage(level)}
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{game.level}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Level</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{game.xp}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Total XP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>🔥 {game.streak}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Day Streak</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{totalPct}%</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Complete</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>
                {game.totalAnswered > 0
                  ? Math.round((game.totalCorrect / game.totalAnswered) * 100)
                  : 0}%
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Accuracy</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{completedCount}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Lessons Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
              📝 SRS Review
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              {dueCards.length > 0
                ? `${dueCards.length} card${dueCards.length > 1 ? 's' : ''} due for review`
                : 'All caught up! No cards due.'}
            </p>
          </div>
          <button
            onClick={() => { playSfx('button_click'); navigate('review') }}
            className="btn-pop"
            style={{
              padding: '14px 32px',
              background: '#1CB0F6',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #1490D4',
              whiteSpace: 'nowrap',
            }}
          >
            {dueCards.length > 0 ? `Review ${dueCards.length}` : 'Review'}
          </button>
        </div>
      </div>

      {/* Lesson Progress */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: '0 0 12px 0' }}>
          Your Progress
        </h2>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            <span>{completedCount} of {totalLessons} lessons completed</span>
            <span>{totalPct}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '16px',
            background: 'var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${totalPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #58CC02, #7AE03A)',
              borderRadius: '10px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Books / Units */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px 0' }}>
        Choose Your Course
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {books.map((book, idx) => {
          const bookCompleted = book.units.reduce(
            (sum, u) => sum + u.chapters.reduce(
              (s, c) => s + c.lessons.filter(l => {
                return game.completedLessons[
                  `${book.id}-${u.id}-${c.id}-${l.id}`
                ]
              }).length, 0), 0)
          const bookTotal = book.units.reduce(
            (sum, u) => sum + u.chapters.reduce(
              (s, c) => s + c.lessons.length, 0), 0)
          const bookPct = bookTotal > 0 ? Math.round((bookCompleted / bookTotal) * 100) : 0

          return (
            <button
              key={book.id}
              className="card-enter-stagger btn-pop"
              onClick={() => { playSfx('button_click'); selectBook(book.id) }}
              style={{
                animationDelay: `${idx * 55}ms`,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px 24px',
                background: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: book.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                color: 'white',
                flexShrink: 0,
              }}>
                {book.volume}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                  {book.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {book.subtitle}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--border)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${bookPct}%`,
                      height: '100%',
                      background: book.color,
                      borderRadius: '6px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-dim)',
                    marginTop: '4px',
                    fontWeight: 600,
                  }}>
                    {bookCompleted}/{bookTotal} lessons • {bookPct}%
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '24px', color: 'var(--text-dim)', }}>→</div>
            </button>
          )
        })}
      </div>


    </div>
  )
}
