
# План: ROSA&BAROCCO — премиальный mobile-first интернет-магазин

## 1. Дизайн-система

Светлая премиальная палитра в `src/styles.css` (oklch токены):
- background: молочный/кремовый
- foreground: тёмный графит
- primary: золото/шампань (CTA, акценты)
- secondary: тёплый персиковый
- muted: бежевый
- accent: розовое золото
- мягкие скругления (`--radius: 1rem`), деликатные тени

Типографика: Cormorant/Playfair (заголовки) + Inter/Manrope (body) через Google Fonts в `__root.tsx`.

Tone: minimal, много воздуха, крупные фото, тонкие разделители, hairline-границы. Никаких медицинских обещаний — только косметические формулировки.

Mobile-first: sticky bottom CTA на карточке товара, sticky header с логотипом + бургер + иконка корзины со счётчиком, safe-area paddings (`env(safe-area-inset-*)`).

## 2. Структура данных (совместима с будущим PostgreSQL)

`src/lib/catalog/types.ts`:
```ts
type Product = {
  id: string; slug: string; sku: string;
  name: string; categorySlug: string;
  price: number; currency: 'RUB';
  volumeMl?: number; weightG?: number;
  composition?: string; shortDescription: string;
  areas?: string[]; skinType?: string[]; usage?: string;
  images: string[]; inStock: boolean;
  isSet?: boolean; bundleItems?: string[];
}
type Category = { slug; name; description?; image? }
type Review = { id; author; text; rating?; productId? }
type Order = { items: CartItem[]; customer; delivery; comment; totals }
```

Seed: `src/lib/catalog/seed.ts` — 9 товаров и категории из ТЗ. Отзывы: `src/lib/reviews/seed.ts`.

## 3. Корзина (отделена от UI)

`src/lib/cart/store.ts` — Zustand store с persist в localStorage:
- `items`, `add/remove/updateQty/clear`
- селекторы `subtotal`, `count`, `freeShippingProgress` (порог 1500 ₽)
- чистый, не зависит от React-компонентов

## 4. Маршруты (TanStack Start, file-based)

```
src/routes/
  __root.tsx          — shell: <Header/> <Outlet/> <Footer/>, шрифты, meta
  index.tsx           — / Главная
  catalog.tsx         — /catalog (layout с фильтрами) + index
  catalog.index.tsx
  catalog.$category.tsx — /catalog/:category
  product.$slug.tsx   — /product/:slug
  cart.tsx            — /cart
  checkout.tsx        — /checkout
  checkout.success.tsx — /checkout/success
  delivery.tsx        — /delivery
  cooperation.tsx     — /cooperation
  contacts.tsx        — /contacts
```

Каждый маршрут — свой `head()` (title, description, og:title, og:description). og:image только на leaf-страницах с реальным изображением.

## 5. Страницы

**Главная (`/`)**: hero (бренд + краткий tagline + CTA «Перейти в каталог»), категории (3 карточки: серебро/золото/платина), 3-4 highlight товара, блок «О лаборатории» (короткий), отзывы (3 карточки), CTA-баннер сотрудничества, ссылка на доставку.

**Каталог (`/catalog`)**: фильтр по категории (chips), сетка карточек (1 кол на mobile, 2 на sm, 3 на lg). Карточка: фото, название, объём, цена, кнопка «В корзину».

**Категория (`/catalog/:category`)**: заголовок категории + товары этой категории.

**Карточка товара (`/product/:slug`)**: крупное фото, название, цена, объём/вес, короткое описание, табы «Состав / Применение / Зоны и тип кожи», sticky bottom bar на mobile с «В корзину» и количеством.

**Корзина (`/cart`)**: список позиций (фото, название, qty +/−, цена, удалить), прогресс до бесплатной доставки, итог, CTA «Оформить заказ». Empty state.

**Оформление (`/checkout`)**: одностраничная форма (имя, телефон, email, город, способ доставки — radio: Яндекс/СДЭК/Почта, адрес или пункт выдачи, комментарий), сводка заказа, согласие. Submit → mock API → `/checkout/success`.

**Успех (`/checkout/success`)**: номер заказа, что дальше, ссылка в каталог. Чистит корзину.

**Доставка и оплата (`/delivery`)**: структурированный текст из ТЗ — расписание, сроки сборки, способы доставки, порог бесплатной доставки.

**Сотрудничество (`/cooperation`)**: краткое описание + форма (имя, телефон, email, тип партнёра — select: магазин/салон/маркетплейс/другое, комментарий).

**Контакты (`/contacts`)**: email, телефон (tel: ссылка), часы работы, форма обратной связи (имя, телефон/email, сообщение).

## 6. Формы

`react-hook-form` + `zod`. Общий хук `useFormSubmit` с состояниями `idle/loading/success/error` + toast (sonner). Mock submit (250–600 мс задержка, имитация ошибки на телефоне типа `+7000`). Структура заявок логируется в console + готова к замене на серверный fn.

Валидация: телефон RU regex, email, обязательные поля, max-длины. Disabled на submit во время loading.

## 7. Компоненты

`src/components/`:
- `layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`
- `catalog/ProductCard.tsx`, `CategoryCard.tsx`, `ProductGrid.tsx`, `CategoryFilter.tsx`
- `product/ProductGallery.tsx`, `ProductInfoTabs.tsx`, `StickyAddToCart.tsx`
- `cart/CartItemRow.tsx`, `CartSummary.tsx`, `FreeShippingProgress.tsx`, `EmptyCart.tsx`
- `forms/CheckoutForm.tsx`, `CooperationForm.tsx`, `ContactForm.tsx`, `FormStateBoundary.tsx`
- `common/Price.tsx`, `SectionHeading.tsx`, `Container.tsx`, `Seo.tsx`
- переиспользуем shadcn (button, input, select, radio-group, sonner, tabs, sheet для мобильного меню)

## 8. Изображения

Сгенерируем premium product mockups (флакон-спрей, белый/кремовый фон, мягкий свет) для 9 товаров + 1 hero + 3 category cover. Сохраним в `src/assets/products/`, импорт через ES6.

## 9. Что НЕ делаем (по ТЗ)

Без Telegram/WhatsApp/Bitrix/CRM, без онлайн-оплаты, без AI, без Google login, без бэкенда/Supabase на этом этапе. Lovable Cloud не включаем.

## 10. Готовность к будущему backend

- все `fetch`/submit инкапсулированы в `src/lib/api/*.ts` (сейчас mock, потом замена на `createServerFn` / Node API)
- env через `import.meta.env.VITE_*` (например, `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`) — никаких хардкодов
- типы Product/Order совместимы с SQL-схемой (snake-friendly → camelCase mapping слой позже)

## Технические детали

- shadcn компоненты + Tailwind v4 токены
- Zustand для корзины, react-hook-form + zod для форм, sonner для toast
- TanStack Query не нужен пока (данные локальные); подключим, когда появится backend
- SEO: уникальные head() на каждом маршруте, semantic HTML, alt на всех img, единственный h1 на странице
- 404 и error boundaries уже в `__root.tsx`

## Порядок реализации

1. Дизайн-токены + шрифты + Header/Footer
2. Типы + seed-данные + cart store
3. Главная + каталог + категория + карточка товара
4. Корзина + checkout + success
5. Доставка / сотрудничество / контакты + формы
6. Генерация продуктовых изображений и hero
7. Полировка mobile UX, sticky bars, safe-area, empty states
