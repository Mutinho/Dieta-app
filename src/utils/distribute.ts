import type { Menu, DayOfWeek, WeekDistribution } from '../types'

const DAYS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const FISH_RE = /salm[oó]n|lubina|dorada|merluza|lenguado|gallo|pescado|langostinos|gulas|marisco|sepia|emperador|boquerones/i
const MEAT_RE = /ternera|añojo/i
const BOCADILLO_RE = /bocadillo/i
const SUMMER_RE = /julio|agosto/i

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function distribute(menu: Menu): WeekDistribution {
  const isSummer = SUMMER_RE.test(menu.Fecha)
  // Pool de 12 platos (JSON ya no incluye COMIDA LIBRE ni cena verduras/frutas)
  const pool = [...menu.comidas, ...menu.cenas]

  let cenas: string[]
  let comidas: string[]

  if (!isSummer) {
    const forced: string[] = []
    const flexible: string[] = []
    for (const d of pool) {
      if (BOCADILLO_RE.test(d) || FISH_RE.test(d) || MEAT_RE.test(d)) forced.push(d)
      else flexible.push(d)
    }
    const shuffledForced = shuffle(forced)
    const shuffledFlex = shuffle(flexible)
    // Cenas: primero los forzados, rellenar con flexibles hasta 6
    cenas = [...shuffledForced.slice(0, 6), ...shuffledFlex.splice(0, Math.max(0, 6 - shuffledForced.length))]
    // Comidas: lo que quede
    comidas = [...shuffledForced.slice(6), ...shuffledFlex]
  } else {
    const forced: string[] = []
    const flexible: string[] = []
    for (const d of pool) {
      if (BOCADILLO_RE.test(d)) forced.push(d)
      else flexible.push(d)
    }
    const shuffledForced = shuffle(forced)
    const shuffledFlex = shuffle(flexible)
    cenas = [...shuffledForced.slice(0, 6), ...shuffledFlex.splice(0, Math.max(0, 6 - shuffledForced.length))]
    comidas = [...shuffledForced.slice(6), ...shuffledFlex]
  }

  cenas = shuffle(cenas)
  comidas = shuffle(comidas)

  const otherDays = DAYS.filter(d => d !== 'sabado')
  const result = {} as WeekDistribution

  // Regla fija: bocadillo de jamón serrano → viernes cena
  const JAMON_RE = /bocadillo.*jam[oó]n serrano/i
  const jamonIdx = cenas.findIndex(d => JAMON_RE.test(d))
  if (jamonIdx === -1) {
    // Puede estar en comidas si no hubo suficientes slots de cena
    const jamonComidaIdx = comidas.findIndex(d => JAMON_RE.test(d))
    if (jamonComidaIdx !== -1) {
      // Mover a cenas intercambiando con una cena cualquiera
      const temp = cenas[0]
      cenas[0] = comidas[jamonComidaIdx]
      comidas[jamonComidaIdx] = temp
    }
  }

  // Asignar viernes primero con jamón serrano en cena
  const viernesIdx = otherDays.indexOf('viernes')
  const jamonCenaIdx = cenas.findIndex(d => JAMON_RE.test(d))
  if (jamonCenaIdx !== -1 && viernesIdx !== -1) {
    // Swap para que el jamón quede en la posición de viernes
    ;[cenas[viernesIdx], cenas[jamonCenaIdx]] = [cenas[jamonCenaIdx], cenas[viernesIdx]]
  }

  otherDays.forEach((day, i) => {
    result[day] = { comida: comidas[i], cena: cenas[i] }
  })

  result.sabado = { comida: 'COMIDA LIBRE', cena: 'Verduras + Frutas de libre consumo' }

  return result
}
