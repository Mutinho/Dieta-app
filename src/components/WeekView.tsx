import { useState } from 'react'
import { YStack, XStack, Text, Card, Separator, Button } from 'tamagui'
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
  swapMeals: (dayA: DayOfWeek, slotA: 'comida' | 'cena', dayB: DayOfWeek, slotB: 'comida' | 'cena') => void
}

interface SelectedSlot {
  day: DayOfWeek
  slot: 'comida' | 'cena'
}

export function WeekView({ plan, swapMeals }: Props) {
  const todayIdx = getTodayIndex()
  const [selected, setSelected] = useState<SelectedSlot | null>(null)
  const [toast, setToast] = useState(false)

  function getAllMeals(): { day: DayOfWeek; slot: 'comida' | 'cena'; text: string }[] {
    const meals: { day: DayOfWeek; slot: 'comida' | 'cena'; text: string }[] = []
    for (const day of DAYS) {
      const dp = plan.distribution[day]
      if (dp) {
        meals.push({ day, slot: 'comida', text: dp.comida })
        meals.push({ day, slot: 'cena', text: dp.cena })
      }
    }
    return meals
  }

  function handlePickMeal(targetDay: DayOfWeek, targetSlot: 'comida' | 'cena') {
    if (!selected) return
    swapMeals(selected.day, selected.slot, targetDay, targetSlot)
    setSelected(null)
    setToast(true)
    setTimeout(() => setToast(false), 1500)
  }

  // Selector de plato
  if (selected) {
    const selectedText = plan.distribution[selected.day]?.[selected.slot]
    const allMeals = getAllMeals().filter(m => !(m.day === selected.day && m.slot === selected.slot))

    return (
      <YStack gap="$3">
        <Button size="$5" theme="gray" onPress={() => setSelected(null)} borderRadius="$4">
          ← Volver
        </Button>

        <Card padding="$4" backgroundColor="$blue2" borderRadius="$5" borderWidth={2} borderColor="$blue7">
          <Text fontSize="$3" color="$blue10" fontWeight="600" marginBottom="$1">Intercambiar:</Text>
          <Text fontSize="$5" fontWeight="700">{selectedText}</Text>
          <Text fontSize="$3" color="$color8" marginTop="$1">
            {selected.slot === 'comida' ? '🍽️' : '🌙'} {DAY_LABELS[selected.day]}
          </Text>
        </Card>

        <Text fontSize="$4" fontWeight="600" marginTop="$2">Selecciona el nuevo plato:</Text>

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="700" color="$orange10" marginTop="$2">🍽️ Comidas</Text>
          {allMeals.filter(m => m.slot === 'comida').map(m => (
            <Card
              key={`${m.day}-${m.slot}`}
              padding="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$4"
              pressStyle={{ backgroundColor: '$orange3', scale: 0.98 }}
              onPress={() => handlePickMeal(m.day, m.slot)}
            >
              <XStack gap="$3" alignItems="center">
                <Text fontSize="$5">🍽️</Text>
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600">{m.text}</Text>
                  <Text fontSize="$2" color="$color8">{DAY_LABELS[m.day]}</Text>
                </YStack>
              </XStack>
            </Card>
          ))}

          <Text fontSize="$4" fontWeight="700" color="$purple10" marginTop="$3">🌙 Cenas</Text>
          {allMeals.filter(m => m.slot === 'cena').map(m => (
            <Card
              key={`${m.day}-${m.slot}`}
              padding="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$4"
              pressStyle={{ backgroundColor: '$purple3', scale: 0.98 }}
              onPress={() => handlePickMeal(m.day, m.slot)}
            >
              <XStack gap="$3" alignItems="center">
                <Text fontSize="$5">🌙</Text>
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600">{m.text}</Text>
                  <Text fontSize="$2" color="$color8">{DAY_LABELS[m.day]}</Text>
                </YStack>
              </XStack>
            </Card>
          ))}
        </YStack>
      </YStack>
    )
  }

  // Vista semanal
  return (
    <YStack gap="$3">
      <Text fontSize="$3" color="$color8" textAlign="center" marginBottom="$1">
        Pulsa un plato para cambiarlo
      </Text>
      {DAYS.map((day, i) => {
        const dayPlan = plan.distribution[day]
        const isToday = i === todayIdx
        return (
          <Card
            key={day}
            padding="$4"
            borderRadius="$5"
            backgroundColor={isToday ? '$blue2' : '$color2'}
            borderWidth={isToday ? 2 : 1}
            borderColor={isToday ? '$blue7' : '$borderColor'}
            elevation={isToday ? '$3' : '$1'}
          >
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
              <Text fontWeight="800" fontSize="$5" color={isToday ? '$blue10' : '$color'}>
                {DAY_LABELS[day]}
              </Text>
              {isToday && (
                <Text fontSize="$2" backgroundColor="$blue10" color="white" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$3" fontWeight="700">
                  HOY
                </Text>
              )}
            </XStack>
            <Separator marginBottom="$2" />
            <XStack gap="$2">
              <Card
                flex={1}
                padding="$3"
                borderRadius="$3"
                backgroundColor="$orange5"
                pressStyle={{ backgroundColor: '$orange6', scale: 0.98 }}
                onPress={() => setSelected({ day, slot: 'comida' })}
              >
                <Text fontSize="$3" marginBottom="$1">🍽️ Comida</Text>
                <Text fontSize="$3" fontWeight="500">{dayPlan?.comida}</Text>
              </Card>
              <Card
                flex={1}
                padding="$3"
                borderRadius="$3"
                backgroundColor="$purple3"
                pressStyle={{ backgroundColor: '$purple4', scale: 0.98 }}
                onPress={() => setSelected({ day, slot: 'cena' })}
              >
                <Text fontSize="$3" marginBottom="$1">🌙 Cena</Text>
                <Text fontSize="$3" fontWeight="500">{dayPlan?.cena}</Text>
              </Card>
            </XStack>
          </Card>
        )
      })}
      {toast && (
        <YStack
          position="absolute"
          bottom={20}
          left={0}
          right={0}
          alignItems="center"
        >
          <YStack backgroundColor="$green9" paddingHorizontal="$4" paddingVertical="$3" borderRadius="$4">
            <Text color="white" fontSize="$4" fontWeight="700">✓ Guardado</Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}
