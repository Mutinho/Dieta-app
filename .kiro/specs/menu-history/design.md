# Design - Histórico de Menús (v1.1)

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    React PWA                              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  useWeekPlan │  │ useHistory   │  │ distribute   │  │
│  │  (existente) │  │ (nuevo)      │  │ (modificado) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         │    ┌─────────────┴──────────┐      │          │
│         │    │  CycleDetector         │      │          │
│         │    │  (lógica de detección  │      │          │
│         │    │   de semana completa)  │      │          │
│         │    └────────────────────────┘      │          │
│         │                                     │          │
│         │    ┌────────────────────────┐      │          │
│         │    │  PreferenceEngine      │◄─────┘          │
│         │    │  (calcula pesos desde  │                  │
│         │    │   histórico)           │                  │
│         │    └────────────────────────┘                  │
│         │                                                │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              Firebase Firestore                           │
│                                                          │
│  weekPlans/current        (existente, sin cambios)       │
│  weekPlans/current        + campo: weekStartedAt (nuevo) │
│                                                          │
│  history/{autoId}         (nueva colección)              │
│  - menuId, distribution, weekStart, weekEnd,             │
│    hadSwaps, createdAt                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Modelo de Datos

### Documento `weekPlans/current` (modificado)

```typescript
interface WeekPlan {
  menuId: string
  distribution: WeekDistribution
  updatedAt: number
  weekStartedAt: number      // timestamp del lunes en que empezó este ciclo
  hasSwaps: boolean           // si hubo intercambios manuales en este ciclo
  nextMenuId?: string         // menú programado para el próximo lunes
  nextDistribution?: WeekDistribution  // distribución pre-calculada del próximo menú
  nextHasSwaps?: boolean      // si el usuario editó la distribución del próximo menú
}
```

### Colección `history` (nueva)

```typescript
interface HistoryEntry {
  menuId: string
  distribution: WeekDistribution  // distribución exacta usada esa semana
  weekStart: number               // timestamp del lunes (00:00)
  weekEnd: number                 // timestamp del domingo (23:59)
  hadSwaps: boolean               // si el usuario hizo intercambios
  createdAt: number               // timestamp de cuando se registró
}
```

### Índices Firestore necesarios

Ninguno adicional. Las queries serán:
- `history` ordenado por `weekStart` desc (índice automático en campo simple)
- `history` filtrado por `menuId` (para preferencias de un menú concreto)

## Detección de Ciclo Completado

### Algoritmo

```
Al abrir la app o al recibir snapshot de weekPlans/current:
  1. Leer weekStartedAt del plan actual
  2. Calcular: diasTranscurridos = (ahora - weekStartedAt) / (24*60*60*1000)
  3. Si diasTranscurridos >= 7:
     a. Calcular cuántas semanas completas han pasado: n = floor(diasTranscurridos / 7)
     b. Para cada semana completa no registrada:
        - Crear entrada en history/
     c. Si existe nextMenuId (menú programado):
        - Promover: menuId = nextMenuId, distribution = nextDistribution
        - weekStartedAt = lunes de la semana actual
        - hasSwaps = nextHasSwaps ?? false
        - Limpiar campos next*
     d. Si NO hay nextMenuId (se repite el mismo menú):
        - Actualizar weekStartedAt al lunes de la semana actual
        - Resetear hasSwaps = false
```

### Cálculo del lunes de referencia

```typescript
function getMondayTimestamp(date: Date): number {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
```

### Cuándo se ejecuta la detección

- En el `useEffect` del hook `useWeekPlan`, tras recibir el snapshot
- Solo se ejecuta si hay un plan activo con `weekStartedAt` definido
- Es idempotente: si ya se registró esa semana, no se duplica

## Motor de Preferencias

### Datos de entrada

Para un `menuId` dado, se consultan las entradas de `history` con ese menuId **que tengan `hadSwaps: true`**. Solo se aprende de semanas donde el usuario editó la distribución (preferencia real, no casualidad del random).

### Cálculo de preferencias

```typescript
interface SlotPreference {
  dish: string
  day: DayOfWeek
  slot: 'comida' | 'cena'
  score: number  // 0.0 a 1.0
}

function calculatePreferences(entries: HistoryEntry[]): SlotPreference[] {
  // Solo entradas con hadSwaps === true
  const swappedEntries = entries.filter(e => e.hadSwaps)
  
  // Para cada plato, contar en qué día/slot terminó (distribución final tras swaps)
  const counts: Map<string, Map<string, number>> = new Map()
  
  for (const entry of swappedEntries) {
    for (const [day, dayPlan] of Object.entries(entry.distribution)) {
      increment(counts, dayPlan.comida, `${day}-comida`)
      increment(counts, dayPlan.cena, `${day}-cena`)
    }
  }
  
  // Normalizar: score = veces_en_este_slot / total_apariciones_del_plato
  // Solo considerar si score > 0.5 (más de la mitad de las veces en ese slot)
  return normalize(counts)
}
```

### Integración con distribute()

```typescript
function distribute(menu: Menu, preferences?: SlotPreference[], weight?: number): WeekDistribution {
  // weight = min(0.7, entriesConSwaps.length * 0.1) — calculado por el caller
  // 1. Aplicar reglas fijas (prioridad absoluta) — sin cambios
  // 2. Para platos sin regla fija:
  //    - Si hay preferencia con score > 0.5 → Math.random() < weight para respetar
  //    - Resto → aleatorio puro
  // 3. Resolver conflictos (2 platos prefieren mismo slot):
  //    - Gana el de mayor score
  //    - El perdedor va aleatorio
}
```

### Peso de preferencias: escalado progresivo

- El peso se escala con el número de entradas con swaps del mismo menú:
  - `peso = min(0.7, entriesConSwaps.length * 0.1)`
  - 3 semanas con swaps → 30%, 5 → 50%, 7+ → 70%
- Se implementa con un `Math.random() < peso` por cada plato con preferencia
- Si el random cae dentro del peso, se intenta colocar en su slot preferido
- Si el slot ya está ocupado por una regla fija o preferencia más fuerte, se ignora

## Flujo de Selección de Menú

### Pantalla de confirmación (MenuSelect)

Al confirmar un menú, se muestra:
- **Botón principal:** "Programar para el lunes" → guarda en `nextMenuId` + `nextDistribution`
- **Botón secundario (texto link):** "Activar ahora" → reemplaza inmediatamente (comportamiento v1.0)

Si ya hay un menú programado y el usuario programa otro, se reemplaza el programado.

### Indicador de menú programado

En la vista Hoy y Semana, si hay `nextMenuId`, mostrar un banner sutil:
```
┌──────────────────────────────────┐
│ 📅 Próximo lunes: Dieta 7       │
└──────────────────────────────────┘
```

## Vista Semana Dual

### Sin menú programado (comportamiento actual)

```
Semana actual — Dieta 5
[Lun] [Mar] [Mié] [Jue] [Vie] [Sáb] [Dom]
 gris  gris  HOY   ←── editables ──→
```

- Días anteriores a hoy: se muestran con opacidad reducida, no son pulsables
- Día actual y posteriores: editables con swap como hasta ahora

### Con menú programado

```
Semana actual — Dieta 5 (hasta domingo)
[Mié] [Jue] [Vie] [Sáb] [Dom]
 HOY   ←── editables ──→

─────────────────────────────────

Próxima semana — Dieta 7 (desde el lunes)
[Lun] [Mar] [Mié] [Jue] [Vie] [Sáb] [Dom]
 ←────────── editables ──────────────→
```

- Separador visual claro entre ambos bloques
- Swaps del bloque inferior escriben en `nextDistribution` y marcan `nextHasSwaps = true`
- No se permite swap cruzado entre bloques

## Vista de Histórico

### Ubicación en la UI

Nueva tab "📊 Historial" reemplazando "Libres" (se mantienen 4 tabs):

```
[Hoy] [Semana] [Historial] [Menú]
 📅      📋       📊        🔍
```

Los alimentos libres se mueven a la vista Hoy como tarjeta-botón al final:
- Tarjeta con texto "🥗 ¿Tienes hambre? Mira qué puedes picar →"
- Al pulsar abre un modal (bottom sheet) con el contenido actual de AlimentosLibres
- El modal se cierra con botón ✕ o pulsando fuera

### Componentes

```
HistoryView
├── HistoryStats (resumen arriba)
│   ├── Total semanas
│   ├── Menú más usado
│   └── Racha actual
├── HistoryList (scroll de entradas)
│   └── HistoryCard × N
│       ├── Menú ID + fechas
│       ├── Badge "editado" si hadSwaps
│       └── onPress → HistoryDetail
└── HistoryDetail (modal/pantalla)
    └── Distribución completa de esa semana
```

### Indicador en MenuSelect

En cada tarjeta de menú, añadir un badge:
- "×3" si se ha completado 3 veces
- "Sin estrenar" con borde punteado si nunca se ha completado
- Color diferenciado para menús nunca usados (sugerencia visual de variedad)

## Mejoras UX en DayView

### Slot atenuado por hora

```
Si hora actual >= 16:00 → comida en gris, cena destacada
Si hora actual < 16:00 → comida destacada, cena normal
```

### Tarjeta "Mañana" con menú nuevo (domingo)

Si es domingo y hay `nextMenuId`:
```
┌─────────────────────────────────────┐
│  📅 Mañana — Lunes                  │
│  ┌───────────────────────────────┐  │
│  │ 🆕 Empieza Dieta 7           │  │
│  └───────────────────────────────┘  │
│  Comida: [plato del nuevo menú]     │
│  Cena: [plato del nuevo menú]       │
└─────────────────────────────────────┘
```

### Toast de semana completada

Al detectar ciclo completado, mostrar toast animado durante 3s:
```
┌──────────────────────────────────┐
│ ✅ Semana completada — Dieta 5   │
└──────────────────────────────────┘
```

## Calendario Visual en Historial

Grid de celdas donde cada celda = 1 semana:
```
Mayo 2026
[D5] [D5] [D5] [D7] [D7]
 ██   ██   ██   ▓▓   ▓▓
```
- Cada menú tiene un color asignado (se genera automáticamente)
- Al pulsar una celda → navega al detalle de esa semana
- Scroll horizontal por meses

## Migración v1.0 → v1.1

1. Al abrir la app por primera vez con v1.1:
   - Si existe `weekPlans/current` sin `weekStartedAt`:
     - Asignar `weekStartedAt = updatedAt` (asumir que empezó cuando se seleccionó)
     - Asignar `hasSwaps = false`
2. La colección `history` empieza vacía
3. No se intenta reconstruir histórico pasado (no hay datos)

## Decisiones de Diseño

| Decisión | Alternativa descartada | Motivo |
|----------|----------------------|--------|
| Detección por tiempo (7 días) | Botón manual "completar semana" | Menos fricción, automático |
| Histórico en Firestore | LocalStorage | Sincronización entre dispositivos |
| Preferencias escalado progresivo (10%×n, max 70%) | Peso fijo desde el inicio | Evitar que pocas coincidencias casuales se conviertan en preferencia fuerte |
| Solo aprender de semanas con swaps | Aprender de todas | Distinguir preferencia real de casualidad del random |
| Programar menú para el lunes | Solo activar inmediato | Refleja el uso real: se elige el viernes/sábado para la semana siguiente |
| 4 tabs (Hoy, Semana, Historial, Menú) | 5 tabs | Cabe bien en iPhone, Libres se integra como modal en Hoy |
| Tab nueva "Historial" | Dentro de la tab Menú | Separación de concerns, acceso directo |
| weekStartedAt en current | Documento separado de tracking | Simplicidad, un solo read |
| Sin límite de histórico | Purgar > 1 año | Uso personal, datos mínimos |
| Score > 0.5 para preferencia | Cualquier aparición cuenta | Evitar ruido de una sola semana |
| Mínimo 3 semanas para activar | Activar desde la primera | Necesita patrón real, no casualidad |
