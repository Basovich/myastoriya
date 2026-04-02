import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { valid: false, error: 'Введіть промокод / сертифікат' },
                { status: 400 }
            );
        }

        // Mock verification logic
        if (code.toLowerCase() === 'aff99') {
            return NextResponse.json({
                valid: true,
                discount: 10,
                type: 'percent', // 10% discount
                message: 'Промокод застосовано! Знижка 10%'
            });
        }

        return NextResponse.json(
            { valid: false, error: 'Невірний промокод або сертифікат' },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { valid: false, error: 'Помилка сервера' },
            { status: 500 }
        );
    }
}
