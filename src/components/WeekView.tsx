import { useState, useRef } from 'react'
import { YStack, XStack, Text, Card, Separator, Button } from 'tamagui'
import { getDishCategory } from '../utils/dishCategory'
import type { WeekPlan, DayOfWeek, WeekDistribution } from '../types'

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
  swapMeals: (dayA: DayOfWeek, slotA: 'comida' | 'cena', dayB: DayOfWeek, slotB: 'comida' | 'cena', target?: 'current' | 'next') => void
  cancelNextMenu: () => void
}

interface SelectedSlot {
  day: DayOfWeek
  slot: 'comida' | 'cena'
  target: 'current' | 'next'
}

export function WeekView({ plan, swapMeals, cancelNextMenu }: Props) {
  const todayIdx = getTodayIndex()
  const [selected, setSelected] = useState<SelectedSlot | null>(null)
  const [toast, setToast] = useState(false)
  const [viewTarget, setViewTarget] = useState<'current' | 'next'>('current')
  const hasNext = !!(plan.nextMenuId && plan.nextDistribution)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const directionLocked = useRef<'horizontal' | 'vertical' | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (!hasNext) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    directionLocked.current = null
    setIsDragging(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!hasNext || !isDragging) return
    const diffX = e.touches[0].clientX - touchStartX.current
    const diffY = e.touches[0].clientY - touchStartY.current

    // Lock direction on first significant movement
    if (!directionLocked.current) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        directionLocked.current = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical'
      }
      return
    }

    if (directionLocked.current === 'vertical') return

    // Horizontal swipe
    if (viewTarget === 'current') {
      setDragOffset(Math.min(0, Math.max(-window.innerWidth, diffX)))
    } else {
      setDragOffset(Math.max(0, Math.min(window.innerWidth, diffX)))
    }
  }

  function handleTouchEnd() {
    if (!hasNext || !isDragging) return
    setIsDragging(false)
    if (directionLocked.current === 'horizontal') {
      const threshold = window.innerWidth * 0.25
      if (viewTarget === 'current' && dragOffset < -threshold) {
        setViewTarget('next')
      } else if (viewTarget === 'next' && dragOffset > threshold) {
        setViewTarget('current')
      }
    }
    setDragOffset(0)
    directionLocked.current = null
  }

  function handlePickMeal(targetDay: DayOfWeek, targetSlot: 'comida' | 'cena') {
    if (!selected) return
    swapMeals(selected.day, selected.slot, targetDay, targetSlot, selected.target)
    setSelected(null)
    setToast(true)
    setTimeout(() => setToast(false), 1500)
  }

  // Selector de plato (swap picker)
  if (selected) {
    const dist = selected.target === 'next' ? plan.nextDistribution! : plan.distribution
    const selectedText = dist[selected.day]?.[selected.slot]
    const editableDays = selected.target === 'next' ? DAYS : DAYS.filter((_, i) => i >= todayIdx)
    const allMeals = editableDays
      .flatMap(day => {
        const dp = dist[day]
        if (!dp) return []
        return [
          { day, slot: 'comida' as const, text: dp.comida },
          { day, slot: 'cena' as const, text: dp.cena },
        ]
      })
      .filter(m => !(m.day === selected.day && m.slot === selected.slot))

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
            {selected.target === 'next' && ' (próx. semana)'}
          </Text>
        </Card>
        <Text fontSize="$4" fontWeight="600" marginTop="$2">Selecciona el nuevo plato:</Text>
        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="700" color="$orange10" marginTop="$2">🍽️ Comidas</Text>
          {allMeals.filter(m => m.slot === 'comida').map(m => (
            <Card key={`${m.day}-${m.slot}`} padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4" backgroundColor={getDishCategory(m.text).color as any} pressStyle={{ scale: 0.98 }} onPress={() => handlePickMeal(m.day, m.slot)} overflow="hidden" position="relative">
              <Text position="absolute" right={-2} bottom={-2} fontSize={36} opacity={0.15} style={{ pointerEvents: 'none' }}>{getDishCategory(m.text).icon}</Text>
              <XStack gap="$3" alignItems="center">
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600">{m.text}</Text>
                  <Text fontSize="$2" color="$color8">{DAY_LABELS[m.day]}</Text>
                </YStack>
              </XStack>
            </Card>
          ))}
          <Text fontSize="$4" fontWeight="700" color="$purple10" marginTop="$3">🌙 Cenas</Text>
          {allMeals.filter(m => m.slot === 'cena').map(m => (
            <Card key={`${m.day}-${m.slot}`} padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4" backgroundColor={getDishCategory(m.text).color as any} pressStyle={{ scale: 0.98 }} onPress={() => handlePickMeal(m.day, m.slot)} overflow="hidden" position="relative">
              <Text position="absolute" right={-2} bottom={-2} fontSize={36} opacity={0.15} style={{ pointerEvents: 'none' }}>{getDishCategory(m.text).icon}</Text>
              <XStack gap="$3" alignItems="center">
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

      {/* Toggle semana actual / programada */}
      {hasNext && (
        <XStack backgroundColor="$blue3" borderRadius="$5" padding={0} gap={0}>
          <Card
            flex={1}
            padding="$3"
            borderRadius="$4"
            backgroundColor={viewTarget === 'current' ? '$blue10' : 'transparent'}
            elevation={viewTarget === 'current' ? '$2' : '$0'}
            borderWidth={0}
            borderColor="transparent"
            alignItems="center"
            onPress={() => setViewTarget('current')}
          >
            <Text fontSize="$3" fontWeight="700" color={viewTarget === 'current' ? 'white' : '$blue10'}>
              Esta semana
            </Text>
            <Text fontSize="$2" color={viewTarget === 'current' ? 'white' : '$blue8'} marginTop="$1">
              {plan.menuId}
            </Text>
          </Card>
          <Card
            flex={1}
            padding="$3"
            borderRadius="$4"
            backgroundColor={viewTarget === 'next' ? '$blue10' : 'transparent'}
            elevation={viewTarget === 'next' ? '$2' : '$0'}
            borderWidth={0}
            borderColor="transparent"
            alignItems="center"
            onPress={() => setViewTarget('next')}
          >
            <Text fontSize="$3" fontWeight="700" color={viewTarget === 'next' ? 'white' : '$blue10'}>
              📅 Próxima
            </Text>
            <Text fontSize="$2" color={viewTarget === 'next' ? 'white' : '$blue8'} marginTop="$1">
              {plan.nextMenuId}
            </Text>
          </Card>
        </XStack>
      )}

      {/* Bloque visible según toggle */}
      <YStack onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} overflow="hidden">
        <YStack
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '200%',
            transform: `translateX(calc(${viewTarget === 'next' ? '-50%' : '0%'} + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <YStack style={{ width: '50%' }}>
            <WeekBlock
              title={`${plan.menuId}`}
              distribution={plan.distribution}
              todayIdx={todayIdx}
              disableBefore={todayIdx}
              onSelect={(day, slot) => setSelected({ day, slot, target: 'current' })}
            />
          </YStack>
          {hasNext && (
            <YStack style={{ width: '50%' }}>
              <Button size="$4" theme="red" marginBottom="$3" borderRadius="$4" onPress={() => { cancelNextMenu(); setViewTarget('current') }}>
                Cancelar programación
              </Button>
              <WeekBlock
                title={`${plan.nextMenuId} (desde el lunes)`}
                distribution={plan.nextDistribution!}
                todayIdx={-1}
                disableBefore={-1}
                onSelect={(day, slot) => setSelected({ day, slot, target: 'next' })}
                isNext
              />
            </YStack>
          )}
        </YStack>
      </YStack>

      {toast && (
        <YStack position="absolute" bottom={20} left={0} right={0} alignItems="center">
          <YStack backgroundColor="$green9" paddingHorizontal="$4" paddingVertical="$3" borderRadius="$4">
            <Text color="white" fontSize="$4" fontWeight="700">✓ Guardado</Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}

function WeekBlock({ title, distribution, todayIdx, disableBefore, onSelect, isNext }: {
  title: string
  distribution: WeekDistribution
  todayIdx: number
  disableBefore: number
  onSelect: (day: DayOfWeek, slot: 'comida' | 'cena') => void
  isNext?: boolean
}) {
  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="700" color={isNext ? '$blue10' : '$color'}>
        {isNext && '📅 '}{title}
      </Text>
      {DAYS.map((day, i) => {
        const dayPlan = distribution[day]
        const isToday = i === todayIdx
        const isPast = i < disableBefore
        return (
          <Card
            key={day}
            padding="$4"
            borderRadius="$5"
            backgroundColor={isToday ? '$blue2' : '$color2'}
            borderWidth={isToday ? 2 : 1}
            borderColor={isToday ? '$blue7' : '$borderColor'}
            elevation={isToday ? '$3' : '$1'}
            opacity={isPast ? 0.5 : 1}
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
                flex={1} padding="$3" borderRadius="$3"
                backgroundColor={getDishCategory(dayPlan?.comida || '').color as any}
                pressStyle={isPast ? undefined : { scale: 0.98 }}
                onPress={isPast ? undefined : () => onSelect(day, 'comida')}
                disabled={isPast}
                overflow="hidden"
                position="relative"
              >
                <Text position="absolute" right={4} top={12} fontSize={32} opacity={0.2} style={{ pointerEvents: 'none' }}>
                  {getDishCategory(dayPlan?.comida || '').icon}
                </Text>
                <Text fontSize="$3" marginBottom="$1">🍽️ Comida</Text>
                <Text fontSize="$3" fontWeight="500">{dayPlan?.comida}</Text>
              </Card>
              <Card
                flex={1} padding="$3" borderRadius="$3"
                backgroundColor={getDishCategory(dayPlan?.cena || '').color as any}
                pressStyle={isPast ? undefined : { scale: 0.98 }}
                onPress={isPast ? undefined : () => onSelect(day, 'cena')}
                disabled={isPast}
                overflow="hidden"
                position="relative"
              >
                <Text position="absolute" right={4} top={12} fontSize={32} opacity={0.2} style={{ pointerEvents: 'none' }}>
                  {getDishCategory(dayPlan?.cena || '').icon}
                </Text>
                <Text fontSize="$3" marginBottom="$1">🌙 Cena</Text>
                <Text fontSize="$3" fontWeight="500">{dayPlan?.cena}</Text>
              </Card>
            </XStack>
          </Card>
        )
      })}
    </YStack>
  )
}
