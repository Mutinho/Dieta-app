import type { HistoryEntry, DayOfWeek } from '../types'

export interface SlotPreference {
  dish: string
  day: DayOfWeek
  slot: 'comida' | 'cena'
  score: number
}

export function calculatePreferences(entries: HistoryEntry[]): SlotPreference[] {
  const swapped = entries.filter(e => e.hadSwaps)
  if (swapped.length < 3) return []

  // Count how many times each dish ended up in each day/slot
  const counts = new Map<string, Map<string, number>>()
  const totals = new Map<string, number>()

  for (const entry of swapped) {
    for (const [day, dp] of Object.entries(entry.distribution)) {
      for (const [slot, dish] of [['comida', dp.comida], ['cena', dp.cena]] as const) {
        const key = `${day}-${slot}`
        if (!counts.has(dish)) counts.set(dish, new Map())
        counts.get(dish)!.set(key, (counts.get(dish)!.get(key) || 0) + 1)
        totals.set(dish, (totals.get(dish) || 0) + 1)
      }
    }
  }

  const prefs: SlotPreference[] = []
  for (const [dish, slots] of counts) {
    const total = totals.get(dish)!
    for (const [key, count] of slots) {
      const score = count / total
      if (score > 0.5) {
        const [day, slot] = key.split('-') as [DayOfWeek, 'comida' | 'cena']
        prefs.push({ dish, day, slot, score })
      }
    }
  }
  return prefs
}

export function getPreferenceWeight(entriesWithSwaps: number): number {
  return Math.min(0.7, entriesWithSwaps * 0.1)
}
