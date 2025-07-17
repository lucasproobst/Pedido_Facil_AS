
export type OrderWithDetails = {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  notes: string | null;
  created_at: string;
  estimated_time: number | null;
  user_id: string;
  restaurant_id: string;
  delivery_fee: number | null;
  updated_at: string;
  accepted_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  profiles: {
    name: string;
    phone: string | null;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;
    order_id: string;
    product_id: string;
    created_at: string;
    products: {
      name: string;
      price: number;
    } | null;
  }[];
};
