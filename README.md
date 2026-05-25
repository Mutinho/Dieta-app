# 🍽️ Dieta App

PWA para gestionar menús semanales de dieta. Diseñada para uso personal en 2 iPhones con sincronización en tiempo real.

## Qué hace

- **Selección de menú** — Elige entre 18 menús predefinidos, filtrando por mes
- **Distribución automática** — Reparte los 12 platos del menú en 7 días con reglas inteligentes:
  - Bocadillos siempre a cena
  - Pescado y ternera a cena (fuera de verano)
  - Bocadillo de jamón serrano siempre el viernes
  - COMIDA LIBRE + Verduras/Frutas el sábado
- **Vista día actual** — Comida y cena de hoy + preview de mañana
- **Vista semanal** — Los 7 días de un vistazo con posibilidad de editar
- **Edición de platos** — Pulsa un plato para intercambiarlo con otro
- **Alimentos libres** — Referencia rápida de alimentos de libre consumo con iconos
- **Sincronización** — Ambos dispositivos ven los mismos datos en tiempo real
- **Offline** — Funciona sin conexión para consultar el menú cargado

## Stack

| Tecnología | Uso |
|-----------|-----|
| React 19 + TypeScript | Frontend |
| Vite 8 | Build tool |
| Tamagui 2 | UI framework (tema auto light/dark) |
| Firebase Firestore | Persistencia y sincronización |
| vite-plugin-pwa | Service Worker y manifest |
| GitHub Pages | Hosting |

## Instalación

```bash
# Clonar
git clone https://github.com/Mutinho/Dieta-app.git
cd Dieta-app

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview
```

## Instalar en iPhone

1. Abre la URL de la app en Safari
2. Pulsa el botón de compartir (↑)
3. "Añadir a pantalla de inicio"
4. La app se instala como una app nativa

## Estructura del proyecto

```
src/
├── App.tsx                  # Layout principal con tabs
├── main.tsx                 # Entry point + TamaguiProvider
├── firebase.ts              # Configuración Firebase
├── types.ts                 # Interfaces TypeScript
├── global.css               # Estilos globales, safe areas iOS
├── data/
│   └── menus_dieta.json     # 18 menús (6 comidas + 6 cenas c/u)
├── hooks/
│   ├── useWeekPlan.ts       # Sincronización Firestore
│   └── useMenuSearch.ts     # Filtro y ordenación de menús
├── utils/
│   └── distribute.ts        # Algoritmo de distribución
└── components/
    ├── TabBar.tsx            # Navegación inferior
    ├── DayView.tsx           # Vista hoy + mañana
    ├── WeekView.tsx          # Vista semanal + edición
    ├── MenuSelect.tsx        # Selección de menú
    └── AlimentosLibres.tsx   # Referencia alimentos libres
```

## Firebase

El proyecto usa Firebase Firestore (plan gratuito Spark) para sincronizar el menú activo entre dispositivos. La configuración está en `src/firebase.ts`.

Firestore almacena un único documento (`weekPlans/current`) con:
- `menuId` — Menú seleccionado
- `distribution` — Distribución de platos por día
- `updatedAt` — Timestamp de última modificación

## Menús

Los menús están en `src/data/menus_dieta.json`. Cada menú tiene:
- `dieta_id` — Identificador (ej: "Dieta 12")
- `Fecha` — Mes asociado
- `comidas` — 6 platos para comida
- `cenas` — 6 platos para cena

El código añade automáticamente "COMIDA LIBRE" y "Verduras + Frutas de libre consumo" al sábado.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (localhost:5173) |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Preview del build |
| `npm run lint` | Linter ESLint |
