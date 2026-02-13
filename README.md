# MyAstoriya

SPA-додаток на **Next.js 16** з **SCSS-модулями**, SEO-оптимізацією та контентом у JSON-файлах.

## Стек технологій

| Технологія       | Версія  |
| ---------------- | ------- |
| Next.js          | 16.1.6  |
| React            | 19.2.3  |
| TypeScript       | 5.x     |
| Sass (embedded)  | 1.97.x  |
| Node.js          | ≥ 20.9  |

## Швидкий старт

```bash
# Переконайтеся, що використовуєте Node.js 20+
node -v

# Встановити залежності
npm install

# Запустити dev-сервер
npm run dev        # → http://localhost:3000

# Зібрати production-версію (static export → out/)
npm run build

# Перевірити код (ESLint)
npm run lint
```

> Якщо на системі встановлено кілька версій Node.js через `n`:
> ```bash
> export PATH="/usr/local/n/versions/node/20.20.0/bin:$PATH"
> ```

---

## Структура проекту

```
├── public/                     # Статичні файли (favicon, зображення)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Кореневий layout (SEO metadata, шрифти)
│   │   ├── page.tsx            # Головна сторінка — композиція компонентів
│   │   ├── globals.css         # CSS custom properties, базові стилі
│   │   ├── robots.ts           # Генерація robots.txt
│   │   ├── sitemap.ts          # Генерація sitemap.xml
│   │   └── components/         # UI-компоненти
│   │       ├── Header/
│   │       │   ├── Header.tsx
│   │       │   └── Header.module.scss
│   │       ├── Hero/
│   │       │   ├── Hero.tsx
│   │       │   └── Hero.module.scss
│   │       ├── Sections/
│   │       │   ├── Sections.tsx       # FeaturesSection, ServicesSection
│   │       │   └── Sections.module.scss
│   │       ├── Contact/
│   │       │   ├── Contact.tsx
│   │       │   └── Contact.module.scss
│   │       └── Footer/
│   │           ├── Footer.tsx
│   │           └── Footer.module.scss
│   └── content/                # Весь контент у JSON
│       ├── site.json           # Глобальні дані: навігація, SEO, соцмережі, футер
│       └── pages/
│           └── home.json       # Контент головної сторінки
├── next.config.ts              # output: 'export', images: unoptimized
├── postcss.config.mjs          # PostCSS конфігурація
├── tsconfig.json               # TypeScript конфігурація
├── .nvmrc                      # Фіксована версія Node.js
└── package.json
```

---

## Ключові файли та налаштування

### `next.config.ts` — конфігурація Next.js

```ts
const nextConfig: NextConfig = {
  output: "export",              // Static export → папка out/
  images: { unoptimized: true }, // Обов'язково для static export
};
```

- **`output: "export"`** — збирає SPA як набір статичних HTML-файлів.
- Щоб вимкнути static export (наприклад, для серверного рендерингу), видаліть ці два рядки.

### `src/app/globals.css` — дизайн-система

Тут налаштовуються всі дизайн-токени через CSS custom properties:

```css
:root {
  --color-accent: #E30613;    /* Основний акцентний колір */
  --color-bg: #000000;        /* Фон сторінки */
  --color-bg-card: #1A1A1A;   /* Фон карток */
  --radius-lg: 16px;          /* Радіус заокруглення */
  /* ... інші змінні */
}
```

**Щоб змінити кольорову схему** — відредагуйте змінні всередині `:root { }`.

### `src/app/layout.tsx` — SEO та метадані

Глобальні SEO-теги (title, description, Open Graph, Twitter Cards) тягнуться з `src/content/site.json`:

```tsx
export const metadata: Metadata = {
  title: { default: siteData.seo.title, template: `%s | ${siteData.name}` },
  description: siteData.seo.description,
  openGraph: { ... },
  twitter: { ... },
};
```

**Щоб змінити SEO** — редагуйте поле `seo` у `src/content/site.json`.

### `src/content/site.json` — глобальні дані сайту

Містить: назва, опис, SEO, навігація, соцмережі, контакти, футер.

```json
{
  "name": "MyAstoriya",
  "seo": { "title": "...", "description": "...", "keywords": [...] },
  "navigation": [
    { "label": "Головна", "href": "#hero" }
  ],
  "socialLinks": [...],
  "contact": { "email": "...", "phone": "..." },
  "footer": { "copyright": "...", "links": [...] }
}
```

### `src/content/pages/home.json` — контент сторінки

Кожна секція (hero, about, services, contact) описана як окремий об'єкт. Компоненти читають дані з цього файлу через `import`.

---

## Як додати новий компонент

1. Створіть папку `src/app/components/НазваКомпонента/`
2. Створіть два файли:

**`MyComponent.tsx`**
```tsx
import s from "./MyComponent.module.scss";

export default function MyComponent() {
  return (
    <section className={s.wrapper} id="my-section">
      <div className={s.inner}>
        <h2 className={s.title}>Заголовок</h2>
      </div>
    </section>
  );
}
```

**`MyComponent.module.scss`**
```scss
.wrapper {
  padding: 40px 16px;
  background: var(--color-bg-secondary);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.title {
  font-size: 1.875rem;
  font-weight: 800;
}
```

3. Підключіть у `src/app/page.tsx`:

```tsx
import MyComponent from "./components/MyComponent/MyComponent";

export default function Home() {
  return (
    <>
      <Header />
      {/* ... */}
      <MyComponent />
      <Footer />
    </>
  );
}
```

---

## Як додати нову сторінку

Next.js App Router використовує файлову маршрутизацію.

1. Створіть папку `src/app/назва-сторінки/`
2. Додайте `page.tsx`:

```tsx
import type { Metadata } from "next";

// SEO для цієї сторінки
export const metadata: Metadata = {
  title: "Назва сторінки",
  description: "Опис для пошукових систем",
};

export default function НоваСторінка() {
  return (
    <main>
      <h1>Нова сторінка</h1>
    </main>
  );
}
```

3. Сторінка буде доступна за адресою `/назва-сторінки`.

4. Щоб використовувати JSON контент — створіть `src/content/pages/назва-сторінки.json` і імпортуйте:

```tsx
import pageData from "@/content/pages/назва-сторінки.json";
```

5. Додайте сторінку в `sitemap.ts`:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://myastoriya.com", lastModified: new Date(), priority: 1 },
    { url: "https://myastoriya.com/назва-сторінки", lastModified: new Date(), priority: 0.8 },
  ];
}
```

---

## Як працює стилізація

У проекті використовуються **два підходи**:

| Підхід | Де використовується | Приклад |
| --- | --- | --- |
| **SCSS modules** | Компонентні стилі | `className={s.card}` |
| **CSS custom properties** | Дизайн-токени в `globals.css` | `var(--color-accent)` |

### Правила для SCSS модулів

- Ім'я файлу: `НазваКомпонента.module.scss`
- CSS-змінні з `:root` доступні через `var(--color-*)` без додаткового імпорту

---

## Деплой на Vercel

Проект автоматично деплоїться на **Vercel** при кожному push/merge в гілку `main`.

| Параметр | Значення |
| --- | --- |
| **Production URL** | [myastoriya-vadyms-projects-d450dffa.vercel.app](https://myastoriya-vadyms-projects-d450dffa.vercel.app) |
| **GitHub Repo** | [Basovich/myastoriya](https://github.com/Basovich/myastoriya) |
| **Trigger** | Push / Merge в `main` |
| **Framework** | Next.js (auto-detected) |
| **Build Command** | `npm run build` |
| **Output** | Static Export (`out/`) |

### Як це працює

1. Ви пушите зміни в `main` → Vercel автоматично запускає білд
2. Якщо білд успішний → нова версія сайту стає доступною через ~30 секунд
3. При помилці білду → попередня версія залишається активною

### Ручний деплой (за потреби)

```bash
# Деплой у production
npx vercel --prod

# Превʼю-деплой (для тестування)
npx vercel
```

### Захист сайту паролем

Сайт захищений клієнтським паролем. При першому відвідуванні зʼявляється промпт для введення пароля. Пароль зберігається в `sessionStorage` (діє до закриття вкладки).

Щоб змінити пароль — відредагуйте `CORRECT_PASSWORD` у `src/app/components/PasswordGate/PasswordGate.tsx`.

---

## Корисні посилання

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [CSS Modules](https://nextjs.org/docs/app/getting-started/css-and-styling#css-modules)
