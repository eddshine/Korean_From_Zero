import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useGameStore } from '../store/gameStore'
import { makeLessonKey } from '../data'
import { useBook, useUnit, useChapter, useLesson } from '../data/useBook'
import { ExerciseCard } from '../components/ExerciseCard'
import { LevelUpModal } from '../components/LevelUpModal'
import { Confetti } from '../components/Confetti'
import { calculateExerciseXp, XP_LESSON_COMPLETE, getFeedbackMessage, shuffle } from '../utils/gamification'
import { playSfx } from '../utils/sfx'
import { ProgressBar } from '../components/ProgressBar'

export function ExercisePage() {
  const {
    nav,
    game,
    addXp,
    completeLesson,
    updateStreak,
    setExerciseIndex,
    navigate,
    selectChapter,
    addToSRS,
    checkNewAchievements,
    requestLeave,
  } = useGameStore()

  const { book } = useBook(nav.selectedBookId)
  const { unit } = useUnit(nav.selectedBookId, nav.selectedUnitId)
  const { chapter } = useChapter(nav.selectedBookId, nav.selectedUnitId, nav.selectedChapterId)
  const { lesson, loading: lessonLoading } = useLesson(
    nav.selectedBookId,
    nav.selectedUnitId,
    nav.selectedChapterId,
    nav.selectedLessonId
  )

  const [feedback, setFeedback] = useState<{ message: string; correct: boolean } | null>(null)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [lessonScore, setLessonScore] = useState(0)
  const [lessonCorrect, setLessonCorrect] = useState(0)
  const [lessonTotal, setLessonTotal] = useState(0)
  const [lessonComplete, setLessonComplete] = useState(false)
  const [pendingXp, setPendingXp] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [prevLevel, setPrevLevel] = useState(game.level)
  const [pendingGradeSfx, setPendingGradeSfx] = useState<string | null>(null)
  const [sessionSeed] = useState(() => Math.random())

  const exercises = useMemo(() => {
    const raw = lesson?.exercises ?? []
    const shuffled = shuffle(raw)
    return shuffled.map(ex => ({
      ...ex,
      options: ex.options ? shuffle(ex.options) : undefined,
    }))
  }, [lesson?.id, sessionSeed])

  const currentIndex = nav.currentExerciseIndex
  const currentExercise = exercises[currentIndex]
  const isLast = currentIndex >= exercises.length - 1

  const handleAnswer = useCallback((correct: boolean) => {
    playSfx(correct ? 'correct' : 'wrong')
    updateStreak()

    const xpEarned = correct ? calculateExerciseXp(consecutiveCorrect + 1) : 0

    if (correct) {
      setConsecutiveCorrect(prev => prev + 1)
      setPendingXp(prev => prev + xpEarned)
      setLessonCorrect(prev => prev + 1)
    } else {
      setConsecutiveCorrect(0)
      const ex = currentExercise
      if (ex?.korean && typeof ex.correctAnswer === 'string') {
        addToSRS(
          ex.korean,
          ex.correctAnswer,
          nav.selectedBookId ?? 0,
          nav.selectedUnitId ?? 0,
          nav.selectedChapterId ?? 0,
          nav.selectedLessonId ?? 0
        )
      }
    }
    setLessonTotal(prev => prev + 1)
    setLessonScore(prev => prev + (correct ? 1 : 0))

    setFeedback({
      message: getFeedbackMessage(correct, correct ? consecutiveCorrect + 1 : 0),
      correct,
    })
  }, [consecutiveCorrect, updateStreak])

  const handleNext = useCallback(() => {
    setFeedback(null)

    if (isLast) {
      const lessonKey = makeLessonKey(
        nav.selectedBookId ?? 0,
        nav.selectedUnitId ?? 0,
        nav.selectedChapterId ?? 0,
        nav.selectedLessonId ?? 0
      )

      const totalExercises = exercises.length
      const pctScore = totalExercises > 0
        ? Math.round((lessonCorrect / totalExercises) * 100)
        : 0

      addXp(pendingXp + XP_LESSON_COMPLETE)
      completeLesson(lessonKey, pctScore)

      setLessonComplete(true)
      setPendingXp(0)

      const newLevel = useGameStore.getState().game.level
      const willLevelUp = newLevel > prevLevel

      if (pctScore >= 100) {
        if (willLevelUp) setPendingGradeSfx('High_Score')
        else playSfx('High_Score')
      } else if (pctScore >= 80) {
        if (willLevelUp) setPendingGradeSfx('High_Score')
        else playSfx('High_Score')
      }

      if (willLevelUp) {
        setTimeout(() => setShowLevelUp(true), 500)
        setPrevLevel(newLevel)
      }

      const totalCompleted = Object.keys(useGameStore.getState().game.completedLessons).length
      const newAchievements = checkNewAchievements(totalCompleted)
      for (const id of newAchievements) {
        if (id === 'streak_7' || id === 'streak_30') {
          playSfx('Streak_milestone')
        } else {
          playSfx('achievement_unlocked')
        }
      }
    } else {
      setExerciseIndex(currentIndex + 1)
    }
  }, [isLast, nav, addXp, completeLesson, setExerciseIndex, exercises.length, lessonCorrect, lessonTotal, pendingXp, prevLevel])

  if (lessonLoading || !lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }

  if (!book || !unit || !chapter || !currentExercise) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Content not found
      </div>
    )
  }

  if (lessonComplete) {
    const pct = lessonTotal > 0 ? Math.round((lessonCorrect / lessonTotal) * 100) : 0
    let grade = '❌'
    let gradeColor = '#FF4B4B'
    if (pct >= 100) { grade = '🌟'; gradeColor = '#58CC02' }
    else if (pct >= 80) { grade = '🌟'; gradeColor = '#58CC02' }
    else if (pct >= 60) { grade = '👍'; gradeColor = '#1CB0F6' }
    else if (pct >= 40) { grade = '💪'; gradeColor = '#FF9600' }

    return (
      <>
        {createPortal(<Confetti />, document.body)}
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '20px' }}>
          <div className="card-enter" style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div className="star-pop" style={{ fontSize: '64px', marginBottom: '8px' }}>{grade}</div>
            <h2 style={{ color: 'var(--text)', fontSize: '24px', margin: '0 0 8px 0' }}>
              Lesson Complete!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px 0' }}>
              {lesson.title}
            </p>

            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `6px solid ${gradeColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
              fontWeight: 800,
              color: gradeColor,
            }}>
              {pct}%
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginBottom: '24px',
            }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#58CC02' }}>
                  {lessonCorrect}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF4B4B' }}>
                  {lessonTotal - lessonCorrect}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wrong</div>
              </div>
            </div>

            <button
              onClick={() => {
                playSfx('button_click')
                setLessonComplete(false)
                setLessonScore(0)
                setLessonCorrect(0)
                setLessonTotal(0)
                setConsecutiveCorrect(0)
                selectChapter(chapter.id)
              }}
              className="btn-pop"
              style={{
                width: '100%',
                padding: '14px',
                background: '#58CC02',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 0 #3F9A02',
                marginBottom: '12px',
              }}
            >
              Back to Lessons
            </button>
            <button
              onClick={() => { playSfx('button_click'); navigate('home') }}
              className="btn-pop"
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
        {showLevelUp && createPortal(
          <LevelUpModal
            level={game.level}
            onClose={() => {
              setShowLevelUp(false)
              if (pendingGradeSfx) {
                playSfx(pendingGradeSfx)
                setPendingGradeSfx(null)
              }
            }}
          />,
          document.body
        )}
      </>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Top Bar with progress */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <button
            onClick={() => { playSfx('leave_game'); requestLeave('lessons') }}
            className="btn-pop"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-muted)',
            }}
          >
            ✕
          </button>

          <ProgressBar
            value={currentIndex + 1}
            max={exercises.length}
            color="#58CC02"
            height={12}
          />
        </div>

        {/* Feedback Banner */}
        <div style={{ height: '48px', maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {feedback && (
            <div className="banner-enter" style={{
              padding: '12px 20px',
              borderRadius: '16px',
              background: feedback.correct ? '#E6F7E6' : '#FFE6E6',
              color: feedback.correct ? '#58CC02' : '#FF4B4B',
              fontWeight: 700,
              fontSize: '15px',
              textAlign: 'center',
              width: '100%',
            }}>
              {feedback.message}
            </div>
          )}
        </div>

        {/* Lesson Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {lesson.title} • Exercise {currentIndex + 1} of {exercises.length}
          </span>
        </div>
      </div>

      <ExerciseCard
        key={currentExercise.id}
        exercise={currentExercise}
        onAnswer={handleAnswer}
        onNext={handleNext}
        isLast={isLast}
      />

      {showLevelUp && createPortal(
        <LevelUpModal
          level={game.level}
          onClose={() => {
            setShowLevelUp(false)
            if (pendingGradeSfx) {
              playSfx(pendingGradeSfx)
              setPendingGradeSfx(null)
            }
          }}
        />,
        document.body
      )}

    </div>
  )
}
