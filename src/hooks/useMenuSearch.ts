import { useMemo, useState } from 'react'
import type { Menu } from '../types'
import menuData from '../data/menus_dieta.json'

const menus = (menuData.menus as Menu[]).sort((a, b) => {
  const numA = parseInt(a.dieta_id.replace(/\D/g, ''))
  const numB = parseInt(b.dieta_id.replace(/\D/g, ''))
  return numA - numB
})

export function useMenuSearch() {
  const [selectedFecha, setSelectedFecha] = useState<string>('')

  const fechas = useMemo(() => {
    const set = new Set(menus.map(m => m.Fecha))
    return ['', ...Array.from(set).sort()]
  }, [])

  const results = useMemo(() => {
    if (!selectedFecha) return menus
    return menus.filter(m => m.Fecha === selectedFecha)
  }, [selectedFecha])

  return { selectedFecha, setSelectedFecha, fechas, results }
}
