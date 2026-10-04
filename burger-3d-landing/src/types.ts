export type IngredientType = 'patty' | 'cheese' | 'tomato' | 'lettuce' | 'bacon';

export interface Ingredient {
  id: string;
  type: IngredientType;
}

export interface IngredientProps {
  name: string;
  price: number;
  height: number;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  transmission?: number;
  thickness?: number;
  ior?: number;
}

export const INGREDIENT_DATA: Record<IngredientType, IngredientProps> = {
  patty: { name: 'Carne Smash', price: 2.5, height: 0.45, color: '#3b2210', roughness: 0.9, metalness: 0.1 },
  cheese: { name: 'Cheddar', price: 1.0, height: 0.08, color: '#ffb000', roughness: 0.3, metalness: 0.1, clearcoat: 0.5 },
  tomato: { name: 'Tomate', price: 0.5, height: 0.15, color: '#cc1100', roughness: 0.1, metalness: 0.1, clearcoat: 1.0, transmission: 0.2, thickness: 0.5, ior: 1.4 },
  lettuce: { name: 'Lechuga', price: 0.5, height: 0.12, color: '#55a620', roughness: 0.7, metalness: 0 },
  bacon: { name: 'Tocino', price: 1.5, height: 0.08, color: '#822416', roughness: 0.6, metalness: 0.1, clearcoat: 0.3 },
};
