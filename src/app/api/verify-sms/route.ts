import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
    const { phone, code } = await req.json();

    if (!phone || !code) {
        return NextResponse.json({ valid: false, error: 'Невірні параметри' }, { status: 400 });
    }

    const entry = otpStore.get(phone);

    if (!entry) {
        return NextResponse.json({ valid: false, error: 'Код не знайдено. Запросіть новий.' });
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(phone);
        return NextResponse.json({ valid: false, error: 'Термін дії коду минув. Запросіть новий.' });
    }

    if (entry.code !== String(code)) {
        return NextResponse.json({ valid: false, error: 'Невірний код. Спробуйте ще раз.' });
    }

    // Valid — remove OTP after successful verification
    otpStore.delete(phone);

    return NextResponse.json({ valid: true });
}
