export interface Menu {
  dieta_id: string
  Fecha: string
  comidas: string[]
  cenas: string[]
}

export interface MenuData {
  alimentos_libres: {
    general: string
    frutas: string
  }
  menus: Menu[]
}

export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export interface DayPlan {
  comida: string
  cena: string
}

export type WeekDistribution = Record<DayOfWeek, DayPlan>

export interface WeekPlan {
  menuId: string
  distribution: WeekDistribution
  updatedAt: number
}
