import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { WeekPlan, WeekDistribution, DayOfWeek } from '../types'

const DOC_REF = doc(db, 'weekPlans', 'current')

export function useWeekPlan() {
  const [plan, setPlan] = useState<WeekPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onSnapshot(DOC_REF, (snap) => {
      setPlan(snap.exists() ? (snap.data() as WeekPlan) : null)
      setLoading(false)
    })
  }, [])

  async function selectMenu(menuId: string, distribution: WeekDistribution) {
    const weekPlan: WeekPlan = { menuId, distribution, updatedAt: Date.now() }
    await setDoc(DOC_REF, weekPlan)
  }

  async function swapMeals(
    dayA: DayOfWeek, slotA: 'comida' | 'cena',
    dayB: DayOfWeek, slotB: 'comida' | 'cena'
  ) {
    if (!plan) return
    const dist = { ...plan.distribution }
    dist[dayA] = { ...dist[dayA] }
    dist[dayB] = { ...dist[dayB] }
    const temp = dist[dayA][slotA]
    dist[dayA][slotA] = dist[dayB][slotB]
    dist[dayB][slotB] = temp
    await setDoc(DOC_REF, { ...plan, distribution: dist, updatedAt: Date.now() })
  }

  return { plan, loading, selectMenu, swapMeals }
}
