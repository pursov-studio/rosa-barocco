# План: контентная база ROSA&BAROCCO + варианты объёма

## Что получится
- 6 карточек товара: PLATINUM LUX, GOLD CHIC, SILVER UNIVERSAL, SILVER ANTI-ACNE, Набор ROSA&BAROCCO (trio), плюс отдельная карточка «Набор» одна (50/100 мл — варианты внутри одной карточки набора).
- На каждой карточке переключатель **50 мл / 100 мл**, цена/SKU/наличие обновляются от выбранного варианта.
- Все старые тестовые товары будут удалены, залиты только эти. Цены везде = 0 (заглушка), правятся в админке.
- Фото — оставляю плейсхолдеры, вы зальёте через `/admin/products`.

## Структура данных (миграция)

Добавляю таблицу вариантов, чтобы один товар = одна карточка с переключателем:

```text
product_variants
  id            uuid pk
  product_id    uuid → products.id  (on delete cascade)
  volume_ml     int                 (50 | 100)
  price         int  default 0
  sku           text
  in_stock      bool default true
  sort          int  default 0
  created_at, updated_at
  UNIQUE (product_id, volume_ml)
```

- `products.price`, `products.volume_ml`, `products.sku` остаются в схеме (для обратной совместимости), но новые продукты не используют их напрямую — цена/наличие берутся из вариантов. Минимальная цена варианта показывается в каталоге как «от …».
- RLS: `Public read variants` (anon+auth), `Admins write variants` (через `has_role`). GRANT-ы для anon/authenticated/service_role.

## Контент (что льём)

Категории (уже есть слаги): `platinum-lux`, `gold-chic`, `silver-universal`, `silver-anti-acne`, `sets`.

Продукты (6):

| Slug | Категория | Варианты |
|---|---|---|
| `platinum-lux` | platinum-lux | 50 мл, 100 мл |
| `gold-chic` | gold-chic | 50 мл, 100 мл |
| `silver-universal` | silver-universal | 50 мл, 100 мл |
| `silver-anti-acne` | silver-anti-acne | 50 мл, 100 мл |
| `set-trio` | sets | 50 мл (trio 3×50), 100 мл (trio 3×100), `is_set=true` |

Каждому продукту заливаю: `name`, `short_description`, `composition`, `usage`, `areas`, `skin_type`, `target` (из документа дословно, безопасные косметические формулировки).

Для набора `bundle_items` = `['platinum-lux','gold-chic','silver-universal']`.

Цены всех вариантов = 0 (пометка «Цена уточняется» в UI, когда price === 0).

## Изменения в коде

1. **Миграция** (`product_variants` + GRANT + RLS + триггер `updated_at`).
2. **Серверные функции** (`src/lib/catalog/catalog.functions.ts`, `admin.functions.ts`):
   - `listProductsPublic`/`getProductBySlugPublic` подтягивают варианты (одним join'ом, select `*, product_variants(*)`).
   - `adminListProducts`, `adminUpsertProduct`, `adminUpsertVariant`, `adminDeleteVariant`.
   - `createOrder` принимает `variantId`, проверяет цену из БД (как сейчас — против подмены).
3. **Типы** (`src/lib/catalog/types.ts`): добавить `ProductVariant`, у `Product` — `variants: ProductVariant[]`. Поле `price`/`volumeMl` становится derived (min/selected).
4. **Корзина** (`src/lib/cart/store.ts`): ключ позиции = `variantId`, в `CartItem` добавить `variantId`, `volumeMl`. Миграция persist: при чтении старой версии — очистка корзины (`version: 2`).
5. **UI**:
   - `ProductCard`: показывать «от {minPrice}» (или «Цена уточняется»), плюс кликается на PDP. Быстрый «+» убрать или открывать PDP, чтобы выбрать объём.
   - `product.$slug.tsx`: селектор 50/100 мл (сегмент-контрол), цена/SKU/CTA реагируют на выбор.
   - `cart.tsx` / `CartItemRow`: показывать объём в названии позиции.
   - `checkout.tsx`: передавать `variantId` в `createOrder`.
6. **Админка** (`admin.products.tsx`):
   - Внутри модалки товара — секция «Варианты» (таблица: объём / цена / SKU / в наличии / sort, добавить/удалить).
   - Скрываем старые поля `price`/`volume_ml` для новых товаров.
7. **Seed-сидер**: одноразовая серверная функция `seedCatalog` (вызывается из админки кнопкой «Залить базу», `requireAdmin`):
   - `DELETE FROM products; DELETE FROM product_variants;`
   - INSERT 6 продуктов + варианты по документу.
   - Описания, состав, применение — точно из docx.

## Что НЕ делаю в этом плане
- Не генерирую фото (вы зальёте сами).
- Не правлю цены — все 0, через админку.
- Не трогаю SILVER ANTI-ACNE как часть набора (в документе явно: только как отдельный продукт).

## Технические детали
- Миграция данных корзины: бампнем `version: 2` в zustand persist — старые корзины очистятся, иначе сломается checkout без variantId.
- В `createOrder` цена 0 разрешена (заглушка), но добавлю проверку: если все варианты в корзине 0 — позволяем (тестовый режим), позже включим валидацию `price > 0`.
- Триггер `set_updated_at` уже есть в проекте — переиспользую для `product_variants`.

После одобрения: миграция → код → запуск сидера через админку.
