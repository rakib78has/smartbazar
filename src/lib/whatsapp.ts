import { OrderItem } from '@/types/order';

interface BuildWhatsAppMessageProps {
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZoneText: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  notes?: string;
}

/**
 * Normalizes phone numbers to WhatsApp international format without '+' or special symbols.
 * Converts 017xxxxxxxx or +88017xxxxxxxx to 88017xxxxxxxx
 */
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('880')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return `88${cleaned}`;
  }
  return `880${cleaned}`;
}

/**
 * Builds the beautifully formatted order message for WhatsApp
 */
export function buildOrderMessage({
  orderNumber,
  customerName,
  customerPhone,
  deliveryAddress,
  deliveryZoneText,
  items,
  subtotal,
  deliveryCharge,
  discount,
  total,
  notes,
}: BuildWhatsAppMessageProps): string {
  const itemsText = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*${item.variantName ? ` (${item.variantName})` : ''}\n   পরিমাণ: ${item.quantity} টি | দাম: ৳${item.price * item.quantity}`
    )
    .join('\n');

  return `🛍️ *নতুন অর্ডার রিকোয়েস্ট*
${orderNumber ? `অর্ডার নম্বর: #${orderNumber}\n` : ''}---------------------------------
${itemsText}
---------------------------------
💰 সাবটোটাল: ৳${subtotal}
🚚 ডেলিভারি চার্জ (${deliveryZoneText}): ৳${deliveryCharge}
${discount > 0 ? `🏷️ ডিসকাউন্ট: -৳${discount}\n` : ''}💵 *সর্বমোট প্রদেয়: ৳${total}*
---------------------------------
👤 *কাস্টমারের তথ্য:*
নাম: ${customerName}
মোবাইল: ${customerPhone}
ঠিকানা: ${deliveryAddress}
${notes ? `নোট: ${notes}\n` : ''}---------------------------------
_অনুগ্রহ করে অর্ডারটি কনফার্ম করুন। ধন্যবাদ!_`;
}

/**
 * Generates the direct WhatsApp Click-to-Chat URL
 */
export function generateWhatsAppOrderUrl(
  whatsAppNumber: string,
  messageProps: BuildWhatsAppMessageProps
): string {
  const normalizedNumber = formatWhatsAppNumber(whatsAppNumber);
  const message = buildOrderMessage(messageProps);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;
}
