import { useState } from 'react'
import { YStack, XStack, Text, Card, Button, Separator, Spinner } from 'tamagui'
import { useMenuSearch } from '../hooks/useMenuSearch'
import { distribute } from '../utils/distribute'
import type { Menu, WeekDistribution } from '../types'

interface Props {
  onSelect: (menuId: string, distribution: WeekDistribution) => Promise<void>
  currentMenuId?: string
}

export function MenuSelect({ onSelect, currentMenuId }: Props) {
  const { selectedFecha, setSelectedFecha, fechas, results } = useMenuSearch()
  const [previewMenu, setPreviewMenu] = useState<Menu | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleConfirm(menu: Menu) {
    setSaving(true)
    await onSelect(menu.dieta_id, distribute(menu))
  }

  // Vista detalle del menú
  if (previewMenu) {
    const isChanging = currentMenuId && currentMenuId !== previewMenu.dieta_id

    return (
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="700" textAlign="center">{previewMenu.dieta_id}</Text>
        <Text fontSize="$4" color="$color8" textAlign="center">{previewMenu.Fecha}</Text>

        <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$5">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2">🍽️ Comidas</Text>
          <Separator marginBottom="$2" />
          <YStack gap="$2">
            {previewMenu.comidas.map((c, i) => (
              <Text key={i} fontSize="$4">• {c}</Text>
            ))}
          </YStack>
        </Card>

        <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$5">
          <Text fontSize="$5" fontWeight="700" marginBottom="$2">🌙 Cenas</Text>
          <Separator marginBottom="$2" />
          <YStack gap="$2">
            {previewMenu.cenas.map((c, i) => (
              <Text key={i} fontSize="$4">• {c}</Text>
            ))}
          </YStack>
        </Card>

        {isChanging && (
          <Card padding="$3" backgroundColor="$orange2" borderRadius="$4" borderWidth={1} borderColor="$orange6">
            <Text fontSize="$3" color="$orange10" textAlign="center" fontWeight="600">
              ⚠️ Esto reemplazará tu menú actual ({currentMenuId})
            </Text>
          </Card>
        )}

        <XStack gap="$3" marginTop="$2">
          <Button flex={1} size="$5" theme="gray" onPress={() => setPreviewMenu(null)} borderRadius="$4" disabled={saving}>
            Cancelar
          </Button>
          <Button flex={1} size="$5" theme="blue" onPress={() => handleConfirm(previewMenu)} borderRadius="$4" disabled={saving}>
            {isChanging ? 'Cambiar' : 'Confirmar'}
          </Button>
        </XStack>

        {saving && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.5)"
            alignItems="center"
            justifyContent="center"
            borderRadius="$5"
            gap="$3"
          >
            <Spinner size="large" color="white" />
            <Text color="white" fontSize="$5" fontWeight="700">Generando menú...</Text>
          </YStack>
        )}
      </YStack>
    )
  }

  // Lista de menús
  return (
    <YStack gap="$3">
      <XStack gap="$2" alignItems="center">
        <Text fontSize="$4" fontWeight="600">Mes:</Text>
        <select
          value={selectedFecha}
          onChange={e => setSelectedFecha(e.target.value)}
          style={{
            flex: 1,
            fontSize: 18,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            backgroundColor: 'transparent',
            color: 'inherit',
          }}
        >
          <option value="">Todos</option>
          {fechas.filter(Boolean).map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </XStack>

      <YStack gap="$3">
        {results.map(menu => {
          const isActive = menu.dieta_id === currentMenuId
          return (
            <Card
              key={menu.dieta_id}
              padding="$4"
              borderRadius="$5"
              backgroundColor={isActive ? '$green2' : '$color2'}
              borderWidth={isActive ? 2 : 1}
              borderColor={isActive ? '$green7' : '$borderColor'}
              pressStyle={{ scale: 0.98 }}
              onPress={() => setPreviewMenu(menu)}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1}>
                  <Text fontWeight="700" fontSize="$5">{menu.dieta_id}</Text>
                  <Text color="$color8" fontSize="$3">{menu.Fecha}</Text>
                </YStack>
                {isActive && <Text fontSize="$4" color="$green10" fontWeight="700">✓ Activo</Text>}
              </XStack>
            </Card>
          )
        })}
      </YStack>
    </YStack>
  )
}
