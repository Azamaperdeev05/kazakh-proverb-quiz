import type { GameMode, ProverbItem } from '@/types/quiz'

export function shuffleArray<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('kk-KZ')
    .replace(/[\.,!?;:()"'«»—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function similarityScore(a: string, b: string) {
  const left = normalizeText(a)
  const right = normalizeText(b)
  if (!left || !right) return 0
  if (left === right) return 1

  const dp = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0))
  for (let i = 0; i <= left.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= right.length; j += 1) dp[0][j] = j

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  return 1 - dp[left.length][right.length] / Math.max(left.length, right.length)
}

export function isAcceptedInput(input: string, answer: string, threshold = 0.85) {
  return similarityScore(input, answer) >= threshold
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function seededIndex(seed: string, index: number, modulo: number) {
  let hash = 0
  const source = `${seed}-${index}`
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 2147483647
  }
  return Math.abs(hash) % modulo
}

export function getDailyQuestions(items: ProverbItem[], count = 5) {
  const seed = getTodayKey()
  const pool = [...items]
  const picked: ProverbItem[] = []

  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = seededIndex(seed, i, pool.length)
    picked.push(pool.splice(index, 1)[0])
  }

  return picked
}

export function getQuestionsForMode(items: ProverbItem[], mode: GameMode) {
  if (mode === 'daily') return getDailyQuestions(items, 5)
  if (mode === 'time_attack') return shuffleArray(items)
  if (mode === 'input') return shuffleArray(items).slice(0, 12)
  return shuffleArray(items).slice(0, 10)
}

export function getPerformanceMessage(score: number, ratio: number) {
  if (ratio >= 0.9) return `Тамаша нәтиже! ${score} ұпаймен нағыз мақал шеберісіз.`
  if (ratio >= 0.7) return `Керемет! Мақалдарды жақсы білесіз, тағы бір айналым жасап көріңіз.`
  if (ratio >= 0.5) return `Жақсы бастама! Тағы ойнап, нәтижеңізді көтере аласыз.`
  return 'Жаттығуды жалғастырыңыз — әр мақал жаңа тәжірибе береді.'
}

export function getHintText(answer: string) {
  const words = answer.split(' ')
  return words.map((word, index) => (index === 0 ? word.slice(0, Math.min(3, word.length)) + '…' : '…')).join(' ')
}
