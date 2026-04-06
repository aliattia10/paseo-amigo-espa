/**
 * Normalize Didit / Edge Function error strings so toasts don't show raw JSON.
 */
export function humanizeDiditErrorMessage(message: string): string {
  const m = message.trim();
  if (!m.startsWith('{') && !m.startsWith('[')) return message;
  try {
    const o = JSON.parse(m) as { detail?: unknown; message?: unknown; error?: unknown };
    const d = o.detail ?? o.message ?? o.error;
    if (typeof d === 'string') return d;
    if (d != null && typeof d !== 'object') return String(d);
  } catch {
    /* keep original */
  }
  return message;
}
