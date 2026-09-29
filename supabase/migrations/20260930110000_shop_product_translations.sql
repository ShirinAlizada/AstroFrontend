-- Məhsul adı və təsviri indi 3 dildə saxlanılır: mövcud name/description
-- sütunları Azərbaycan (defolt/fallback) mətnini saxlayır, yeni *_en/*_ru
-- sütunları isə seçilmiş tərcümələri. Boş buraxılan tərcümə üçün UI
-- avtomatik olaraq Azərbaycan mətninə geri qayıdır (aşağıda lib/shop.ts-də).
ALTER TABLE public.shop_products
  ADD COLUMN name_en text,
  ADD COLUMN name_ru text,
  ADD COLUMN description_en text,
  ADD COLUMN description_ru text;

COMMENT ON COLUMN public.shop_products.name_en IS 'NULL olduqda UI-da name (AZ) göstərilir';
COMMENT ON COLUMN public.shop_products.name_ru IS 'NULL olduqda UI-da name (AZ) göstərilir';
COMMENT ON COLUMN public.shop_products.description_en IS 'NULL olduqda UI-da description (AZ) göstərilir';
COMMENT ON COLUMN public.shop_products.description_ru IS 'NULL olduqda UI-da description (AZ) göstərilir';

-- Mövcud 11 nümunə məhsul üçün EN/RU tərcümələri
UPDATE public.shop_products SET
  name_en = 'Classic Rider-Waite Tarot',
  name_ru = 'Классическое Таро Райдера-Уэйта',
  description_en = 'The most recognized tarot deck and the best starting point for beginners. 78 cards, traditional symbolism, with a detailed guidebook.',
  description_ru = 'Самая узнаваемая колода Таро и лучший выбор для начинающих. 78 карт, традиционная символика, с подробным руководством.'
WHERE slug = 'classic';

UPDATE public.shop_products SET
  name_en = 'Moon Phases Tarot',
  name_ru = 'Таро Фаз Луны',
  description_en = 'A modern tarot deck in silver-violet tones, devoted to the Moon''s energy. Ideal for working with intuition and your inner world.',
  description_ru = 'Современная колода Таро в серебристо-фиолетовых тонах, посвящённая энергии Луны. Идеальна для работы с интуицией и внутренним миром.'
WHERE slug = 'moon';

UPDATE public.shop_products SET
  name_en = 'Star Map Tarot',
  name_ru = 'Таро Звёздной Карты',
  description_en = 'A gold-and-navy deck that blends astrology with tarot — every card carries zodiac and planetary symbolism.',
  description_ru = 'Золотисто-тёмно-синяя колода, объединяющая астрологию с Таро — на каждой карте символика знаков зодиака и планет.'
WHERE slug = 'stars';

UPDATE public.shop_products SET
  name_en = 'Shadow & Light Oracle',
  name_ru = 'Оракул Тени и Света',
  description_en = 'A 44-card oracle deck for deep self-discovery. Minimalist black-and-gold design, with an extra guide for daily reflection.',
  description_ru = 'Колода-оракул из 44 карт для глубокого самопознания. Минималистичный чёрно-золотой дизайн, с дополнительным гидом для ежедневной рефлексии.'
WHERE slug = 'shadow';

UPDATE public.shop_products SET
  name_en = 'Amethyst Crystal',
  name_ru = 'Кристалл Аметиста',
  description_en = 'A violet crystal that enhances calm and intuition. Ideal for meditation and the bedroom.',
  description_ru = 'Фиолетовый кристалл, усиливающий спокойствие и интуицию. Идеален для медитации и спальни.'
WHERE slug = 'ametist';

UPDATE public.shop_products SET
  name_en = 'Black Tourmaline',
  name_ru = 'Чёрный Турмалин',
  description_en = 'A black crystal considered an energy protector — used to absorb negative energy.',
  description_ru = 'Чёрный кристалл, считающийся защитником энергии — используется для поглощения негативной энергии.'
WHERE slug = 'qara-turmalin';

UPDATE public.shop_products SET
  name_en = 'Moonstone',
  name_ru = 'Лунный камень',
  description_en = 'A mystical stone linked to lunar energy, chosen for intuition and new beginnings.',
  description_ru = 'Мистический камень, связанный с энергией Луны, выбираемый для интуиции и новых начинаний.'
WHERE slug = 'aypark';

UPDATE public.shop_products SET
  name_en = 'Lavender Calm Candle',
  name_ru = 'Свеча «Лавандовый Покой»',
  description_en = 'A handmade soy-wax candle scented with lavender for relaxation. For meditation and evening rituals.',
  description_ru = 'Ручная соевая свеча с ароматом лаванды для расслабления. Для медитации и вечерних ритуалов.'
WHERE slug = 'lavanda-rahatliq';

UPDATE public.shop_products SET
  name_en = 'Cedar & Sandalwood Candle',
  name_ru = 'Свеча «Кедр и Сандал»',
  description_en = 'A warm, woody scent blend for grounding and focus.',
  description_ru = 'Тёплая древесная ароматическая композиция для заземления и концентрации.'
WHERE slug = 'sedr-sandal';

UPDATE public.shop_products SET
  name_en = 'The Language of Stars: An Introduction to Astrology',
  name_ru = 'Язык Звёзд: Введение в Астрологию',
  description_en = 'A beginner''s book that explains the basics of signs, houses and planets in plain language.',
  description_ru = 'Книга для начинающих, простым языком объясняющая основы знаков, домов и планет.'
WHERE slug = 'ulduzlarin-dili';

UPDATE public.shop_products SET
  name_en = 'Tarot Secrets: A Beginner''s Guide',
  name_ru = 'Секреты Таро: Руководство для Начинающих',
  description_en = 'The meaning of all 78 cards, spread techniques, and a practical guide to your own tarot practice.',
  description_ru = 'Значения всех 78 карт, техники раскладов и практическое руководство для собственной практики Таро.'
WHERE slug = 'tarot-sirleri';
