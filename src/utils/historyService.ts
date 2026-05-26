import { doc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import type { WeekPlan, HistoryEntry } from '../types'

const HISTORY_COL = collection(db, 'history')

export async function registerCompletedWeek(plan: WeekPlan, weekStart: number, weekEnd: number) {
  const docId = `${plan.menuId}_${weekStart}`
  const entry: HistoryEntry = {
    menuId: plan.menuId,
    distribution: plan.distribution,
    weekStart,
    weekEnd,
    hadSwaps: plan.hasSwaps,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'history', docId), entry)
}

export async function getHistoryByMenu(menuId: string): Promise<HistoryEntry[]> {
  const q = query(HISTORY_COL, where('menuId', '==', menuId), orderBy('weekStart', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as HistoryEntry)
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
  const q = query(HISTORY_COL, orderBy('weekStart', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as HistoryEntry)
}
