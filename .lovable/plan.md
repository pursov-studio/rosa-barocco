# План: переезд с Lovable Cloud на ваш собственный Supabase-аккаунт

После переезда Lovable больше не нужен — сайт работает на VPS, база/файлы/админ-логины живут в **вашем** Supabase-проекте (на вашем аккаунте на supabase.com). Resend остаётся как есть.

## Что вы делаете заранее (1 раз, ~5 минут)

1. Зарегистрироваться на https://supabase.com (если ещё нет) — бесплатный тариф подойдёт.
2. Создать новый проект: имя любое (например `rosa-barocco`), регион — `Frankfurt (eu-central-1)` (ближе к РФ, доступен без VPN), задать пароль БД и сохранить.
3. Подождать, пока проект развернётся (~2 минуты).
4. В новом проекте зайти **Settings → API** и сохранить:
   - `Project URL`
   - `anon public` key
   - `service_role` key
5. Из **Settings → Database → Connection string** скопировать `URI` (для миграции данных).

Передадите мне эти значения в чат, когда будут готовы.

## Что делаю я (последовательно)

### Шаг 1. Экспорт текущей базы из Lovable Cloud
- Делаю SQL-дамп схемы (таблицы, функции, политики, триггеры, enum'ы) текущего проекта.
- Делаю CSV-дампы данных всех таблиц: `products`, `product_variants`, `categories`, `orders`, `site_content`, `app_settings`, `user_roles`.
- Складываю всё в `/mnt/documents/migration/` чтобы вы могли скачать.

### Шаг 2. Экспорт файлов из Storage
- Скачиваю всё содержимое бакета `product-images` (фото товаров) одним архивом.
- Кладу в `/mnt/documents/migration/product-images.zip`.

### Шаг 3. Экспорт пользователей (админов)
- Из `auth.users` выгружаю id, email, зашифрованные пароли, метаданные — то, что нужно для импорта в новый Supabase без сброса паролей.
- Если экспорт паролей не получится через API — план Б: создаю в новом проекте админа заново и присылаю одноразовый пароль для смены.

### Шаг 4. Импорт в ваш Supabase
Через ваш `DB connection string` и `service_role` key:
- Прогоняю SQL-дамп схемы → создаются все таблицы, RLS, функции, триггеры.
- Заливаю CSV-данные через `COPY`.
- Создаю бакет `product-images` (public) и заливаю в него все фото с теми же путями.
- Импортирую пользователей-админов и присваиваю им роль `admin` в `user_roles`.

### Шаг 5. Проверка целостности
- Сверяю количество строк в каждой таблице (старое = новое).
- Сверяю количество файлов в storage.
- Делаю тестовый запрос с anon-ключом нового проекта — проверяю, что RLS политики работают и публичные данные читаются.

### Шаг 6. Обновление кода и `.env` на VPS
Даю вам новые значения для `/var/www/rosa-barocco/.env`:
```env
VITE_SUPABASE_URL=https://<ваш-новый-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<ваш anon key>
VITE_SUPABASE_PROJECT_ID=<ваш ref>
SUPABASE_URL=https://<ваш-новый-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<ваш anon key>
SUPABASE_SERVICE_ROLE_KEY=<ваш service_role>
RESEND_API_KEY=<остаётся прежний>
RESEND_FROM=...
ORDER_NOTIFY_EMAIL=rosabarocco@ya.ru
SERVER_PRESET=node-server
```
Команды на VPS:
```bash
cd /var/www/rosa-barocco
nano .env   # вставить новые значения
SERVER_PRESET=node-server bun run build
pm2 restart rosa-barocco --update-env
```

### Шаг 7. Финальная проверка
- Открыть сайт — главная, каталог товаров, фото подгружаются.
- Зайти в админку под старым логином/паролем.
- Создать тестовую заявку → письмо приходит на `rosabarocco@ya.ru`.
- Если всё ок — старый Lovable Cloud проект можно больше не трогать (или удалить).

## Что станет с зависимостью от Lovable после миграции

| Что | До | После |
|---|---|---|
| База, фото, авторизация | `okumelhbeglhjngzjewh.supabase.co` (Lovable) | ваш `*.supabase.co` (Frankfurt) |
| Письма | `api.resend.com` | без изменений |
| Сайт | VPS | без изменений |
| Lovable | нужен для редактирования кода | не нужен вообще |

Связи с `*.lovable.app` / `*.lovable.dev` после этого нет ни в одной точке.

## Что мне нужно от вас, чтобы стартовать

1. Создать новый Supabase-проект (шаги выше).
2. Прислать в чат: `Project URL`, `anon key`, `service_role key`, `DB connection string (URI)`.
3. Сказать «погнали» — и я начинаю с экспорта.
