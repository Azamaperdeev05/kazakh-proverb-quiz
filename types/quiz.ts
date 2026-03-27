export type GameMode = 'multiple_choice' | 'input' | 'time_attack' | 'daily'

export interface ProverbItem {
  id: string
  start: string
  answer: string
  options: string[]
  meaning?: string
}

export interface QuizSettings {
  preferredTheme: 'system' | 'light' | 'dark'
  inputHints: boolean
  soundEnabled: boolean
  lastMode: GameMode
}

export interface QuizProgress {
  learnedIds: string[]
  totalAnswered: number
  totalCorrect: number
  streakDays: number
  lastPlayedOn?: string
}

export interface LeaderboardEntry {
  id: string
  mode: GameMode
  score: number
  correct: number
  total: number
  playedAt: string
}

export interface QuizSessionResult {
  mode: GameMode
  score: number
  correct: number
  total: number
  answeredIds: string[]
  durationMs: number
}

export interface StoredQuizState {
  settings: QuizSettings
  progress: QuizProgress
  leaderboard: LeaderboardEntry[]
  dailyCompletions: string[]
 }
