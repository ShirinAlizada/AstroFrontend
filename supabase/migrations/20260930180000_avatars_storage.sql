-- Profil şəkli yükləmək üçün ictimai "avatars" bucket-i. Fayl yolu həmişə
-- "<user_id>/avatar.<uzantı>" formatındadır — RLS siyasəti yolun ilk
-- seqmentini (storage.foldername) auth.uid() ilə müqayisə edərək yalnız
-- sahibinin öz şəklini yükləyə/dəyişə/silə bilməsini təmin edir. Oxumaq
-- (SELECT) hamı üçün açıqdır ki, şəkillər sayt üzərində göstərilə bilsin.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
