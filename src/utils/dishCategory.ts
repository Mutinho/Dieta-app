export interface DishCategory {
  id: string
  icon: string
  color: string
}

const CATEGORIES: { id: string; icon: string; color: string; pattern: RegExp }[] = [
  { id: 'bocadillo', icon: '🥖', color: '$orange3', pattern: /bocadillo/i },
  { id: 'leche', icon: '🥛', color: '$gray4', pattern: /leche|taz[oó]n/i },
  { id: 'frutas', icon: '🍓', color: '$red2', pattern: /frutas|fruta/i },
  { id: 'libre', icon: '🎉', color: '$purple4', pattern: /COMIDA LIBRE/i },
  { id: 'ensalada', icon: '🥗', color: '$green3', pattern: /ensalada/i },
  { id: 'huevos', icon: '🍳', color: '$yellow3', pattern: /huevo|tortilla francesa|revuelto/i },
  { id: 'pasta', icon: '🍝', color: '$yellow4', pattern: /pasta|espagueti|macarrones|tallarines|lasaña|canelones|fideos/i },
  { id: 'legumbres', icon: '🫘', color: '$orange4', pattern: /lentejas|garbanzos|alubias|judiones|legumbres|fabada/i },
  { id: 'arroz', icon: '🍚', color: '$color3', pattern: /arroz|paella|risotto/i },
  { id: 'gazpacho', icon: '🍅', color: '$red3', pattern: /gazpacho|salmorejo/i },
  { id: 'sopa', icon: '🥣', color: '$orange2', pattern: /crema de|puré|sopa|vichyssoise/i },
  { id: 'patatas', icon: '🥔', color: '$yellow3', pattern: /patata|campera/i },
  { id: 'verduras', icon: '🥦', color: '$green4', pattern: /verdura|menestra|pisto|calabacín|berenjena|brócoli|espinacas|acelgas/i },
  { id: 'pescado', icon: '🐟', color: '$blue4', pattern: /salm[oó]n|lubina|dorada|merluza|lenguado|gallo|pescado|langostinos|gulas|marisco|sepia|emperador|boquerones|atún|bacalao/i },
  { id: 'pollo', icon: '🍗', color: '$orange5', pattern: /pollo|pavo/i },
  { id: 'carne', icon: '🥩', color: '$red4', pattern: /ternera|añojo|cerdo|lomo|solomillo|filete|hamburguesa|albóndigas|carne/i },
]

const DEFAULT_CATEGORY: DishCategory = { id: 'otro', icon: '🍽️', color: '$color3' }

export function getDishCategory(dish: string): DishCategory {
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(dish)) return { id: cat.id, icon: cat.icon, color: cat.color }
  }
  return DEFAULT_CATEGORY
}

export function getDishCategories(dish: string): DishCategory[] {
  const matches: DishCategory[] = []
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(dish)) matches.push({ id: cat.id, icon: cat.icon, color: cat.color })
  }
  return matches.length > 0 ? matches : [DEFAULT_CATEGORY]
}
