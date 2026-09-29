-- Genişləndirilmiş mağaza: tarot məhsulları ümumi "shop_products" cədvəlinə
-- keçir və kateqoriya sütunu alır (tarot, kristal, şam, kitab), sifarişlər isə
-- çox-məhsullu səbət dəstəkləyən shop_orders + shop_order_items struktoruna
-- keçir (əvvəlki tarot_orders bir sifarişdə tək məhsulu dəstəkləyirdi).
--
-- Köhnə tarot_orders cədvəli SİLİNMİR — mövcud sifariş tarixçəsini itirməmək
-- üçün saxlanılır və məlumatları shop_orders/shop_order_items-ə köçürülür.
-- Admin panelindən idarə davam edən sifarişlər artıq yeni cədvəllərdən oxunur.

-- 1) tarot_products -> shop_products, kateqoriya dəstəyi ilə
ALTER TABLE public.tarot_products RENAME TO shop_products;

ALTER TABLE public.shop_products
  DROP CONSTRAINT IF EXISTS tarot_products_slug_check;

ALTER TABLE public.shop_products
  ADD COLUMN category text NOT NULL DEFAULT 'tarot'
    CHECK (category IN ('tarot','kristal','sham','kitab')),
  ADD COLUMN image_url text,
  ADD COLUMN unit_label text;

ALTER TABLE public.shop_products
  ALTER COLUMN category DROP DEFAULT,
  ALTER COLUMN card_count DROP NOT NULL,
  ALTER COLUMN card_count DROP DEFAULT;

-- Mövcud tarot məhsulları üçün unit_label və şəkil yolu doldurulur (şəkillər
-- artıq public/tarot/ qovluğunda var).
UPDATE public.shop_products SET unit_label = card_count || ' kart' WHERE category = 'tarot';
UPDATE public.shop_products SET image_url = '/tarot/' || slug || '.jpg' WHERE category = 'tarot';

COMMENT ON COLUMN public.shop_products.category IS 'tarot | kristal | sham | kitab';
COMMENT ON COLUMN public.shop_products.unit_label IS 'Göstərilən ölçü vahidi, məs. "78 kart", "500 qram", "240 səh"';
COMMENT ON COLUMN public.shop_products.image_url IS 'NULL olduqda UI kateqoriyaya uyğun ikon-placeholder göstərir';

-- 2) Çox-məhsullu sifarişlər: order + order-items
CREATE TABLE public.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_azn integer NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'yeni' CHECK (status IN ('yeni','tesdiqlenib','gonderilib','legv_edilib')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shop_orders TO authenticated;
GRANT ALL ON public.shop_orders TO service_role;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own shop orders" ON public.shop_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own shop orders" ON public.shop_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all shop orders" ON public.shop_orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_shop_orders_updated BEFORE UPDATE ON public.shop_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.shop_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_azn integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shop_order_items TO authenticated;
GRANT ALL ON public.shop_order_items TO service_role;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own shop order items" ON public.shop_order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Users create own shop order items" ON public.shop_order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.shop_orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins manage all shop order items" ON public.shop_order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- product_id-yə ON DELETE SET NULL icazə verilib — silinən məhsulun adı və
-- qiyməti sifariş sətrində (product_name/unit_price_azn) qorunur, köhnə
-- sifarişlər pozulmur.

-- 3) Köhnə tarot_orders -> yeni struktura köçürülür (tarixçə qorunur)
INSERT INTO public.shop_orders (id, user_id, total_azn, full_name, phone, address, note, status, created_at, updated_at)
SELECT id, user_id, total_azn, full_name, phone, address, note, status, created_at, updated_at
FROM public.tarot_orders
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.shop_order_items (order_id, product_id, product_name, quantity, unit_price_azn, created_at)
SELECT o.id, o.product_id, p.name, o.quantity, p.price_azn, o.created_at
FROM public.tarot_orders o
JOIN public.shop_products p ON p.id = o.product_id;

-- tarot_orders artıq tətbiqdə istifadə olunmur, amma məlumat itkisi riski
-- olmadan (yuxarıdakı köçürmə təsdiqləndikdən sonra) mənuel silinə bilər:
--   DROP TABLE public.tarot_orders;

-- 4) Yeni kateqoriyalar üçün nümunə məhsullar (şəkilsiz — admin paneldən öz
-- şəkil linkinizi əlavə edə bilərsiniz, olmadıqda kateqoriya ikonu göstərilir)
INSERT INTO public.shop_products (category, slug, name, description, price_azn, unit_label, sort_order)
VALUES
('kristal', 'ametist', 'Ametist Kristalı', 'Sakitlik və intuisiyanı gücləndirən bənövşəyi kristal. Meditasiya və yuxu otağı üçün ideal.', 18, '1 ədəd, ə.t. 4-6 sm', 1),
('kristal', 'qara-turmalin', 'Qara Turmalin', 'Enerji qoruyucusu hesab olunan qara kristal — mənfi enerjini sovurmaq üçün istifadə olunur.', 22, '1 ədəd, ə.t. 3-5 sm', 2),
('kristal', 'aypark', 'Aypark (Moonstone)', 'Ay enerjisi ilə bağlı, intuisiya və yeni başlanğıclar üçün seçilən mistik daş.', 20, '1 ədəd, ə.t. 3-4 sm', 3),
('sham', 'lavanda-rahatliq', 'Lavanda Rahatlıq Şamı', 'Əl işi soya mumundan hazırlanmış, lavanda ətirli rahatlıq şamı. Meditasiya və axşam ritualları üçün.', 12, '180 qram, ~35 saat', 1),
('sham', 'sedr-sandal', 'Sedr və Sandal Ağacı Şamı', 'Torpaqlanma və fokuslanma üçün isti, ağac notlu ətir kompozisiyası.', 14, '180 qram, ~35 saat', 2),
('kitab', 'ulduzlarin-dili', 'Ulduzların Dili: Astrologiyaya Giriş', 'Bürclər, evlər və planetlərin əsaslarını sadə dildə izah edən başlanğıc kitabı.', 16, '240 səhifə', 1),
('kitab', 'tarot-sirleri', 'Tarot Sirləri: Başlanğıc Bələdçisi', '78 kartın mənası, açılış üsulları və şəxsi tarot təcrübəsi üçün praktik bələdçi.', 19, '196 səhifə', 2)
ON CONFLICT (slug) DO NOTHING;
