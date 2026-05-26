import { createPortal } from 'react-dom'
import { YStack, XStack, Text, Card, Separator, Button } from 'tamagui'
import menuData from '../data/menus_dieta.json'

const ICONS: Record<string, string> = {
  lechugas: '🥬', berros: '🌿', canónigos: '🥬', rúcula: '🥬',
  tomates: '🍅', cebollas: '🧅', zanahorias: '🥕', pepinos: '🥒',
  espárragos: '🌱', puerros: '🌱', apio: '🌱', champiñones: '🍄',
  setas: '🍄', pimientos: '🫑', ajos: '🧄', limón: '🍋',
  café: '☕', té: '🍵', sal: '🧂', ketchup: '🍅',
  caramelos: '🍬', chicles: '🍬', bebidas: '🥤',
  kiwis: '🥝', piña: '🍍', melón: '🍈', sandía: '🍉',
  naranja: '🍊', mandarina: '🍊', fresa: '🍓', pera: '🍐',
  cerezas: '🍒', melocotón: '🍑', granada: '🫐', ciruela: '🟣',
  nectarina: '🍑', paraguaya: '🍑', papaya: '🥭', albaricoque: '🍑',
}

function getIcon(word: string): string {
  const lower = word.toLowerCase()
  for (const [key, icon] of Object.entries(ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '🟢'
}

function splitItems(text: string): string[] {
  return text.split(',').map(s => s.trim()).filter(Boolean)
}

interface Props {
  onClose: () => void
}

export function AlimentosLibresModal({ onClose }: Props) {
  const { general, frutas } = menuData.alimentos_libres

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        zIndex: 9999,
      }}
    >
      <YStack
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        padding="$5"
        maxHeight="80%"
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize="$6" fontWeight="800">🥗 Alimentos libres</Text>
          <Button size="$3" circular theme="gray" onPress={onClose}>✕</Button>
        </XStack>

        <YStack overflow="scroll" flex={1} gap="$4">
          <Card padding="$4" borderRadius="$5" backgroundColor="$green2" borderWidth={1} borderColor="$green6">
            <Text fontSize="$5" fontWeight="700" color="$green10" marginBottom="$2">General</Text>
            <Separator marginBottom="$2" />
            <XStack flexWrap="wrap" gap="$1">
              {splitItems(general).map((item, i) => (
                <XStack key={i} backgroundColor="$background" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$3" marginBottom="$1" alignItems="center" gap="$1">
                  <Text fontSize="$4">{getIcon(item)}</Text>
                  <Text fontSize="$3">{item}</Text>
                </XStack>
              ))}
            </XStack>
          </Card>

          <Card padding="$4" borderRadius="$5" backgroundColor="$orange2" borderWidth={1} borderColor="$orange6">
            <Text fontSize="$5" fontWeight="700" color="$orange10" marginBottom="$2">Frutas</Text>
            <Separator marginBottom="$2" />
            <XStack flexWrap="wrap" gap="$1">
              {splitItems(frutas).map((item, i) => (
                <XStack key={i} backgroundColor="$background" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$3" marginBottom="$1" alignItems="center" gap="$1">
                  <Text fontSize="$4">{getIcon(item)}</Text>
                  <Text fontSize="$3">{item}</Text>
                </XStack>
              ))}
            </XStack>
          </Card>
        </YStack>
      </YStack>
    </div>,
    document.body
  )
}
