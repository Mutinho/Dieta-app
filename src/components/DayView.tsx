import { YStack, XStack, Text, Card, Separator } from 'tamagui'
import type { WeekPlan, DayOfWeek } from '../types'

const DAYS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const DAY_LABELS: Record<DayOfWeek, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}

function getTodayIndex(): number {
  const jsDay = new Date().getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

interface Props {
  plan: WeekPlan
}

export function DayView({ plan }: Props) {
  const todayIdx = getTodayIndex()
  const tomorrowIdx = (todayIdx + 1) % 7
  const today = DAYS[todayIdx]
  const tomorrow = DAYS[tomorrowIdx]

  return (
    <YStack gap="$4">
      <DayCard day={today} label="Hoy" plan={plan} highlight />
      <DayCard day={tomorrow} label="Mañana" plan={plan} />
    </YStack>
  )
}

function DayCard({ day, label, plan, highlight }: { day: DayOfWeek; label: string; plan: WeekPlan; highlight?: boolean }) {
  const dayPlan = plan.distribution[day]
  if (!dayPlan) return null

  return (
    <Card
      padding="$5"
      borderRadius="$6"
      backgroundColor={highlight ? '$blue2' : '$color2'}
      borderWidth={2}
      borderColor={highlight ? '$blue7' : '$borderColor'}
      elevation={highlight ? '$4' : '$2'}
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <Text fontSize="$7" fontWeight="800" color={highlight ? '$blue10' : '$color'}>
          {label}
        </Text>
        <Text fontSize="$4" color="$color8" fontWeight="500">
          {DAY_LABELS[day]}
        </Text>
      </XStack>

      <Separator marginBottom="$4" />

      <YStack gap="$4">
        <YStack gap="$1" padding="$3" backgroundColor={highlight ? '$blue3' : '$background'} borderRadius="$4">
          <XStack gap="$2" alignItems="center">
            <Text fontSize="$6">🍽️</Text>
            <Text fontSize="$3" color="$color8" fontWeight="600">COMIDA</Text>
          </XStack>
          <Text fontSize="$5" fontWeight="500" paddingLeft="$8">{dayPlan.comida}</Text>
        </YStack>

        <YStack gap="$1" padding="$3" backgroundColor={highlight ? '$orange2' : '$background'} borderRadius="$4">
          <XStack gap="$2" alignItems="center">
            <Text fontSize="$6">🌙</Text>
            <Text fontSize="$3" color="$color8" fontWeight="600">CENA</Text>
          </XStack>
          <Text fontSize="$5" fontWeight="500" paddingLeft="$8">{dayPlan.cena}</Text>
        </YStack>
      </YStack>
    </Card>
  )
}
