## Цель
Сайт должен открываться из России без VPN и без обращений к доменам `*.lovable.app` / `*.lovable.dev`.

## Что нужно заменить (что блокируется или может блокироваться в РФ)

| Сейчас используется | Проблема | Чем заменим |
|---|---|---|
| `rosa-barocco.lovable.app` (хостинг) | Lovable-домены недоступны | Ваш VPS + ваш домен |
| `connector-gateway.lovable.dev/resend` (отправка писем) | Lovable-домен | Прямой вызов `api.resend.com` ИЛИ Yandex SMTP |
| `okumelhbeglhjngzjewh.supabase.co` (БД, фото, заявки) | Supabase.co обычно доступен из РФ, но не гарантировано | Оставляем, либо в будущем переедем на свой Postgres |
| Cloudflare Workers preset | Сборка под чужой рантайм | Меняем на `node-server` |

## Архитектура после переноса

```text
[Пользователь из РФ]
        │
        ▼
[rosabarocco.ru] ─── nginx + SSL (Let's Encrypt)
        │
        ▼
[Node.js + pm2 на вашем VPS] ── createServerFn ──▶ api.resend.com (письма на rosabarocco@ya.ru)
        │
        ▼
   Supabase (okumelhbeglhjngzjewh.supabase.co) — БД заявок, фото, авторизация админки
```

## Изменения в коде

### 1. `vite.config.ts` — сменить preset сборки

```ts
tanstackStart: {
  server: { entry: "server", preset: "node-server" },
},
```

Это даст после `bun run build` готовый сервер в `.output/server/index.mjs`, который запускается обычным `node`.

### 2. `src/lib/orders/orders.functions.ts` — отправка писем напрямую через Resend

Заменить блок `sendOrderEmail`:
- было: `https://connector-gateway.lovable.dev/resend/emails` + `LOVABLE_API_KEY` + `X-Connection-Api-Key`
- станет: `https://api.resend.com/emails` + `Authorization: Bearer ${RESEND_API_KEY}`

Для этого нужен прямой ключ Resend (формат `re_...`) — получается в личном кабинете https://resend.com → API Keys. Когда будете готовы, я попрошу его добавить через secrets.

### 3. (Опционально, как запасной вариант) Yandex SMTP вместо Resend

Если Resend тоже окажется недоступен или захотите «всё в РФ»: использовать SMTP `smtp.yandex.ru:465` с паролем приложения от того же `rosabarocco@ya.ru`. Тогда вообще никаких внешних сервисов кроме Yandex. Сделаю по запросу.

## Развёртывание на VPS (команды для Terminal)

### Шаг 1. Получить код
Подключить проект к GitHub в Lovable (кнопка GitHub справа сверху → Create repository), затем:

```bash
ssh root@<IP-сервера>
apt update && apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm i -g pm2 bun
git clone https://github.com/<ваш-логин>/<репо>.git /var/www/rosa-barocco
cd /var/www/rosa-barocco
```

### Шаг 2. Создать `.env`

```env
VITE_SUPABASE_URL=https://okumelhbeglhjngzjewh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<существующий публичный ключ>
VITE_SUPABASE_PROJECT_ID=okumelhbeglhjngzjewh
SUPABASE_URL=https://okumelhbeglhjngzjewh.supabase.co
SUPABASE_PUBLISHABLE_KEY=<тот же ключ>
SUPABASE_SERVICE_ROLE_KEY=<service role key из Lovable Cloud>
RESEND_API_KEY=re_xxxxxxxxxx
```

### Шаг 3. Сборка и запуск

```bash
bun install
bun run build
pm2 start .output/server/index.mjs --name rosa-barocco
pm2 startup && pm2 save
```

### Шаг 4. Nginx + HTTPS

```bash
apt install -y certbot python3-certbot-nginx
# конфиг nginx с proxy_pass http://127.0.0.1:3000;
certbot --nginx -d rosabarocco.ru -d www.rosabarocco.ru
```

DNS вашего домена настроить на IP сервера (A-записи `@` и `www`).

## Что нужно от вас перед стартом реализации

1. **Подтвердить выбор отправщика писем:** прямой Resend (`api.resend.com`) или Yandex SMTP. Рекомендую Yandex SMTP — почта и так уходит на `rosabarocco@ya.ru`, доставляемость лучше всех и никаких иностранных сервисов.
2. **Получить и прислать через secrets** соответствующий ключ:
   - Для Resend: API-ключ из https://resend.com
   - Для Yandex SMTP: пароль приложения из https://id.yandex.ru → Безопасность → Пароли приложений (тип «Почта»).
3. **Подтвердить, что Supabase остаётся** (`*.supabase.co` — в РФ доступен напрямую, проверено для большинства провайдеров). Если позже окажется недоступен — отдельной задачей перенесём БД на ваш Postgres.

## Что я сделаю в режиме Build

1. Переключу `vite.config.ts` на preset `node-server`.
2. Перепишу `sendOrderEmail` под выбранный вариант (Resend напрямую / Yandex SMTP через `nodemailer`).
3. Подготовлю готовый nginx-конфиг и `ecosystem.config.cjs` для pm2 в корне репозитория.
4. Добавлю короткий `DEPLOY.md` с командами под ваш VPS.

После этого вы делаете `git pull` на сервере и проходите 4 шага выше — сайт работает на вашем домене без обращений к Lovable.
