-- Checkout-da demo endirim kodları üçün: tətbiq olunan kodu və faizini
-- sifarişdə qeyd edir (audit/tarixçə üçün). Kodların özü backend-də
-- saxlanmır — src/lib/shop.ts-də sadə sabit siyahıdır (demo xarakterlidir,
-- real kupon sistemi lazım olsa ayrıca cədvəl qurulmalıdır).
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS discount_code text,
  ADD COLUMN IF NOT EXISTS discount_pct integer NOT NULL DEFAULT 0;
