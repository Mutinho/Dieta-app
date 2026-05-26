import { useState, useEffect, useRef } from 'react'
import { YStack, Text, Spinner } from 'tamagui'
import { useWeekPlan } from './hooks/useWeekPlan'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { MenuSelect } from './components/MenuSelect'
import { HistoryView } from './components/HistoryView'
import { TabBar, type Tab } from './components/TabBar'

function getInitialTab(): Tab {
  const hash = location.hash.replace('#', '') as Tab
  if (['hoy', 'semana', 'historial', 'menu'].includes(hash)) return hash
  return 'hoy'
}

export default function App() {
  const [tab, setTab] = useState<Tab>(getInitialTab)
  const { plan, loading, selectMenu, swapMeals, weekCompleted, cancelNextMenu } = useWeekPlan()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    location.hash = tab
    scrollRef.current?.scrollTo(0, 0)
  }, [tab])

  const activeTab = !plan && !loading && tab !== 'menu' && tab !== 'historial' ? 'menu' : tab

  if (loading) {
    return (
      <YStack flex={1} height="100vh" alignItems="center" justifyContent="center" gap="$3">
        <Spinner size="large" color="$blue10" />
        <Text fontSize="$4" color="$color8">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} height="100vh" backgroundColor="$background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <YStack flex={1} overflow="scroll" padding="$4" paddingBottom="$2" ref={scrollRef}>
        {activeTab === 'hoy' && plan && <DayView plan={plan} />}
        {activeTab === 'semana' && plan && <WeekView plan={plan} swapMeals={swapMeals} cancelNextMenu={cancelNextMenu} />}
        {activeTab === 'historial' && <HistoryView />}
        {activeTab === 'menu' && <MenuSelect onSelect={selectMenu} currentMenuId={plan?.menuId} nextMenuId={plan?.nextMenuId} hasActivePlan={!!plan} />}
      </YStack>
      <TabBar active={activeTab} onChange={setTab} />

      {weekCompleted && (
        <YStack position="absolute" top={60} left={0} right={0} alignItems="center" zIndex={100}>
          <YStack backgroundColor="$green9" paddingHorizontal="$5" paddingVertical="$3" borderRadius="$4" elevation="$4">
            <Text color="white" fontSize="$4" fontWeight="700">✅ Semana completada — {weekCompleted}</Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}
