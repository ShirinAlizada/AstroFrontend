-- Mağaza məhsullarının "unit_label" sahəsi (məs. "78 kart", "180 qram, ~35
-- saat") yalnız AZ-da idi — dil rus/ingilis edildikdə belə dəyişmirdi. Bu,
-- name/description üçün tətbiq olunan naxışın (20260930110000_shop_product_
-- translations.sql) eynisi: NULL olduqda UI avtomatik AZ mətninə qayıdır
-- (bax src/lib/shop.ts -> localizedUnitLabel).
ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS unit_label_en text,
  ADD COLUMN IF NOT EXISTS unit_label_ru text;

COMMENT ON COLUMN public.shop_products.unit_label_en IS 'NULL olduqda UI-da unit_label (AZ) göstərilir';
COMMENT ON COLUMN public.shop_products.unit_label_ru IS 'NULL olduqda UI-da unit_label (AZ) göstərilir';

-- Mövcud 11 nümunə məhsul üçün EN/RU tərcümələri — slug üzrə (sabit, etibarlı
-- açar), neçə dəfə işə salınsa da sağlam qalır (idempotent).
UPDATE public.shop_products SET unit_label_en = '78 cards', unit_label_ru = '78 карт'
WHERE slug = 'classic';

UPDATE public.shop_products SET unit_label_en = '78 cards', unit_label_ru = '78 карт'
WHERE slug = 'moon';

UPDATE public.shop_products SET unit_label_en = '78 cards', unit_label_ru = '78 карт'
WHERE slug = 'stars';

UPDATE public.shop_products SET unit_label_en = '44 cards', unit_label_ru = '44 карты'
WHERE slug = 'shadow';

UPDATE public.shop_products SET unit_label_en = '1 piece, approx. 4–6 cm', unit_label_ru = '1 шт., ориентировочно 4–6 см'
WHERE slug = 'ametist';

UPDATE public.shop_products SET unit_label_en = '1 piece, approx. 3–5 cm', unit_label_ru = '1 шт., ориентировочно 3–5 см'
WHERE slug = 'qara-turmalin';

UPDATE public.shop_products SET unit_label_en = '1 piece, approx. 3–4 cm', unit_label_ru = '1 шт., ориентировочно 3–4 см'
WHERE slug = 'aypark';

UPDATE public.shop_products SET unit_label_en = '180 g, ~35 hours', unit_label_ru = '180 г, ~35 часов'
WHERE slug = 'lavanda-rahatliq';

UPDATE public.shop_products SET unit_label_en = '180 g, ~35 hours', unit_label_ru = '180 г, ~35 часов'
WHERE slug = 'sedr-sandal';

UPDATE public.shop_products SET unit_label_en = '240 pages', unit_label_ru = '240 страниц'
WHERE slug = 'ulduzlarin-dili';

UPDATE public.shop_products SET unit_label_en = '196 pages', unit_label_ru = '196 страниц'
WHERE slug = 'tarot-sirleri';
