export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string; // stored hashed or mock hashed
  defaultAddress?: string;
  deliveryCity?: string;
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka';
  rewardCoins?: number; // 1 coin = 1 BDT discount
  createdAt: string;
}

export interface UserAuthSession {
  user: UserProfile;
  token: string;
}
