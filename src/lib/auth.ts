// Admin Authentication Helper

export const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@smartbazar.com';
export const DEFAULT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123456';

const SESSION_KEY = 'smartbazar_admin_session';
const FAILED_ATTEMPTS_KEY = 'smartbazar_auth_failed_attempts';
const LOCKOUT_KEY = 'smartbazar_auth_lockout_until';

export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    // Check if session expired (e.g., 24 hours validity)
    if (Date.now() > parsed.expiresAt) {
      logoutAdmin();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setAdminSession(email: string): void {
  if (typeof window === 'undefined') return;
  const session = {
    email,
    token: `tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Reset failed attempts on success
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function checkBruteForceLockout(): { isLocked: boolean; remainingSeconds: number } {
  if (typeof window === 'undefined') return { isLocked: false, remainingSeconds: 0 };
  try {
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntil) {
      const remainingMs = Number(lockoutUntil) - Date.now();
      if (remainingMs > 0) {
        return { isLocked: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
      }
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    }
  } catch {}
  return { isLocked: false, remainingSeconds: 0 };
}

export function recordFailedAttempt(): { isNowLocked: boolean; attempts: number } {
  if (typeof window === 'undefined') return { isNowLocked: false, attempts: 1 };
  try {
    const current = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, String(current));

    if (current >= 5) {
      // Lock for 60 seconds
      const lockoutUntil = Date.now() + 60 * 1000;
      localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
      return { isNowLocked: true, attempts: current };
    }
    return { isNowLocked: false, attempts: current };
  } catch {
    return { isNowLocked: false, attempts: 1 };
  }
}
