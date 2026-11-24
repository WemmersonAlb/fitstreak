// ---------- Plano nutricional (dados estáticos) ----------

export type MealCategoryId =
  | 'cafe_raiz'
  | 'cafe'
  | 'almoco_feijao'
  | 'almoco'
  | 'lanche'
  | 'jantar'
  | 'jantar_raiz'
  | 'ceia';

export type MealSlotId = 'cafe' | 'almoco' | 'lanche' | 'jantar' | 'ceia';

export interface FoodPortion {
  /** Nome do alimento exatamente como no PDF. */
  food: string;
  /** Medida caseira (ex.: "2 Colher(es) de sopa cheia(s)"). */
  measure: string;
  /** Peso/volume entre parênteses no PDF (ex.: 50). */
  amount: number;
  unit: 'g' | 'ml';
}

export interface MealGroup {
  id: string;
  /** Rótulo derivado do grupo da lista de substituição referenciado. */
  label: string;
  main: FoodPortion;
  substitutions: FoodPortion[];
  /** "Ou escolha N porções do grupo X da lista de substituição." */
  groupRef?: { group: number; portions: number };
  /** Item sem substituições (ex.: Salada e/ou legumes à vontade). */
  freeQuantity?: boolean;
}

export interface PreparationSuggestion {
  id: string;
  /** Número como aparece no PDF (ex.: "01"). */
  number: string;
  title: string;
  description: string;
}

export interface MealCategory {
  id: MealCategoryId;
  slot: MealSlotId;
  name: string;
  groups: MealGroup[];
  notes: string[];
  suggestions: PreparationSuggestion[];
  /** Pontos que precisam de revisão da nutricionista. */
  reviewNotes?: string[];
}

export interface MealSlot {
  id: MealSlotId;
  name: string;
  categories: MealCategoryId[];
  emoji: string;
}

export interface SubstitutionItem {
  food: string;
  measure: string;
  amount: number;
  unit: 'g' | 'ml';
}

export interface SubstitutionGroup {
  number: number;
  name: string;
  items: SubstitutionItem[];
}

export interface Recipe {
  id: string;
  title: string;
  author?: string;
  servings: string;
  ingredients: string[];
  steps: string[];
}

// ---------- Dados do usuário (persistidos) ----------

export type ThemePreference = 'dark' | 'light' | 'system';

export interface Settings {
  theme: ThemePreference;
  waterGoalMl: number;
  userName: string;
  /** Horário sugerido por momento do dia (HH:mm) ou vazio. */
  mealTimes: Record<MealSlotId, string>;
  celebrations: boolean;
}

export interface WaterEntry {
  id: string;
  dateKey: string;
  amountMl: number;
  /** ISO timestamp do registro. */
  createdAt: string;
  /** Meta vigente no momento do registro. */
  goalMl: number;
}

export type MealSelectionKind = 'main' | 'custom-plan' | 'suggestion' | 'other';

export interface MealChoice {
  groupId: string;
  groupLabel: string;
  /** Texto do que foi efetivamente consumido. */
  food: string;
  source: 'main' | 'substitution' | 'group';
}

export interface MealLog {
  id: string;
  dateKey: string;
  slot: MealSlotId;
  categoryId: MealCategoryId;
  kind: MealSelectionKind;
  choices: MealChoice[];
  suggestionId?: string;
  suggestionTitle?: string;
  otherDescription?: string;
  /** Horário de consumo HH:mm (America/Recife). */
  time: string;
  notes: string;
  createdAt: string;
}

export interface FreeMeal {
  id: string;
  dateKey: string;
  description: string;
  notes: string;
  /** Momento do dia que a refeição livre ocupou, se houver. */
  slot?: MealSlotId;
  time: string;
  createdAt: string;
}

export interface UnlockedAchievement {
  unlockedAt: string;
}

export interface Records {
  bestStreak: number;
  bestStreakEnd?: string;
}

export interface Counters {
  waterUndos: number;
  exports: number;
}

export interface AppData {
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  settings: Settings;
  waterEntries: WaterEntry[];
  mealLogs: MealLog[];
  freeMeals: FreeMeal[];
  dailyNotes: Record<string, string>;
  achievements: Record<string, UnlockedAchievement>;
  records: Records;
  counters: Counters;
  /** Campos desconhecidos encontrados em imports/migrações, preservados. */
  extras?: Record<string, unknown>;
}
