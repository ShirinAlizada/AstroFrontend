CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text NOT NULL,
  tag text NOT NULL DEFAULT 'Ümumi',
  cover_url text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  views integer NOT NULL DEFAULT 0,
  author_id uuid REFERENCES auth.users,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are public" ON public.articles FOR SELECT USING (published = true);
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.chat_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,
  title text NOT NULL DEFAULT 'Yeni söhbət',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own threads" ON public.chat_threads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_thread_idx ON public.chat_messages (thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.articles (title, slug, excerpt, body, tag, published, published_at) VALUES
('Mercury retrogradında necə qərar vermək olar?','merkuri-retroqrad','Görünüşdə geriyə hərəkət edən planetlər bizi yavaşlatmağa çağırır.','Merkuri retroqrad dövrü ildə üç-dörd dəfə baş verir və təxminən üç həftə davam edir.\n\nBu dövrdə rabitə, sənədlər və səyahətlə bağlı çaşqınlıqlar artır. Astroloji ənənəyə görə yeni müqavilələr bağlamaq, texnika almaq və vacib qərarları qəti şəkildə imzalamaq üçün ideal vaxt deyil.\n\nƏvəzində geriyə baxmaq, köhnə işləri tamamlamaq, əlaqələri bərpa etmək və planları yenidən nəzərdən keçirmək üçün güclü bir fürsətdir. Retroqrad dayanmağa deyil, yavaşlamağa çağırır.','Təlimat',true, now()),
('Tam ayın bürclərə təsiri','dolunay-tesiri','Dolunay dövründə duyğular güclənir.','Dolunay Günəşlə Ayın qarşı-qarşıya durduğu andır. Bu qarşıdurma daxili gərginliyi üzə çıxarır.\n\nHər dolunay müəyyən bürcdə baş verir və o bürcün mövzularını işıqlandırır. Qoç dolunayı cəsarət və müstəqillik, Tərəzi dolunayı isə münasibətlərdə tarazlıq mövzusunu gündəmə gətirir.\n\nDolunay günü meditasiya, jurnal yazmaq və buraxmaq praktikaları üçün əlverişlidir.','Ay',true, now()),
('Doğum xəritəsindəki 12 ev nə deməkdir?','12-ev','Hər ev həyatınızın bir sahəsini göstərir.','Doğum xəritəsi 12 evə bölünür və hər ev həyatın konkret sahəsini təmsil edir.\n\n1-ci ev — şəxsiyyət və görünüş. 2-ci ev — maddi resurslar. 3-cü ev — ünsiyyət. 4-cü ev — ev və kök. 5-ci ev — yaradıcılıq və eşq. 6-cı ev — gündəlik iş və sağlamlıq.\n\n7-ci ev — tərəfdaşlıq. 8-ci ev — dəyişim. 9-cu ev — fəlsəfə və səyahət. 10-cu ev — karyera. 11-ci ev — dostluq. 12-ci ev — ruhani aləm.','Xəritə',true, now());