import { useEffect, useState, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useGameStore } from './store/gameStore'
import { Header } from './components/Header'
import { TitleBar } from './components/TitleBar'
import { playSfx } from './utils/sfx'
import { HomePage } from './pages/HomePage'

const BookPage = lazy(() => import('./pages/BookPage').then(m => ({ default: m.BookPage })))
const LessonPage = lazy(() => import('./pages/LessonPage').then(m => ({ default: m.LessonPage })))
const ExercisePage = lazy(() => import('./pages/ExercisePage').then(m => ({ default: m.ExercisePage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const ReviewPage = lazy(() => import('./pages/ReviewPage').then(m => ({ default: m.ReviewPage })))

export default function App() {
  const { nav, showLeaveConfirm, cancelLeave, confirmLeave, game } = useGameStore()
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark')
    document.body.classList.add(`theme-${game.theme}`)
  }, [game.theme])

  useEffect(() => {
    const api = (window as any).electronAPI
    if (api?.onConfirmClose) {
      api.onConfirmClose(() => { playSfx('leave_game'); setShowQuitConfirm(true) })
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') { e.preventDefault(); return }
      if (e.key === 'Tab') { e.preventDefault(); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const renderPage = () => {
    switch (nav.page) {
      case 'home':
        return <HomePage />
      case 'units':
        return <BookPage />
      case 'lessons':
        return <LessonPage />
      case 'exercise':
        return <ExercisePage />
      case 'review':
        return <ReviewPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <HomePage />
    }
  }

  return showSplash ? (
    <div className={`theme-${game.theme}`} style={{ height: '100vh', background: 'var(--bg)' }}>
      <div style={{
        height: '100%', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={`img/kfz_screen_${game.theme}.png`} alt="" style={{ height: '30vh', width: 'auto', maxWidth: '60%' }} />
        <div style={{
          width: '36px', height: '36px',
          marginTop: '30px',
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--text-muted)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    </div>
  ) : (
    <div className={`theme-${game.theme}`} style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: 'var(--text)',
    }}>
      <TitleBar />
      <Header />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <main style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '36px', height: '36px', border: '4px solid var(--border)', borderTop: '4px solid var(--text-muted)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
            <div key={nav.page} className="page-enter">
              {renderPage()}
            </div>
          </Suspense>
        </main>
      </div>

      {showQuitConfirm && createPortal(
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
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>🚪</div>
            <h2 style={{ color: 'var(--text)', fontSize: '28px', margin: '8px 0' }}>
              Quit App?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
              Are you sure you want to close the app?
            </p>
            <button
              onClick={() => { playSfx('button_click'); const api = (window as any).electronAPI; api?.forceClose() }}
              style={{
                width: '100%', padding: '14px', background: '#FF4B4B',
                color: 'white', border: 'none', borderRadius: '16px',
                fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 0 #CC3B3B', marginBottom: '10px',
              }}
              onMouseDown={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(2px)'; (e.target as HTMLButtonElement).style.boxShadow = '0 2px 0 #CC3B3B' }}
              onMouseUp={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(0)'; (e.target as HTMLButtonElement).style.boxShadow = '0 4px 0 #CC3B3B' }}
            >
              Quit
            </button>
            <button
              onClick={() => { playSfx('button_click'); setShowQuitConfirm(false) }}
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

      {showLeaveConfirm && createPortal(
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
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>🚪</div>
            <h2 style={{ color: 'var(--text)', fontSize: '28px', margin: '8px 0' }}>
              Leave Lesson?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
              Progress will not be saved.
            </p>
            <button
              onClick={() => { playSfx('button_click'); confirmLeave() }}
              style={{
                width: '100%', padding: '14px', background: '#FF4B4B',
                color: 'white', border: 'none', borderRadius: '16px',
                fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 0 #CC3B3B', marginBottom: '10px',
              }}
              onMouseDown={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(2px)'; (e.target as HTMLButtonElement).style.boxShadow = '0 2px 0 #CC3B3B' }}
              onMouseUp={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(0)'; (e.target as HTMLButtonElement).style.boxShadow = '0 4px 0 #CC3B3B' }}
            >
              Leave Anyway
            </button>
            <button
              onClick={() => { playSfx('button_click'); cancelLeave() }}
              style={{
                width: '100%', padding: '14px', background: 'var(--bg-card)',
                color: 'var(--text-muted)', border: '2px solid var(--border)',
                borderRadius: '16px', fontSize: '16px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Stay
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
