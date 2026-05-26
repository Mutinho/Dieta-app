import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import type { HistoryEntry } from '../types'

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'history'), orderBy('weekStart', 'desc'))
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(d => d.data() as HistoryEntry))
      setLoading(false)
    })
  }, [])

  function getMenuCounts(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const e of entries) {
      counts[e.menuId] = (counts[e.menuId] || 0) + 1
    }
    return counts
  }

  function getEntriesByMenu(menuId: string): HistoryEntry[] {
    return entries.filter(e => e.menuId === menuId)
  }

  function getStats() {
    const total = entries.length
    const counts = getMenuCounts()
    const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

    // Racha: semanas consecutivas completadas (sin huecos)
    let streak = 0
    if (entries.length > 0) {
      const weekMs = 7 * 24 * 60 * 60 * 1000
      let expected = entries[0].weekStart
      for (const e of entries) {
        if (Math.abs(e.weekStart - expected) < weekMs * 0.5) {
          streak++
          expected -= weekMs
        } else break
      }
    }

    return {
      total,
      mostUsed: mostUsed ? { menuId: mostUsed[0], count: mostUsed[1] } : null,
      streak,
    }
  }

  return { entries, loading, getMenuCounts, getEntriesByMenu, getStats }
}
