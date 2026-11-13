// Facebook Meta Pixel & Google Analytics 4 (GA4) Tracking Hub (100% Free, Client-side)

export interface AnalyticsEventRecord {
  id: string;
  timestamp: string;
  event: string;
  params?: Record<string, unknown>;
  platform: 'Facebook Pixel' | 'GA4' | 'Both';
}

const STORAGE_KEY = 'smartbazar_analytics_events';

/**
 * Tracks an e-commerce event across Meta Pixel, GA4, and internal audit logs.
 */
export function trackPixelEvent(
  event: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase',
  params?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  // 1. Meta (Facebook) Pixel Dispatch
  try {
    const win = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (typeof win.fbq === 'function') {
      win.fbq('track', event, params);
    }
  } catch {}

  // 2. Google Analytics 4 (GA4 / dataLayer) Dispatch
  try {
    const win = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    if (typeof win.gtag === 'function') {
      win.gtag('event', event, params);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event, ...params });
    }
  } catch {}

  // 3. Persist Event into Local Audit Log for Admin Inspection
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const logs: AnalyticsEventRecord[] = raw ? JSON.parse(raw) : [];
    const newRecord: AnalyticsEventRecord = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      event,
      params,
      platform: 'Both',
    };

    // Keep last 40 events
    const updated = [newRecord, ...logs].slice(0, 40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Retrieve stored analytics audit logs
 */
export function getAnalyticsAuditLogs(): AnalyticsEventRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored analytics audit logs
 */
export function clearAnalyticsAuditLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
