# Requirements - Dieta App

## Descripción General

PWA React para gestionar menús semanales de dieta. Uso exclusivo en 2 iPhones con datos sincronizados en tiempo real via Firebase Firestore. Los menús base se cargan desde un JSON estático con 18 dietas predefinidas (6 comidas + 6 cenas cada una).

## Requisitos Funcionales

### RF-1: Búsqueda y selección de menú
- El usuario filtra menús por mes mediante un selector/combo nativo
- Los menús se muestran ordenados por número (Dieta 1, 2, 3...)
- Al pulsar un menú se muestra su detalle (lista de comidas y cenas)
- Desde el detalle se confirma la selección, generando la distribución automática
- Si ya hay un menú activo, se muestra aviso de que será reemplazado
- Tras confirmar, se navega automáticamente a la vista Semana

### RF-2: Distribución aleatoria
- Cada menú tiene 12 platos en el JSON (6 comidas + 6 cenas)
- El código añade automáticamente "COMIDA LIBRE" (comida sábado) y "Verduras + Frutas de libre consumo" (cena sábado)
- Total: 14 platos distribuidos en 7 días × 2 slots
- Cada plato se usa exactamente una vez
- Restricciones de la distribución automática:
  - **Sábado fijo:** COMIDA LIBRE (comida) + Verduras + Frutas (cena)
  - **Siempre:** Bocadillos → slot cena
  - **Siempre:** Bocadillo de jamón serrano → cena del viernes
  - **Fuera de julio/agosto:** Platos con pescado o ternera → slot cena
  - Palabras clave pescado: salmón, lubina, dorada, merluza, lenguado, gallo, pescado, langostinos, gulas, marisco, sepia, emperador, boquerones
  - Palabras clave ternera: ternera, añojo
  - Los platos restantes se reparten aleatoriamente

### RF-3: Vista día actual (tab "Hoy")
- Tarjeta del día actual con comida y cena
- Tarjeta del día siguiente (preview para organización)
- Disposición vertical
- Si no hay menú activo, redirige a selección de menú

### RF-4: Vista semanal (tab "Semana")
- Vista completa de lunes a domingo con comida y cena por día
- Highlight del día actual con badge "HOY"
- Tip informativo: "Pulsa un plato para cambiarlo"

### RF-5: Edición de platos (selector)
- Al pulsar un plato en la vista semanal, se abre una pantalla de selección
- Se muestra el plato actual destacado arriba
- Lista de todos los demás platos separados por sección (Comidas / Cenas)
- Al elegir un plato, se intercambian automáticamente
- Toast "✓ Guardado" confirma la operación
- Las restricciones de distribución NO aplican a la edición manual

### RF-6: Sección alimentos libres (tab "Libres")
- Vista de referencia con alimentos de libre consumo
- Cada alimento con icono emoji descriptivo en chips
- Separación: alimentos generales (fondo verde) y frutas (fondo naranja)

### RF-7: Sincronización en tiempo real
- Los 2 dispositivos comparten el mismo estado via Firebase Firestore
- Cambios reflejados en tiempo real (onSnapshot)
- Sin autenticación (uso privado, 2 dispositivos)

### RF-8: Persistencia
- Menú activo y distribución en Firestore (documento "current")
- Persistencia offline via IndexedDB del SDK Firebase
- Al reabrir la app se carga el último estado

## Requisitos No Funcionales

### RNF-1: PWA instalable en iOS
- Manifest con iconos (180px, 1024px)
- Service Worker con precache de assets (vite-plugin-pwa)
- Meta tags: apple-mobile-web-app-capable, status-bar-style, theme-color
- viewport-fit=cover para safe areas

### RNF-2: UX móvil
- Safe areas iOS (notch, barra inferior)
- Scroll to top al cambiar de tab
- Feedback visual: toast al guardar, spinner al cargar
- Touch-friendly: áreas de interacción amplias

### RNF-3: Diseño
- Tamagui v2 como framework visual
- Tema automático light/dark según preferencia del sistema
- Mobile-first (375px-430px)

### RNF-4: Hosting
- GitHub Pages desde repositorio personal
- Build estático (Vite)

### RNF-5: Coste cero
- Firebase Spark plan (gratis)
- GitHub Pages gratuito

## Datos de entrada

- 18 menús en `src/data/menus_dieta.json`
- Cada menú: `dieta_id`, `Fecha`, `comidas[6]`, `cenas[6]`
- Sección `alimentos_libres` (general + frutas)

## Fuera de alcance (v1)

- Autenticación de usuarios
- Edición de menús base
- Historial de semanas anteriores
- Notificaciones
- Lista de la compra
- Layout responsive desktop
