export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packaging'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export interface OrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-202611-1001"
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryZone: DeliveryZone;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  courierTrackingCode?: string;
  courierName?: string;
  channel: 'whatsapp' | 'website';
  isFlaggedRisky?: boolean;
  paymentMethod?: PaymentMethod;
  paymentTrxId?: string;
  paymentSenderPhone?: string;
  deliveryTimeSlot?: string;
  createdAt: string;
  updatedAt: string;
}
