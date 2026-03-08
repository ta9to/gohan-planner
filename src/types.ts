export interface MealItem {
  name: string;
  description: string;
  ingredients: string[];
  cookTime: number;
  nutrition: { highlight: string };
}

export interface DayMeal {
  day: number;
  date: string;
  breakfast?: MealItem;
  lunch?: MealItem;
  dinner?: MealItem;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

export interface MealPlan {
  id: string;
  createdAt: string;
  title: string;
  days: number;
  servings: number;
  mood: string;
  recentMeals: string[];
  nutritionalFocus: string[];
  notes: string;
  meals: DayMeal[];
  shoppingList: ShoppingItem[];
}
