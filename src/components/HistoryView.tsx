import { useState } from 'react'
import { YStack, XStack, Text, Card, Separator, Button } from 'tamagui'
import { useHistory } from '../hooks/useHistory'
import type { HistoryEntry, DayOfWeek } from '../types'

const DAY_LABELS: Record<DayOfWeek, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}
const DAYS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function HistoryView() {
  const { entries, loading, getStats } = useHistory()
  const [detail, setDetail] = useState<HistoryEntry | null>(null)

  if (loading) {
    return <Text fontSize="$4" color="$color8" textAlign="center" marginTop="$6">Cargando historial...</Text>
  }

  if (detail) {
    return (
      <YStack gap="$3">
        <Button size="$5" theme="gray" onPress={() => setDetail(null)} borderRadius="$4">← Volver</Button>
        <Text fontSize="$6" fontWeight="700" textAlign="center">{detail.menuId}</Text>
        <Text fontSize="$3" color="$color8" textAlign="center">
          {formatDate(detail.weekStart)} — {formatDate(detail.weekEnd)}
          {detail.hadSwaps && ' • Editada'}
        </Text>
        <YStack gap="$2" marginTop="$2">
          {DAYS.map(day => {
            const dp = detail.distribution[day]
            if (!dp) return null
            return (
              <Card key={day} padding="$3" borderRadius="$4" backgroundColor="$color2" borderWidth={1} borderColor="$borderColor">
                <Text fontWeight="700" fontSize="$4" marginBottom="$1">{DAY_LABELS[day]}</Text>
                <XStack gap="$2">
                  <Text flex={1} fontSize="$3">🍽️ {dp.comida}</Text>
                  <Text flex={1} fontSize="$3">🌙 {dp.cena}</Text>
                </XStack>
              </Card>
            )
          })}
        </YStack>
      </YStack>
    )
  }

  const stats = getStats()

  return (
    <YStack gap="$4">
      {/* Stats */}
      <XStack gap="$3">
        <Card flex={1} padding="$3" borderRadius="$4" backgroundColor="$blue2" alignItems="center">
          <Text fontSize="$7" fontWeight="800" color="$blue10">{stats.total}</Text>
          <Text fontSize="$2" color="$color8">Semanas</Text>
        </Card>
        <Card flex={1} padding="$3" borderRadius="$4" backgroundColor="$green2" alignItems="center">
          <Text fontSize="$7" fontWeight="800" color="$green10">{stats.streak}</Text>
          <Text fontSize="$2" color="$color8">Racha</Text>
        </Card>
        {stats.mostUsed && (
          <Card flex={1} padding="$3" borderRadius="$4" backgroundColor="$purple2" alignItems="center">
            <Text fontSize="$4" fontWeight="800" color="$purple10">{stats.mostUsed.menuId}</Text>
            <Text fontSize="$2" color="$color8">×{stats.mostUsed.count}</Text>
          </Card>
        )}
      </XStack>

      <Separator />

      {entries.length === 0 ? (
        <YStack alignItems="center" paddingVertical="$6" gap="$2">
          <Text fontSize="$7">📋</Text>
          <Text fontSize="$4" color="$color8" textAlign="center">Aún no hay historial</Text>
          <Text fontSize="$3" color="$color8" textAlign="center">Se registrará automáticamente al completar una semana</Text>
        </YStack>
      ) : (
        <YStack gap="$3">
          {/* Calendario visual */}
          <CalendarGrid entries={entries} onSelect={setDetail} />
          <Separator />
          <YStack gap="$2">
            {entries.map((entry, i) => (
            <Card
              key={i}
              padding="$4"
              borderRadius="$4"
              backgroundColor="$color2"
              borderWidth={1}
              borderColor="$borderColor"
              pressStyle={{ scale: 0.98, backgroundColor: '$color3' }}
              onPress={() => setDetail(entry)}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text fontWeight="700" fontSize="$4">{entry.menuId}</Text>
                  <Text fontSize="$3" color="$color8">
                    {formatDate(entry.weekStart)} — {formatDate(entry.weekEnd)}
                  </Text>
                </YStack>
                <XStack gap="$2" alignItems="center">
                  {entry.hadSwaps && (
                    <Text fontSize="$2" backgroundColor="$orange3" color="$orange10" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" fontWeight="600">
                      Editada
                    </Text>
                  )}
                  <Text fontSize="$4" color="$color8">→</Text>
                </XStack>
              </XStack>
            </Card>
          ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}

const MENU_COLORS = ['$blue4', '$green4', '$purple4', '$orange4', '$red4', '$pink4', '$yellow4', '$cyan4']

function CalendarGrid({ entries, onSelect }: { entries: HistoryEntry[]; onSelect: (e: HistoryEntry) => void }) {
  if (entries.length === 0) return null

  // Group by month
  const months = new Map<string, HistoryEntry[]>()
  for (const e of entries) {
    const d = new Date(e.weekStart)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!months.has(key)) months.set(key, [])
    months.get(key)!.push(e)
  }

  // Assign colors to menus
  const menuIds = [...new Set(entries.map(e => e.menuId))]
  const colorMap = new Map<string, string>()
  menuIds.forEach((id, i) => colorMap.set(id, MENU_COLORS[i % MENU_COLORS.length]))

  const sortedMonths = [...months.entries()].sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <YStack gap="$3">
      {sortedMonths.slice(0, 3).map(([month, monthEntries]) => {
        const [year, m] = month.split('-')
        const label = new Date(+year, +m - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        return (
          <YStack key={month} gap="$1">
            <Text fontSize="$3" fontWeight="600" color="$color8" textTransform="capitalize">{label}</Text>
            <XStack gap="$2" flexWrap="wrap">
              {monthEntries.map((e, i) => (
                <YStack
                  key={i}
                  width={48}
                  height={36}
                  borderRadius="$2"
                  backgroundColor={colorMap.get(e.menuId) as any}
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ scale: 0.9 }}
                  onPress={() => onSelect(e)}
                >
                  <Text fontSize="$1" fontWeight="700" numberOfLines={1}>
                    {e.menuId.replace('Dieta ', 'D')}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )
      })}
    </YStack>
  )
}
