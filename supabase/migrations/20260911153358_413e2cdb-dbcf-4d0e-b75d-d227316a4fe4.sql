-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','astrologer','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  birth_date date,
  birth_time time,
  birth_place text,
  birth_lat double precision,
  birth_lon double precision,
  tz_offset double precision,
  sun_sign text,
  moon_sign text,
  ascendant text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- NATAL CHARTS
CREATE TABLE public.natal_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  chart jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.natal_charts TO authenticated;
GRANT ALL ON public.natal_charts TO service_role;
ALTER TABLE public.natal_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chart" ON public.natal_charts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_charts_updated BEFORE UPDATE ON public.natal_charts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HOROSCOPES
CREATE TABLE public.horoscopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sign text NOT NULL,
  period text NOT NULL CHECK (period IN ('daily','weekly','monthly')),
  period_start date NOT NULL,
  content text NOT NULL,
  love smallint NOT NULL DEFAULT 70,
  career smallint NOT NULL DEFAULT 70,
  finance smallint NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sign, period, period_start)
);
GRANT SELECT ON public.horoscopes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horoscopes TO authenticated;
GRANT ALL ON public.horoscopes TO service_role;
ALTER TABLE public.horoscopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Horoscopes are public" ON public.horoscopes FOR SELECT USING (true);
CREATE POLICY "Admins manage horoscopes" ON public.horoscopes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ASTROLOGERS
CREATE TABLE public.astrologers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  title text,
  bio text,
  specialties text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  price_azn integer NOT NULL DEFAULT 50,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  avatar_url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astrologers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.astrologers TO authenticated;
GRANT ALL ON public.astrologers TO service_role;
ALTER TABLE public.astrologers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verified astrologers are public" ON public.astrologers FOR SELECT USING (verified = true);
CREATE POLICY "Astrologer reads own row" ON public.astrologers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Astrologer updates own row" ON public.astrologers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage astrologers" ON public.astrologers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_astrologers_updated BEFORE UPDATE ON public.astrologers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  astrologer_id uuid NOT NULL REFERENCES public.astrologers(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'live' CHECK (session_type IN ('live','written')),
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Astrologers read their bookings" ON public.bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.astrologers a WHERE a.id = bookings.astrologer_id AND a.user_id = auth.uid()));
CREATE POLICY "Astrologers update their bookings" ON public.bookings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.astrologers a WHERE a.id = bookings.astrologer_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- JOURNAL
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT current_date,
  mood smallint NOT NULL DEFAULT 3 CHECK (mood BETWEEN 1 AND 5),
  title text,
  content text NOT NULL,
  transit_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON public.journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_journal_updated BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FORUM
CREATE TABLE public.forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'İstifadəçi',
  category text NOT NULL DEFAULT 'ümumi',
  title text NOT NULL,
  body text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forum_topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_topics TO authenticated;
GRANT ALL ON public.forum_topics TO service_role;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible topics are public" ON public.forum_topics FOR SELECT USING (is_hidden = false);
CREATE POLICY "Authors read own topics" ON public.forum_topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create topics" ON public.forum_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors edit own topics" ON public.forum_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors delete own topics" ON public.forum_topics FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage topics" ON public.forum_topics FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_topics_updated BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'İstifadəçi',
  body text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forum_replies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible replies are public" ON public.forum_replies FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users create replies" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors delete own replies" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage replies" ON public.forum_replies FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SEED ASTROLOGERS
INSERT INTO public.astrologers (display_name, title, bio, specialties, languages, price_azn, rating, verified) VALUES
('Leyla Kərimova','Natal xəritə mütəxəssisi','15 illik təcrübə ilə natal xəritə və həyat yolu təhlili.', ARRAY['Natal xəritə','Karyera'], ARRAY['Azərbaycan','Türk'], 80, 4.9, true),
('Rəşad Hüseynov','Sinastriya astroloqu','Münasibət uyğunluğu və sinastriya təhlilləri.', ARRAY['Sinastriya','Sevgi'], ARRAY['Azərbaycan','İngilis'], 65, 4.8, true),
('Nigar Əliyeva','Tranzit və proqnoz','Tranzitlər əsasında illik proqnozlar hazırlayır.', ARRAY['Tranzit','Proqnoz'], ARRAY['Azərbaycan','Rus'], 70, 4.7, true);

-- SEED HOROSCOPES (daily/weekly/monthly for 12 signs)
INSERT INTO public.horoscopes (sign, period, period_start, content, love, career, finance)
SELECT s.sign, p.period, current_date,
  'Bu gün ' || s.sign || ' bürcü üçün səmavi axın güclüdür. Qərarlarını səhər saatlarında ver, axşamı isə istirahətə ayır.',
  60 + (row_number() over ())::int % 40,
  55 + (row_number() over ())::int % 45,
  50 + (row_number() over ())::int % 50
FROM (VALUES ('Qoç'),('Buğa'),('Əkizlər'),('Xərçəng'),('Aslan'),('Qız'),('Tərəzi'),('Əqrəb'),('Oxatan'),('Oğlaq'),('Dolça'),('Balıqlar')) AS s(sign)
CROSS JOIN (VALUES ('daily'),('weekly'),('monthly')) AS p(period);