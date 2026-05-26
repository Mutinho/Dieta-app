import type { Menu, DayOfWeek, WeekDistribution } from '../types'
import type { SlotPreference } from './preferences'

const DAYS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const FISH_RE = /salm[oó]n|lubina|dorada|merluza|lenguado|gallo|pescado|langostinos|gulas|marisco|sepia|emperador|boquerones/i
const MEAT_RE = /ternera|añojo/i
const BOCADILLO_RE = /bocadillo/i
const LECHE_RE = /leche|cereales|taz[oó]n/i
const SUMMER_RE = /julio|agosto/i
const JAMON_RE = /bocadillo.*jam[oó]n serrano/i

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function distribute(menu: Menu, preferences?: SlotPreference[], weight?: number): WeekDistribution {
  const isSummer = SUMMER_RE.test(menu.Fecha)
  const pool = [...menu.comidas, ...menu.cenas]

  let cenas: string[]
  let comidas: string[]

  if (!isSummer) {
    const forced: string[] = []
    const flexible: string[] = []
    for (const d of pool) {
      if (BOCADILLO_RE.test(d) || FISH_RE.test(d) || MEAT_RE.test(d) || LECHE_RE.test(d)) forced.push(d)
      else flexible.push(d)
    }
    const shuffledForced = shuffle(forced)
    const shuffledFlex = shuffle(flexible)
    cenas = [...shuffledForced.slice(0, 6), ...shuffledFlex.splice(0, Math.max(0, 6 - shuffledForced.length))]
    comidas = [...shuffledForced.slice(6), ...shuffledFlex]
  } else {
    const forced: string[] = []
    const flexible: string[] = []
    for (const d of pool) {
      if (BOCADILLO_RE.test(d) || LECHE_RE.test(d)) forced.push(d)
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
  const jamonIdx = cenas.findIndex(d => JAMON_RE.test(d))
  if (jamonIdx === -1) {
    const jamonComidaIdx = comidas.findIndex(d => JAMON_RE.test(d))
    if (jamonComidaIdx !== -1) {
      const temp = cenas[0]
      cenas[0] = comidas[jamonComidaIdx]
      comidas[jamonComidaIdx] = temp
    }
  }

  const viernesIdx = otherDays.indexOf('viernes')
  const jamonCenaIdx = cenas.findIndex(d => JAMON_RE.test(d))
  if (jamonCenaIdx !== -1 && viernesIdx !== -1) {
    ;[cenas[viernesIdx], cenas[jamonCenaIdx]] = [cenas[jamonCenaIdx], cenas[viernesIdx]]
  }

  // Asignación base
  otherDays.forEach((day, i) => {
    result[day] = { comida: comidas[i], cena: cenas[i] }
  })
  result.sabado = { comida: 'COMIDA LIBRE', cena: 'Verduras + Frutas de libre consumo' }

  // Aplicar preferencias (post reglas fijas)
  if (preferences && preferences.length > 0 && weight && weight > 0) {
    applyPreferences(result, preferences, weight)
  }

  return result
}

function applyPreferences(result: WeekDistribution, prefs: SlotPreference[], weight: number) {
  // Sort by score desc so strongest preferences get priority
  const sorted = [...prefs].sort((a, b) => b.score - a.score)

  for (const pref of sorted) {
    if (Math.random() >= weight) continue
    if (pref.day === 'sabado') continue // sábado es fijo

    const currentInTarget = result[pref.day][pref.slot]
    if (currentInTarget === pref.dish) continue // ya está donde quiere

    // Find where the preferred dish currently is
    let foundDay: DayOfWeek | null = null
    let foundSlot: 'comida' | 'cena' | null = null
    for (const day of DAYS) {
      if (day === 'sabado') continue
      if (result[day].comida === pref.dish) { foundDay = day; foundSlot = 'comida'; break }
      if (result[day].cena === pref.dish) { foundDay = day; foundSlot = 'cena'; break }
    }
    if (!foundDay || !foundSlot) continue

    // Don't move jamón serrano away from viernes cena
    if (JAMON_RE.test(result[pref.day][pref.slot]) && pref.day === 'viernes' && pref.slot === 'cena') continue
    if (foundDay === 'viernes' && foundSlot === 'cena' && JAMON_RE.test(pref.dish)) continue

    // Swap
    const temp = result[pref.day][pref.slot]
    result[pref.day][pref.slot] = pref.dish
    result[foundDay][foundSlot] = temp
  }
}
