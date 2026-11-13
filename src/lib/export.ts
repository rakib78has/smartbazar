import { Order } from '@/types/order';

/**
 * Exports an array of orders to a properly UTF-8 encoded CSV file
 * that opens seamlessly in Microsoft Excel with full Bengali text support.
 */
export function exportOrdersToCSV(orders: Order[], fileName = 'smartbazar-orders'): void {
  if (typeof window === 'undefined' || orders.length === 0) return;

  const headers = [
    'অর্ডার নম্বর',
    'তারিখ ও সময়',
    'কাস্টমারের নাম',
    'মোবাইল নম্বর',
    'ডেলিভারি ঠিকানা',
    'ডেলিভারি এলাকা',
    'পণ্যসমূহ',
    'সাবটোটাল (৳)',
    'ডেলিভারি চার্জ (৳)',
    'ডিসকাউন্ট (৳)',
    'সর্বমোট প্রদেয় (৳)',
    'অর্ডার স্ট্যাটাস',
    'কুরিয়ার ট্র্যাকিং কোড',
    'চ্যানেল',
  ];

  const rows = orders.map((o) => {
    const itemsSummary = o.items
      .map((i) => `${i.productName} ${i.variantName ? `(${i.variantName})` : ''} x ${i.quantity}`)
      .join('; ');

    const dateStr = new Date(o.createdAt).toLocaleString('bn-BD');

    return [
      `"${o.orderNumber}"`,
      `"${dateStr}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${o.deliveryZone === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      o.subtotal,
      o.deliveryCharge,
      o.discount,
      o.total,
      `"${o.status}"`,
      `"${o.courierTrackingCode || 'N/A'}"`,
      `"${o.channel}"`,
    ].join(',');
  });

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays Bengali characters
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports orders in the exact format required by Steadfast Courier
 * for 1-click bulk consignment upload on the Steadfast merchant portal.
 */
export function exportSteadfastCSV(orders: Order[], fileName = 'steadfast-bulk-orders'): void {
  if (typeof window === 'undefined' || orders.length === 0) return;

  const headers = [
    'Invoice',
    'Recipient Name',
    'Recipient Phone',
    'Recipient Address',
    'COD Amount',
    'Note',
  ];

  const rows = orders.map((o) => {
    return [
      `"${o.orderNumber}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      o.total,
      `"${(o.notes || 'Allow customer to check parcel').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
