-- İllik ödəniş seçimi: istifadəçi checkout-da Aylıq/İllik seçə bilər (illik
-- seçsə endirimli məbləğ ödəyir, dövr 365 gün olur). Endirim faizi backend-də
-- saxlanmır — src/lib/subscription.ts-də ANNUAL_DISCOUNT_PCT sabitidir (demo
-- xarakterlidir), burada yalnız istifadəçinin FAKTİKİ seçdiyi dövr qeydə
-- alınır (audit/tarixçə və gələcək yenilənmə məntiqi üçün).
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly'));

ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly'));
