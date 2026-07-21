import { useGameStore } from '../store/gameStore'
import { makeLessonKey } from '../data'
import { useBook } from '../data/useBook'
import { playSfx } from '../utils/sfx'

export function LessonPage() {
  const { nav, selectLesson, navigate, selectUnit, selectChapter, selectBook, game } = useGameStore()
  const { book, loading } = useBook(nav.selectedBookId)
  const unit = book?.units.find(u => u.id === nav.selectedUnitId) ?? null

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
  if (!book || !unit) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Content not found</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <button
        onClick={() => { playSfx('button_click'); selectBook(book.id) }}
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
        ← Back to {book.title}
      </button>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '24px',
        border: '2px solid var(--border)',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: book.color, marginBottom: '4px' }}>
          Volume {book.volume} • Unit {unit.id}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '0' }}>
          {unit.title}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {unit.description}
        </p>
      </div>

      {unit.chapters.map((chapter) => {
        const chapterCompleted = chapter.lessons.filter(l =>
          game.completedLessons[makeLessonKey(book.id, unit.id, chapter.id, l.id)]
        ).length

        return (
          <div key={chapter.id} style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {chapter.title}
              </h2>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-dim)',
              }}>
                {chapterCompleted}/{chapter.lessons.length}
              </span>
            </div>

            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}>
              <div style={{
                width: `${(chapterCompleted / chapter.lessons.length) * 100}%`,
                height: '100%',
                background: book.color,
                borderRadius: '4px',
                transition: 'width 0.5s ease',
              }} />
            </div>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: '0 0 12px 0',
              lineHeight: 1.4,
            }}>
              {chapter.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chapter.lessons.map((lesson, lIdx) => {
                const key = makeLessonKey(book.id, unit.id, chapter.id, lesson.id)
                const isCompleted = game.completedLessons[key]
                const bestScore = game.lessonBestScores[key]
                const completionCount = game.lessonCompletionCount[key] || 0
                const MASTERY_REQUIRED = 5
                const fullyMastered = completionCount >= MASTERY_REQUIRED

                return (
                  <button
                    key={lesson.id}
                    className="card-enter-stagger btn-pop"
                    onClick={() => { playSfx('button_click'); selectLesson(lesson.id, chapter.id) }}
                    style={{
                      animationDelay: `${lIdx * 45}ms`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 20px',
                      background: fullyMastered ? 'rgba(88,204,2,0.12)' : isCompleted ? 'rgba(88,204,2,0.06)' : 'var(--bg-card)',
                      border: `2px solid ${fullyMastered ? '#58CC02' : isCompleted ? '#58CC02' : 'var(--border)'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: fullyMastered ? '#58CC02' : isCompleted ? '#58CC02' : 'var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}>
                      {fullyMastered ? '★' : isCompleted ? '✓' : lesson.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: fullyMastered ? '#3F9A02' : isCompleted ? '#58CC02' : 'var(--text)',
                      }}>
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {lesson.description}
                      </div>
                      {completionCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                          {Array.from({ length: MASTERY_REQUIRED }).map((_, i) => (
                            <div key={i} style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: i < completionCount ? '#58CC02' : 'var(--border)',
                            }} />
                          ))}
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '2px' }}>
                            {completionCount}/{MASTERY_REQUIRED}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      {bestScore !== undefined && (
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFF',
                          background: '#58CC02',
                          padding: '2px 8px',
                          borderRadius: '8px',
                        }}>
                          {bestScore}%
                        </span>
                      )}
                      <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                        {lesson.exercises.length} exercises
                      </span>
                      <span style={{ fontSize: '18px', color: 'var(--text-dim)', }}>→</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
