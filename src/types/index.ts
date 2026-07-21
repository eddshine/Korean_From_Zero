export interface Book {
  id: number
  title: string
  subtitle: string
  volume: number
  color: string
  units: Unit[]
}

export interface Unit {
  id: number
  title: string
  description: string
  chapters: Chapter[]
}

export interface Chapter {
  id: number
  title: string
  description: string
  lessons: Lesson[]
}

export interface Lesson {
  id: number
  title: string
  description: string
  exercises: Exercise[]
  completed: boolean
}

export interface Exercise {
  id: number
  type: 'multiple-choice' | 'translation' | 'word-order' | 'fill-blank' | 'listening'
  question: string
  korean?: string
  options?: string[]
  optionKor?: string[]
  correctAnswer: string | string[]
  audioUrl?: string
  hint?: string
  explanation?: string
}

export interface GameState {
  xp: number
  level: number
  theme: 'light' | 'dark'

  streak: number
  lastPlayedDate: string | null
  completedLessons: Record<string, boolean>
  lessonBestScores: Record<string, number>
  lessonCompletionCount: Record<string, number>
  totalCorrect: number
  totalAnswered: number
  notifiedAchievements: string[]
}

export interface SRSCard {
  id: string
  front: string
  back: string
  korean: string
  bookId: number
  unitId: number
  chapterId: number
  lessonId: number
  interval: number
  ease: number
  repetitions: number
  nextReview: string
  lastReviewed: string | null
}

export interface SRSState {
  cards: SRSCard[]
}

export type AppPage = 'home' | 'books' | 'units' | 'lessons' | 'exercise' | 'profile' | 'review'

export interface NavigationState {
  page: AppPage
  selectedBookId: number | null
  selectedUnitId: number | null
  selectedChapterId: number | null
  selectedLessonId: number | null
  currentExerciseIndex: number
}
