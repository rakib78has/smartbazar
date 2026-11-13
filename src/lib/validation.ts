import { z } from 'zod';

// Bangladeshi Phone Number Regex
const bdPhoneRegex = /^(?:\+?8801|01)[3-9]\d{8}$/;

export const orderFormSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' })
    .max(80, { message: 'নাম খুব বড় হয়ে গেছে' })
    .trim(),
  customerPhone: z
    .string()
    .trim()
    .regex(bdPhoneRegex, { message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' }),
  deliveryAddress: z
    .string()
    .min(5, { message: 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন' })
    .max(250, { message: 'ঠিকানা সর্বোচ্চ ২৫০ অক্ষরের হতে পারে' })
    .trim(),
  deliveryZone: z.enum(['inside_dhaka', 'outside_dhaka'], {
    message: 'ডেলিভারি এরিয়া সিলেক্ট করুন',
  }),
  notes: z.string().max(200, { message: 'নোট সর্বোচ্চ ২০০ অক্ষর হতে পারে' }).optional(),
  // Honeypot field to trap spam bots (must remain empty for humans)
  honeypot: z.string().max(0, { message: 'Bot detected' }).optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export const productSchema = z.object({
  name: z.string().min(2, 'প্রোডাক্টের নাম দিন').max(150),
  category: z.string().min(1, 'ক্যাটাগরি সিলেক্ট করুন'),
  basePrice: z.number().positive('দাম অবশ্যই ধনাত্মক সংখ্যা হতে হবে'),
  discountPrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative('স্টক ০ বা তার বেশি হতে হবে'),
  description: z.string().min(10, 'ডেসক্রিপশন কমপক্ষে ১০ অক্ষরের হতে হবে'),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const adminLoginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল এড্রেস দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
});
