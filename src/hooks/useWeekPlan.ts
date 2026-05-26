import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getMondayTimestamp, getCompletedWeeks } from '../utils/cycle'
import { registerCompletedWeek } from '../utils/historyService'
import type { WeekPlan, WeekDistribution, DayOfWeek } from '../types'

const DOC_REF = doc(db, 'weekPlans', 'current')

export function useWeekPlan() {
  const [plan, setPlan] = useState<WeekPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekCompleted, setWeekCompleted] = useState<string | null>(null)

  useEffect(() => {
    return onSnapshot(DOC_REF, async (snap) => {
      if (!snap.exists()) {
        setPlan(null)
        setLoading(false)
        return
      }
      const data = snap.data() as WeekPlan
      // Migración v1.0 → v1.1: si no tiene weekStartedAt, asignar updatedAt
      if (!data.weekStartedAt) {
        const weekStartedAt = getMondayTimestamp(new Date(data.updatedAt))
        await updateDoc(DOC_REF, { weekStartedAt, hasSwaps: data.hasSwaps ?? false })
        return
      }

      // Detección de ciclo completado
      const now = Date.now()
      const completedWeeks = getCompletedWeeks(data.weekStartedAt, now)
      if (completedWeeks > 0) {
        const weekMs = 7 * 24 * 60 * 60 * 1000
        for (let i = 0; i < completedWeeks; i++) {
          const weekStart = data.weekStartedAt + i * weekMs
          const weekEnd = weekStart + weekMs - 1
          await registerCompletedWeek(data, weekStart, weekEnd)
        }
        setWeekCompleted(data.menuId)
        setTimeout(() => setWeekCompleted(null), 3000)

        // Activar menú programado o repetir el actual
        if (data.nextMenuId && data.nextDistribution) {
          await setDoc(DOC_REF, {
            menuId: data.nextMenuId,
            distribution: data.nextDistribution,
            updatedAt: Date.now(),
            weekStartedAt: getMondayTimestamp(new Date(now)),
            hasSwaps: data.nextHasSwaps ?? false,
          })
        } else {
          await updateDoc(DOC_REF, {
            weekStartedAt: getMondayTimestamp(new Date(now)),
            hasSwaps: false,
          })
        }
        return
      }

      setPlan(data)
      setLoading(false)
    })
  }, [])

  async function selectMenu(menuId: string, distribution: WeekDistribution, mode: 'schedule' | 'now' = 'schedule') {
    if (mode === 'now' || !plan) {
      const weekPlan: WeekPlan = {
        menuId,
        distribution,
        updatedAt: Date.now(),
        weekStartedAt: getMondayTimestamp(new Date()),
        hasSwaps: false,
      }
      await setDoc(DOC_REF, weekPlan)
    } else {
      await updateDoc(DOC_REF, {
        nextMenuId: menuId,
        nextDistribution: distribution,
        nextHasSwaps: false,
        updatedAt: Date.now(),
      })
    }
  }

  async function swapMeals(
    dayA: DayOfWeek, slotA: 'comida' | 'cena',
    dayB: DayOfWeek, slotB: 'comida' | 'cena',
    target: 'current' | 'next' = 'current'
  ) {
    if (!plan) return

    if (target === 'next') {
      if (!plan.nextDistribution) return
      const dist = { ...plan.nextDistribution }
      dist[dayA] = { ...dist[dayA] }
      dist[dayB] = { ...dist[dayB] }
      const temp = dist[dayA][slotA]
      dist[dayA][slotA] = dist[dayB][slotB]
      dist[dayB][slotB] = temp
      await updateDoc(DOC_REF, { nextDistribution: dist, nextHasSwaps: true, updatedAt: Date.now() })
    } else {
      const dist = { ...plan.distribution }
      dist[dayA] = { ...dist[dayA] }
      dist[dayB] = { ...dist[dayB] }
      const temp = dist[dayA][slotA]
      dist[dayA][slotA] = dist[dayB][slotB]
      dist[dayB][slotB] = temp
      await updateDoc(DOC_REF, { distribution: dist, hasSwaps: true, updatedAt: Date.now() })
    }
  }

  return { plan, loading, selectMenu, swapMeals, weekCompleted }
}
