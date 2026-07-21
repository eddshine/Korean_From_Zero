export const XP_CORRECT = 10
export const XP_STREAK_BONUS = 5
export const XP_LESSON_COMPLETE = 50
export const HEART_COST_WRONG = 1
export const HEART_REGEN_TIME = 30 * 60 * 1000

export function calculateExerciseXp(streakCount: number): number {
  return XP_CORRECT + (streakCount > 2 ? XP_STREAK_BONUS : 0)
}

export function getLevelTitle(level: number): string {
  if (level <= 5) return '초급 Beginner'
  if (level <= 10) return '초중급 Elementary'
  if (level <= 20) return '중급 Intermediate'
  if (level <= 35) return '중상급 Upper Intermediate'
  if (level <= 50) return '고급 Advanced'
  return '마스터 Master'
}

export const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'First Step', description: 'Complete your first lesson', icon: '🌱', xpReward: 50 },
  { id: 'ten_lessons', title: 'Getting Started', description: 'Complete 10 lessons', icon: '📚', xpReward: 100 },
  { id: 'fifty_lessons', title: 'Dedicated Learner', description: 'Complete 50 lessons', icon: '🎓', xpReward: 300 },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day streak', icon: '🔥', xpReward: 200 },
  { id: 'streak_30', title: 'Monthly Master', description: '30-day streak', icon: '⭐', xpReward: 500 },
  { id: 'perfect_lesson', title: 'Perfect Score', description: 'Get 100% on a lesson', icon: '💯', xpReward: 100 },
  { id: 'level_10', title: 'Double Digits', description: 'Reach level 10', icon: '🌟', xpReward: 250 },
  { id: 'level_25', title: 'Halfway There', description: 'Reach level 25', icon: '🏆', xpReward: 500 },
]

export function getFeedbackMessage(correct: boolean, streak: number): string {
  if (correct) {
    const messages = [
      '정답입니다! Correct!',
      '잘했어요! Great job!',
      '완벽해요! Perfect!',
      '멋져요! Awesome!',
      '훌륭해요! Excellent!',
    ]
    if (streak > 3) {
      return messages[streak % messages.length] + ` 🔥 ${streak}x streak!`
    }
    return messages[Math.floor(Math.random() * messages.length)]
  }
  const messages = [
    '틀렸어요. Not quite!',
    '다시 해보세요. Try again!',
    '아니에요. Keep going!',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getMotivationalMessage(level: number): string {
  if (level <= 5) return 'You\'re building a strong foundation! Keep going!'
  if (level <= 10) return 'You\'re making great progress! 화이팅!'
  if (level <= 20) return 'You\'re becoming fluent! Keep it up!'
  if (level <= 35) return 'Almost there! You\'re doing amazing!'
  return 'You\'re a Korean master! 대단해요!'
}

export function formatXp(xp: number): string {
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'K'
  }
  return xp.toString()
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
