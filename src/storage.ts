import type { MealPlan, ShoppingItem } from './types';

const PLANS_KEY = 'gohan-planner:plans';
const ACTIVE_PLAN_KEY = 'gohan-planner:active-plan-id';

function isMealPlan(obj: unknown): obj is MealPlan {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.title === 'string' &&
    typeof o.days === 'number' &&
    typeof o.servings === 'number' &&
    typeof o.mood === 'string' &&
    Array.isArray(o.recentMeals) &&
    Array.isArray(o.nutritionalFocus) &&
    typeof o.notes === 'string' &&
    Array.isArray(o.meals) &&
    Array.isArray(o.shoppingList)
  );
}

export function loadPlans(): MealPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMealPlan);
  } catch {
    return [];
  }
}

export function savePlans(plans: MealPlan[]): void {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function loadActivePlanId(): string | null {
  return localStorage.getItem(ACTIVE_PLAN_KEY);
}

export function saveActivePlanId(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(ACTIVE_PLAN_KEY);
  } else {
    localStorage.setItem(ACTIVE_PLAN_KEY, id);
  }
}

export function importPlan(plan: MealPlan): { overwritten: boolean } {
  const plans = loadPlans();
  const existingIndex = plans.findIndex((p) => p.id === plan.id);
  const overwritten = existingIndex >= 0;
  if (overwritten) {
    plans[existingIndex] = plan;
  } else {
    plans.unshift(plan);
  }
  savePlans(plans);
  return { overwritten };
}

export function deletePlan(id: string): void {
  const plans = loadPlans().filter((p) => p.id !== id);
  savePlans(plans);
  if (loadActivePlanId() === id) {
    saveActivePlanId(null);
  }
}

export function updateShoppingItems(planId: string, items: ShoppingItem[]): void {
  const plans = loadPlans();
  const idx = plans.findIndex((p) => p.id === planId);
  if (idx >= 0) {
    plans[idx] = { ...plans[idx], shoppingList: items };
    savePlans(plans);
  }
}

export function validateMealPlan(raw: unknown): MealPlan {
  if (!isMealPlan(raw)) {
    throw new Error('MealPlan 形式のJSONではありません。必須フィールドが不足しているか型が不正です。');
  }
  return raw;
}
