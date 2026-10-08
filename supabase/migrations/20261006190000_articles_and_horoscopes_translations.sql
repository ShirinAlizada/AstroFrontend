-- Articles (qəzet) və horoscopes cədvəllərinə EN/RU tərcümə sütunları.
-- Naxış shop_products-dakı name_en/name_ru ilə eynidir (bax 20260930110000_shop_product_translations.sql):
-- sütun NULL olduqda UI avtomatik mövcud AZ mətninə geri qayıdır.
ALTER TABLE public.articles
  ADD COLUMN title_en text,
  ADD COLUMN title_ru text,
  ADD COLUMN excerpt_en text,
  ADD COLUMN excerpt_ru text,
  ADD COLUMN body_en text,
  ADD COLUMN body_ru text;

COMMENT ON COLUMN public.articles.title_en IS 'NULL olduqda UI-da title (AZ) göstərilir';
COMMENT ON COLUMN public.articles.title_ru IS 'NULL olduqda UI-da title (AZ) göstərilir';
COMMENT ON COLUMN public.articles.excerpt_en IS 'NULL olduqda UI-da excerpt (AZ) göstərilir';
COMMENT ON COLUMN public.articles.excerpt_ru IS 'NULL olduqda UI-da excerpt (AZ) göstərilir';
COMMENT ON COLUMN public.articles.body_en IS 'NULL olduqda UI-da body (AZ) göstərilir';
COMMENT ON COLUMN public.articles.body_ru IS 'NULL olduqda UI-da body (AZ) göstərilir';

ALTER TABLE public.horoscopes
  ADD COLUMN content_en text,
  ADD COLUMN content_ru text;

COMMENT ON COLUMN public.horoscopes.content_en IS 'NULL olduqda UI-da content (AZ) göstərilir';
COMMENT ON COLUMN public.horoscopes.content_ru IS 'NULL olduqda UI-da content (AZ) göstərilir';

-- ------------------------------------------------------------
-- Mövcud 14 toxum məqalənin EN/RU tərcümələri (slug üzrə)
-- ------------------------------------------------------------
UPDATE public.articles SET
  title_en = 'What does your Sun sign actually mean?',
  title_ru = 'Что на самом деле означает твой знак Солнца?',
  excerpt_en = 'The most familiar part of a horoscope is really just one layer of the chart.',
  excerpt_ru = 'Самая известная часть гороскопа — это на самом деле лишь один слой карты.',
  body_en = 'When someone asks for your sign, they''re almost always talking about your Sun sign. It shows which zodiac sign the Sun was in at the moment you were born, and it reflects the core of your identity — your will, and what you''re trying to express in life.

But the Sun sign alone doesn''t give the full picture. The Moon shows your inner world, while the Ascendant shows how others see you. Getting to know yourself through the Sun alone is like reading only the first chapter of a book.

Even so, the Sun sign is a powerful starting point. It shows your core energy, your leadership style, and what makes you feel alive — and it''s the best place to begin when making sense of the rest of your natal chart.',
  body_ru = 'Когда кто-то спрашивает твой знак, обычно речь идёт о знаке Солнца. Он показывает, в каком знаке зодиака находилось Солнце в момент твоего рождения, и отражает суть твоей личности — твою волю и то, что ты стремишься выразить в жизни.

Но знак Солнца сам по себе не даёт полной картины. Луна показывает твой внутренний мир, а Асцендент — как тебя видят другие. Познавать себя только через Солнце — всё равно что читать лишь первую главу книги.

И всё же знак Солнца — это сильная отправная точка. Он показывает твою основную энергию, стиль лидерства и то, что тебя воодушевляет, — и именно с него лучше всего начинать знакомство с остальной натальной картой.'
WHERE slug = 'gunes-burcu-ne-demekdir';

UPDATE public.articles SET
  title_en = 'The Moon''s phases and your emotional cycles',
  title_ru = 'Фазы Луны и твои эмоциональные циклы',
  excerpt_en = 'Each lunar phase matches a different inner rhythm.',
  excerpt_ru = 'Каждая фаза Луны соответствует своему внутреннему ритму.',
  body_en = 'The Moon completes a full orbit around the Earth in about 29.5 days, passing through eight main phases along the way. Each phase matches a distinct emotional and energetic rhythm.

The new moon is the best moment for setting intentions and planting seeds. During the waxing phase, it becomes easier to take action and carry plans forward. The full moon brings culmination, clarity, and sometimes heightened emotional intensity.

The waning moon, in turn, is an invitation to release, simplify, and rest. Tracking your own emotional rhythm against the lunar phases is a simple but powerful way to understand your inner shifts.',
  body_ru = 'Луна совершает полный оборот вокруг Земли примерно за 29,5 дней, проходя при этом через восемь основных фаз. Каждая фаза соответствует своему эмоциональному и энергетическому ритму.

Новолуние — лучший момент для постановки намерений и посева новых идей. На растущей Луне легче действовать и воплощать планы. Полнолуние приносит кульминацию, ясность, а иногда и повышенную эмоциональную интенсивность.

Убывающая Луна, в свою очередь, приглашает отпускать, упрощать и отдыхать. Отслеживать свой эмоциональный ритм по фазам Луны — простой, но мощный способ понять свои внутренние перемены.'
WHERE slug = 'ayin-fazalari-emosional-dovrler';

UPDATE public.articles SET
  title_en = 'What happens to your love life during Venus retrograde?',
  title_ru = 'Что происходит с личной жизнью во время ретроградной Венеры?',
  excerpt_en = 'When Venus turns retrograde, old relationships can resurface.',
  excerpt_ru = 'Когда Венера идёт в ретроград, старые отношения могут всплыть на поверхность.',
  body_en = 'Venus appears to move retrograde about once every 18 months, for roughly six weeks at a time. During this period, love, relationships, money, and personal values all call for extra attention.

Old acquaintances, former partners, or unfinished emotional business can resurface during this time. Astrologers generally don''t recommend starting a new relationship or making major financial decisions during this period — because you may well change your mind afterward.

Instead, Venus retrograde is a great opportunity to reconsider your own values, your self-love, and what you truly need in your relationships.',
  body_ru = 'Венера становится ретроградной примерно раз в 18 месяцев, на срок около шести недель. В этот период особое внимание требуют темы любви, отношений, денег и ценностей.

Старые знакомые, бывшие партнёры или незакрытые эмоциональные вопросы могут снова выйти на первый план. Астрологи обычно не советуют начинать новые отношения или принимать важные финансовые решения в этот период — потому что позже ты можешь изменить своё мнение.

Зато ретроградная Венера — отличная возможность пересмотреть свои ценности, отношение к себе и то, что тебе действительно нужно в отношениях.'
WHERE slug = 'venera-retroqrad-sevgi';

UPDATE public.articles SET
  title_en = 'Rising sign: the secret behind first impressions',
  title_ru = 'Асцендент: секрет первого впечатления',
  excerpt_en = 'Your rising sign shows how others see you in that very first moment.',
  excerpt_ru = 'Асцендент показывает, как тебя видят другие в самый первый момент.',
  body_en = 'The rising sign (Ascendant) is the zodiac sign that was climbing the eastern horizon at the moment you were born. It can''t be calculated without an exact birth time — which makes it one of the most commonly mis-calculated points in a natal chart.

The rising sign shapes your outward appearance, your first impression, and the way you approach the world. For example, someone with a Leo rising can come across as confident even with a quiet Pisces Sun.

This sign also marks the start of the 1st house in the natal chart and shapes the entire house system — which is why knowing your exact birth time matters so much for reading the chart correctly.',
  body_ru = 'Асцендент (восходящий знак) — это знак зодиака, который поднимался над восточным горизонтом в момент твоего рождения. Его невозможно рассчитать без точного времени рождения — поэтому это один из самых часто неверно рассчитанных пунктов натальной карты.

Асцендент формирует твою внешность, первое впечатление и манеру подходить к миру. Например, человек с Асцендентом во Льве может казаться уверенным в себе, даже имея тихое Солнце в Рыбах.

Этот знак также задаёт начало 1-го дома натальной карты и формирует всю систему домов — поэтому точное время рождения так важно для правильного чтения карты.'
WHERE slug = 'yukselen-burc-ilk-teessurat';

UPDATE public.articles SET
  title_en = 'The elements and modalities of the 12 zodiac signs',
  title_ru = 'Стихии и качества 12 знаков зодиака',
  excerpt_en = 'Every sign belongs to one element and one modality — that''s the key to its character.',
  excerpt_ru = 'Каждый знак принадлежит одной стихии и одному качеству — это ключ к его характеру.',
  body_en = 'The 12 zodiac signs are divided into four elements: Fire (Aries, Leo, Sagittarius), Earth (Taurus, Virgo, Capricorn), Air (Gemini, Libra, Aquarius), and Water (Cancer, Scorpio, Pisces). The element shows your core energy type — Fire is active, Earth is practical, Air is intellectual, and Water is emotional.

At the same time, every sign belongs to one of three modalities: Cardinal (Aries, Cancer, Libra, Capricorn), Fixed (Taurus, Leo, Scorpio, Aquarius), and Mutable (Gemini, Virgo, Sagittarius, Pisces).

Combining these two classifications reveals each sign''s unique character — Leo, for instance, is both Fire and Fixed, which is why it carries a passionate yet steady, leadership-driven energy.',
  body_ru = '12 знаков зодиака делятся на четыре стихии: Огонь (Овен, Лев, Стрелец), Земля (Телец, Дева, Козерог), Воздух (Близнецы, Весы, Водолей) и Вода (Рак, Скорпион, Рыбы). Стихия показывает твой базовый тип энергии — Огонь деятелен, Земля практична, Воздух интеллектуален, а Вода эмоциональна.

При этом каждый знак относится к одному из трёх качеств: Кардинальному (Овен, Рак, Весы, Козерог), Фиксированному (Телец, Лев, Скорпион, Водолей) и Мутабельному (Близнецы, Дева, Стрелец, Рыбы).

Сочетание этих двух классификаций раскрывает уникальный характер каждого знака — например, Лев относится и к Огню, и к Фиксированному качеству, поэтому несёт страстную, но устойчивую, лидерскую энергию.'
WHERE slug = 'burclerin-element-keyfiyyeti';

UPDATE public.articles SET
  title_en = 'What is synastry and how do you read it?',
  title_ru = 'Что такое синастрия и как её читать?',
  excerpt_en = 'Overlaying two natal charts reveals the dynamics of a relationship.',
  excerpt_ru = 'Наложение двух натальных карт друг на друга показывает динамику отношений.',
  body_en = 'Synastry is the technique of comparing two people''s natal charts to study the astrological dynamic between them. The angles (aspects) the planets in both charts form with each other show the relationship''s strengths and its harder edges.

For example, a harmonious aspect between one person''s Venus and the other''s Mars can heighten attraction and passion, while a Moon-Moon square can point to emotional misunderstandings.

Synastry doesn''t just answer "are we compatible or not" — it''s a map of which areas of the relationship need work. No combination is perfect; each one comes with its own lesson.',
  body_ru = 'Синастрия — это метод сравнения натальных карт двух людей для изучения астрологической динамики между ними. Углы (аспекты), которые образуют планеты обоих карт друг с другом, показывают сильные и сложные стороны отношений.

Например, гармоничный аспект между Венерой одного партнёра и Марсом другого может усиливать притяжение и страсть, а квадрат Луна-Луна может указывать на эмоциональные недопонимания.

Синастрия отвечает не только на вопрос «подходим мы друг другу или нет» — это карта того, над какими сферами отношений стоит поработать. Ни одно сочетание не идеально, и у каждого есть свой урок.'
WHERE slug = 'sinastriya-nedir';

UPDATE public.articles SET
  title_en = 'Saturn return: the astrology behind the age-29 crisis',
  title_ru = 'Возвращение Сатурна: астрология кризиса 29 лет',
  excerpt_en = 'Roughly every 29 years, Saturn returns to its birth position and reshapes your life.',
  excerpt_ru = 'Примерно раз в 29 лет Сатурн возвращается в точку своего рождения и перестраивает жизнь.',
  body_en = 'Saturn completes a full orbit around the Sun in about 29.5 years. That means everyone experiences what''s known as a "Saturn return" between roughly ages 27 and 30 — when Saturn comes back to the exact position it held at your birth.

This period is often accompanied by major life changes: a career shift, relationships either getting serious or ending, and growing responsibility. Saturn is the planet of structure and order — this return essentially forces you to "grow up."

As hard as it can feel, the Saturn return is really an invitation to build your life on firmer foundations. The second return happens around ages 58-60, bringing a similar but wiser chapter.',
  body_ru = 'Сатурн совершает полный оборот вокруг Солнца примерно за 29,5 лет. Это значит, что каждый человек в возрасте примерно 27-30 лет переживает так называемое «возвращение Сатурна» — Сатурн возвращается в ту же позицию, что была в момент рождения.

Этот период часто сопровождается крупными жизненными изменениями: сменой карьеры, укреплением или завершением отношений, ростом ответственности. Сатурн — планета структуры и порядка, и это возвращение буквально заставляет тебя «взрослеть».

Хотя это и может казаться трудным, возвращение Сатурна на самом деле — приглашение выстроить свою жизнь на более прочном фундаменте. Второе возвращение происходит в 58-60 лет и приносит похожий, но более мудрый этап.'
WHERE slug = 'saturn-qayidisi-29-yas';

UPDATE public.articles SET
  title_en = 'How your natal Moon sign reveals your emotional needs',
  title_ru = 'Как натальная Луна показывает твои эмоциональные потребности',
  excerpt_en = 'Your Moon sign reveals what you need in order to feel safe.',
  excerpt_ru = 'Твоя Луна показывает, что тебе нужно для чувства защищённости.',
  body_en = 'In the natal chart, the Moon shows your inner world, instinctive reactions, and emotional needs. The Sun shows who we want to become, while the Moon shows what we need in order to feel safe.

For someone with Moon in Cancer, for instance, home and family are a source of security, while someone with Moon in Aquarius needs freedom and intellectual connection. Knowing your Moon sign helps you understand your own emotional triggers and the ways you recharge.

In relationships, knowing your partner''s Moon sign is useful too — it can be the key to understanding what they need most in moments of stress.',
  body_ru = 'В натальной карте Луна показывает внутренний мир, инстинктивные реакции и эмоциональные потребности. Солнце показывает, кем мы хотим стать, а Луна — что нам нужно, чтобы чувствовать себя в безопасности.

Например, для человека с Луной в Раке дом и семья — источник защищённости, а для человека с Луной в Водолее важны свобода и интеллектуальная связь. Знание своей Луны помогает понять собственные эмоциональные триггеры и способы восстановления.

В отношениях полезно также знать знак Луны партнёра — это может быть ключом к пониманию того, что ему нужно больше всего в моменты стресса.'
WHERE slug = 'natal-ay-burcun-emosional-ehtiyaclar';

UPDATE public.articles SET
  title_en = 'The North Node and your life''s mission',
  title_ru = 'Северный узел и миссия твоей жизни',
  excerpt_en = 'The Node axis points the way from old habits toward the direction of growth.',
  excerpt_ru = 'Ось узлов показывает путь от старых привычек к направлению роста.',
  body_en = 'The lunar Nodes — North and South — aren''t real planets but mathematical points where the Moon''s orbit crosses the ecliptic. In astrology, they symbolize your life path and spiritual growth.

The South Node shows comfortable, familiar, "already known" qualities — sometimes understood as past habits. The North Node, on the other hand, is the direction that calls to us, feels difficult, but brings growth.

For someone with South Node in Gemini and North Node in Sagittarius, for example, the growth path might be moving away from getting lost in details and toward bigger meaning and philosophy. The Node axis is especially interesting for anyone asking "what am I meant to learn in this life?"',
  body_ru = 'Лунные узлы — Северный и Южный — не реальные планеты, а математические точки пересечения орбиты Луны с эклиптикой. В астрологии они символизируют жизненный путь и духовный рост.

Южный узел показывает комфортные, знакомые, «уже известные» качества — иногда их понимают как прошлые привычки. Северный узел, напротив, — это направление, которое зовёт нас, кажется трудным, но приносит рост.

Например, для человека с Южным узлом в Близнецах и Северным узлом в Стрельце путём развития может стать движение от погружения в детали к более широкому смыслу и философии. Ось узлов особенно интересна тем, кто ищет ответ на вопрос «чему я должен научиться в этой жизни».'
WHERE slug = 'shimal-node-heyat-missiyasi';

UPDATE public.articles SET
  title_en = 'Astrocartography: where is the right place for you to live?',
  title_ru = 'Астрокартография: где тебе подходит жить?',
  excerpt_en = 'Mapping your natal chart onto the world map reveals how different places affect you.',
  excerpt_ru = 'Проекция натальной карты на карту мира показывает, как разные места влияют на тебя.',
  body_en = 'Astrocartography is a technique that projects the planetary lines from your natal chart onto a world map. The idea is simple: a planet''s influence shifts depending on geographic location.

Living in, or even visiting, a city crossed by your Venus line can strengthen experiences tied to love, beauty, and harmony, for example, while a Mars line can boost energy and competitiveness — and sometimes bring tension too.

This technique is an interesting tool for anyone thinking about moving, choosing a city for work, or simply trying to understand why certain places feel different to them — and while it has no scientific proof, it''s shaped by the experience of thousands of people.',
  body_ru = 'Астрокартография — техника, переносящая планетарные линии натальной карты на карту мира. Идея проста: влияние планет меняется в зависимости от географического положения.

Например, жизнь или даже путешествие в город, через который проходит линия Венеры, может усиливать опыт, связанный с любовью, красотой и гармонией, а линия Марса может повышать энергию и соперничество, а иногда и приносить напряжение.

Этот метод — интересный инструмент для тех, кто думает о переезде, выбирает город для работы или просто хочет понять, почему в определённых местах чувствует себя иначе — и хотя научных доказательств этому нет, он сформирован опытом тысяч людей.'
WHERE slug = 'astrokartografiya-harada-yasamaq';

UPDATE public.articles SET
  title_en = 'How your Mercury sign shapes the way you think',
  title_ru = 'Как знак Меркурия формирует твой образ мышления',
  excerpt_en = 'Mercury shows how you think and how you communicate.',
  excerpt_ru = 'Меркурий показывает, как ты думаешь и как общаешься.',
  body_en = 'Because Mercury never strays too far from the Sun, its sign is usually close to your Sun sign (the same sign or a neighboring one). Mercury governs your thinking style, your learning style, and how you communicate.

Mercury in a Fire sign thinks fast and directly; in an Earth sign, it''s practical and detail-oriented; in an Air sign, analytical and social; and in a Water sign, intuitive and emotionally grounded.

Knowing your Mercury sign is useful both for accepting your own way of thinking and for communicating more effectively with others — especially when working with people who have a very different Mercury type.',
  body_ru = 'Поскольку Меркурий никогда не отходит далеко от Солнца, его знак обычно близок к знаку Солнца (тот же знак или соседний). Меркурий отвечает за стиль мышления, способ обучения и манеру общения.

Меркурий в знаке Огня думает быстро и прямо, в знаке Земли — практично и детально, в знаке Воздуха — аналитично и социально, а в знаке Воды — интуитивно и эмоционально.

Знание своего Меркурия полезно и для того, чтобы принять собственный способ мышления, и для более эффективного общения с другими — особенно при работе с людьми с совершенно иным типом Меркурия.'
WHERE slug = 'merkurinin-burcu-dushunce-tarzi';

UPDATE public.articles SET
  title_en = 'Your Mars sign: where do you direct your energy?',
  title_ru = 'Твой Марс: куда ты направляешь энергию?',
  excerpt_en = 'Mars shows how you take action and what motivates you.',
  excerpt_ru = 'Марс показывает, как ты действуешь и что тебя мотивирует.',
  body_en = 'Mars is the planet of desire, action, and drive. Its sign shows how you take action, what triggers you, and how you express your energy.

Mars in Aries — in its home sign — is direct and impulsive, while Mars in Capricorn is strategic and patient. Mars in Libra may avoid conflict, while Mars in Scorpio carries deep, intense energy.

Challenging aspects to Mars (a square to Saturn, for example) can create obstacles to expressing your energy, while harmonious aspects make taking action easier. Knowing your Mars sign helps you understand yourself better in moments when you feel unmotivated.',
  body_ru = 'Марс — планета желания, действия и борьбы. Его знак показывает, как ты действуешь, что тебя раздражает и как ты выражаешь свою энергию.

Марс в Овне — в своём родном знаке — прямой и импульсивный, а Марс в Козероге — стратегический и терпеливый. Марс в Весах может избегать конфликтов, а Марс в Скорпионе несёт глубокую, интенсивную энергию.

Напряжённые аспекты Марса (например, квадрат с Сатурном) могут создавать препятствия для выражения энергии, а гармоничные аспекты облегчают действие. Знание своего Марса помогает лучше понимать себя в моменты, когда пропадает мотивация.'
WHERE slug = 'marsin-burcu-enerji';

UPDATE public.articles SET
  title_en = 'Venus''s role in a couple''s compatibility',
  title_ru = 'Роль Венеры в совместимости пары',
  excerpt_en = 'Venus shows attraction and what you value in a relationship.',
  excerpt_ru = 'Венера показывает притяжение и то, что ты ценишь в отношениях.',
  body_en = 'Venus is the planet of love, beauty, and values. In synastry, the aspects between two people''s Venus positions show the nature of their attraction and what matters to them in a relationship.

Harmonious Venus-Venus aspects usually point to shared taste and values — creating an easy, natural sense of compatibility. Venus-Mars aspects, meanwhile, heighten physical attraction and passion.

But challenging aspects aren''t useless either — they can bring depth and an opportunity for growth to a relationship, they simply require more conscious effort. Venus alone doesn''t determine a relationship''s fate, but it plays an important role in shaping its emotional tone.',
  body_ru = 'Венера — планета любви, красоты и ценностей. В синастрии аспекты между позициями Венеры двух людей показывают природу притяжения и то, что важно для них в отношениях.

Гармоничные аспекты Венера-Венера обычно указывают на общий вкус и ценности, создавая лёгкое, естественное ощущение совместимости. Аспекты Венера-Марс, в свою очередь, усиливают физическое притяжение и страсть.

Но сложные аспекты тоже не бесполезны — они могут принести отношениям глубину и возможность для роста, просто требуют более осознанных усилий. Венера одна не определяет судьбу отношений, но играет важную роль в формировании их эмоционального тона.'
WHERE slug = 'cutlerin-uygunlugunda-venera';

UPDATE public.articles SET
  title_en = 'Astrology and meditation: 5 steps for a daily practice',
  title_ru = 'Астрология и медитация: 5 шагов для ежедневной практики',
  excerpt_en = 'A simple practice that turns astrological insight into daily inner work.',
  excerpt_ru = 'Простая практика, превращающая астрологические знания в ежедневную внутреннюю работу.',
  body_en = 'Astrology isn''t just a forecasting tool — it''s also an invitation to self-knowledge and inner work. The simple practice below can help you integrate astrological insight into everyday life.

1. In the morning, check today''s Moon sign and ask yourself: how can I move with this energy? 2. Recall your own Sun, Moon, and Rising signs, and notice how each one shows up for you today. 3. Sit quietly for five minutes and focus on your breath.

4. Think about one of the current transits (a retrograde planet, for example) and note how it''s showing up in your life. 5. At the end of the day, write a journal entry noting your observations — over time, this will help you get to know your own inner rhythm more deeply.',
  body_ru = 'Астрология — это не только инструмент прогнозирования, но и приглашение к самопознанию и внутренней работе. Приведённая ниже простая практика поможет интегрировать астрологические знания в повседневную жизнь.

1. Утром проверь сегодняшний знак Луны и спроси себя: как мне действовать с этой энергией? 2. Вспомни свои знаки Солнца, Луны и Асцендента и заметь, как каждый из них проявляется сегодня. 3. Посиди спокойно пять минут, сосредоточившись на дыхании.

4. Подумай об одном из текущих транзитов (например, ретроградной планете) и отметь, как он отражается в твоей жизни. 5. В конце дня запиши свои наблюдения в дневник — со временем это поможет тебе глубже узнать свой внутренний ритм.'
WHERE slug = 'astrologiya-meditasiya-5-addim';

-- ------------------------------------------------------------
-- Mövcud 36 toxum horoskop sətrinin EN/RU tərcümələri
-- (sign + period + mövcud AZ content üzrə eşləşdirilir ki, admin
-- panelindən əl ilə yazılmış fərqli mətnlər təsadüfən üstündən yazılmasın)
-- ------------------------------------------------------------
UPDATE public.horoscopes SET
  content_en = 'Your energy is at its peak today — this is the ideal moment to finish what you started. Make your decisions quickly, but don''t forget to consult the people around you.',
  content_ru = 'Сегодня твоя энергия на пике — идеальный момент, чтобы завершить начатое. Принимай решения быстро, но не забывай советоваться с окружающими.'
WHERE sign = 'Qoç' AND period = 'daily' AND content = 'Bu gün enerjin zirvədədir — başladığın işi sona çatdırmaq üçün ideal məqamdasan. Qərarlarını tez ver, amma ətrafındakılarla məsləhətləşməyi unutma.';

UPDATE public.horoscopes SET
  content_en = 'Your leadership instinct takes the lead this week — you''ll be the one taking initiative within the team. Be careful with finances, and avoid impulsive spending.',
  content_ru = 'На этой неделе на первый план выходит твой лидерский инстинкт — именно ты возьмёшь на себя инициативу в команде. Будь внимателен в финансах, избегай поспешных трат.'
WHERE sign = 'Qoç' AND period = 'weekly' AND content = 'Bu həftə liderlik instinktin önə çıxır, komanda içində təşəbbüsü sən götürəcəksən. Maliyyə mövzusunda diqqətli ol, tələsik xərcdən çəkin.';

UPDATE public.horoscopes SET
  content_en = 'This month favors new beginnings — have the courage to take action at work or on personal projects. In the second half of the month, giving more time to your relationships will do you good.',
  content_ru = 'Этот месяц благоприятен для новых начинаний — не бойся сделать шаг вперёд на работе или в личных проектах. Во второй половине месяца тебе будет полезно уделить больше времени отношениям.'
WHERE sign = 'Qoç' AND period = 'monthly' AND content = 'Bu ay yeni başlanğıclar üçün əlverişlidir — iş yerində və ya şəxsi layihələrdə addım atmağa cəsarət et. Ayın ikinci yarısında münasibətlərə daha çox vaxt ayırmaq sənə yaxşı gələcək.';

UPDATE public.horoscopes SET
  content_en = 'Stability and comfort are your priority today — sticking to your daily routine is the right choice. Don''t rush financial decisions; set aside the evening hours for reflection.',
  content_ru = 'Стабильность и комфорт сегодня в приоритете — лучший выбор — не нарушать привычный распорядок дня. Не торопись с финансовыми решениями, вечерние часы посвяти размышлениям.'
WHERE sign = 'Buğa' AND period = 'daily' AND content = 'Sabitlik və rahatlıq bu gün sənin üçün prioritetdir — gündəlik rutinini pozmamaq ən doğru seçimdir. Maliyyə qərarlarında tələsmə, axşam saatları düşünməyə həsr olunsun.';

UPDATE public.horoscopes SET
  content_en = 'Your patience will be rewarded this week — news you''ve been waiting a long time for may arrive. Smart planning in material matters will start paying off now.',
  content_ru = 'На этой неделе твоё терпение будет вознаграждено — может прийти новость, которую ты давно ждал. Разумное планирование в материальных делах начнёт приносить плоды.'
WHERE sign = 'Buğa' AND period = 'weekly' AND content = 'Bu həftə səbrin mükafatlanacaq — uzun müddətdir gözlədiyin bir xəbər gələ bilər. Material məsələlərdə ağıllı planlaşdırma indi öz bəhrəsini verəcək.';

UPDATE public.horoscopes SET
  content_en = 'This month is the time to build solid foundations — take firm steps in work and home matters. In your love life, being more open will deepen your relationships.',
  content_ru = 'Этот месяц — время строить прочный фундамент: делай уверенные шаги в работе и домашних делах. А в любви большая открытость сделает твои отношения глубже.'
WHERE sign = 'Buğa' AND period = 'monthly' AND content = 'Bu ay əsaslı təməllər qurmaq vaxtıdır — iş və ev məsələlərində möhkəm addımlar at. Sevgi həyatında isə daha açıq olmaq münasibətlərini dərinləşdirəcək.';

UPDATE public.horoscopes SET
  content_en = 'Your mind is even sharper than usual today — new ideas, conversations, and offers will excite you. But you may find it hard to focus on just one topic.',
  content_ru = 'Сегодня твой ум особенно живой — новые идеи, разговоры и предложения будут тебя радовать. Но тебе может быть трудно сосредоточиться на одной теме.'
WHERE sign = 'Əkizlər' AND period = 'daily' AND content = 'Zehnin bu gün adətən olduğundan da çevikdir — yeni fikirlər, söhbətlər və təkliflər səni həyəcanlandıracaq. Amma bir mövzuya fokuslanmaqda çətinlik çəkə bilərsən.';

UPDATE public.horoscopes SET
  content_en = 'Your communication skills take center stage this week — negotiations, interviews, or new acquaintances will go well. Wait a little before making a decision.',
  content_ru = 'На этой неделе на первый план выходят твои коммуникативные способности — переговоры, собеседования или новые знакомства пройдут удачно. Перед принятием решения немного подожди.'
WHERE sign = 'Əkizlər' AND period = 'weekly' AND content = 'Bu həftə ünsiyyət qabiliyyətin ön plana çıxır — danışıqlar, müsahibələr və ya yeni tanışlıqlar uğurlu keçəcək. Qərar verməzdən əvvəl bir az gözlə.';

UPDATE public.horoscopes SET
  content_en = 'This month is about learning and growth — you''ll take an interest in a new skill or field. Finances may be unpredictable, so keep a reserve budget.',
  content_ru = 'Этот месяц — месяц обучения и развития: ты заинтересуешься новым навыком или сферой. В финансах возможна нестабильность, поэтому держи резервный бюджет.'
WHERE sign = 'Əkizlər' AND period = 'monthly' AND content = 'Bu ay öyrənmə və inkişaf ayıdır — yeni bacarıq və ya sahəyə maraq göstərəcəksən. Maliyyədə dəyişkənlik ola bilər, ona görə ehtiyat büdcəsi saxla.';

UPDATE public.horoscopes SET
  content_en = 'Your feelings run stronger than usual today — spending time with family and loved ones will bring you comfort. Avoid making emotional decisions at work.',
  content_ru = 'Сегодня твои чувства сильнее обычного — время, проведённое с семьёй и близкими, принесёт тебе утешение. На работе избегай эмоциональных решений.'
WHERE sign = 'Xərçəng' AND period = 'daily' AND content = 'Hisslərin bu gün adətən olduğundan daha güclüdür — ailə və yaxınlarınla vaxt keçirmək sənə rahatlıq gətirəcək. İş yerində emosional qərar verməkdən çəkin.';

UPDATE public.horoscopes SET
  content_en = 'Home and family matters take center stage this week — it''s a good time to mend an old relationship. Take cautious steps in your financial planning.',
  content_ru = 'На этой неделе в центре внимания темы дома и семьи — подходящее время, чтобы наладить старые отношения. В финансовом планировании действуй осторожно.'
WHERE sign = 'Xərçəng' AND period = 'weekly' AND content = 'Bu həftə ev və ailə mövzuları diqqət mərkəzindədir — köhnə bir münasibəti düzəltmək üçün münasib zamandır. Maliyyə planında ehtiyatlı addımlar at.';

UPDATE public.horoscopes SET
  content_en = 'This month, emotional depth and intuition will guide you — make your decisions by listening to your heart. Expect quiet but steady progress in your career.',
  content_ru = 'В этом месяце эмоциональная глубина и интуиция будут твоим проводником — принимай решения, слушая своё сердце. В карьере ожидается тихий, но устойчивый прогресс.'
WHERE sign = 'Xərçəng' AND period = 'monthly' AND content = 'Bu ay emosional dərinlik və intuisiya sənə yol göstərəcək — qərarlarını ürəyinin səsinə görə ver. Karyerada sakit, amma davamlı irəliləyiş gözlənilir.';

UPDATE public.horoscopes SET
  content_en = 'You''ll be the center of attention today — your charisma and self-confidence will make an impression on those around you. Be generous, but keep your budget under control.',
  content_ru = 'Сегодня ты будешь в центре внимания — твоя харизма и уверенность в себе произведут впечатление на окружающих. Будь щедрым, но держи бюджет под контролем.'
WHERE sign = 'Aslan' AND period = 'daily' AND content = 'Bu gün diqqət mərkəzində olacaqsan — xarizman və özünəinamın ətrafındakıları təsirləndirəcək. Səxavətli ol, amma büdcəni də nəzarətdə saxla.';

UPDATE public.horoscopes SET
  content_en = 'The stars are with you this week for creative projects or presentations — don''t miss the chance to shine. In your romantic relationship, remember that praise matters.',
  content_ru = 'На этой неделе звёзды на твоей стороне в творческих проектах и презентациях — не упусти шанс проявить себя. В отношениях не забывай, что похвала важна.'
WHERE sign = 'Aslan' AND period = 'weekly' AND content = 'Bu həftə yaradıcı layihələr və ya təqdimatlar üçün ulduzlar səninlədir — özünü göstərmək fürsətini qaçırma. Cütlük münasibətlərində tərifə ehtiyac olduğunu unutma.';

UPDATE public.horoscopes SET
  content_en = 'This month is about leadership and recognition — your hard work will finally be appreciated. In love, softening your pride a little will strengthen your relationships.',
  content_ru = 'Этот месяц — месяц лидерства и признания: твой труд наконец оценят по заслугам. В любви немного смягчить гордость поможет укрепить отношения.'
WHERE sign = 'Aslan' AND period = 'monthly' AND content = 'Bu ay liderlik və tanınma ayıdır — zəhmətin nəhayət qiymətləndiriləcək. Sevgidə qürurunu bir az yumşaltmaq münasibətləri gücləndirəcək.';

UPDATE public.horoscopes SET
  content_en = 'Your attention to detail gives you a real edge today — you may catch a small mistake at work just in time. Don''t overdo it with self-criticism.',
  content_ru = 'Сегодня твоё внимание к деталям даёт тебе большое преимущество — ты можешь вовремя заметить небольшую ошибку на работе. Не переусердствуй с самокритикой.'
WHERE sign = 'Qız' AND period = 'daily' AND content = 'Təfərrüatlara diqqətin bu gün sənə böyük üstünlük verir — işdəki kiçik bir səhvi vaxtında tuta bilərsən. Özünü tənqid etməkdə ölçünü aşma.';

UPDATE public.horoscopes SET
  content_en = 'This week, your organizational skills will help you bring order to a backlog of tasks. Don''t forget to look after your health too — taking a break isn''t a weakness.',
  content_ru = 'На этой неделе благодаря своим организаторским способностям ты наведёшь порядок в накопившихся делах. Не забывай и о здоровье — отдыхать — не слабость.'
WHERE sign = 'Qız' AND period = 'weekly' AND content = 'Bu həftə təşkilatçılıq bacarığın sayəsində yığılmış işləri nizama salacaqsan. Sağlamlığına da diqqət ayırmağı unutma — fasilə vermək zəiflik deyil.';

UPDATE public.horoscopes SET
  content_en = 'This month, practicality and planning will bring you success — take concrete steps toward your long-term goals. Ease up a little on expecting perfection in relationships.',
  content_ru = 'Этот месяц принесёт тебе успех благодаря практичности и планированию — сделай конкретные шаги к долгосрочным целям. В отношениях немного отступи от ожидания совершенства.'
WHERE sign = 'Qız' AND period = 'monthly' AND content = 'Bu ay praktiklik və planlaşdırma sənə uğur gətirəcək — uzunmüddətli hədəflər üçün konkret addımlar at. Münasibətlərdə mükəmməllik gözləməkdən bir az əl çək.';

UPDATE public.horoscopes SET
  content_en = 'Your search for balance shows up in your relationships today — you may end up being the fair mediator in a dispute. Don''t let indecision waste your time.',
  content_ru = 'Сегодня твой поиск равновесия проявляется в отношениях — ты можешь стать справедливым посредником в спорном вопросе. Не позволяй нерешительности отнимать время.'
WHERE sign = 'Tərəzi' AND period = 'daily' AND content = 'Tarazlıq axtarışın bu gün münasibətlərdə özünü göstərir — mübahisəli bir məsələdə ədalətli vasitəçi ola bilərsən. Qərarsızlıq vaxt itkisinə səbəb olmasın.';

UPDATE public.horoscopes SET
  content_en = 'Partnership and collaboration take the spotlight this week — you''ll reach an agreement with someone, at work or in your personal life. Your aesthetic taste will help you in creative work.',
  content_ru = 'На этой неделе на первый план выходят темы партнёрства и сотрудничества — ты достигнешь согласия с кем-то на работе или в личной жизни. Твой эстетический вкус поможет в творческих делах.'
WHERE sign = 'Tərəzi' AND period = 'weekly' AND content = 'Bu həftə tərəfdaşlıq və əməkdaşlıq mövzuları önə çıxır — iş və ya şəxsi həyatda kiminləsə razılaşma əldə edəcəksən. Estetik zövqün yaradıcı işlərdə köməyinə çatacaq.';

UPDATE public.horoscopes SET
  content_en = 'This month is about relationships — a favorable time to build harmony in both romantic and professional connections. Partnership-based financial decisions will work in your favor.',
  content_ru = 'Этот месяц — месяц отношений: благоприятное время для построения гармонии и в романтических, и в профессиональных связях. В финансах решения, основанные на партнёрстве, окажутся полезными.'
WHERE sign = 'Tərəzi' AND period = 'monthly' AND content = 'Bu ay münasibətlər ayıdır — həm romantik, həm də peşəkar əlaqələrdə harmoniya qurmaq üçün əlverişli vaxtdır. Maliyyədə tərəfdaşlıq əsaslı qərarlar faydalı olacaq.';

UPDATE public.horoscopes SET
  content_en = 'Your ability to see beneath the surface is heightened today — something that''s been hidden may come to light. Pay attention to who you trust.',
  content_ru = 'Сегодня усиливается твоя способность видеть правду под поверхностью — может всплыть скрытый до этого вопрос. Будь внимателен к тому, кому доверяешь.'
WHERE sign = 'Əqrəb' AND period = 'daily' AND content = 'Bu gün səthin altındakı həqiqəti görmək bacarığın güclənir — gizli qalan bir məsələ üzə çıxa bilər. Kimə etibar etdiyinə diqqət et.';

UPDATE public.horoscopes SET
  content_en = 'This week you''re gathering energy for deep change — it may be time to leave an old habit or relationship behind. Keep your strategy at work to yourself.',
  content_ru = 'На этой неделе ты накапливаешь энергию для глубоких перемен — возможно, пришло время оставить в прошлом старую привычку или отношения. В рабочих вопросах держи свою стратегию в секрете.'
WHERE sign = 'Əqrəb' AND period = 'weekly' AND content = 'Bu həftə dərin dəyişikliklər üçün enerji toplayırsan — köhnə bir vərdişi və ya münasibəti arxada qoymaq vaxtı ola bilər. İş məsələlərində strategiyanı gizli saxla.';

UPDATE public.horoscopes SET
  content_en = 'This month is about transformation — a fundamental change may happen in your finances or career. In love, your passion is strong, but don''t give room to jealousy.',
  content_ru = 'Этот месяц — месяц трансформации: в финансах или карьере может произойти коренная перемена. В любви твоя страсть сильна, но не давай места ревности.'
WHERE sign = 'Əqrəb' AND period = 'monthly' AND content = 'Bu ay transformasiya ayıdır — maliyyə və ya karyerada köklü bir dəyişiklik baş verə bilər. Sevgidə ehtirasın güclüdür, amma qısqanclığa yer vermə.';

UPDATE public.horoscopes SET
  content_en = 'Your sense of adventure wants to pull you away from the usual routine today — a short trip or a new experience will lift your mood. Don''t forget to keep your promises.',
  content_ru = 'Сегодня чувство авантюризма хочет увести тебя от обычной рутины — короткая поездка или новый опыт поднимут настроение. Не забывай выполнять свои обещания.'
WHERE sign = 'Oxatan' AND period = 'daily' AND content = 'Macəra hissi bu gün səni adi gündəlikdən uzaqlaşdırmaq istəyir — qısa bir səyahət və ya yeni təcrübə əhval-ruhiyyəni qaldıracaq. Vədlərini yerinə yetirməyi unutma.';

UPDATE public.horoscopes SET
  content_en = 'Opportunities that expand your horizons may come your way this week — expect news about education, travel, or an offer from abroad. Don''t be overly optimistic about finances.',
  content_ru = 'На этой неделе тебе могут встретиться возможности, расширяющие горизонты — ожидай новостей об образовании, путешествии или предложении из-за границы. В финансах не будь чрезмерно оптимистичен.'
WHERE sign = 'Oxatan' AND period = 'weekly' AND content = 'Bu həftə üfüqlərini genişləndirən fürsətlər qarşına çıxa bilər — təhsil, səyahət və ya xaricdən təklif mövzusunda xəbər gözlə. Maliyyədə həddən artıq nikbin olma.';

UPDATE public.horoscopes SET
  content_en = 'This month is about expansion and freedom — you have the courage to step into a new field. In relationships, find the balance between keeping your independence and staying committed.',
  content_ru = 'Этот месяц — месяц расширения и свободы: у тебя есть смелость сделать шаг в новую сферу. В отношениях найди баланс между сохранением свободы и привязанностью.'
WHERE sign = 'Oxatan' AND period = 'monthly' AND content = 'Bu ay genişlənmə və azadlıq ayıdır — yeni bir sahəyə addım atmaq üçün cəsarətin var. Münasibətlərdə sərbəstliyini qorumaqla bağlılıq arasında tarazlıq tap.';

UPDATE public.horoscopes SET
  content_en = 'A sense of responsibility carries you forward today — you''ll finish the task you planned with discipline. Don''t forget to show yourself a little compassion.',
  content_ru = 'Сегодня чувство ответственности ведёт тебя вперёд — ты с дисциплиной завершишь запланированное дело. Не забывай проявлять немного сострадания к себе.'
WHERE sign = 'Oğlaq' AND period = 'daily' AND content = 'Məsuliyyət hissi bu gün səni irəli aparır — planlaşdırdığın işi intizamla başa çatdıracaqsan. Özünə bir az mərhəmət göstərməyi unutma.';

UPDATE public.horoscopes SET
  content_en = 'Your hard work pays off this week — you may catch the attention of your superiors. Make room for time with family too — work isn''t everything.',
  content_ru = 'На этой неделе твой труд приносит результат — ты можешь привлечь внимание руководства. Найди время и для семьи — работа — не всё.'
WHERE sign = 'Oğlaq' AND period = 'weekly' AND content = 'Bu həftə zəhmətin nəticə verir — rəhbərlik tərəfindən diqqət çəkə bilərsən. Ailə ilə vaxt keçirməyə də yer aç, iş hər şey deyil.';

UPDATE public.horoscopes SET
  content_en = 'This month is about career and standing — the strategy you''ve been building for a long time starts to bear fruit. Your frugal approach to finances will bring you stability.',
  content_ru = 'Этот месяц — месяц карьеры и влияния: стратегия, которую ты выстраивал долгое время, начинает приносить плоды. Бережливый подход к финансам принесёт тебе стабильность.'
WHERE sign = 'Oğlaq' AND period = 'monthly' AND content = 'Bu ay karyera və nüfuz ayıdır — uzun müddətdir qurduğun strategiya bəhrəsini verməyə başlayır. Maliyyədə qənaətcil yanaşman sənə sabitlik gətirəcək.';

UPDATE public.horoscopes SET
  content_en = 'Your original ideas will draw attention today — it''s a good time to propose a solution that breaks from the usual path. If you need your friends'' support, don''t hesitate to ask.',
  content_ru = 'Сегодня твои оригинальные идеи привлекут внимание — время предложить решение, отличное от привычного пути. Если тебе нужна поддержка друзей, не стесняйся обратиться.'
WHERE sign = 'Dolça' AND period = 'daily' AND content = 'Orijinal fikirlərin bu gün diqqət çəkəcək — adi yoldan fərqli bir həll yolu təklif etmə vaxtıdır. Dostların dəstəyinə ehtiyac duysan, çəkinmədən müraciət et.';

UPDATE public.horoscopes SET
  content_en = 'Your social circle expands this week — new acquaintances or community projects will inspire you. In financial matters, you''ll find an unusual but workable solution.',
  content_ru = 'На этой неделе твой круг общения расширяется — новые знакомства или общественные проекты вдохновят тебя. В финансовых вопросах ты найдёшь необычный, но рабочий путь.'
WHERE sign = 'Dolça' AND period = 'weekly' AND content = 'Bu həftə sosial çevrən genişlənir — yeni tanışlıqlar və ya icma layihələri sənə ilham verəcək. Maliyyə məsələlərində qeyri-adi, amma işə yarayan bir yol tapacaqsan.';

UPDATE public.horoscopes SET
  content_en = 'This month is about innovation and independence — your urge to step outside traditional rules and follow your own path grows stronger. If you need distance in a relationship, explain it openly.',
  content_ru = 'Этот месяц — месяц новаторства и независимости: усиливается желание выйти за рамки традиционных правил и идти своим путём. Если в отношениях нужна дистанция, объясни это открыто.'
WHERE sign = 'Dolça' AND period = 'monthly' AND content = 'Bu ay yenilik və müstəqillik ayıdır — ənənəvi qaydalardan kənara çıxıb öz yolunu getmək istəyin güclənir. Münasibətlərdə məsafəyə ehtiyac duysan, bunu açıq izah et.';

UPDATE public.horoscopes SET
  content_en = 'Your sensitivity today lets you sense what others leave unsaid — put that gift to use in your creative work. Rather than escaping reality, face it.',
  content_ru = 'Сегодня твоя чувствительность позволяет улавливать то, что другие не говорят вслух — используй эту способность в творческой работе. Вместо того чтобы убегать от реальности, посмотри ей в лицо.'
WHERE sign = 'Balıqlar' AND period = 'daily' AND content = 'Həssaslığın bu gün sənə başqalarının demədiyini hiss etmək imkanı verir — bu bacarığı yaradıcı işində istifadə et. Reallıqdan qaçmaqdansa, üzləş.';

UPDATE public.horoscopes SET
  content_en = 'Your imagination and intuition are strong this week — if you give time to art, music, or writing, you''ll get beautiful results. In money matters, stick to the real numbers.',
  content_ru = 'На этой неделе твоё воображение и интуиция сильны — если уделишь время искусству, музыке или писательству, получишь прекрасные результаты. В денежных вопросах держись реальных цифр.'
WHERE sign = 'Balıqlar' AND period = 'weekly' AND content = 'Bu həftə xəyal gücün və intuisiyan güclüdür — sənət, musiqi və ya yazıya vaxt ayırsan, gözəl nəticələr alacaqsan. Pul məsələlərində real rəqəmlərə sadiq qal.';

UPDATE public.horoscopes SET
  content_en = 'This month is about spiritual and creative growth — listening to your inner voice will show you the right direction. It''s a favorable time to build a deep bond in love.',
  content_ru = 'Этот месяц — месяц духовного и творческого роста: умение слушать свой внутренний голос покажет тебе верное направление. Это благоприятное время для построения глубокой связи в любви.'
WHERE sign = 'Balıqlar' AND period = 'monthly' AND content = 'Bu ay ruhani və yaradıcı inkişaf ayıdır — daxili səsini dinləmək sənə doğru istiqaməti göstərəcək. Sevgidə dərin bir bağlılıq qurmaq üçün əlverişli zamandır.';
