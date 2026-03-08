/**
 * Simple admin session: cookie-based guard for /admin routes.
 * loginAdmin(password) compares with VITE_ADMIN_PASSWORD and sets cookie.
 */

const COOKIE_NAME = "admin_session";
const COOKIE_VALUE = "true";
const COOKIE_DAYS = 1;

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()};SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function setAdminSession(): void {
  setCookie(COOKIE_NAME, COOKIE_VALUE, COOKIE_DAYS);
}

export function clearAdminSession(): void {
  document.cookie = `${COOKIE_NAME}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function isAdminSession(): boolean {
  return getCookie(COOKIE_NAME) === COOKIE_VALUE;
}

/**
 * Check password against env and set session cookie if valid.
 * Returns true if login succeeded.
 */
export function loginAdmin(password: string): boolean {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD ?? "";
  if (typeof expected !== "string" || !expected.trim()) {
    return false;
  }
  if (password.trim() === expected.trim()) {
    setAdminSession();
    return true;
  }
  return false;
}
