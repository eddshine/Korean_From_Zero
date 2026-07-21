import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dbStorage } from './dbStorage'

import { GameState, NavigationState, AppPage, SRSCard } from '../types'
import { ACHIEVEMENTS } from '../utils/gamification'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function srsCardId(korean: string, bookId: number, lessonId: number): string {
  return `${bookId}-${lessonId}-${korean.replace(/\s+/g, '_')}`
}

export function calcNextReview(prevInterval: number, prevEase: number, quality: 1 | 2 | 3 | 4): { interval: number; ease: number; repetitions: number } {
  if (quality <= 2) {
    return { interval: 1, ease: Math.max(1.3, prevEase - 0.2), repetitions: 0 }
  }
  const newEase = quality === 4 ? Math.min(3.0, prevEase + 0.15) : prevEase
  let reps = 0
  let interval = 1
  if (prevInterval <= 1) {
    reps = 1
    interval = 1
  } else if (prevInterval <= 6) {
    reps = 2
    interval = 6
  } else {
    reps = 3
    interval = Math.round(prevInterval * newEase)
  }
  return { interval, ease: newEase, repetitions: reps }
}

interface GameStore {
  game: GameState
  nav: NavigationState
  srs: { cards: SRSCard[] }

  addXp: (amount: number) => void
  completeLesson: (lessonKey: string, score: number) => void
  updateStreak: () => void

  navigate: (page: AppPage) => void
  selectBook: (bookId: number) => void
  selectUnit: (unitId: number) => void
  selectChapter: (chapterId: number) => void
  selectLesson: (lessonId: number, chapterId?: number) => void
  setExerciseIndex: (index: number) => void
  resetNav: () => void

  showLeaveConfirm: boolean
  pendingNav: AppPage | null
  requestLeave: (target: AppPage) => void
  confirmLeave: () => void
  cancelLeave: () => void

  addToSRS: (korean: string, english: string, bookId: number, unitId: number, chapterId: number, lessonId: number) => void
  reviewCard: (cardId: string, quality: 1 | 2 | 3 | 4) => void
  getDueCards: () => SRSCard[]
  checkNewAchievements: (completedCount: number) => string[]
  resetProgress: () => void
  toggleTheme: () => void
}

const XP_PER_LEVEL = 100
const LESSON_MASTERY_REQUIRED = 5

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getXpForNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL)
}

const defaultGame: GameState = {
  xp: 0,
  level: 1,
  theme: 'light',

  streak: 0,
  lastPlayedDate: null,
  completedLessons: {},
  lessonBestScores: {},
  lessonCompletionCount: {},
  totalCorrect: 0,
  totalAnswered: 0,
  notifiedAchievements: [],
}

const defaultNav: NavigationState = {
  page: 'home',
  selectedBookId: null,
  selectedUnitId: null,
  selectedChapterId: null,
  selectedLessonId: null,
  currentExerciseIndex: 0,
}

const defaultSRS = { cards: [] }

export const useGameStore = create<GameStore>()(
  persist(
  (set, get) => ({
    game: defaultGame,
    nav: defaultNav,
      srs: defaultSRS,

      showLeaveConfirm: false,
      pendingNav: null,

      addXp: (amount: number) => {
        set((state) => {
          const newXp = state.game.xp + amount
          const newLevel = getLevel(newXp)
          return {
            game: {
              ...state.game,
              xp: newXp,
              level: newLevel,
            },
          }
        })
      },

      
      completeLesson: (lessonKey: string, score: number) => {
        set((state) => {
          const best = state.game.lessonBestScores[lessonKey] || 0
          const currentCount = state.game.lessonCompletionCount[lessonKey] || 0
          const newCount = currentCount + 1
          return {
            game: {
              ...state.game,
              completedLessons: {
                ...state.game.completedLessons,
                [lessonKey]: newCount >= LESSON_MASTERY_REQUIRED,
              },
              lessonBestScores: {
                ...state.game.lessonBestScores,
                [lessonKey]: Math.max(best, score),
              },
              lessonCompletionCount: {
                ...state.game.lessonCompletionCount,
                [lessonKey]: newCount,
              },
            },
          }
        })
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => {
          const lastPlayed = state.game.lastPlayedDate
          let newStreak = state.game.streak

          if (lastPlayed === today) {
            return state
          }

          if (lastPlayed) {
            const lastDate = new Date(lastPlayed)
            const diffDays = Math.floor(
              (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            if (diffDays === 1) {
              newStreak += 1
            } else {
              newStreak = 1
            }
          } else {
            newStreak = 1
          }

          return {
            game: {
              ...state.game,
              streak: newStreak,
              lastPlayedDate: today,
            },
          }
        })
      },

      navigate: (page: AppPage) => {
        set((state) => ({
          nav: { ...state.nav, page },
        }))
      },

      selectBook: (bookId: number) => {
        set((state) => ({
          nav: {
            ...state.nav,
            page: 'units',
            selectedBookId: bookId,
            selectedUnitId: null,
            selectedChapterId: null,
            selectedLessonId: null,
            currentExerciseIndex: 0,
          },
        }))
      },

      selectUnit: (unitId: number) => {
        set((state) => ({
          nav: {
            ...state.nav,
            page: 'lessons',
            selectedUnitId: unitId,
            selectedChapterId: null,
            selectedLessonId: null,
            currentExerciseIndex: 0,
          },
        }))
      },

      selectChapter: (chapterId: number) => {
        set((state) => ({
          nav: {
            ...state.nav,
            page: 'lessons',
            selectedChapterId: chapterId,
            selectedLessonId: null,
            currentExerciseIndex: 0,
          },
        }))
      },

      selectLesson: (lessonId: number, chapterId?: number) => {
        set((state) => ({
          nav: {
            ...state.nav,
            page: 'exercise',
            selectedChapterId: chapterId ?? state.nav.selectedChapterId,
            selectedLessonId: lessonId,
            currentExerciseIndex: 0,
          },
        }))
      },

      setExerciseIndex: (index: number) => {
        set((state) => ({
          nav: {
            ...state.nav,
            currentExerciseIndex: index,
          },
        }))
      },

      resetNav: () => {
        set({ nav: defaultNav })
      },

      requestLeave: (target: AppPage) => {
        const state = get()
        if (state.nav.page === 'exercise') {
          set({ showLeaveConfirm: true, pendingNav: target })
        } else {
          set((s) => ({ nav: { ...s.nav, page: target } }))
        }
      },

      confirmLeave: () => {
        const state = get()
        const target = state.pendingNav ?? 'home'
        set((s) => ({
          nav: { ...s.nav, page: target, currentExerciseIndex: 0 },
          showLeaveConfirm: false,
          pendingNav: null,
        }))
      },

      cancelLeave: () => {
        set({ showLeaveConfirm: false, pendingNav: null })
      },

      addToSRS: (korean: string, english: string, bookId: number, unitId: number, chapterId: number, lessonId: number) => {
        const id = srsCardId(korean, bookId, lessonId)
        const state = get()
        const existing = state.srs.cards.find(c => c.id === id)
        if (existing) {
          set({
            srs: {
              cards: state.srs.cards.map(c =>
                c.id === id
                  ? { ...c, interval: 1, ease: Math.max(1.3, c.ease - 0.2), repetitions: 0, nextReview: todayStr() }
                  : c
              ),
            },
          })
        } else {
          set({
            srs: {
              cards: [...state.srs.cards, {
                id,
                front: korean,
                back: english,
                korean,
                bookId,
                unitId,
                chapterId,
                lessonId,
                interval: 1,
                ease: 2.5,
                repetitions: 0,
                nextReview: todayStr(),
                lastReviewed: null,
              }],
            },
          })
        }
      },

      reviewCard: (cardId: string, quality: 1 | 2 | 3 | 4) => {
        const state = get()
        const card = state.srs.cards.find(c => c.id === cardId)
        if (!card) return
        const { interval, ease, repetitions } = calcNextReview(card.interval, card.ease, quality)
        set({
          srs: {
            cards: state.srs.cards.map(c =>
              c.id === cardId
                ? { ...c, interval, ease, repetitions, nextReview: daysFromNow(interval), lastReviewed: todayStr() }
                : c
            ),
          },
        })
      },

      getDueCards: () => {
        const today = todayStr()
        return get().srs.cards.filter(c => c.nextReview <= today).sort((a, b) => a.nextReview.localeCompare(b.nextReview))
      },

      checkNewAchievements: (completedCount: number) => {
        const state = get()
        const newlyEarned: string[] = []
        for (const a of ACHIEVEMENTS) {
          if (state.game.notifiedAchievements.includes(a.id)) continue
          let earned = false
          switch (a.id) {
            case 'first_lesson': earned = completedCount >= 1; break
            case 'ten_lessons': earned = completedCount >= 10; break
            case 'fifty_lessons': earned = completedCount >= 50; break
            case 'streak_7': earned = state.game.streak >= 7; break
            case 'streak_30': earned = state.game.streak >= 30; break
            case 'perfect_lesson': earned = Object.values(state.game.lessonBestScores).some(s => s === 100); break
            case 'level_10': earned = state.game.level >= 10; break
            case 'level_25': earned = state.game.level >= 25; break
          }
          if (earned) {
            newlyEarned.push(a.id)
          }
        }
        if (newlyEarned.length > 0) {
          set((s) => ({
            game: {
              ...s.game,
              notifiedAchievements: [...s.game.notifiedAchievements, ...newlyEarned],
            },
          }))
        }
        return newlyEarned
      },

      resetProgress: () => {
        set({ game: defaultGame, srs: defaultSRS })
      },

      toggleTheme: () => {
        set((state) => ({
          game: {
            ...state.game,
            theme: state.game.theme === 'light' ? 'dark' : 'light',
          },
        }))
      },
    }), {
      name: 'korean-app-storage',
      storage: dbStorage,
      partialize: (state) => ({
        game: state.game,
        srs: state.srs,
      }),
    }))

