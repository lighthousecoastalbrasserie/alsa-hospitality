/** Reject browser requests from other origins before mutating application data. */
export function isSameOrigin(request: Request): boolean {
 const origin = request.headers.get('origin');
 const host = request.headers.get('host');
 if (!origin || !host) return false;
 try {
  const parsed = new URL(origin);
  const protocol = process.env.NODE_ENV === 'production' ? 'https:' : new URL(request.url).protocol;
  return parsed.protocol === protocol && parsed.host === host;
 } catch { return false; }
}
