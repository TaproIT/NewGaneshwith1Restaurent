export interface Category {
  id: string;
  label: string;
}

export interface FoodItem {
  id: string;
  categoryId: string;
  title: string;
  price: number;
}