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

## GraphQL-клієнт

Всі GraphQL-запити (як клієнтські, так і серверні) йдуть **напряму** на бекенд:

```
Браузер → https://dev-api.myastoriya.com.ua/graphql
Сервер (SSR) → https://dev-api.myastoriya.com.ua/graphql
```

### Авторизація

- `access_token` зберігається в `httpOnly` cookie (встановлюється через Server Action) **і** в Redux store (`auth.token`) — в пам'яті, для клієнтських запитів.
- `refresh_token` залишається лише в `httpOnly` cookie.
- `gqlRequest` на клієнті автоматично читає токен зі Redux store і додає `Authorization: Bearer` до запиту.
- При закінченні токена — JWT interceptor в `client.ts` автоматично робить refresh через `tryRefreshTokenAction` і зберігає новий токен у store.

### Як це виглядає в коді

Файл [`src/lib/graphql/client.ts`](src/lib/graphql/client.ts):
```ts
// Завжди напряму на бекенд
const endpoint = 'https://dev-api.myastoriya.com.ua/graphql';

// Токен — явно через options.token або зі store
const storeToken = store.getState().auth.token;
if (storeToken) headers['Authorization'] = `Bearer ${storeToken}`;
```

### ❌ Не повертати проксі `/api/graphql`

Проксі видалено. CORS налаштовано на бекенді. Токен зберігається в Redux store і передається напряму у заголовках клієнтом.

---

## Планування

- **Обов'язковий план перед виконанням:** Перед початком виконання будь-якого завдання AI-асистент повинен створити детальний план реалізації (Implementation Plan) **українською мовою** та отримати схвалення від користувача перед написанням коду чи виконанням модифікуючих команд.

---

## Заборонено

- ❌ `any` у TypeScript
- ❌ Inline-стилі (`style={{ ... }}`)
- ❌ Глобальні CSS-класи (поза `globals.css`)
- ❌ Прямий push у `main`
- ❌ Хардкодити рядки (текст) поза системою перекладів
- ❌ Зберігати секрети/токени у коді або localStorage
- ❌ Залишати тимчасові файли, тестові дані або скрипти налагодження (наприклад, `scratch_query.js`) у репозиторії після завершення завдання.

---

## Команди

```bash
npm run dev     # Запустити dev-сервер → http://localhost:3000
npm run build   # Перевірити production-білд
npm run lint    # Перевірити ESLint
```
