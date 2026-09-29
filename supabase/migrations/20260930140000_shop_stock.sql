-- Anbar sistemi: hər məhsulun neçə ədəd stokda qaldığını izləyir. Admin
-- panel bunu birbaşa redaktə edir (tam məbləğ) və ya sürətli +/- düymələri
-- ilə tənzimləyir. Sifariş veriləndə stok atomik şəkildə azaldılır
-- (decrement_shop_stock — kifayət qədər stok yoxdursa false qaytarır, heç
-- nəyi dəyişmir), sifariş ləğv edilərsə admin panelindən geri qaytarılır
-- (increment_shop_stock). Hər ikisi SECURITY DEFINER-dir ki, adi
-- istifadəçi UPDATE ilə birbaşa stoku dəyişə bilməsin, yalnız bu iki
-- funksiya vasitəsilə.
ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS stock_qty integer NOT NULL DEFAULT 20;

CREATE OR REPLACE FUNCTION public.decrement_shop_stock(_product_id uuid, _qty integer)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.shop_products
  SET stock_qty = stock_qty - _qty
  WHERE id = _product_id AND stock_qty >= _qty;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected > 0;
END;
$$;
REVOKE ALL ON FUNCTION public.decrement_shop_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_shop_stock(uuid, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_shop_stock(_product_id uuid, _qty integer)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.shop_products SET stock_qty = stock_qty + _qty WHERE id = _product_id;
$$;
REVOKE ALL ON FUNCTION public.increment_shop_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_shop_stock(uuid, integer) TO authenticated;
