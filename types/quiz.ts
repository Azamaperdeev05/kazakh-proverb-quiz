export type GameMode = 'multiple_choice' | 'input' | 'time_attack' | 'daily'
export type ThemePreference = 'system' | 'light' | 'dark'
export type AppScreen = 'home' | 'game' | 'result' | 'profile' | 'leaderboard' | 'settings'

export interface ProverbItem {
  id: string
  start: string
  answer: string
  options: string[]
  meaning?: string
}

export interface QuizSettings {
  preferredTheme: ThemePreference
  inputHints: boolean
  soundEnabled: boolean
  hapticsEnabled: boolean
  lastMode: GameMode
}

export interface QuizProgress {
  learnedIds: string[]
  totalAnswered: number
  totalCorrect: number
  streakDays: number
  bestStreak: number
  gamesPlayed: number
  totalPlayTimeMs: number
  lastPlayedOn?: string
}

export interface LeaderboardEntry {
  id: string
  mode: GameMode
  score: number
  correct: number
  total: number
  playedAt: string
  durationMs: number
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
  perModeBestScores: Record<GameMode, number>
  recentResults: LeaderboardEntry[]
}

export interface QuizStatsSummary {
  accuracyRate: number
  averageScore: number
  learnedCount: number
  completionRate: number
}

export const defaultQuizSettings: QuizSettings = {
  preferredTheme: 'system',
  inputHints: true,
  soundEnabled: true,
  hapticsEnabled: true,
  lastMode: 'multiple_choice',
}

export const defaultQuizProgress: QuizProgress = {
  learnedIds: [],
  totalAnswered: 0,
  totalCorrect: 0,
  streakDays: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  totalPlayTimeMs: 0,
}

export const defaultModeScores: Record<GameMode, number> = {
  multiple_choice: 0,
  input: 0,
  time_attack: 0,
  daily: 0,
}

export const defaultStoredQuizState: StoredQuizState = {
  settings: defaultQuizSettings,
  progress: defaultQuizProgress,
  leaderboard: [],
  dailyCompletions: [],
  perModeBestScores: defaultModeScores,
  recentResults: [],
}