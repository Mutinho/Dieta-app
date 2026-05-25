import { XStack, Text, YStack } from 'tamagui'

type Tab = 'hoy' | 'semana' | 'menu' | 'libres'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: '📅' },
  { id: 'semana', label: 'Semana', icon: '📋' },
  { id: 'menu', label: 'Menú', icon: '🔍' },
  { id: 'libres', label: 'Libres', icon: '🥗' },
]

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TabBar({ active, onChange }: Props) {
  return (
    <XStack
      borderTopWidth={1}
      borderTopColor="$borderColor"
      backgroundColor="$background"
      paddingTop="$2"
      elevation="$4"
      style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
    >
      {TABS.map(t => {
        const isActive = active === t.id
        return (
          <YStack
            key={t.id}
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="$2"
            onPress={() => onChange(t.id)}
            cursor="pointer"
            pressStyle={{ scale: 0.9 }}
          >
            <Text fontSize="$6" marginBottom="$1">{t.icon}</Text>
            <Text
              fontSize="$2"
              fontWeight={isActive ? '700' : '400'}
              color={isActive ? '$blue10' : '$color8'}
            >
              {t.label}
            </Text>
            {isActive && (
              <YStack
                position="absolute"
                top={0}
                width={32}
                height={3}
                borderRadius="$4"
                backgroundColor="$blue10"
              />
            )}
          </YStack>
        )
      })}
    </XStack>
  )
}
