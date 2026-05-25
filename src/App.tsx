import { useState, useEffect, useRef } from 'react'
import { YStack, Text, Spinner } from 'tamagui'
import { useWeekPlan } from './hooks/useWeekPlan'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { MenuSelect } from './components/MenuSelect'
import { AlimentosLibres } from './components/AlimentosLibres'
import { TabBar } from './components/TabBar'

type Tab = 'hoy' | 'semana' | 'menu' | 'libres'

function getInitialTab(): Tab {
  return (location.hash.replace('#', '') as Tab) || 'hoy'
}

export default function App() {
  const [tab, setTab] = useState<Tab>(getInitialTab)
  const { plan, loading, selectMenu, swapMeals } = useWeekPlan()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    location.hash = tab
    scrollRef.current?.scrollTo(0, 0)
  }, [tab])

  const activeTab = !plan && !loading && tab !== 'menu' && tab !== 'libres' && tab !== 'semana' ? 'menu' : tab

  if (loading) {
    return (
      <YStack flex={1} height="100vh" alignItems="center" justifyContent="center" gap="$3">
        <Spinner size="large" color="$blue10" />
        <Text fontSize="$4" color="$color8">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} height="100vh" backgroundColor="$background">
      <YStack flex={1} overflow="scroll" padding="$4" paddingBottom="$2" ref={scrollRef}>
        {activeTab === 'hoy' && plan && <DayView plan={plan} />}
        {activeTab === 'semana' && plan && <WeekView plan={plan} swapMeals={swapMeals} />}
        {activeTab === 'menu' && <MenuSelect onSelect={async (id, dist) => { await selectMenu(id, dist); setTab('semana') }} currentMenuId={plan?.menuId} />}
        {activeTab === 'libres' && <AlimentosLibres />}
      </YStack>
      <TabBar active={activeTab} onChange={setTab} />
    </YStack>
  )
}
