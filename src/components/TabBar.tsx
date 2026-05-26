import { XStack, Text, YStack } from 'tamagui'

export type Tab = 'hoy' | 'semana' | 'historial' | 'menu'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: '📅' },
  { id: 'semana', label: 'Semana', icon: '📋' },
  { id: 'historial', label: 'Historial', icon: '📊' },
  { id: 'menu', label: 'Menú', icon: '🔍' },
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
      paddingTop="$1"
      elevation="$4"
      style={{ paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))' }}
    >
      {TABS.map(t => {
        const isActive = active === t.id
        return (
          <YStack
            key={t.id}
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="$1"
            onPress={() => onChange(t.id)}
            cursor="pointer"
            pressStyle={{ scale: 0.9 }}
          >
            <Text fontSize="$5" marginBottom={2}>{t.icon}</Text>
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
