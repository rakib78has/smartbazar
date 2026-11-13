export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  logoUrl?: string;
  primaryWhatsAppNumber: string; // e.g. "8801700000000"
  supportWhatsAppNumber?: string;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  freeDeliveryThreshold: number; // e.g. 2000 BDT
  currencySymbol: string; // "৳"
  announcementText: string;
  announcementActive: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  enableOrderCelebration?: boolean;
  enableMetaPixelTracking?: boolean;
}
