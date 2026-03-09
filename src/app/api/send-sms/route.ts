import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

function generateCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(req: NextRequest) {
    const { phone } = await req.json();

    if (!phone || !/^380\d{9}$/.test(phone)) {
        return NextResponse.json({ error: 'Невірний формат номера телефону' }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

    otpStore.set(phone, { code, expiresAt });

    const turbosmsEnabled = process.env.TURBOSMS_ENABLED === 'true';

    if (turbosmsEnabled) {
        const token = process.env.TURBOSMS_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'TURBOSMS_TOKEN не налаштований' }, { status: 500 });
        }

        const body = {
            recipients: [phone],
            sms: {
                sender: process.env.TURBOSMS_SENDER || 'Myastoriya',
                text: `Ваш код підтвердження: ${code}`,
            },
        };

        const response = await fetch('https://api.turbosms.ua/message/send.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('[TurboSMS] Error:', err);
            return NextResponse.json({ error: 'Помилка відправки SMS' }, { status: 500 });
        }
    } else {
        // Stub mode for development — log code to console
        console.log(`[SMS STUB] Phone: ${phone} → Code: ${code}`);
    }

    return NextResponse.json({ ok: true });
}
