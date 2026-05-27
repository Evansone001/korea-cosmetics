
export type PurchaseItem = {
  product_id: string;
  quantity: number;
};

export type PurchaseRequest = {
  items: PurchaseItem[];
  coupon_code?: string;
  address_id?: string;
};