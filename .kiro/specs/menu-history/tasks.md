# Tasks - Histórico de Menús (v1.1)

## Estado: 📋 Pendiente de implementación

## Fase 1: Modelo de datos y migración

- [ ] Actualizar `types.ts`: añadir `weekStartedAt`, `hasSwaps`, `nextMenuId`, `nextDistribution`, `nextHasSwaps` a `WeekPlan`, crear interfaz `HistoryEntry`
- [ ] Modificar `useWeekPlan.ts` → `selectMenu()`: implementar 2 modos — "programar" (escribe next*) y "activar ahora" (comportamiento actual + weekStartedAt)
- [ ] Modificar `useWeekPlan.ts` → `swapMeals()`: aceptar parámetro `target: 'current' | 'next'`, escribir en `distribution` o `nextDistribution` según corresponda, marcar `hasSwaps`/`nextHasSwaps`
- [ ] Lógica de migración: en el snapshot listener, si `weekStartedAt` no existe, asignar `updatedAt` como valor inicial

## Fase 2: Detección de ciclo, registro y activación de menú programado

- [ ] Crear `utils/cycle.ts`: función `getMondayTimestamp(date)` y `getCompletedWeeks(weekStartedAt, now)`
- [ ] Crear `utils/historyService.ts`: función `registerCompletedWeek(plan, weekStart, weekEnd)` que escribe en Firestore `history/{menuId}_{weekStart}`
- [ ] Integrar detección en `useWeekPlan.ts`: tras recibir snapshot, ejecutar lógica de ciclo. Si hay semanas completas → registrar, y si hay nextMenuId → promover a activo
- [ ] Guard de idempotencia: usar ID determinista `{menuId}_{weekStart}` para evitar duplicados entre dispositivos

## Fase 2b: Vista semana dual

- [ ] Modificar `WeekView.tsx`: mostrar días pasados en gris (no editables), solo permitir swap en días >= hoy
- [ ] Modificar `WeekView.tsx`: si hay `nextMenuId`, renderizar segundo bloque con la próxima semana (separador visual + título)
- [ ] Swaps en bloque "próxima semana" llaman a `swapMeals(..., 'next')` → actualiza `nextDistribution`

## Fase 3: Motor de preferencias

- [ ] Crear `utils/preferences.ts`: función `calculatePreferences(entries: HistoryEntry[])` → `SlotPreference[]`
- [ ] Crear `hooks/useHistory.ts`: hook que lee colección `history` filtrada por `menuId`, devuelve entries + stats
- [ ] Modificar `utils/distribute.ts`: aceptar parámetros opcionales `preferences?: SlotPreference[]` y `weight?: number`, aplicar lógica de escalado tras reglas fijas
- [ ] Integrar en `MenuSelect.tsx`: al confirmar menú, consultar histórico del menuId (solo entradas con hadSwaps), calcular preferencias y peso (`min(0.7, n * 0.1)`), pasar a `distribute()`

## Fase 4: Vista de histórico y cambios en MenuSelect

- [ ] Crear `components/HistoryView.tsx`: componente principal con stats + lista
- [ ] Crear sub-componente `HistoryStats`: total semanas, menú más usado, racha
- [ ] Crear sub-componente `HistoryCard`: tarjeta por semana (menú, fechas, badge ediciones)
- [ ] Crear sub-componente `HistoryDetail`: vista detalle de distribución de una semana pasada
- [ ] Añadir tab "📊 Historial" en `TabBar.tsx` y `App.tsx` (reemplaza "Libres", quedan 4 tabs)
- [ ] Mover alimentos libres a `DayView.tsx`: tarjeta-botón al final que abre modal
- [ ] Crear `components/AlimentosLibresModal.tsx`: modal/sheet con el contenido actual de AlimentosLibres
- [ ] Modificar `MenuSelect.tsx`: al confirmar, mostrar 2 opciones — "Programar para el lunes" (principal) y "Activar ahora" (secundario)
- [ ] Añadir banner "Próximo lunes: Dieta X" en DayView y WeekView cuando hay nextMenuId

## Fase 5: Indicador de repetición en MenuSelect

- [ ] En `useHistory.ts`: exponer función `getMenuCounts()` → `Record<string, number>`
- [ ] Modificar `MenuSelect.tsx`: mostrar badge "×N" en cada tarjeta de menú con el contador
- [ ] Estilo diferenciado para menús nunca usados (ej: borde punteado o label "Nuevo")

## Fase 6: Mejoras UX

- [ ] `DayView.tsx`: atenuar slot pasado según hora (comida gris si >= 16:00, destacar el siguiente)
- [ ] `DayView.tsx`: si es domingo y hay nextMenuId, tarjeta "Mañana" muestra platos del nuevo menú con badge "🆕 Empieza [menú]"
- [ ] Toast de semana completada: al detectar ciclo, mostrar "✅ Semana completada — [menú]" durante 3s
- [ ] `HistoryView.tsx`: añadir calendario visual (grid de semanas coloreado por menú, scroll por meses)
- [ ] `MenuSelect.tsx`: badge "Sin estrenar" con borde punteado en menús nunca completados

## Fase 7: Testing y polish

- [ ] Verificar flujo completo: seleccionar menú → esperar 7 días simulados → verificar registro
- [ ] Verificar que preferencias se aplican correctamente con >= 3 entradas del mismo menú
- [ ] Verificar sincronización del histórico entre 2 dispositivos
- [ ] Verificar que la app funciona correctamente sin histórico (compatibilidad v1.0)
- [ ] Verificar offline: histórico accesible sin conexión
- [ ] Bump versión a 1.1.0 en package.json

## Dependencias entre fases

```
Fase 1 ──► Fase 2 ──► Fase 3
                  │         │
                  ▼         ▼
             Fase 2b    Fase 4
                  │         │
                  └────┬────┘
                       ▼
                   Fase 5
                       │
                       ▼
                   Fase 6
                       │
                       ▼
                   Fase 7
```

## Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/utils/cycle.ts` | Funciones de cálculo de lunes y semanas completadas |
| `src/utils/historyService.ts` | Escritura/lectura de histórico en Firestore |
| `src/utils/preferences.ts` | Motor de cálculo de preferencias |
| `src/hooks/useHistory.ts` | Hook para consumir histórico y stats |
| `src/components/HistoryView.tsx` | Vista principal del histórico |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/types.ts` | Añadir `HistoryEntry`, campos nuevos en `WeekPlan` |
| `src/hooks/useWeekPlan.ts` | Migración, detección ciclo, hasSwaps |
| `src/utils/distribute.ts` | Parámetro preferencias, lógica 60/40 |
| `src/components/MenuSelect.tsx` | Badge repeticiones, pasar preferencias |
| `src/components/TabBar.tsx` | Nueva tab Historial |
| `src/App.tsx` | Nuevo tab type, renderizar HistoryView |
| `package.json` | Versión 1.1.0 |
