import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Category {
  id: string;
  name: string;
  is_editable: string;
  user_id: string;
  created_at: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  category_id: string;
  brand: string;
  size: string;
  color: string;
  season: string;
  purchase_date: string;
  price: number;
  notes: string;
  image_url: string;
  is_favorite: boolean;
  user_id: string;
  created_at: string;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  clothes?: ClothingItem[];
}