import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameMode, LeaderboardEntry, QuizSessionResult, QuizSettings, StoredQuizState } from '@/types/quiz'
import { getTodayKey } from '@/utils/quiz'

const STORAGE_KEY = 'maqaldy-zhalghastyr-state'
const LEADERBOARD_LIMIT = 12

const defaultState: StoredQuizState = {
  settings: {
    preferredTheme: 'system',
    inputHints: true,
    soundEnabled: true,
    lastMode: 'multiple_choice',
  },
  progress: {
    learnedIds: [],
    totalAnswered: 0,
    totalCorrect: 0,
    streakDays: 0,
  },
  leaderboard: [],
  dailyCompletions: [],
}

async function readState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultState
  try {
    return { ...defaultState, ...JSON.parse(raw) } as StoredQuizState
  } catch {
    return defaultState
  }
}

async function writeState(state: StoredQuizState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export async function getStoredState() {
  return readState()
}

export async function updateSettings(patch: Partial<QuizSettings>) {
  const state = await readState()
  const next = { ...state, settings: { ...state.settings, ...patch } }
  await writeState(next)
  return next
}

export async function saveSessionResult(result: QuizSessionResult) {
  const state = await readState()
  const today = getTodayKey()
  const learnedIds = new Set(state.progress.learnedIds)
  result.answeredIds.forEach((id) => learnedIds.add(id))

  const streakDays = state.progress.lastPlayedOn === today
    ? state.progress.streakDays
    : state.progress.lastPlayedOn
      ? state.progress.streakDays + 1
      : 1

  const entry: LeaderboardEntry = {
    id: `${result.mode}-${Date.now()}`,
    mode: result.mode,
    score: result.score,
    correct: result.correct,
    total: result.total,
    playedAt: new Date().toISOString(),
  }

  const leaderboard = [...state.leaderboard, entry]
    .sort((a, b) => b.score - a.score || b.correct - a.correct)
    .slice(0, LEADERBOARD_LIMIT)

  const dailyCompletions = result.mode === 'daily'
    ? Array.from(new Set([...state.dailyCompletions, today])).slice(-30)
    : state.dailyCompletions

  const next: StoredQuizState = {
    settings: state.settings,
    leaderboard,
    dailyCompletions,
    progress: {
      learnedIds: Array.from(learnedIds),
      totalAnswered: state.progress.totalAnswered + result.total,
      totalCorrect: state.progress.totalCorrect + result.correct,
      streakDays,
      lastPlayedOn: today,
    },
  }

  await writeState(next)
  return next
}

export async function getBestScore(mode: GameMode) {
  const state = await readState()
  return state.leaderboard.filter((entry) => entry.mode === mode)[0]?.score ?? 0
}
