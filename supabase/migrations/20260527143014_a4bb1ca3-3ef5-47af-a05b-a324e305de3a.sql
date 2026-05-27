
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins read user_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  metal TEXT NOT NULL CHECK (metal IN ('platinum','gold','silver','mix')),
  description TEXT,
  image_url TEXT,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  price INT NOT NULL CHECK (price >= 0),
  short_description TEXT NOT NULL DEFAULT '',
  composition TEXT,
  usage TEXT,
  volume_ml INT,
  weight_g INT,
  areas TEXT[] NOT NULL DEFAULT '{}',
  skin_type TEXT[] NOT NULL DEFAULT '{}',
  target TEXT,
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_set BOOLEAN NOT NULL DEFAULT false,
  bundle_items TEXT[] NOT NULL DEFAULT '{}',
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_products_category ON public.products(category_slug);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TYPE public.order_status AS ENUM ('new','processing','paid','shipped','done','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cod','robokassa');
CREATE TYPE public.payment_status AS ENUM ('unpaid','pending','paid','failed','refunded');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  address TEXT NOT NULL,
  comment TEXT,
  items JSONB NOT NULL,
  subtotal INT NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cod',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  status public.order_status NOT NULL DEFAULT 'new',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Inserts/updates go through server functions with supabaseAdmin (service_role bypasses RLS).
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Site content (single-row-per-key)
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write site_content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- App settings (admin-only)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_app_settings_updated BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read settings" ON public.app_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed: categories
INSERT INTO public.categories (slug, name, short_name, metal, description, sort) VALUES
  ('platinum-lux', 'Коллоидная платина PLATINUM LUX', 'PLATINUM LUX', 'platinum', 'Премиальная линия с коллоидной платиной.', 10),
  ('gold-chic', 'Коллоидное золото GOLD CHIC', 'GOLD CHIC', 'gold', 'Премиальная линия с коллоидным золотом.', 20),
  ('platinum', 'Коллоидный раствор платины', 'Платина', 'platinum', NULL, 30),
  ('gold', 'Коллоидный раствор золота', 'Золото', 'gold', NULL, 40),
  ('silver-universal', 'Коллоидное серебро SILVER UNIVERSAL', 'SILVER UNIVERSAL', 'silver', NULL, 50),
  ('silver-anti-acne', 'Коллоидное серебро SILVER ANTI-ACNE', 'SILVER ANTI-ACNE', 'silver', NULL, 60),
  ('sets', 'Наборы средств', 'Наборы', 'mix', 'Подарочные наборы и комплекты.', 70);

-- Seed: products
INSERT INTO public.products (slug, sku, name, category_slug, price, short_description, composition, usage, volume_ml, weight_g, areas, skin_type, target, in_stock, is_set, bundle_items, sort) VALUES
  ('platinum-lux-110','PLT-LUX-110','PLATINUM LUX 110 мл','platinum-lux',1563,'Спрей-мист для ухода за кожей с коллоидной платиной.','Коллоидная платина','Встряхните флакон. Распылите на очищенную кожу утром и вечером. Можно добавлять в косметические средства.',110,115,ARRAY['лицо','тело','зона декольте','руки'],ARRAY['все типы кожи','зрелая','нормальная'],NULL,true,false,'{}',10),
  ('gold-chic-110','GLD-CHC-110','GOLD CHIC 110 мл','gold-chic',1453,'Спрей-мист для ухода за кожей с коллоидным золотом.','Коллоидное золото','Встряхните флакон. Равномерно распылите на очищенную кожу. Можно использовать для обогащения косметических средств.',110,110,ARRAY['лицо','тело','зона декольте','руки'],ARRAY['все типы кожи','зрелая','комбинированная'],NULL,true,false,'{}',20),
  ('gold-chic-100','GLD-CHC-100','GOLD CHIC 100 мл','gold-chic',945,'Спрей для ухода за кожей с коллоидным золотом.','Коллоидное золото','Распылите на очищенную кожу лица, декольте, рук и тела утром, вечером или в течение дня.',100,120,ARRAY['шея','зона декольте','лицо','тело'],ARRAY['все типы кожи','зрелая','комбинированная'],NULL,true,false,'{}',30),
  ('platinum-100','PLT-100','Коллоидная платина 100 мл','platinum',985,'Спрей-мист с коллоидной платиной для ежедневного ухода.','Коллоидная платина','Распыляйте на очищенную кожу утром, вечером и в течение дня перед нанесением крема, сыворотки, маски или патчей.',100,NULL,ARRAY['лицо','зона декольте','область вокруг глаз','руки'],'{}',NULL,true,false,'{}',40),
  ('gold-100','GLD-100','Коллоидное золото 100 мл','gold',954,'Спрей для ухода за кожей с коллоидным золотом.','Коллоидное золото','Встряхните флакон. Распылите на очищенную кожу утром, вечером или в течение дня.',100,120,ARRAY['шея','зона декольте','лицо','тело'],ARRAY['все типы кожи','зрелая','комбинированная'],NULL,true,false,'{}',50),
  ('silver-universal','SLV-UNI-100','SILVER UNIVERSAL 100 мл','silver-universal',534,'Универсальный спрей-тонер для ежедневного ухода.','Коллоидное серебро, хелат, очищенная вода, дистиллированная вода, стабилизатор','Распыляйте на нужную область кожи.',100,100,ARRAY['лицо','тело'],'{}',NULL,true,false,'{}',60),
  ('silver-anti-acne','SLV-ACN-100','SILVER ANTI-ACNE 100 мл','silver-anti-acne',564,'Спрей для проблемной кожи, склонной к высыпаниям.','Деминерализованная вода, серебро, хелат, дистиллированная вода, стабилизатор','Используйте как спрей для ухода за кожей.',100,NULL,'{}','{}','проблемная кожа',true,false,'{}',70),
  ('set-diamant-lux','SET-DMT-LUX','Набор DIAMANT LUX','sets',2450,'Набор из коллоидной платины и золота, по 110 мл, 2 флакона.',NULL,NULL,NULL,NULL,'{}','{}',NULL,true,true,ARRAY['platinum-lux-110','gold-chic-110'],80),
  ('set-diamant-collection','SET-DMT-COL','Набор DIAMANT COLLECTION','sets',2352,'Набор из коллоидной платины, золота и серебра, по 100 мл, 3 флакона.',NULL,NULL,NULL,NULL,'{}','{}',NULL,true,true,ARRAY['platinum-100','gold-100','silver-universal'],90);

-- Seed: site_content
INSERT INTO public.site_content (key, value) VALUES
  ('home_hero', jsonb_build_object(
    'eyebrow','Cosmetic Lab',
    'title_mobile','Коллоидное серебро, золото и платина',
    'title_desktop','Натуральные коллоидные растворы серебра, золота и платины',
    'subtitle','Деликатный спрей-мист для лица, тела и кожи рук.',
    'cta','Открыть каталог'
  )),
  ('delivery_page', jsonb_build_object(
    'banner','Бесплатная доставка от 1500 ₽',
    'intro','Отправляем заказы по всей России. Сборка 1–2 рабочих дня.'
  )),
  ('contacts_page', jsonb_build_object(
    'email','hello@rosabarocco.ru',
    'phone','+7 (000) 000-00-00',
    'address','Россия'
  )),
  ('cooperation_page', jsonb_build_object(
    'intro','Пришлём прайс и условия в ответ на заявку.'
  ));

-- App settings: robokassa stub
INSERT INTO public.app_settings (key, value) VALUES
  ('robokassa', jsonb_build_object(
    'enabled', false,
    'merchant_login','',
    'password_1','',
    'password_2','',
    'test_mode', true
  ));

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images','product-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete product-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
