
# План: Админ-панель, заказы, Робокасса

## 1. Бэкенд (Lovable Cloud)

Включаем Cloud. Создаём схему БД:

- `categories` (id, slug, title, description, sort, updated_at)
- `products` (id, slug, category_id, title, description, price, image_url, in_stock, sort, updated_at)
- `orders` (id, public_id, name, phone, email, city, delivery_method, address, comment, items jsonb, subtotal, payment_method, payment_status, status, created_at, updated_at)
- `site_content` (key text PK, value jsonb, updated_at) — для hero, доставки, контактов, сотрудничества
- `app_role` enum (`admin`, `editor`) + `user_roles` (user_id, role) + security-definer `has_role()`
- `app_settings` (key text PK, value jsonb) — для Робокассы (MerchantLogin, Password1, Password2, test_mode)

RLS:
- `products`, `categories`, `site_content`: SELECT для `anon`+`authenticated`; INSERT/UPDATE/DELETE только `has_role(auth.uid(),'admin')`.
- `orders`: INSERT для `anon` (создание заказа гостем); SELECT/UPDATE только admin.
- `user_roles`, `app_settings`: только admin.

GRANT'ы выставляем явно для каждой таблицы.

## 2. Авторизация

- Email/пароль (Cloud Auth).
- Страница `/admin/login`.
- Layout `_admin` с `beforeLoad`: проверка `getUser()` + `has_role`. Иначе redirect на `/admin/login`.
- Несколько админов: вручную добавляются строки в `user_roles` (через миграцию seed первого админа, далее из UI «Команда»).

## 3. Server functions (`createServerFn`)

- `admin/products.functions.ts`: list/get/upsert/delete + upload фото в Supabase Storage (`product-images` bucket, public).
- `admin/categories.functions.ts`: list/upsert/delete.
- `admin/content.functions.ts`: get/set по ключу (`home_hero`, `delivery_page`, `contacts_page`, `cooperation_page`).
- `admin/orders.functions.ts`: list (с фильтрами по статусу/дате), get, updateStatus, stats (для дашборда).
- `admin/settings.functions.ts`: get/set Робокассы.
- `public/orders.functions.ts`: `createOrder` (вызывается из `/checkout`), пишет в `orders` через admin client.

## 4. Админ-роуты

```
/admin/login
/admin                       — дашборд (KPI + последние заказы)
/admin/orders                — таблица заказов, фильтры по статусу
/admin/orders/$id            — карточка заказа, смена статуса (new/processing/paid/shipped/done/cancelled)
/admin/products              — список + поиск
/admin/products/new
/admin/products/$id          — редактор (категория, цена, описание, фото)
/admin/categories            — CRUD категорий
/admin/content               — табы: Главная / Доставка / Контакты / Сотрудничество
/admin/settings              — поля Робокассы + переключатель test/live
/admin/team                  — список user_roles, добавить admin по email
```

Все под `_admin` layout (sidebar + проверка роли).

## 5. Дашборд

KPI-карточки: заказов за 7/30 дней, выручка, средний чек, % оплаченных. Список последних 10 заказов с быстрой сменой статуса.

## 6. Публичный сайт — переход на БД

Минимальные правки:
- `catalog.tsx`, `catalog.$category.tsx`, `product.$slug.tsx`, `index.tsx`, `delivery.tsx`, `cooperation.tsx`, `contacts.tsx` — читают из server functions (loader через TanStack Query), `seed.ts` остаётся только как первичный seed в миграции.
- `checkout.tsx` — вместо mock `submitForm("order")` вызывает `createOrder`. Добавляется radio «Способ оплаты»: «При получении» и «Робокасса (скоро)». Робокасса пока disabled с подсказкой «Будет доступна после одобрения».

## 7. Робокасса — заглушка

- В `/admin/settings`: поля `merchant_login`, `password_1`, `password_2`, `test_mode` (boolean). Сохраняются в `app_settings`.
- В `checkout` радио «Робокасса» помечено как disabled (или активно, но при сабмите создаёт заказ со статусом `pending_payment` и показывает «Перенаправление отключено — ожидаем одобрения»).
- Server function `payment/robokassa.functions.ts` — каркас: `createPaymentUrl(orderId)` собирает подпись по MD5(MerchantLogin:OutSum:InvId:Password1), возвращает URL. Сейчас не вызывается из UI, но готов.
- Server route `/api/public/robokassa/result` — каркас: принимает ResultURL, проверяет подпись (Password2), помечает заказ `paid`. Закомментированный вызов, чтобы не падал без ключей.

## 8. Что НЕ делаем сейчас

- Не подключаем реальный редирект на Робокассу (включится после получения ключей пользователем).
- Не меняем дизайн витрины.
- Не трогаем zustand-корзину.
- Не добавляем email-уведомления.

## 9. Технические детали

- Storage bucket `product-images` public, upload только admin (RLS на storage.objects).
- Первый админ: после включения Cloud прошу пользователя зарегистрироваться через `/admin/login`, затем миграцией INSERT в `user_roles` для его user_id (попрошу email).
- Все списки в админке — TanStack Query + server functions с `requireSupabaseAuth` + проверкой роли внутри handler'а.

## Шаги реализации

1. Включить Lovable Cloud.
2. Миграция: enums, таблицы, RLS, GRANT'ы, security-definer `has_role`, seed категорий/товаров из `seed.ts`, seed site_content.
3. Storage bucket + политики.
4. Auth pages (`/admin/login`, `_admin` layout с гейтом роли).
5. Server functions (products, categories, orders, content, settings, public createOrder).
6. Админ-страницы (sidebar, дашборд, CRUD товаров/категорий/контента, заказы, настройки, команда).
7. Переключить публичные страницы на чтение из БД.
8. Обновить checkout: реальное создание заказа + radio оплаты с Робокассой-заглушкой.
9. Каркас Робокассы (functions + public route, без активации).
10. Попросить email первого админа и зашить роль миграцией.
