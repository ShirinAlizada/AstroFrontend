-- TAROT PRODUCTS (catalog, publicly readable, admin-managed)
CREATE TABLE public.tarot_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug IN ('classic','moon','stars','shadow')),
  name text NOT NULL,
  description text NOT NULL,
  price_azn integer NOT NULL,
  card_count integer NOT NULL DEFAULT 78,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tarot_products TO anon;
GRANT SELECT ON public.tarot_products TO authenticated;
GRANT ALL ON public.tarot_products TO service_role;
ALTER TABLE public.tarot_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active tarot products are public" ON public.tarot_products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage tarot products" ON public.tarot_products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_tarot_products_updated BEFORE UPDATE ON public.tarot_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TAROT ORDERS (demo/mock ödəniş ilə yaranan sifarişlər — fiziki göndəriş məlumatları ilə)
CREATE TABLE public.tarot_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.tarot_products(id),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_azn integer NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'yeni' CHECK (status IN ('yeni','tesdiqlenib','gonderilib','legv_edilib')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.tarot_orders TO authenticated;
GRANT ALL ON public.tarot_orders TO service_role;
ALTER TABLE public.tarot_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own tarot orders" ON public.tarot_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own tarot orders" ON public.tarot_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all tarot orders" ON public.tarot_orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_tarot_orders_updated BEFORE UPDATE ON public.tarot_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED PRODUCTS
INSERT INTO public.tarot_products (slug, name, description, price_azn, card_count, sort_order)
VALUES
(
  'classic',
  'Klassik Rider-Waite Tarot',
  'Tarotun ən çox tanınan və başlanğıc üçün ən uyğun dəsti. 78 kart, ənənəvi simvolika, ətraflı təlimat kitabçası ilə birlikdə.',
  24,
  78,
  1
),
(
  'moon',
  'Ay Fazaları Tarot',
  'Gümüşü-bənövşəyi tonlarda, Ayın enerjisinə həsr olunmuş müasir tarot dəsti. Intuisiya və daxili dünya ilə iş üçün ideal.',
  29,
  78,
  2
),
(
  'stars',
  'Ulduz Xəritəsi Tarot',
  'Astrologiya ilə tarotu birləşdirən qızılı-lacivərd dəst — hər kartda bürc və planet simvolikası.',
  32,
  78,
  3
),
(
  'shadow',
  'Kölgə və İşıq Oracle',
  'Dərin özünü-dərketmə üçün 44 kartlıq oracle dəsti. Minimalist qara-qızılı dizayn, gündəlik refleksiya üçün əlavə bələdçi ilə.',
  27,
  44,
  4
)
ON CONFLICT (slug) DO NOTHING;
