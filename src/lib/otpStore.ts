// Shared in-memory OTP store used by send-sms and verify-sms routes.
// In production, replace with Redis or a database-backed solution.

interface OtpEntry {
    code: string;
    expiresAt: number; // Unix timestamp (ms)
}

// We attach to globalThis to survive Next.js hot-module reloads in development.
const g = globalThis as typeof globalThis & { __otpStore?: Map<string, OtpEntry> };

if (!g.__otpStore) {
    g.__otpStore = new Map<string, OtpEntry>();
}

export const otpStore: Map<string, OtpEntry> = g.__otpStore;
