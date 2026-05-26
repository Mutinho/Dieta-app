# Requirements - Histórico de Menús (v1.1)

## Descripción General

Incorporar un sistema de histórico que registre los menús semanales completados, permitiendo consultar el historial y usar las preferencias acumuladas para influir en la distribución aleatoria de futuros menús.

## Contexto

Actualmente la app solo almacena el menú activo (`weekPlans/current`). Cuando pasa una semana sin cambio manual, el mismo menú se repite. No hay registro de qué menús se han usado ni con qué configuración de platos/días.

## Requisitos Funcionales

### RF-1: Detección de ciclo semanal completado
- Un menú se considera "completado" cuando ha estado activo durante un ciclo completo lunes→domingo
- La detección es retroactiva: se ejecuta al abrir la app, calculando semanas completas transcurridas
- Si han pasado N semanas completas sin abrir la app, se registran las N entradas de golpe
- Si el usuario activa un menú con "Activar ahora" a mitad de semana, esa semana NO se registra
- Si un menú se repite varias semanas consecutivas, se registra una entrada por cada semana completada
- Al detectar que es lunes (o que ha pasado el lunes) y hay un menú programado (`nextMenuId`), se activa automáticamente: el actual va a histórico y el programado pasa a ser el activo

### RF-1b: Selección de menú con programación
- Al seleccionar un menú se ofrecen 2 opciones:
  - **"Programar para el lunes"** (opción por defecto): el menú actual sigue activo hasta el domingo, el nuevo se activa el lunes. La semana actual se completa y registra normalmente
  - **"Activar ahora"** (opción secundaria): reemplaza inmediatamente, la semana en curso no se registra como completada
- Cuando hay un menú programado, se muestra un indicador en la UI: "Próximo menú: [nombre] (desde el lunes)"
- La distribución del menú programado se pre-calcula al programarlo (aplicando preferencias si hay histórico)

### RF-2: Registro en histórico
- Al completarse un ciclo, se guarda:
  - ID del menú (`dieta_id`)
  - Distribución exacta de platos/días que se usó esa semana
  - Fecha de inicio de la semana (lunes)
  - Fecha de fin de la semana (domingo)
  - Si hubo ediciones manuales (swaps) durante esa semana
- El registro es automático y transparente para el usuario (no requiere acción manual)

### RF-2b: Vista semanal dual
- Si NO hay menú programado: se muestra la semana completa (lun→dom) como hasta ahora
- Si hay menú programado: se muestran 2 bloques:
  - **Semana actual**: días restantes hasta domingo. Los días ya pasados se muestran en gris y no son editables
  - **Próxima semana**: lunes→domingo completo del menú programado
- Los swaps funcionan igual en ambos bloques (misma UX, guardado en tiempo real en Firestore)
- Los swaps solo se permiten dentro de cada bloque (no mezclar platos entre semana actual y siguiente)

### RF-3: Vista de histórico
- Nueva pestaña "📊 Historial" (reemplaza la tab "Libres", quedando 4 tabs: Hoy, Semana, Historial, Menú)
- Los alimentos libres se integran en la vista Hoy: tarjeta al final que al pulsarla abre un modal elegante con los alimentos organizados (general + frutas con iconos)
- Muestra lista de semanas completadas, ordenadas de más reciente a más antigua
- Cada entrada muestra: menú usado, rango de fechas, indicador de ediciones
- Al pulsar una entrada se puede ver el detalle de la distribución que se usó esa semana
- Mostrar estadísticas básicas:
  - Número total de semanas completadas
  - Menú más usado (con contador)
  - Racha actual (semanas consecutivas completadas)

### RF-4: Preferencias basadas en histórico
- Al generar una nueva distribución aleatoria, el algoritmo consulta el histórico
- Se identifican patrones de preferencia:
  - Platos que el usuario tiende a mover a cierto día/slot tras la distribución inicial
  - Combinaciones comida+cena del mismo día que se repiten
  - Platos que nunca se mueven (el usuario está conforme con su posición)
- Las preferencias influyen en la distribución pero NO la determinan al 100%:
  - Peso escalado progresivo: `min(0.7, semanas_con_swaps * 0.1)` — crece con el uso
  - Las reglas fijas existentes (bocadillos→cena, jamón→viernes, etc.) siguen teniendo prioridad absoluta
- Si no hay histórico suficiente (< 3 semanas con swaps del mismo menú), se usa distribución 100% aleatoria
- Solo se aprende de semanas donde el usuario hizo intercambios manuales (swaps). Semanas sin editar no cuentan como preferencia

### RF-5: Indicador de repetición
- En la pantalla de selección de menú, mostrar cuántas veces se ha completado cada menú
- Destacar visualmente los menús nunca usados vs los más repetidos

## Requisitos No Funcionales

### RNF-1: Rendimiento
- La consulta del histórico no debe añadir latencia perceptible al generar una distribución
- El histórico se carga bajo demanda (no al inicio de la app)
- Máximo 200ms para calcular preferencias sobre el histórico

### RNF-2: Almacenamiento
- Usar Firestore para el histórico (misma estrategia de sync que el plan actual)
- El histórico debe funcionar offline (IndexedDB persistence ya habilitada)
- Sin límite práctico de entradas (uso personal, ~52 semanas/año máximo)

### RNF-3: Compatibilidad
- No romper el flujo actual: si no hay histórico, la app funciona exactamente igual que v1.0
- Migración transparente: la primera vez que se abre v1.1, el histórico empieza vacío
- Mantener sincronización entre los 2 dispositivos

### RNF-4: UX
- El registro automático no debe mostrar popups ni interrumpir al usuario
- La vista de histórico debe ser consultiva (no editable)
- Las preferencias deben ser sutiles: el usuario no debe sentir que pierde la "sorpresa" de la aleatoriedad

### RF-6: Mejoras de usabilidad en vista Hoy
- El slot de comida/cena que ya pasó (según la hora actual) se muestra atenuado; el siguiente slot se destaca visualmente
- Si es domingo y hay menú programado, la tarjeta "Mañana" muestra los platos del nuevo menú (no del actual que caduca hoy)
- En ese caso, la tarjeta de "Mañana" incluye un indicador destacado tipo badge o banner: "🆕 Empieza Dieta 7" para que quede claro que es un menú nuevo

### RF-7: Feedback de semana completada
- Al detectar que se ha completado una semana, mostrar un toast breve: "✅ Semana completada — [menú] registrada"
- No bloquea la UI, desaparece solo tras 3 segundos

### RF-8: Calendario visual en historial
- Además de la lista, mostrar un mini-calendario (grid de semanas) coloreado por menú
- Permite ver de un vistazo cuántas semanas seguidas se ha usado el mismo menú
- Cada celda = 1 semana, color = menú, al pulsar navega al detalle

### RF-9: Indicador "Sin estrenar" en menús
- En la selección de menú, los que nunca se han completado muestran un badge "Sin estrenar" o borde punteado
- Incentiva variedad visualmente
