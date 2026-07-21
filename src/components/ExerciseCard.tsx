import { useState, useCallback, useEffect, useRef } from 'react'
import { Exercise } from '../types'
import { audioMap } from '../data/audioMap'
import { playSfx } from '../utils/sfx'

interface Props {
  exercise: Exercise
  onAnswer: (correct: boolean) => void
  onNext: () => void
  isLast: boolean
}

export function ExerciseCard({ exercise, onAnswer, onNext, isLast }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [userInput, setUserInput] = useState('')
  const [wordOrderSelected, setWordOrderSelected] = useState<string[]>([])
  const [remainingWords, setRemainingWords] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ca = exercise.correctAnswer
  const correctAnswerStr: string = Array.isArray(ca) ? ca.join(' ') : ca

  useEffect(() => {
    setSelected(null)
    setUserInput('')
    setWordOrderSelected([])
    setShowResult(false)
    setShowHint(false)
    if (exercise.type === 'word-order' && Array.isArray(exercise.correctAnswer)) {
      const shuffled = [...exercise.correctAnswer].sort(() => Math.random() - 0.5)
      setRemainingWords(shuffled)
    }
    if (exercise.type === 'translation' || exercise.type === 'fill-blank') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [exercise])

  const checkAnswer = useCallback((userAnswer: string): boolean => {
    if (exercise.type === 'word-order') {
      return userAnswer === correctAnswerStr
    }
    const ca = exercise.correctAnswer
    if (Array.isArray(ca)) {
      return ca.some(a => userAnswer.trim().toLowerCase() === a.trim().toLowerCase())
    }
    return userAnswer.trim().toLowerCase() === ca.trim().toLowerCase()
  }, [exercise, correctAnswerStr])

  const handleSubmit = useCallback(() => {
    if (showResult) return

    let userAnswer = ''
    if (exercise.type === 'multiple-choice' && selected) {
      userAnswer = selected
    } else if ((exercise.type === 'translation' || exercise.type === 'fill-blank' || exercise.type === 'listening') && userInput) {
      userAnswer = userInput
    } else if (exercise.type === 'word-order') {
      userAnswer = wordOrderSelected.join(' ')
    } else {
      return
    }

    const correct = checkAnswer(userAnswer)
    setIsCorrect(correct)
    setShowResult(true)
    onAnswer(correct)
  }, [exercise, selected, userInput, wordOrderSelected, checkAnswer, showResult, onAnswer])

  const handleNext = useCallback(() => {
    onNext()
  }, [onNext])

  const addWordToAnswer = (word: string) => {
    setWordOrderSelected(prev => [...prev, word])
    setRemainingWords(prev => prev.filter(w => w !== word))
  }

  const removeWordFromAnswer = (word: string, index: number) => {
    setWordOrderSelected(prev => prev.filter((_, i) => i !== index))
    setRemainingWords(prev => [...prev, word].sort(() => Math.random() - 0.5))
  }

  const getKoreanText = useCallback((): string | undefined => {
    if (exercise.korean) return exercise.korean
    const m = exercise.question.match(/[\uac00-\ud7af\u3130-\u318f]+(?:\s*[\uac00-\ud7af\u3130-\u318f]+)*/)
    return m ? m[0] : undefined
  }, [exercise])

  const playKoreanAudio = useCallback((text: string) => {
    const url = audioMap[text]
    if (url) {
      try {
        const a = new Audio(url)
        a.play().catch((e) => console.warn('audio play failed', e))
      } catch (e) {
        console.warn('audio error', e)
      }
    }
  }, [])

  const canSubmit = (): boolean => {
    if (showResult) return false
    switch (exercise.type) {
      case 'multiple-choice': return selected !== null
      case 'translation': return userInput.trim().length > 0
      case 'fill-blank': return userInput.trim().length > 0
      case 'listening': return audioPlayed && userInput.trim().length > 0
      case 'word-order': return wordOrderSelected.length === (Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer.length : 0)
      default: return false
    }
  }

  const [audioPlayed, setAudioPlayed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setAudioPlayed(false)
    if (exercise.type === 'listening' && exercise.audioUrl) {
      audioRef.current = new Audio(exercise.audioUrl)
      audioRef.current.play().catch(() => {})
    }
  }, [exercise])

  const playAudio = useCallback(() => {
    setAudioPlayed(true)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const colorByType = (type: Exercise['type']) => {
    switch (type) {
      case 'multiple-choice': return '#1CB0F6'
      case 'translation': return '#CE82FF'
      case 'word-order': return '#FF9600'
      case 'fill-blank': return '#58CC02'
      case 'listening': return '#FF4B4B'
    }
  }

  const typeLabel = (type: Exercise['type']) => {
    switch (type) {
      case 'multiple-choice': return 'Choose the answer'
      case 'translation': return 'Type the translation'
      case 'word-order': return 'Arrange the words'
      case 'fill-blank': return 'Fill in the blank'
      case 'listening': return 'Listen & Answer'
    }
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <div className="card-enter">
        <div className={showResult ? (isCorrect ? 'correct-pop' : 'wrong-wiggle') : ''} style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: colorByType(exercise.type),
          marginBottom: '8px',
        }}>
          {typeLabel(exercise.type)}
        </div>

        {exercise.korean && (
          <div style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
          }}>
            {exercise.korean}
          </div>
        )}

        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text)',
          margin: '0 0 24px 0',
          lineHeight: 1.4,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>{exercise.question}</span>
          {(() => {
            if (exercise.question.startsWith('What sound does') || exercise.question.startsWith('How do you read')) return null
            const kt = exercise.korean || getKoreanText()
            return kt ? (
              <button
                onClick={(e) => { e.stopPropagation(); playKoreanAudio(kt) }}
                className="btn-pop"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '18px', padding: '2px', lineHeight: 1,
                  color: 'var(--text-muted)', flexShrink: 0,
                }}
                title="Play audio"
              >
                🔊
              </button>
            ) : null
          })()}
        </h3>

        {/* Multiple Choice */}
        {exercise.type === 'multiple-choice' && exercise.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {exercise.options.map((opt, i) => {
              let bg = 'var(--bg-card)'
              let border = 'var(--border)'
              let color = 'var(--text)'

              const ca = exercise.correctAnswer
              const isOptCorrect = Array.isArray(ca) ? ca.includes(opt) : opt === ca
              const isWrongSelected = showResult && opt === selected && !isOptCorrect
              const isSelectedCorrect = showResult && isCorrect && opt === selected
              const isShowCorrect = showResult && !isCorrect && isOptCorrect

              if (isSelectedCorrect) {
                bg = '#E6F7E6'
                border = '#58CC02'
                color = '#58CC02'
              } else if (isShowCorrect) {
                bg = '#F0FFF0'
                border = '#58CC02'
                color = '#58CC02'
              } else if (isWrongSelected) {
                bg = '#FFE6E6'
                border = '#FF4B4B'
                color = '#FF4B4B'
              } else if (!showResult && selected === opt) {
                bg = '#F0F8FF'
                border = '#1CB0F6'
                color = '#1CB0F6'
              }

              return (
                <button
                  key={i}
                  className={`opt-pop${selected === opt && !showResult ? ' pop-on-select' : ''}`}
                  onClick={() => {
                    if (showResult) return
                    playSfx('mc_click', 0.3)
                    const ok = exercise.optionKor?.[i]
                    if (ok) playKoreanAudio(ok)
                    setSelected(opt)
                  }}
                  style={{
                    padding: '16px 20px',
                    border: `2px solid ${border}`,
                    borderRadius: '16px',
                    background: bg,
                    color,
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    boxShadow: isShowCorrect ? '0 0 12px rgba(88, 204, 2, 0.5)' : undefined,
                  }}
                >
                  <span className={showResult && isSelectedCorrect ? 'star-pop' : undefined} style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    flexShrink: 0,
                    background: showResult && isSelectedCorrect ? '#58CC02' : 'transparent',
                    color: showResult && isSelectedCorrect ? 'white' : color,
                  }}>
                    {showResult && isSelectedCorrect ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {showResult && isSelectedCorrect && (
                    <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✅</span>
                  )}
                  {showResult && isWrongSelected && (
                    <span style={{ marginLeft: 'auto', fontSize: '18px' }}>❌</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Translation / Fill Blank */}
        {(exercise.type === 'translation' || exercise.type === 'fill-blank') && (
          <div>
            {exercise.type === 'fill-blank' && exercise.korean && (
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '16px',
                padding: '16px',
                background: 'var(--bg)',
                borderRadius: '12px',
                textAlign: 'center',
                letterSpacing: '2px',
              }}>
                {exercise.korean}
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showResult) handleSubmit()
                if (e.key === 'Enter' && showResult) handleNext()
              }}
              placeholder={exercise.type === 'translation' ? 'Type your answer...' : 'Type the missing word...'}
              disabled={showResult}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '20px',
                border: `2px solid ${showResult ? (isCorrect ? '#58CC02' : '#FF4B4B') : 'var(--border)'}`,
                borderRadius: '16px',
                outline: 'none',
                background: showResult ? (isCorrect ? '#F0FFF0' : '#FFF0F0') : 'var(--bg-card)',
                color: 'var(--text)',
                fontWeight: 600,
                boxSizing: 'border-box',
              }}
            />
            {showResult && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '12px',
                background: isCorrect ? '#E6F7E6' : '#FFF0F0',
                color: isCorrect ? '#58CC02' : '#FF4B4B',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                {isCorrect ? '✓ Correct!' : <>✗ The answer: <span style={{ background: '#58CC02', color: 'white', padding: '2px 10px', borderRadius: '8px', marginLeft: '4px' }}>{correctAnswerStr}</span></>}
              </div>
            )}
          </div>
        )}

        {/* Listening */}
        {exercise.type === 'listening' && (
          <div>
            <button
              onClick={playAudio}
              className="btn-pop"
              style={{
                width: '100%',
                padding: '20px',
                background: audioPlayed ? '#FFF0F0' : '#FF4B4B',
                color: audioPlayed ? '#FF4B4B' : 'white',
                border: `2px solid ${audioPlayed ? '#FF4B4B' : '#FF4B4B'}`,
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'all 0.2s',
              }}
            >
              {audioPlayed ? '🔊 Play Again' : '▶ Play Audio'}
            </button>
            {audioPlayed && (
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !showResult) handleSubmit()
                  if (e.key === 'Enter' && showResult) handleNext()
                }}
                placeholder="Type what you heard..."
                disabled={showResult}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '20px',
                  border: `2px solid ${showResult ? (isCorrect ? '#58CC02' : '#FF4B4B') : 'var(--border)'}`,
                  borderRadius: '16px',
                  outline: 'none',
                  background: showResult ? (isCorrect ? '#F0FFF0' : '#FFF0F0') : 'var(--bg-card)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  boxSizing: 'border-box',
                }}
              />
            )}
            {showResult && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '12px',
                background: isCorrect ? '#E6F7E6' : '#FFF0F0',
                color: isCorrect ? '#58CC02' : '#FF4B4B',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                {isCorrect ? '✓ Correct!' : <>✗ The answer: <span style={{ background: '#58CC02', color: 'white', padding: '2px 10px', borderRadius: '8px', marginLeft: '4px' }}>{correctAnswerStr}</span></>}
                <div style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>
                  {exercise.korean}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Word Order */}
        {exercise.type === 'word-order' && (
          <div>
            <div style={{
              minHeight: '56px',
              padding: '12px',
              border: `2px dashed ${showResult ? (isCorrect ? '#58CC02' : '#FF4B4B') : 'var(--border)'}`,
              borderRadius: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
              background: showResult ? (isCorrect ? '#F0FFF0' : '#FFF0F0') : 'var(--bg)',
              alignItems: 'center',
            }}>
              {wordOrderSelected.length === 0 && !showResult && (
                <span style={{ color: 'var(--text-dim)', fontSize: '14px', padding: '8px' }}>
                  Tap words below to build the sentence
                </span>
              )}
              {wordOrderSelected.map((word, i) => (
                <button
                  key={`selected-${i}`}
                  onClick={() => !showResult && removeWordFromAnswer(word, i)}
                  className="btn-pop"
                  style={{
                    padding: '8px 16px',
                    background: showResult ? (isCorrect ? '#58CC02' : '#FF4B4B') : '#1CB0F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {word} {!showResult && '✕'}
                </button>
              ))}
              {showResult && !isCorrect && (
                <div style={{
                  width: '100%',
                  color: '#FF4B4B',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '4px',
                }}>
                  Correct order: <span style={{ background: '#58CC02', color: 'white', padding: '2px 10px', borderRadius: '8px', marginLeft: '4px' }}>{correctAnswerStr}</span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}>
              {remainingWords.map((word, i) => (
                <button
                  key={`remaining-${i}`}
                  onClick={() => !showResult && addWordToAnswer(word)}
                  className="btn-pop"
                  style={{
                    padding: '10px 20px',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border)',
                    color: 'var(--text)',
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hint */}
        {exercise.hint && !showResult && (
          <div style={{ marginTop: '12px' }}>
            {showHint ? (
              <div style={{
                padding: '12px',
                background: '#FFF8E1',
                borderRadius: '12px',
                color: '#FF9600',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                💡 {exercise.hint}
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="btn-pop"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '4px 0',
                }}
              >
                💡 Show hint
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className="btn-pop"
              style={{
                flex: 1,
                padding: '14px',
                background: canSubmit() ? '#58CC02' : 'var(--border)',
                color: canSubmit() ? 'white' : 'var(--text-dim)',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: canSubmit() ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit() ? '0 4px 0 #3F9A02' : 'none',
                transition: 'all 0.1s',
              }}
            >
              Check ✓
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-pop"
              style={{
                flex: 1,
                padding: '14px',
                background: '#58CC02',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 0 #3F9A02',
                transition: 'all 0.1s',
              }}
            >
              {isLast ? 'Complete Lesson 🎉' : 'Next →'}
            </button>
          )}
        </div>
      </div>

      {/* Explanation */}
      {showResult && exercise.explanation && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          fontSize: '14px',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#1CB0F6' }}>📖 Explanation:</strong> {exercise.explanation}
        </div>
      )}
      </div>
    </div>
  )
}
