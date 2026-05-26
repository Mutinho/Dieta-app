import { useState } from 'react'
import { YStack, XStack, Text, Card, Separator } from 'tamagui'
import { AlimentosLibresView } from './AlimentosLibresModal'
import { getDishCategory } from '../utils/dishCategory'
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
  const [showLibres, setShowLibres] = useState(false)
  const todayIdx = getTodayIndex()
  const tomorrowIdx = (todayIdx + 1) % 7
  const today = DAYS[todayIdx]
  const tomorrow = DAYS[tomorrowIdx]

  // Si es domingo y hay menú programado, mañana muestra el nuevo menú
  const isSunday = todayIdx === 6
  const tomorrowPlan = isSunday && plan.nextDistribution
    ? plan.nextDistribution[DAYS[0]]
    : plan.distribution[tomorrow]
  const tomorrowMenuLabel = isSunday && plan.nextMenuId ? plan.nextMenuId : null

  if (showLibres) {
    return <AlimentosLibresView onClose={() => setShowLibres(false)} />
  }

  return (
    <YStack gap="$4">
      <DayCard day={today} label="Hoy" plan={plan} highlight />
      <Card
        padding="$5"
        borderRadius="$6"
        backgroundColor="$color2"
        borderWidth={1}
        borderColor="$borderColor"
        elevation="$2"
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize="$7" fontWeight="800">Mañana</Text>
          <Text fontSize="$4" color="$color8" fontWeight="500">{DAY_LABELS[tomorrow]}</Text>
        </XStack>
        {tomorrowMenuLabel && (
          <XStack backgroundColor="$blue3" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$3" marginBottom="$3" alignItems="center" gap="$2">
            <Text fontSize="$4">🆕</Text>
            <Text fontSize="$3" fontWeight="700" color="$blue10">Empieza {tomorrowMenuLabel}</Text>
          </XStack>
        )}
        <Separator marginBottom="$4" />
        <YStack gap="$4">
          <MealSlot label="COMIDA" icon="🍽️" dish={tomorrowPlan?.comida || ''} />
          <MealSlot label="CENA" icon="🌙" dish={tomorrowPlan?.cena || ''} />
        </YStack>
      </Card>

      {/* Tarjeta alimentos libres */}
      <Card
        padding="$4"
        borderRadius="$5"
        backgroundColor="$green2"
        borderWidth={1}
        borderColor="$green6"
        pressStyle={{ scale: 0.98, backgroundColor: '$green3' }}
        onPress={() => setShowLibres(true)}
      >
        <XStack alignItems="center" gap="$3">
          <Text fontSize="$6">🥗</Text>
          <YStack flex={1}>
            <Text fontSize="$4" fontWeight="600" color="$green10">¿Tienes hambre?</Text>
            <Text fontSize="$3" color="$color8">Mira qué puedes picar →</Text>
          </YStack>
        </XStack>
      </Card>
    </YStack>
  )
}

function DayCard({ day, label, plan, highlight }: { day: DayOfWeek; label: string; plan: WeekPlan; highlight?: boolean }) {
  const dayPlan = plan.distribution[day]
  if (!dayPlan) return null
  const hour = new Date().getHours()
  const comidaPast = highlight && hour >= 16
  const cenaPast = false // cena nunca está "pasada" en el mismo día

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
        <MealSlot label="COMIDA" icon="🍽️" dish={dayPlan.comida} dimmed={comidaPast} highlighted={comidaPast === false && highlight} />
        <MealSlot label="CENA" icon="🌙" dish={dayPlan.cena} dimmed={cenaPast} highlighted={comidaPast && highlight} />
      </YStack>
    </Card>
  )
}

function MealSlot({ label, icon, dish, dimmed, highlighted }: { label: string; icon: string; dish: string; dimmed?: boolean; highlighted?: boolean }) {
  const cat = getDishCategory(dish)
  return (
    <YStack
      gap="$2"
      padding="$3"
      backgroundColor={cat.color as any}
      borderRadius="$4"
      opacity={dimmed ? 0.4 : 1}
      borderWidth={highlighted ? 2 : 0}
      borderColor="$blue8"
      overflow="hidden"
      position="relative"
    >
      {/* Emoji de fondo */}
      <Text
        position="absolute"
        right={-4}
        top="50%"
        fontSize={80}
        opacity={0.15}
        style={{ pointerEvents: 'none', transform: 'translateY(-50%)' }}
      >
        {cat.icon}
      </Text>
      <XStack gap="$2" alignItems="center">
        <Text fontSize="$3" color="$color8" fontWeight="600">{icon} {label}</Text>
      </XStack>
      <XStack gap="$3" alignItems="center" paddingLeft="$1">
        <Text fontSize="$5" fontWeight="500" flex={1}>{dish}</Text>
      </XStack>
    </YStack>
  )
}
