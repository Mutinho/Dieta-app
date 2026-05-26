import { useState } from 'react'
import { YStack, XStack, Text, Card, Button, Separator, Spinner } from 'tamagui'
import { useMenuSearch } from '../hooks/useMenuSearch'
import { useHistory } from '../hooks/useHistory'
import { distribute } from '../utils/distribute'
import { calculatePreferences, getPreferenceWeight } from '../utils/preferences'
import type { Menu, WeekDistribution } from '../types'

interface Props {
  onSelect: (menuId: string, distribution: WeekDistribution, mode: 'schedule' | 'now') => Promise<void>
  currentMenuId?: string
  nextMenuId?: string
  hasActivePlan: boolean
}

export function MenuSelect({ onSelect, currentMenuId, nextMenuId, hasActivePlan }: Props) {
  const { selectedFecha, setSelectedFecha, fechas, results } = useMenuSearch()
  const { getEntriesByMenu, getMenuCounts } = useHistory()
  const [previewMenu, setPreviewMenu] = useState<Menu | null>(null)
  const [saving, setSaving] = useState(false)
  const menuCounts = getMenuCounts()

  async function handleConfirm(menu: Menu, mode: 'schedule' | 'now') {
    setSaving(true)
    const entries = getEntriesByMenu(menu.dieta_id)
    const prefs = calculatePreferences(entries)
    const swappedCount = entries.filter(e => e.hadSwaps).length
    const weight = getPreferenceWeight(swappedCount)
    const dist = distribute(menu, prefs.length > 0 ? prefs : undefined, weight > 0 ? weight : undefined)
    await onSelect(menu.dieta_id, dist, mode)
    setSaving(false)
    setPreviewMenu(null)
  }

  if (previewMenu) {
    return (
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="700" textAlign="center">{previewMenu.dieta_id}</Text>
        <Text fontSize="$4" color="$color8" textAlign="center">{previewMenu.Fecha}</Text>

        <Card padding="$4" backgroundColor="$orange5" borderRadius="$5">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2">🍽️ Comidas</Text>
          <Separator marginBottom="$2" />
          <YStack gap="$2">
            {previewMenu.comidas.map((c, i) => <Text key={i} fontSize="$4">• {c}</Text>)}
          </YStack>
        </Card>

        <Card padding="$4" backgroundColor="$purple4" borderRadius="$5">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2">🌙 Cenas</Text>
          <Separator marginBottom="$2" />
          <YStack gap="$2">
            {previewMenu.cenas.map((c, i) => <Text key={i} fontSize="$4">• {c}</Text>)}
          </YStack>
        </Card>

        <YStack gap="$2" marginTop="$2">
          {hasActivePlan && (
            <Button size="$5" theme="blue" onPress={() => handleConfirm(previewMenu, 'schedule')} borderRadius="$4" disabled={saving}>
              📅 Programar para el lunes
            </Button>
          )}
          <Button size="$5" theme={hasActivePlan ? 'gray' : 'blue'} onPress={() => handleConfirm(previewMenu, 'now')} borderRadius="$4" disabled={saving}>
            {hasActivePlan ? 'Activar ahora' : 'Confirmar'}
          </Button>
          <Button size="$5" theme="gray" onPress={() => setPreviewMenu(null)} borderRadius="$4" disabled={saving}>
            Cancelar
          </Button>
        </YStack>

        {saving && (
          <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="rgba(0,0,0,0.5)" alignItems="center" justifyContent="center" borderRadius="$5" gap="$3">
            <Spinner size="large" color="white" />
            <Text color="white" fontSize="$5" fontWeight="700">Generando menú...</Text>
          </YStack>
        )}
      </YStack>
    )
  }

  return (
    <YStack gap="$3">
      <XStack gap="$2" alignItems="center">
        <Text fontSize="$4" fontWeight="600">Mes:</Text>
        <select
          value={selectedFecha}
          onChange={e => setSelectedFecha(e.target.value)}
          style={{ flex: 1, fontSize: 18, padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', backgroundColor: 'transparent', color: 'inherit' }}
        >
          <option value="">Todos</option>
          {fechas.filter(Boolean).map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </XStack>

      <YStack gap="$3">
        {results.map(menu => {
          const isActive = menu.dieta_id === currentMenuId
          const isScheduled = menu.dieta_id === nextMenuId
          const count = menuCounts[menu.dieta_id] || 0
          return (
            <Card
              key={menu.dieta_id}
              padding="$4"
              borderRadius="$5"
              backgroundColor={isActive ? '$green3' : isScheduled ? '$blue3' : '$purple3'}
              borderWidth={isActive || isScheduled ? 2 : 1}
              borderColor={isActive ? '$green7' : isScheduled ? '$blue7' : count === 0 ? '$color8' : '$purple6'}
              borderStyle={count === 0 && !isActive && !isScheduled ? 'dashed' : 'solid'}
              pressStyle={{ scale: 0.98 }}
              onPress={() => setPreviewMenu(menu)}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1}>
                  <Text fontWeight="700" fontSize="$5">{menu.dieta_id}</Text>
                  <Text color="$color8" fontSize="$3">{menu.Fecha}</Text>
                </YStack>
                <XStack gap="$2" alignItems="center">
                  {count > 0 && (
                    <Text fontSize="$3" color="$purple10" fontWeight="700">×{count}</Text>
                  )}
                  {count === 0 && !isActive && !isScheduled && (
                    <Text fontSize="$2" backgroundColor="$blue3" color="$blue10" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" fontWeight="600">
                      Sin estrenar
                    </Text>
                  )}
                  {isScheduled && (
                    <Text fontSize="$3" color="$blue10" fontWeight="700">📅 Programado</Text>
                  )}
                  {isActive && <Text fontSize="$4" color="$green10" fontWeight="700">✓ Activo</Text>}
                </XStack>
              </XStack>
            </Card>
          )
        })}
      </YStack>
    </YStack>
  )
}
