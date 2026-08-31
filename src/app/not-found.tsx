import Image from "next/image";
import Link from "next/link";

export default function GlobalNotFound() {
    return (
        <html lang="uk">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>404 — Сторінку не знайдено</title>
                <style>{`
                    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        background: #F5F5F5;
                        color: #000;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .wrapper {
                        text-align: center;
                        padding: 40px 24px;
                        max-width: 600px;
                    }
                    .img-wrap {
                        margin-bottom: 32px;
                    }
                    .img-wrap img {
                        max-width: 100%;
                        height: auto;
                    }
                    h1 {
                        font-size: 28px;
                        font-weight: 700;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        margin-bottom: 16px;
                        color: #000;
                    }
                    p {
                        font-size: 15px;
                        color: #666;
                        margin-bottom: 8px;
                    }
                    a.btn {
                        display: inline-block;
                        margin-top: 28px;
                        background: #E30613;
                        color: #fff;
                        text-decoration: none;
                        padding: 14px 32px;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 700;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        transition: background 0.2s;
                    }
                    a.btn:hover {
                        background: #FF1A2A;
                    }
                `}</style>
            </head>
            <body>
                <div className="wrapper">
                    <div className="img-wrap">
                        <Image
                            src="/images/404.webp"
                            alt="404"
                            width={544}
                            height={348}
                            priority
                        />
                    </div>
                    <h1>Сторінку не знайдено</h1>
                    <p>Такої сторінки ми не маємо, зате є багато акційних пропозицій.</p>
                    <p>Знайти їх можна на домашній сторінці.</p>
                    <Link href="/" className="btn">
                        Повернутися на головну
                    </Link>
                </div>
            </body>
        </html>
    );
}
