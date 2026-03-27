import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  defaultModeScores,
  defaultQuizProgress,
  defaultQuizSettings,
  defaultStoredQuizState,
  type GameMode,
  type LeaderboardEntry,
  type QuizSessionResult,
  type QuizSettings,
  type StoredQuizState,
} from '@/types/quiz'
import { getTodayKey } from '@/utils/quiz'

const STORAGE_KEY = 'maqaldy-zhalghastyr-state'
const LEADERBOARD_LIMIT = 20
const RECENT_RESULTS_LIMIT = 12

function normalizeState(raw: Partial<StoredQuizState> | null | undefined): StoredQuizState {
  const progress = { ...defaultQuizProgress, ...(raw?.progress ?? {}) }
  const settings = { ...defaultQuizSettings, ...(raw?.settings ?? {}) }

  return {
    settings,
    progress,
    leaderboard: Array.isArray(raw?.leaderboard) ? raw!.leaderboard : [],
    dailyCompletions: Array.isArray(raw?.dailyCompletions) ? raw!.dailyCompletions : [],
    perModeBestScores: { ...defaultModeScores, ...(raw?.perModeBestScores ?? {}) },
    recentResults: Array.isArray(raw?.recentResults) ? raw!.recentResults : [],
  }
}

export async function getStoredState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultStoredQuizState

  try {
    return normalizeState(JSON.parse(raw))
  } catch {
    return defaultStoredQuizState
  }
}

async function writeState(state: StoredQuizState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export async function updateSettings(patch: Partial<QuizSettings>) {
  const current = await getStoredState()
  const next = normalizeState({
    ...current,
    settings: { ...current.settings, ...patch },
  })
  await writeState(next)
  return next
}

export async function saveSessionResult(result: QuizSessionResult) {
  const current = await getStoredState()
  const today = getTodayKey()
  const learnedIds = Array.from(new Set([...current.progress.learnedIds, ...result.answeredIds]))
  const accuracyRate = result.total > 0 ? result.correct / result.total : 0

  const lastPlayedOn = current.progress.lastPlayedOn
  const previousDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const streakDays = lastPlayedOn === today
    ? current.progress.streakDays
    : lastPlayedOn === previousDay
      ? current.progress.streakDays + 1
      : 1

  const entry: LeaderboardEntry = {
    id: `${result.mode}-${Date.now()}`,
    mode: result.mode,
    score: result.score,
    correct: result.correct,
    total: result.total,
    playedAt: new Date().toISOString(),
    durationMs: result.durationMs,
  }

  const leaderboard = [...current.leaderboard, entry]
    .sort((a, b) => b.score - a.score || (b.correct / Math.max(1, b.total)) - (a.correct / Math.max(1, a.total)))
    .slice(0, LEADERBOARD_LIMIT)

  const recentResults = [entry, ...current.recentResults].slice(0, RECENT_RESULTS_LIMIT)
  const dailyCompletions = result.mode === 'daily'
    ? Array.from(new Set([...current.dailyCompletions, today])).slice(-30)
    : current.dailyCompletions

  const next = normalizeState({
    settings: current.settings,
    leaderboard,
    recentResults,
    dailyCompletions,
    perModeBestScores: {
      ...current.perModeBestScores,
      [result.mode]: Math.max(current.perModeBestScores[result.mode], result.score),
    },
    progress: {
      ...current.progress,
      learnedIds,
      totalAnswered: current.progress.totalAnswered + result.total,
      totalCorrect: current.progress.totalCorrect + result.correct,
      streakDays,
      bestStreak: Math.max(current.progress.bestStreak, streakDays),
      gamesPlayed: current.progress.gamesPlayed + 1,
      totalPlayTimeMs: current.progress.totalPlayTimeMs + result.durationMs,
      lastPlayedOn: today,
    },
  })

  void accuracyRate
  await writeState(next)
  return next
}

export async function getBestScore(mode: GameMode) {
  const state = await getStoredState()
  return state.perModeBestScores[mode] ?? 0
}

export async function getLeaderboard(mode?: GameMode) {
  const state = await getStoredState()
  return mode ? state.leaderboard.filter((entry) => entry.mode === mode) : state.leaderboard
}