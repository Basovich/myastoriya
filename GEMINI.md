# Правила розробки — MyAstoriya

Цей документ описує архітектурні рішення, угоди та правила для роботи з проектом `myastoriya`. Дотримуватися цих правил обов'язково — як для людей, так і для AI-асистентів.

---

## Стек

| Технологія | Версія | Примітка |
|---|---|---|
| Next.js | 16.x | App Router, `--webpack` |
| React | 19.x | |
| TypeScript | 5.x | Строгий режим |
| Sass (embedded) | 1.97.x | SCSS Modules для компонентів |
| Redux Toolkit | 2.x | + redux-persist |
| Sentry | 10.x | Моніторинг помилок |
| Formik + Yup | 2.x / 1.x | Форми та валідація |
| i18n | власний | Через папку `src/i18n/` + `[lang]` роутинг |

---

## Структура проекту

```
src/
├── app/
│   ├── [lang]/          # Локалізовані сторінки (i18n)
│   ├── actions/         # Server Actions (Next.js)
│   ├── api/             # API-роути Next.js
│   ├── components/      # UI-компоненти (кожен у своїй папці)
│   │   └── ui/          # Атомарні переиикористовувані компоненти
│   ├── pages/           # Специфічні сторінки-компоненти
│   ├── globals.css      # Дизайн-токени (CSS custom properties)
│   └── global-error.tsx
├── config/              # Конфігурація додатку
├── fonts/               # Локальні шрифти
├── hooks/               # Custom React hooks
├── i18n/                # Переклади та утиліти локалізації
├── lib/                 # Бізнес-логіка, API-клієнти
├── store/               # Redux store
│   ├── slices/          # Redux слайси
│   ├── index.ts         # Конфігурація store
│   ├── hooks.ts         # Типізовані хуки (useAppDispatch, useAppSelector)
│   └── ReduxProvider.tsx
└── utils/               # Утиліти та хелпери
```

---

## Компоненти

### Структура компонента

Кожен компонент живе у власній папці:

```
src/app/components/НазваКомпонента/
├── НазваКомпонента.tsx
└── НазваКомпонента.module.scss
```

### Правила іменування

- Папки та файли компонентів — **PascalCase**: `CartModal/`, `CartModal.tsx`
- SCSS-модулі — **PascalCase** з суфіксом `.module.scss`
- Атомарні/переиикористовувані компоненти — у `src/app/components/ui/`
- Кастомні хуки — у `src/hooks/`, назва починається з `use`: `useCart.ts`

### Шаблон компонента

```tsx
// НазваКомпонента.tsx
import s from "./НазваКомпонента.module.scss";

interface Props {
  // пропси тут
}

export default function НазваКомпонента({ }: Props) {
  return (
    <section className={s.wrapper} id="section-id">
      <div className={s.inner}>
        {/* контент */}
      </div>
    </section>
  );
}
```

---

## Стилізація

### Два підходи, які використовуються разом

| Підхід | Де | Приклад |
|---|---|---|
| **CSS custom properties** | Дизайн-токени (`globals.css`) | `var(--color-accent)` |
| **SCSS Modules** | Компонентні стилі | `className={s.card}` |

### Правила стилізації

- **Ніяких inline-стилів** — тільки через SCSS Modules або CSS-змінні
- **Ніяких глобальних CSS-класів** (окрім `globals.css`) — тільки модулі
- Всі кольори, відступи, радіуси — тільки через `var(--*)` з `globals.css`
- Клас-оббгортка завжди: `.wrapper` → `.inner` → контент
- `max-width` контейнера — `1200px`, горизонтальні відступи — `24px`

### Шаблон SCSS-модуля

```scss
.wrapper {
  padding: 60px 16px;
  background: var(--color-bg);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

---

## TypeScript

- Завжди вказувати типи для пропсів (через `interface Props`)
- **Не використовувати `any`** — якщо тип невідомий, використовуй `unknown` і звужуй
- Для Redux — тільки типізовані хуки: `useAppDispatch()`, `useAppSelector()`
- Server Actions — відповідний серверний код виносити в `src/app/actions/`
- API-виклики — у `src/lib/`

---

## Redux

- Кожен слайс — окремий файл у `src/store/slices/`
- `useAppDispatch` і `useAppSelector` замість прямих `useDispatch`/`useSelector`
- `redux-persist` налаштований — не зберігати чутливі дані (токени зберігай у httpOnly cookies)
- Зберігати у store тільки **глобальний** стан (кошик, авторизацію, UI-стан)
- Локальний стан компонента — `useState`

---

## i18n (Локалізація)

- Всі сторінки маршрутизуються через `src/app/[lang]/`
- Переклади — у `src/i18n/`
- Мову визначає `src/middleware.ts`
- **Весь текст у компонентах** — тільки через переклади, не хардкодити рядки

---

## API та Server Actions

- API-роути — у `src/app/api/`
- Server Actions — у `src/app/actions/`
- Бізнес-логіка запитів до бекенду — у `src/lib/`
- Обов'язково обробляти помилки та показувати стан завантаження

---

## Git

### Гілки

| Гілка | Призначення |
|---|---|
| `main` | Production (auto-deploy на Vercel) |
| `dev` або `feature/*` | Розробка нових фічей |

### Правила

- **Ніколи не пушити напряму в `main`** без PR
- Назви гілок: `feature/назва-фічі`, `fix/опис-бага`, `refactor/що-рефакторимо`
- Коміти — зрозумілі, описові (можна українською)

---

## Sentry

- Sentry підключено для клієнта, сервера та edge (`sentry.*.config.ts`)
- Критичні помилки автоматично логуються
- Для ручного логування: `Sentry.captureException(error)`

---

## Деплой

- **Vercel** — автоматичний деплой при merge в `main`
- Перевіряти білд локально перед пушем: `npm run build`
- ESLint: `npm run lint`

---

## GraphQL-проксі `/api/graphql`

На клієнті всі GraphQL-запити йдуть **не напряму** на бекенд, а через внутрішній Next.js API-роут:

```
Браузер → /api/graphql (src/app/api/graphql/route.ts) → https://dev-api.myastoriya.com.ua/graphql
```

На **сервері** (SSR, Server Actions) — запити йдуть напряму на бекенд.

### Навіщо проксі?

- **Авторизація:** токен (`access_token`) зберігається в `httpOnly` cookie. JavaScript у браузері **не може** його прочитати. Проксі читає куку на сервері і сам додає `Authorization: Bearer ...` до запиту на бекенд.
- **Безпека:** токен не потрапляє в Redux/localStorage — захист від XSS.
- **Приховування адреси бекенду:** клієнт бачить лише `/api/graphql`.

### ❌ Не прибирати проксі

Навіть якщо бекенд пофіксив CORS — **проксі потрібен**. Без нього авторизовані запити з клієнта (wishlist, cart, orders, profile тощо) будуть отримувати `Unauthorized`, бо токен з httpOnly cookie не буде передаватись.

### Як це виглядає в коді

Файл [`src/lib/graphql/client.ts`](src/lib/graphql/client.ts):
```ts
const GQL_ENDPOINT = isServer 
    ? 'https://dev-api.myastoriya.com.ua/graphql'  // сервер — напряму
    : '/api/graphql';                               // клієнт — через проксі
```

---

## Заборонено

- ❌ `any` у TypeScript
- ❌ Inline-стилі (`style={{ ... }}`)
- ❌ Глобальні CSS-класи (поза `globals.css`)
- ❌ Прямий push у `main`
- ❌ Хардкодити рядки (текст) поза системою перекладів
- ❌ Зберігати секрети/токени у коді або localStorage

---

## Команди

```bash
npm run dev     # Запустити dev-сервер → http://localhost:3000
npm run build   # Перевірити production-білд
npm run lint    # Перевірити ESLint
```
