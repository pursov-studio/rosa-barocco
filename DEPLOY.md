# Деплой ROSA&BAROCCO на свой VPS (для доступа из РФ)

Сайт работает на TanStack Start. По умолчанию Lovable собирает его под Cloudflare Workers — для своего сервера используем Node-сборку.

## 0. Что должно быть готово

- VPS на Ubuntu/Debian с root- или sudo-доступом по SSH
- Домен с A-записями `@` и `www`, направленными на IP сервера
- Проект подключён к GitHub (в Lovable: справа сверху GitHub → Create repository)

## 1. Установить окружение на сервере

```bash
ssh root@<IP-сервера>

apt update
apt install -y curl git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm i -g pm2 bun
```

## 2. Склонировать репозиторий

```bash
git clone https://github.com/<ваш-логин>/<репо>.git /var/www/rosa-barocco
cd /var/www/rosa-barocco
```

## 3. Создать `.env`

```bash
nano .env
```

```env
# Подключение к базе/хранилищу (Lovable Cloud / Supabase)
VITE_SUPABASE_URL=https://okumelhbeglhjngzjewh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<публичный ключ из Lovable .env>
VITE_SUPABASE_PROJECT_ID=okumelhbeglhjngzjewh

SUPABASE_URL=https://okumelhbeglhjngzjewh.supabase.co
SUPABASE_PUBLISHABLE_KEY=<тот же публичный ключ>
SUPABASE_SERVICE_ROLE_KEY=<service role key, взять в Lovable Cloud → Project Settings>

# Отправка писем напрямую через Resend (без gateway Lovable)
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM=ROSA&BAROCCO <onboarding@resend.dev>
ORDER_NOTIFY_EMAIL=rosabarocco@ya.ru

# Указание Vite собирать под Node вместо Cloudflare Workers
SERVER_PRESET=node-server
```

> `SUPABASE_SERVICE_ROLE_KEY` нужен для серверных функций (создание заказов, отправка письма). Никогда не публикуйте его и не используйте на фронте.

## 4. Сборка и запуск

```bash
bun install
SERVER_PRESET=node-server bun run build

# .output/server/index.mjs — готовый сервер на Node
pm2 start .output/server/index.mjs --name rosa-barocco --update-env
pm2 startup
pm2 save
```

Проверить, что сайт жив:

```bash
curl -I http://127.0.0.1:3000
```

## 5. Nginx + HTTPS

`/etc/nginx/sites-available/rosa-barocco`:

```nginx
server {
    listen 80;
    server_name rosabarocco.ru www.rosabarocco.ru;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
ln -s /etc/nginx/sites-available/rosa-barocco /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d rosabarocco.ru -d www.rosabarocco.ru
```

## 6. Обновление сайта после правок в Lovable

```bash
cd /var/www/rosa-barocco
git pull
bun install
SERVER_PRESET=node-server bun run build
pm2 restart rosa-barocco --update-env
```

---

## Что используется из внешних сервисов и почему это безопасно для РФ

| Сервис | Домен | Доступ из РФ |
|---|---|---|
| База данных, фото товаров, авторизация админки | `okumelhbeglhjngzjewh.supabase.co` | Доступен напрямую |
| Отправка письма о заявке | `api.resend.com` | Доступен напрямую |
| Сайт | ваш домен на VPS | Полностью на вашем сервере |

Никаких обращений к `*.lovable.app` или `*.lovable.dev` после сборки не делается.

## Запасной вариант: Yandex SMTP вместо Resend

Если Resend перестанет работать — можно перейти на Yandex SMTP (`smtp.yandex.ru:465`) с паролем приложения от `rosabarocco@ya.ru`. Скажите — переделаю `sendOrderEmail` под `nodemailer`.
