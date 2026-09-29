-- SUBSCRIPTION PLANS (catalog, publicly readable, admin-managed)
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE CHECK (key IN ('standart','premium')),
  name text NOT NULL,
  tagline text,
  price_azn integer NOT NULL,
  billing_period text NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly','yearly')),
  features text[] NOT NULL DEFAULT '{}',
  ai_messages_per_day integer, -- NULL = limitsiz
  synastry_full_detail boolean NOT NULL DEFAULT false,
  booking_discount_pct smallint NOT NULL DEFAULT 0,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon;
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active plans are public" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER SUBSCRIPTIONS (bir istifadəçi = bir aktiv abunəlik sətri)
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_key text NOT NULL REFERENCES public.subscription_plans(key),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscription" ON public.user_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PAYMENT TRANSACTIONS (append-only jurnal; hələlik "mock" provayder)
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_key text NOT NULL REFERENCES public.subscription_plans(key),
  amount_azn integer NOT NULL,
  provider text NOT NULL DEFAULT 'mock',
  status text NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded','failed','refunded')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payments" ON public.payment_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own payments" ON public.payment_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all payments" ON public.payment_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- SEED PLANS
INSERT INTO public.subscription_plans
  (key, name, tagline, price_azn, features, ai_messages_per_day, synastry_full_detail, booking_discount_pct, sort_order)
VALUES
(
  'standart',
  'Standart',
  'Əsas astroloji vasitələrə tam giriş',
  9,
  ARRAY[
    'Tam natal xəritə təkəri (planet, ev və aspekt təfərrüatları)',
    'Uyğunluq (sinastriya) — planet-planet detallı təhlil',
    'Gündəlik, həftəlik və aylıq horoskop',
    'Numerologiya hesablamaları',
    'Günün bələdçisi (Panchang)',
    'AI Astroloq söhbəti — gündə 15 mesaj',
    'Jurnal — limitsiz qeyd',
    'Astroloqlarla rezervasiya'
  ],
  15,
  true,
  0,
  1
),
(
  'premium',
  'Premium',
  'Ən dərin təhlillər və limitsiz AI dəstəyi',
  19,
  ARRAY[
    'Standart paketin bütün imkanları',
    'AI Astroloq söhbəti — limitsiz mesaj',
    'Astroloq rezervasiyalarında 15% endirim',
    'Yeni məqalələrə prioritet giriş',
    'Prioritet dəstək'
  ],
  NULL,
  true,
  15,
  2
)
ON CONFLICT (key) DO NOTHING;
