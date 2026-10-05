-- Bildirişlər zəngi: forum cavabı, sifariş statusu dəyişikliyi kimi
-- hadisələr üçün ümumi "notifications" cədvəli. Yazma yalnız SECURITY
-- DEFINER trigger funksiyaları vasitəsilə olur (istifadəçilər özləri INSERT
-- edə bilmir — RLS-də INSERT policy YOXDUR, məqsədli), oxumaq/oxunmuş
-- etmək/silmək isə hər kəsin öz bildirişləri üzərində açıqdır. Abunəlik
-- bitmə xəbərdarlığı isə vaxta bağlı olduğu üçün (cron/scheduled job yoxdur)
-- backend-də saxlanmır — frontend-də cari abunəlik məlumatından "canlı"
-- hesablanır (bax: src/hooks/useNotifications.tsx).
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id, created_at DESC);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Forum: mövzuya cavab gələndə mövzu sahibinə bildiriş (özünə cavab yazsa yox).
CREATE OR REPLACE FUNCTION public.notify_forum_reply()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  topic_user_id uuid;
BEGIN
  SELECT user_id INTO topic_user_id FROM public.forum_topics WHERE id = NEW.topic_id;
  IF topic_user_id IS NOT NULL AND topic_user_id <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      topic_user_id,
      'forum_reply',
      'Mövzuna yeni cavab',
      NEW.author_name || ': ' || left(NEW.body, 120),
      '/forum/' || NEW.topic_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_forum_reply
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.notify_forum_reply();

-- Mağaza: sifariş statusu dəyişəndə sifarişi verən istifadəçiyə bildiriş.
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  status_label text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    status_label := CASE NEW.status
      WHEN 'yeni' THEN 'Yeni'
      WHEN 'tesdiqlenib' THEN 'Təsdiqləndi'
      WHEN 'gonderilib' THEN 'Göndərildi'
      WHEN 'legv_edilib' THEN 'Ləğv edildi'
      ELSE NEW.status
    END;
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'order_status',
      'Sifariş statusu yeniləndi',
      'Sifarişiniz "' || status_label || '" statusuna keçdi.',
      '/sifarislerim'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_order_status
  AFTER UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();
