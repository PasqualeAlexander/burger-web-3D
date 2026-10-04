export type IngredientType = 'patty' | 'cheese' | 'tomato' | 'lettuce' | 'bacon';

export interface Ingredient {
  id: string;
  type: IngredientType;
}

export const INGREDIENT_DATA: Record<IngredientType, { name: string; price: number; height: number; color: string }> = {
  patty: { name: 'Carne Smash', price: 2.5, height: 0.4, color: '#5C3A21' },
  cheese: { name: 'Cheddar', price: 1.0, height: 0.1, color: '#FFB800' },
  tomato: { name: 'Tomate', price: 0.5, height: 0.15, color: '#E82C0C' },
  lettuce: { name: 'Lechuga', price: 0.5, height: 0.1, color: '#6BBA2F' },
  bacon: { name: 'Tocino', price: 1.5, height: 0.1, color: '#8A2E1B' },
};
