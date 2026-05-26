export function getMondayTimestamp(date: Date): number {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function getCompletedWeeks(weekStartedAt: number, now: number): number {
  const elapsed = now - weekStartedAt
  return Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000))
}
