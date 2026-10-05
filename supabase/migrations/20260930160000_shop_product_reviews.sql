-- Məhsul reytinqi/rəyi: hər istifadəçi hər məhsula 1 ulduz+şərh (1-5) yaza
-- bilər (UNIQUE (product_id, user_id) — yenidən yazsa, upsert ilə köhnə
-- rəyi yeniləyir). Oxumaq hamıya açıqdır (mağaza kartlarında orta reytinq
-- göstərmək üçün), yazmaq/dəyişmək/silmək yalnız öz rəyi üzərində.
CREATE TABLE public.shop_product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_shop_product_reviews_product_id ON public.shop_product_reviews (product_id);

ALTER TABLE public.shop_product_reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.shop_product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shop_product_reviews TO authenticated;

CREATE POLICY "Anyone can view product reviews"
  ON public.shop_product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own review"
  ON public.shop_product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review"
  ON public.shop_product_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review"
  ON public.shop_product_reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_shop_product_reviews_updated
  BEFORE UPDATE ON public.shop_product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
