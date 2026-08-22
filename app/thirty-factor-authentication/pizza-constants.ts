export type SauceId = 'tomato' | 'hot'
export type CheeseId = 'cheese'
export type ExtraId = 'pepperoni' | 'mushroom' | 'olive' | 'pineapple'
export type IngredientId = SauceId | CheeseId | ExtraId

export type IngredientKind = 'sauce' | 'cheese' | 'extra'

export type Ingredient = {
  id: IngredientId
  label: string
  kind: IngredientKind
  color: string
}

/** Counted extras on a recipe (cheese is separate boolean). */
export type ExtraCounts = Partial<Record<ExtraId, number>>

export type PizzaRecipe = {
  sauce: SauceId
  cheese: boolean
  extras: ExtraCounts
}

export type PizzaBuild = {
  sauce: SauceId | null
  cheese: boolean
  extras: ExtraId[]
}

export const SAUCES: Ingredient[] = [
  { id: 'tomato', label: 'Tomato Sauce', kind: 'sauce', color: '#c43c2c' },
  { id: 'hot', label: 'Hot Sauce', kind: 'sauce', color: '#e85d04' },
]

export const CHEESE: Ingredient = {
  id: 'cheese',
  label: 'Cheese',
  kind: 'cheese',
  color: '#f5d76e',
}

export type ExtraIngredient = Ingredient & { id: ExtraId; kind: 'extra' }

export const EXTRAS: ExtraIngredient[] = [
  { id: 'pepperoni', label: 'Pepperoni', kind: 'extra', color: '#b91c1c' },
  { id: 'mushroom', label: 'Mushroom', kind: 'extra', color: '#a8a29e' },
  { id: 'olive', label: 'Olive', kind: 'extra', color: '#1f2937' },
  { id: 'pineapple', label: 'Pineapple', kind: 'extra', color: '#fbbf24' },
]

export const EXTRA_IDS: ExtraId[] = EXTRAS.map((e) => e.id)

export const ALL_INGREDIENTS: Ingredient[] = [...SAUCES, CHEESE, ...EXTRAS]

export function getIngredient(id: IngredientId): Ingredient {
  return ALL_INGREDIENTS.find((i) => i.id === id)!
}

export function emptyBuild(): PizzaBuild {
  return { sauce: null, cheese: false, extras: [] }
}

export function countExtras(extras: ExtraId[]): ExtraCounts {
  const counts: ExtraCounts = {}
  for (const id of extras) {
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

export function formatExtraLine(id: ExtraId, count: number): string {
  const label = getIngredient(id).label
  if (count <= 1) return label
  return `${count}× ${label}`
}

export const PIZZAS_TO_WIN = 10
export const MISTAKES_BEFORE_STRIKE = 3
export const EJECT_MS = 320
export const RESULT_FLASH_MS = 550

const BELT_MS_BY_SERVED = [
  9067, // 1st
  8533, // 2nd
  8000, // 3rd
  7200, // 4th
  6400, // 5th
  5600, // 6th
  5067, // 7th
  4533, // 8th
  4000, // 9th
  3467, // 10th
]

export function beltMsForServed(served: number): number {
  return BELT_MS_BY_SERVED[Math.min(served, BELT_MS_BY_SERVED.length - 1)]
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const MAX_TOTAL_TOPPINGS = 5

function recipeBudget(servedCount: number): { types: number; total: number } {
  switch (servedCount) {
    case 0:
      return { types: 0, total: 0 }
    case 1:
      return { types: 1, total: 1 }
    case 2:
      return { types: 1, total: 2 }
    case 3:
      return { types: 1, total: 3 }
    case 4:
      return { types: 2, total: 3 }
    case 5:
      return { types: 2, total: 4 }
    case 6:
      return { types: 3, total: 4 }
    case 7:
      return { types: 2, total: 5 }
    case 8:
      return { types: 3, total: 5 }
    default:
      return { types: 3, total: 5 }
  }
}

/** Distribute `total` pieces across `types` topping ids (each type ≥ 1). */
function distributeToppings(types: number, total: number): ExtraCounts {
  const cappedTotal = Math.min(total, MAX_TOTAL_TOPPINGS)
  const n = Math.min(types, EXTRA_IDS.length, cappedTotal)
  if (n <= 0) return {}

  const picked = shuffleInPlace([...EXTRA_IDS]).slice(0, n)
  const counts = picked.map(() => 1)
  let remaining = cappedTotal - n
  while (remaining > 0) {
    counts[Math.floor(Math.random() * n)] += 1
    remaining -= 1
  }

  const extras: ExtraCounts = {}
  picked.forEach((id, i) => {
    extras[id] = counts[i]
  })
  return extras
}

/** Recipe from served count only — mistakes do not advance this. */
export function pickRecipe(servedCount: number): PizzaRecipe {
  const sauce: SauceId = servedCount === 0 || Math.random() < 0.55 ? 'tomato' : 'hot'
  const cheese = true
  const { types, total } = recipeBudget(servedCount)

  if (types <= 0 || total <= 0) {
    return { sauce: 'tomato', cheese: true, extras: {} }
  }

  return { sauce, cheese, extras: distributeToppings(types, total) }
}

export function recipeMatches(recipe: PizzaRecipe, build: PizzaBuild): boolean {
  if (build.sauce !== recipe.sauce) return false
  if (build.cheese !== recipe.cheese) return false

  const built = countExtras(build.extras)
  const neededIds = Object.keys(recipe.extras) as ExtraId[]
  const builtIds = Object.keys(built) as ExtraId[]
  if (neededIds.length !== builtIds.length) return false

  return neededIds.every((id) => (built[id] ?? 0) === (recipe.extras[id] ?? 0))
}
