# Tasks - Dieta App

## Estado: ✅ Implementación completa — Pendiente deploy

## Fase 1: Setup ✅

- [x] Inicializar proyecto React + Vite + TypeScript
- [x] Configurar PWA (vite-plugin-pwa, manifest, service worker)
- [x] Setup Firebase (proyecto dieta-app-23bb3, Firestore modo prueba, SDK)
- [x] Integrar datos (menus_dieta.json en src/data/, types.ts)

## Fase 2: Lógica core ✅

- [x] Algoritmo de distribución (pool 12 platos, reglas bocadillos/pescado/ternera/jamón serrano)
- [x] Hook de búsqueda (filtro por mes, ordenación por número)
- [x] Hook de sincronización Firestore (onSnapshot, selectMenu, swapMeals)

## Fase 3: UI ✅

- [x] Layout y navegación (4 tabs, hash routing, scroll to top)
- [x] Pantalla selección de menú (combo mes, lista, detalle, confirmar con spinner)
- [x] Vista día actual (tarjeta hoy + mañana)
- [x] Vista semanal (7 cards, badge HOY, tip)
- [x] Edición por selector (pantalla intercambio separada comidas/cenas, toast guardado)
- [x] Sección alimentos libres (chips con emojis, separación general/frutas)

## Fase 4: Polish y deploy

- [x] Estilos y UX (Tamagui v2, tema auto, safe areas, meta tags iOS, iconos PWA)
- [ ] Deploy GitHub Pages (configurar base, GitHub Action, verificar PWA install)

## Decisiones técnicas tomadas

| Decisión | Motivo |
|----------|--------|
| Sin drag & drop | Selector es más intuitivo en móvil |
| Sin AlertDialog | Problemas de z-index, confirmación inline |
| Sin tsc -b en build | Tipos Tamagui v2 incompatibles con strict |
| Select HTML nativo | Mejor UX en iOS (picker nativo) |
| Sin layout desktop | Uso principal en 2 iPhones |
| JSON sin COMIDA LIBRE | Evitar variantes de texto, se añade en código |
