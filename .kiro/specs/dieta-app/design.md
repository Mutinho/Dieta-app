# Design - Dieta App

## Arquitectura

```
┌─────────────────────────────────────────────┐
│              GitHub Pages                     │
│  ┌─────────────────────────────────────┐    │
│  │   React PWA (Vite build estático)   │    │
│  │   - index.html + JS/CSS bundles     │    │
│  │   - menus_dieta.json (en bundle)    │    │
│  │   - Service Worker (precache)       │    │
│  │   - Iconos PWA (180px, 1024px)      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│     Firebase Firestore (dieta-app-23bb3)     │
│  ┌─────────────────────────────────────┐    │
│  │  Collection: weekPlans              │    │
│  │  Document: "current"                │    │
│  │  - menuId, distribution, updatedAt  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React + TypeScript | 19 |
| Build | Vite | 8 |
| UI Framework | Tamagui | 2.0 |
| Backend | Firebase Firestore | SDK 12 |
| PWA | vite-plugin-pwa | 1.3 |
| Hosting | GitHub Pages | — |

## Estructura de Ficheros

```
src/
├── App.tsx                     # Router con tabs, scroll management
├── main.tsx                    # Entry: TamaguiProvider + tema auto
├── firebase.ts                 # Config Firebase + persistencia offline
├── tamagui.config.ts           # Config Tamagui (defaultConfig v5)
├── types.ts                    # Interfaces TypeScript
├── global.css                  # Reset, safe areas, select styling
├── data/
│   └── menus_dieta.json        # 18 menús (6 comidas + 6 cenas c/u)
├── hooks/
│   ├── useWeekPlan.ts          # Sync Firestore: onSnapshot, selectMenu, swapMeals
│   └── useMenuSearch.ts        # Filtro por mes, ordenación por número
├── utils/
│   └── distribute.ts           # Distribución aleatoria con reglas
└── components/
    ├── TabBar.tsx              # 4 tabs: Hoy, Semana, Menú, Libres
    ├── DayView.tsx            # Tarjeta hoy + mañana
    ├── WeekView.tsx           # 7 cards + selector de intercambio
    ├── MenuSelect.tsx         # Combo mes + lista + detalle + confirmar
    └── AlimentosLibres.tsx    # Chips con emojis (general + frutas)
```

## Modelo de Datos

### TypeScript

```typescript
interface Menu {
  dieta_id: string       // "Dieta 12"
  Fecha: string          // "Mayo"
  comidas: string[]      // 6 platos
  cenas: string[]        // 6 platos
}

type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

interface DayPlan {
  comida: string
  cena: string
}

type WeekDistribution = Record<DayOfWeek, DayPlan>

interface WeekPlan {
  menuId: string
  distribution: WeekDistribution
  updatedAt: number
}
```

### Firestore

```
Collection: weekPlans
└── Document: "current"
    ├── menuId: "Dieta 12"
    ├── distribution:
    │   ├── lunes:     { comida: "...", cena: "..." }
    │   ├── martes:    { comida: "...", cena: "..." }
    │   ├── miercoles: { comida: "...", cena: "..." }
    │   ├── jueves:    { comida: "...", cena: "..." }
    │   ├── viernes:   { comida: "...", cena: "Bocadillo de jamón serrano" }
    │   ├── sabado:    { comida: "COMIDA LIBRE", cena: "Verduras + Frutas..." }
    │   └── domingo:   { comida: "...", cena: "..." }
    └── updatedAt: 1716633600000
```

Reglas Firestore (modo prueba, sin auth):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weekPlans/{doc} {
      allow read, write: if true;
    }
  }
}
```

## Algoritmo de Distribución

```
Input: Menu (6 comidas + 6 cenas)
Pool: 12 platos del JSON

1. Clasificar platos:
   - Bocadillos → forzados a cena (siempre)
   - Pescado/ternera → forzados a cena (solo fuera julio/agosto)
   - Resto → flexibles

2. Asignar slots:
   - Cenas (6): forzados primero, rellenar con flexibles
   - Comidas (6): lo que quede

3. Regla fija: Bocadillo jamón serrano → posición viernes en cenas

4. Shuffle ambos arrays y asignar a lunes-viernes + domingo

5. Sábado fijo: COMIDA LIBRE + Verduras + Frutas de libre consumo
```

## Navegación

4 tabs con TabBar inferior (indicador azul en tab activo):

| Tab | Componente | Descripción |
|-----|-----------|-------------|
| Hoy | DayView | Tarjeta día actual + mañana |
| Semana | WeekView | 7 días, edición por selector |
| Menú | MenuSelect | Filtro mes, lista, detalle, confirmar |
| Libres | AlimentosLibres | Referencia alimentos libres |

Flujo de selección de menú:
```
Lista menús → Pulsar menú → Detalle (comidas/cenas) → Confirmar → Vista Semana
```

Flujo de edición de plato:
```
Vista Semana → Pulsar plato → Lista intercambio (separada comidas/cenas) → Elegir → Swap + Toast
```

## Sincronización

- `onSnapshot` en documento "current" para tiempo real bidireccional
- Escrituras: `setDoc` al seleccionar menú o hacer swap
- Persistencia offline: `enableIndexedDbPersistence` del SDK Firebase
- Sin conflictos: último escritor gana (suficiente para 2 dispositivos)

## PWA

- Manifest: name "Dieta App", display standalone, theme_color #4a90d9
- Iconos: Icon-180.png (apple-touch-icon), Icon-1024.png (manifest)
- Service Worker: precache assets estáticos (generateSW via vite-plugin-pwa)
- Meta tags iOS: apple-mobile-web-app-capable, black-translucent status bar
- Safe areas: viewport-fit=cover + env(safe-area-inset-*)

## Tema Visual

- Tamagui v2 con `defaultConfig` (v5 preset)
- Tema automático: light/dark según `prefers-color-scheme`
- Colores semánticos:
  - Azul: comidas, día actual, acciones primarias
  - Naranja: cenas, acciones secundarias
  - Verde: menú activo, confirmaciones
  - Gris: fondos de tarjetas ($color2)
