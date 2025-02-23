import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Category {
  id: string;
  name: string;
  is_editable: string;
  user_id: string;
  order: number;
  created_at: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  isFavorite?: boolean;
  brand: string | null;
  category_id: string | null;
  color: string | null;
  created_at: string | null;
  image_url: string | null;
  is_favorite: boolean | null;
  notes: string | null;
  price: number | null;
  purchase_date: string | null;
  season: "winter" | "summer" | "fall" | "spring" | null;
  size: string | null;
  user_id: string | null;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  clothes?: ClothingItem[];
}