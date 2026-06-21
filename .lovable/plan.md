# План миграции: импорт в новый Supabase

## Вводные

- Новый проект: `grqyolkwprkulqttpxnr.supabase.co`
- Publishable key: `sb_publishable_UydJdL7P4V4SOyi45dt4Ng_1_FTxdkK`
- Service role key: получен (сохраню как секрет `NEW_SUPABASE_SERVICE_ROLE_KEY`)
- DB пароль: получен (сохраню как секрет `NEW_SUPABASE_DB_PASSWORD`)
- Архив с экспортом готов: `rosa-barocco-migration.zip` (schema + CSV + изображения + auth-юзер)

## Шаги

### 1. Сохранить креды нового проекта в секреты Lovable
Чтобы дальше работать через переменные окружения, не светя пароль/ключ в логах:
- `NEW_SUPABASE_URL` = `https://grqyolkwprkulqttpxnr.supabase.co`
- `NEW_SUPABASE_PUBLISHABLE_KEY`
- `NEW_SUPABASE_SERVICE_ROLE_KEY`
- `NEW_SUPABASE_DB_PASSWORD`

### 2. Импорт схемы
`psql "postgresql://postgres:<pwd>@db.grqyolkwprkulqttpxnr.supabase.co:5432/postgres" -f schema_public.sql`

Включает: enum `app_role`, таблицы (`products`, `product_variants`, `categories`, `orders`, `site_content`, `app_settings`, `user_roles`), функции `has_role` и `set_updated_at`, RLS-политики, GRANT-ы, триггеры.

### 3. Импорт данных (CSV → COPY)
По каждой таблице в правильном порядке (с учётом FK):
`categories → products → product_variants → site_content → app_settings → orders → user_roles`

### 4. Создать bucket `product-images` (public) и залить 23 изображения
Через Storage API с service_role.

### 5. Импорт пользователя
Создать `spursov@vk.com` через Admin API нового проекта с временным паролем `ChangeMe123!` и пометкой `email_confirmed=true`. Назначить роль `admin` в `public.user_roles`.
**Пароль придётся сбросить** — Supabase не отдаёт хеши паролей наружу.

### 6. Проверка
- `SELECT count(*)` по каждой таблице — должно совпасть с экспортом
- Открыть одну картинку из bucket по public URL
- Проверить `has_role(<uid>, 'admin')` = true

### 7. Выдать инструкцию для VPS
Готовый блок для `.env` на VPS:
```
VITE_SUPABASE_URL=https://grqyolkwprkulqttpxnr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_UydJdL7P4V4SOyi45dt4Ng_1_FTxdkK
VITE_SUPABASE_PROJECT_ID=grqyolkwprkulqttpxnr
SUPABASE_URL=https://grqyolkwprkulqttpxnr.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_UydJdL7P4V4SOyi45dt4Ng_1_FTxdkK
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # тот, что ты прислал
RESEND_API_KEY=<остаётся>
```
Команды на VPS:
```
nano .env       # вставить блок выше
bun install
bun run build
pm2 restart rosa-barocco --update-env
```

### 8. Сброс пароля админа
На задеплоенном сайте: «Забыли пароль?» → письмо через Resend → задать новый.

## Что НЕ переносим
- Хеши паролей (Supabase их не отдаёт — by design)
- Edge Functions (их нет в проекте)
- Cron-задачи (нет)

Скажи «погнали» — начну с шага 1.