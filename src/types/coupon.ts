export interface Coupon {
  id: string;
  code: string; // e.g. "SAVE50", "EID100"
  description?: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number; // e.g. 50 (for ৳50) or 10 (for 10%)
  minOrderAmount: number; // e.g. 500 BDT
  isActive: boolean;
  expiresAt?: string;
}

export const initialCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'SAVE50',
    description: 'যেকোনো ৫০০ টাকার বেশি অর্ডারে ৫০ টাকা ছাড়',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 500,
    isActive: true,
  },
  {
    id: 'coup-2',
    code: 'EID100',
    description: '১০০০ টাকার বেশি অর্ডারে ১০০ টাকা ছাড়',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    isActive: true,
  },
];
