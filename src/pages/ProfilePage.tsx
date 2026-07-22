import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useGameStore, getLevel } from '../store/gameStore'
import { playSfx } from '../utils/sfx'
import { getLevelTitle, getMotivationalMessage, ACHIEVEMENTS, formatXp } from '../utils/gamification'
import { useBooks } from '../data/useBook'

export function ProfilePage() {
  const { game, navigate, resetProgress, toggleTheme } = useGameStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const { books, loading } = useBooks()
  const level = getLevel(game.xp)

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>

  const totalLessons = books.reduce(
    (sum, b) => sum + b.units.reduce(
      (s, u) => s + u.chapters.reduce(
        (ss, c) => ss + c.lessons.length, 0), 0), 0
  )
  const completedCount = Object.keys(game.completedLessons).length
  const accuracy = game.totalAnswered > 0
    ? Math.round((game.totalCorrect / game.totalAnswered) * 100)
    : 0

  const earnedAchievements = ACHIEVEMENTS.filter(a => {
    switch (a.id) {
      case 'first_lesson': return completedCount >= 1
      case 'ten_lessons': return completedCount >= 10
      case 'fifty_lessons': return completedCount >= 50
      case 'streak_7': return game.streak >= 7
      case 'streak_30': return game.streak >= 30
      case 'perfect_lesson': return Object.values(game.lessonBestScores).some(s => s === 100)
      case 'level_10': return game.level >= 10
      case 'level_25': return game.level >= 25
      default: return false
    }
  })

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }}>
      <button
        onClick={() => { playSfx('button_click'); navigate('home') }}
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
        ← Back to Home
      </button>

      {/* Profile Header */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '32px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          margin: '0 auto 12px',
        }}>
          🎓
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
          Korean Learner
        </h1>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'white',
          background: '#58CC02',
          padding: '4px 16px',
          borderRadius: '20px',
          display: 'inline-block',
        }}>
          Level {level} - {getLevelTitle(level)}
        </div>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          marginTop: '12px',
          fontStyle: 'italic',
        }}>
          "{getMotivationalMessage(level)}"
        </p>
      </div>

      {/* Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <label style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={game.theme === 'dark'}
            onChange={() => { playSfx('button_click'); toggleTheme() }}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
          <span style={{
            display: 'block',
            width: '56px',
            height: '32px',
            background: game.theme === 'dark' ? '#58CC02' : 'var(--border)',
            borderRadius: '16px',
            border: '2px solid var(--border)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <span style={{
              position: 'absolute',
              top: '2px',
              left: game.theme === 'dark' ? '28px' : '2px',
              width: '26px',
              height: '26px',
              background: 'white',
              borderRadius: '50%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}>
              {game.theme === 'dark' ? '🌙' : '☀️'}
            </span>
          </span>
          <span style={{
            marginLeft: '10px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text)',
          }}>
            {game.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </label>
      </div>

      {/* Stats Grid */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 12px 0' }}>
        Your Statistics
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard icon="⭐" label="Total XP" value={formatXp(game.xp)} />
        <StatCard icon="🔥" label="Streak" value={`${game.streak} days`} />
        <StatCard icon="📚" label="Lessons" value={`${completedCount}/${totalLessons}`} />
        <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`} />
        <StatCard icon="🏆" label="Level" value={String(level)} />
      </div>

      {/* Achievements */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 12px 0' }}>
        Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
      </h2>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ACHIEVEMENTS.map((a) => {
            const earned = earnedAchievements.find(e => e.id === a.id)
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '12px',
                  background: earned ? 'rgba(88,204,2,0.08)' : 'var(--bg-card)',
                  opacity: earned ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: '28px' }}>{earned ? a.icon : '🔒'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: earned ? 'var(--text)' : 'var(--text-muted)',
                  }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {a.description}
                  </div>
                </div>
                {earned && <span style={{ fontSize: '14px', color: '#58CC02' }}>+{a.xpReward} XP</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress per Book */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 12px 0' }}>
        Course Progress
      </h2>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}>
        {books.map((book) => {
          const completed = book.units.reduce(
            (s, u) => s + u.chapters.reduce(
              (ss, c) => ss + c.lessons.filter(l =>
                game.completedLessons[`${book.id}-${u.id}-${c.id}-${l.id}`]
              ).length, 0), 0)
          const total = book.units.reduce(
            (s, u) => s + u.chapters.reduce(
              (ss, c) => ss + c.lessons.length, 0), 0)
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0

          return (
            <div key={book.id} style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}>
                <span>Volume {book.volume}: {book.title}</span>
                <span>{pct}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                background: 'var(--border)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: book.color,
                  borderRadius: '6px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset Button */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => { playSfx('button_click'); setShowResetConfirm(true) }}
          style={{
            padding: '10px 24px',
            background: 'var(--bg-card)',
            border: '2px solid #FF4B4B',
            borderRadius: '12px',
            color: '#FF4B4B',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset All Progress
        </button>
      </div>

      {showResetConfirm && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '24px', padding: '40px',
            textAlign: 'center', maxWidth: '400px', width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'bounceIn 0.5s ease',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>⚠️</div>
            <h2 style={{ color: '#FF4B4B', fontSize: '28px', margin: '8px 0' }}>
              Reset Progress?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
              All progress, XP, and SRS cards will be lost. This cannot be undone.
            </p>
            <button
              onClick={() => { playSfx('button_click'); resetProgress(); setShowResetConfirm(false) }}
              style={{
                width: '100%', padding: '14px', background: '#FF4B4B',
                color: 'white', border: 'none', borderRadius: '16px',
                fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 0 #CC3B3B', marginBottom: '10px',
              }}
              onMouseDown={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(2px)'; (e.target as HTMLButtonElement).style.boxShadow = '0 2px 0 #CC3B3B' }}
              onMouseUp={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(0)'; (e.target as HTMLButtonElement).style.boxShadow = '0 4px 0 #CC3B3B' }}
            >
              Reset Everything
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              style={{
                width: '100%', padding: '14px', background: 'var(--bg-card)',
                color: 'var(--text-muted)', border: '2px solid var(--border)',
                borderRadius: '16px', fontSize: '16px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      padding: '16px',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
