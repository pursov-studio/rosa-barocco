
# Аудит ROSA&BAROCCO — минимальные правки

Цель: исправить только реальные проблемы, без переписывания архитектуры, дизайна и данных.

## Найденные проблемы

1. **Hydration mismatch для корзины (критично).**
   - `Header.tsx` рендерит cart badge из `useCart(cartSelectors.count)`. На SSR — 0, после гидратации zustand/persist подтягивает реальное число → React 19 warning + мелькание.
   - `cart.tsx` и `checkout.tsx` показывают «Корзина пуста» во время SSR, даже если в localStorage есть товары → мелькание на reload.

2. **Битый `og:image` на главной.** `index.tsx` указывает `/og-home.jpg`, файла нет. Подменим на импортированный `heroImage`.

3. **Дублирующиеся фильтры в каталоге.** Сейчас 7 чипов (`platinum-lux`, `platinum`, `gold-chic`, `gold`, `silver-universal`, `silver-anti-acne`, `sets`) — на mobile это горизонтальная лента из почти одинаковых слов. Сводим к 4 группам по металлу: **Платина / Золото / Серебро / Наборы**, фильтруя товары через `metal` их категории. Сами категории и страницы `/catalog/:category` оставляем.

4. **Валидация согласия в checkout.** `z.literal(true, { errorMap })` устаревший синтаксис, в новых zod ломается. Заменяем на `z.boolean().refine(v => v === true, "Согласие обязательно")` — работает в любой 3.x/4.x.

## Что НЕ меняем

- Архитектуру, zustand, тип `Product`, seed-данные, изображения.
- Дизайн-систему (`styles.css`), типографику, токены.
- Состав страниц и маршруты.
- Формы (кроме одной строки в схеме checkout).
- Бэкенд: ничего не добавляем (Cloud / payments / messengers / CRM остаются выключенными).

## Список правок (5 файлов)

### 1. `src/components/layout/Header.tsx`
Добавить `useEffect` + `mounted` стейт. Cart badge рендерится только при `mounted && count > 0`. Безопасно для SSR.

### 2. `src/routes/cart.tsx`
То же: до `mounted` показывать лёгкий скелет (или просто `null`/обычный layout без empty-state), чтобы persisted-корзина не «исчезала» на reload.

### 3. `src/routes/checkout.tsx`
- Тот же `mounted` гейт перед редиректом «пусто».
- Заменить:
  ```ts
  agree: z.literal(true, { errorMap: () => ({ message: "Согласие обязательно" }) })
  ```
  на:
  ```ts
  agree: z.boolean().refine((v) => v === true, { message: "Согласие обязательно" })
  ```

### 4. `src/routes/index.tsx`
Импортировать `heroImage` уже есть. Заменить:
```ts
{ property: "og:image", content: "/og-home.jpg" }
```
на:
```ts
{ property: "og:image", content: heroImage }
```

### 5. `src/routes/catalog.tsx`
Заменить чипы на 4 кнопки: Все / Платина / Золото / Серебро / Наборы (5 включая «Все»). Фильтрация:
```ts
const metalOf = (p) => getCategoryBySlug(p.categorySlug)?.metal;
const list = active === "all"
  ? products
  : active === "sets"
    ? products.filter(p => metalOf(p) === "mix")
    : products.filter(p => metalOf(p) === active);
```

## Проверка после правок

1. Reload `/` → cart badge не мигает, og-meta валидна.
2. Открыть товар → добавить в корзину → `/cart` без мелькания «пусто».
3. `/checkout` с товарами → submit без галочки = ошибка валидации; с галочкой → success.
4. `/cooperation`, `/contacts` — формы шлют, success-state работает.
5. Mobile viewport 390×844: sticky CTA на товаре, sticky header, бургер-меню, чипы каталога не переполняются.
