-- Məqalə bölməsi: tərcüməsiz qalan 3 məqalə tamamlanır + 12 yeni orijinal
-- məqalə (AZ+EN+RU) əlavə olunur. Forum bölməsinə 6 yeni EN/RU sual-cavab
-- mövzusu + cavabları əlavə olunur (mövcud 18 AZ mövzuya əlavə, onları
-- toxunmadan). Hamısı idempotent: UPDATE sabit slug üzrə, INSERT-lər
-- ON CONFLICT DO NOTHING ilə.

-- 1) 3 mövcud məqalənin tərcüməsi tamamlanır (idempotent, slug üzrə)
UPDATE public.articles SET
  title_en = 'How to Make Decisions During Mercury Retrograde',
  title_ru = 'Как принимать решения во время Меркурия в ретрограде',
  excerpt_en = 'Planets that appear to move backward are inviting us to slow down.',
  excerpt_ru = 'Планеты, которые движутся словно назад, зовут нас притормозить.',
  body_en = 'Mercury retrograde happens three to four times a year and lasts about three weeks each time.

During this period, confusion tends to rise around communication, paperwork, and travel. By astrological tradition, it''s not the ideal time to sign new contracts, buy new technology, or lock in major decisions.

Instead, it''s a powerful window for looking back — finishing unfinished business, reconnecting with old contacts, and revisiting plans. Retrograde isn''t a call to stop; it''s a call to slow down.',
  body_ru = 'Ретроградный Меркурий случается три-четыре раза в год и лится около трёх недель.

В этот период растёт путаница в общении, документах и поездках. По астрологической традиции, это не лучшее время подписывать новые контракты, покупать технику или принимать окончательные важные решения.

Зато это мощное окно для взгляда назад — завершить незаконченные дела, восстановить связи и пересмотреть планы. Ретроград зовёт не остановиться, а притормозить.'
WHERE slug = 'merkuri-retroqrad';

UPDATE public.articles SET
  title_en = 'How the Full Moon Affects Each Zodiac Sign',
  title_ru = 'Как полная луна влияет на знаки зодиака',
  excerpt_en = 'Emotions run stronger during the full moon.',
  excerpt_ru = 'Во время полнолуния чувства становятся острее.',
  body_en = 'The full moon is the moment the Sun and Moon stand opposite each other. That opposition brings inner tension to the surface.

Each full moon falls in a particular sign and lights up that sign''s themes. A full moon in Aries stirs courage and independence, while one in Libra brings balance in relationships into focus.

Full moon days are well suited for meditation, journaling, and letting-go practices.',
  body_ru = 'Полнолуние — момент, когда Солнце и Луна стоят друг против друга. Это противостояние выводит внутреннее напряжение на поверхность.

Каждое полнолуние происходит в определённом знаке и освещает его темы. Полнолуние в Овне пробуждает смелость и независимость, а полнолуние в Весах поднимает тему равновесия в отношениях.

Дни полнолуния хорошо подходят для медитации, ведения дневника и практик отпускания.'
WHERE slug = 'dolunay-tesiri';

UPDATE public.articles SET
  title_en = 'What the 12 Houses in Your Birth Chart Mean',
  title_ru = 'Что означают 12 домов в натальной карте',
  excerpt_en = 'Each house points to one area of your life.',
  excerpt_ru = 'Каждый дом отражает одну из сфер вашей жизни.',
  body_en = 'The birth chart is divided into 12 houses, and each one represents a specific area of life.

1st house — identity and appearance. 2nd house — material resources. 3rd house — communication. 4th house — home and roots. 5th house — creativity and romance. 6th house — daily work and health.

7th house — partnership. 8th house — transformation. 9th house — philosophy and travel. 10th house — career. 11th house — friendship. 12th house — the spiritual realm.',
  body_ru = 'Натальная карта делится на 12 домов, и каждый представляет конкретную сферу жизни.

1-й дом — личность и внешность. 2-й дом — материальные ресурсы. 3-й дом — общение. 4-й дом — дом и корни. 5-й дом — творчество и любовь. 6-й дом — повседневная работа и здоровье.

7-й дом — партнёрство. 8-й дом — трансформация. 9-й дом — философия и путешествия. 10-й дом — карьера. 11-й дом — дружба. 12-й дом — духовная сфера.'
WHERE slug = '12-ev';

-- 2) 12 yeni orijinal məqalə (AZ+EN+RU), idempotent: slug üzrə ON CONFLICT DO NOTHING
INSERT INTO public.articles
  (title, slug, excerpt, body, tag, published, published_at,
   title_en, title_ru, excerpt_en, excerpt_ru, body_en, body_ru)
VALUES
  ('Kiron: yaralı şəfaçı arxetipi', 'kiron-yarali-shefaci', 'Kiron ən dərin yarandığımız yer, həm də başqalarına şəfa vermə qabiliyyətimizin mənbəyidir.', 'Kiron Saturn ilə Uran arasında dövr edən kiçik bir göy cismidir və astrologiyada ''yaralı şəfaçı'' adlanır. Onun xəritədəki mövqeyi, ən erkən və ən dərin yaranan həssaslığımızı göstərir — adətən uşaqlıqda formalaşan, həyat boyu yenidən üzə çıxan bir mövzu.

Kironun bürcü və evi, bu yaranın harada daha çox hiss olunduğunu göstərir. Məsələn, 7-ci evdə Kiron münasibətlərdə etibar məsələləri ilə bağlı ola bilər, 10-cu evdə isə karyerada görünməmə və ya qiymətləndirilməmə hissi ilə.

Paradoks burasındadır ki, məhz bu həssas nöqtə zamanla ən böyük güc mənbəyinə çevrilə bilər. Öz yarasını tanıyan insan, çox vaxt başqalarına şəfa vermək qabiliyyəti ilə seçilir — buna görə də Kiron tez-tez həkimlərin, terapevtlərin və müəllimlərin xəritəsində önəmli mövqedə olur.', 'Xəritə', true, now() - interval '0 days', 'Chiron: the wounded healer archetype', 'Хирон: архетип раненого целителя', 'Chiron marks our earliest, deepest wound — and often the root of our ability to heal others.', 'Хирон отмечает нашу самую раннюю и глубокую рану — и часто становится источником способности исцелять других.', 'Chiron is a small body orbiting between Saturn and Uranus, known in astrology as the ''wounded healer.'' Its placement in the chart points to our earliest and deepest sensitivity — usually something shaped in childhood that keeps resurfacing throughout life.

Chiron''s sign and house show where that wound tends to be felt most. In the 7th house, for instance, it can show up as trust issues in relationships; in the 10th house, as a feeling of being overlooked or unappreciated in one''s career.

The paradox is that this tender point can become, over time, a real source of strength. Someone who has come to know their own wound often develops a real capacity to help others heal — which is why Chiron so often sits prominently in the charts of doctors, therapists, and teachers.', 'Хирон — небольшое небесное тело, движущееся по орбите между Сатурном и Ураном, в астрологии известное как ''раненый целитель''. Его положение в карте указывает на самую раннюю и глубокую чувствительную точку — обычно сформированную в детстве и всплывающую снова на протяжении жизни.

Знак и дом Хирона показывают, где эта рана ощущается сильнее всего. Например, в 7-м доме это может проявляться как проблемы с доверием в отношениях, а в 10-м — как ощущение незамеченности или недооценённости в карьере.

Парадокс в том, что именно эта чувствительная точка со временем может стать источником настоящей силы. Человек, узнавший свою рану, часто обретает способность помогать исцеляться другим — поэтому Хирон нередко занимает заметное место в картах врачей, терапевтов и учителей.'),
  ('Zenit (MC): karyera və ictimai imic xəritəsi', 'mc-zenit-peshe-nufuz', 'Zenit nöqtəsi dünyaya hansı sifətlə tanındığını göstərir.', 'Natal xəritənin ən yuxarı nöqtəsi Zenit (Midheaven, MC) adlanır və doğum anında səma xəritəsinin ən yüksək hissəsini göstərir. Bu nöqtə karyera istiqamətini, ictimai nüfuzu və insanların səni ilk növbədə necə tanıdığını əks etdirir.

Zenitin bürcü, hansı sahədə öz izini qoymaq istədiyini göstərə bilər. Oğlaq Zenit struktur və nüfuz axtarır, Dolça Zenit isə yenilik və icma işləri ilə tanınmaq istəyir. Zenitə yaxın planetlər də ictimai imicə güclü təsir göstərir.

Zenit təkcə ''hansı iş'' sualına cavab vermir — o, daha geniş mənada, dünyaya hansı töhfəni vermək istədiyini göstərir. Buna görə də karyera seçimində çətinlik çəkənlər üçün Zenit araştırmaya başlamaq üçün yaxşı nöqtədir.', 'Xəritə', true, now() - interval '1 days', 'The Midheaven (MC): your career and public image', 'Зенит (MC): карьера и публичный образ', 'The Midheaven shows the face you''re known by in the world.', 'Зенит показывает, каким лицом тебя узнаёт мир.', 'The highest point of the birth chart is called the Midheaven (MC), marking the top of the sky map at the moment of birth. It reflects career direction, public standing, and how people tend to recognize you first.

The Midheaven''s sign can point to the area where you''re drawn to make your mark. A Capricorn MC tends to seek structure and authority, while an Aquarius MC often wants to be known for innovation and community work. Planets near the Midheaven also shape public image strongly.

The Midheaven doesn''t just answer ''what job'' — in a broader sense, it shows what contribution you want to make to the world. That makes it a good starting point for anyone struggling with career direction.', 'Самая высокая точка натальной карты называется Зенитом (Midheaven, MC) и отмечает верхнюю часть карты неба в момент рождения. Она отражает направление карьеры, общественное положение и то, каким человека узнают первым делом.

Знак Зенита может подсказать, в какой сфере человек стремится оставить свой след. Зенит в Козероге тянется к структуре и авторитету, а Зенит в Водолее — к новаторству и работе на благо сообщества. Планеты рядом с Зенитом также сильно влияют на публичный образ.

Зенит не отвечает только на вопрос ''какая профессия'' — в более широком смысле он показывает, какой вклад человек хочет внести в мир. Поэтому тем, кто испытывает трудности с выбором карьеры, стоит начать именно с изучения своего Зенита.'),
  ('Yupiter tranziti: genişlənmə zamanı', 'yupiter-tranziti-genislenme', 'Yupiter keçdiyi hər evdə böyümə və imkan qapıları açır.', 'Yupiter bürcdən bürcə təxminən 12 ildə bir dövr edir və hər bürcdə bir il qədər qalır. Bu, onun xəritənin hər evini təxminən bir il ərzində ''ziyarət etdiyi'' deməkdir — və həmin dövrdə o sahədə genişlənmə, inkişaf və yeni imkanlar güclənir.

Yupiter 2-ci evdən keçərkən maliyyə imkanları, 9-cu evdən keçərkən təhsil və səyahət, 11-ci evdən keçərkən isə sosial şəbəkə və icma bağları güclənə bilər. Təbii ki, Yupiter həmişə asanlıqla gəlməyən, bəzən həddindən artıqlıqla müşayiət olunan böyümə də gətirə bilər.

Yupiter tranziti zamanı ən yaxşı strategiya, açılan qapılardan məqsədyönlü istifadə etməkdir — çünki bu geniş enerji pəncərəsi həmişə açıq qalmır, təxminən bir ildən sonra Yupiter növbəti bürcə keçir və fokus dəyişir.', 'Tranzit', true, now() - interval '2 days', 'Jupiter transits: a season of expansion', 'Транзит Юпитера: сезон расширения', 'Wherever Jupiter is moving through, doors to growth and opportunity tend to open.', 'Там, где движется Юпитер, обычно открываются двери к росту и возможностям.', 'Jupiter takes about 12 years to orbit the Sun, spending roughly a year in each sign. That means it ''visits'' each house of the chart for about a year at a time — and during that stretch, growth, opportunity, and expansion in that area of life tend to pick up.

Jupiter moving through the 2nd house can bring financial opportunity, through the 9th house can bring education and travel, and through the 11th house can strengthen social networks and community ties. Of course, Jupiter''s growth doesn''t always arrive easily — it can also come with overextension or excess.

The best strategy during a Jupiter transit is to make deliberate use of the doors that open, since this expansive window doesn''t stay open forever — after roughly a year, Jupiter moves into the next sign and the focus shifts.', 'Юпитер совершает полный оборот примерно за 12 лет, проводя около года в каждом знаке. Это значит, что он ''посещает'' каждый дом карты примерно на год — и в это время рост, возможности и расширение в соответствующей сфере жизни усиливаются.

Юпитер во 2-м доме может принести финансовые возможности, в 9-м — образование и путешествия, а в 11-м — укрепление социальных связей и сообщества. Конечно, рост Юпитера не всегда приходит легко — он может сопровождаться и избыточностью, перегибом.

Лучшая стратегия во время транзита Юпитера — осознанно использовать открывающиеся двери, ведь это окно расширения не остаётся открытым навсегда: примерно через год Юпитер переходит в следующий знак, и фокус смещается.'),
  ('Lilit (Qara Ay): kölgədəki güc', 'lilit-qara-ay-kolge-guc', 'Lilit bizim bəyənilməyən, lakin əsl gücümüzün gizləndiyi tərəfimizi göstərir.', 'Lilit, real göy cismi deyil — Ayın orbitindəki ən uzaq nöqtədir və astrologiyada ''Qara Ay'' adlanır. O, cəmiyyət tərəfindən qəbul edilməsi çətin olan, bəzən ''yaraşmaz'' sayılan, lakin çox güclü instinktləri və istəkləri simvolizə edir.

Lilitin bürcü, haradan ''utanmaq'' öyrədildiyimizi göstərə bilər — məsələn Əkizlər Lilit birbaşa, kəskin danışmaqdan çəkinməyi, Buğa Lilit isə öz dəyərini açıq şəkildə tələb etməkdən qorxmağı göstərə bilər.

Lilitlə işləmək, bu basdırılmış enerjini tanımaq və qəbul etməkdir. Kölgədə saxlanılan bu güc, üzə çıxanda çox vaxt ən həqiqi, ən sərbəst tərəfimizə çevrilir — buna görə də Lilit ''qaranlıq'' deyil, daha çox ''görünməyən güc'' kimi başa düşülməlidir.', 'Xəritə', true, now() - interval '3 days', 'Lilith (the Dark/Black Moon): power in the shadow', 'Лилит (Чёрная Луна): сила в тени', 'Lilith points to the part of us we were taught to hide — and where our real power often hides with it.', 'Лилит указывает на ту часть нас, которую нас учили прятать — и где часто скрывается наша настоящая сила.', 'Lilith isn''t a physical body — it''s the furthest point in the Moon''s orbit, known in astrology as the ''Black Moon.'' It symbolizes instincts and desires that are hard for society to accept, sometimes labeled ''inappropriate,'' yet often genuinely powerful.

Lilith''s sign can show where we were taught to feel ashamed. A Gemini Lilith, for example, might point to being discouraged from speaking bluntly, while a Taurus Lilith might point to fear of openly claiming one''s own worth.

Working with Lilith means recognizing and accepting this suppressed energy. Once it''s brought into the light, this shadow-held power often becomes the most authentic, most liberated part of us — which is why Lilith is better understood not as ''darkness,'' but as a kind of hidden strength.', 'Лилит — это не физическое тело, а самая дальняя точка орбиты Луны, известная в астрологии как ''Чёрная Луна''. Она символизирует инстинкты и желания, которые общество принимает с трудом, иногда считая их ''неподобающими'', хотя на деле они бывают по-настоящему сильными.

Знак Лилит может показать, где нас учили стыдиться. Например, Лилит в Близнецах может указывать на то, что человека отучали говорить прямо и резко, а Лилит в Тельце — на страх открыто заявлять о своей ценности.

Работа с Лилит — это узнавание и принятие этой подавленной энергии. Выведенная на свет, эта хранимая в тени сила часто становится самой подлинной, самой свободной частью нас — поэтому Лилит правильнее понимать не как ''темноту'', а как своего рода скрытую силу.'),
  ('8-ci ev: yaxınlıq, dəyişim və paylaşılan resurslar', '8-ci-ev-yaxinlik-deyishim', '8-ci ev səthin altındakı, dərin və çevrilmə gətirən mövzuları idarə edir.', '8-ci ev natal xəritənin ən dərin və tez-tez ən az başa düşülən sahələrindən biridir. O, yalnız ölüm və gizli sirlərlə bağlı deyil — gündəlik həyatda daha çox dərin emosional yaxınlıq, cinsəllik, paylaşılan maliyyə resursları (irs, kredit, ortaq əmlak) və şəxsi transformasiya ilə əlaqəlidir.

8-ci evdə planetlər olan insanlar üçün münasibətlər adətən səthi qala bilmir — onlar dərin etibar, zəiflik və bəzən intensiv emosional təcrübələr axtarır. Bu ev həm də ''buraxma'' mövzusunu idarə edir: köhnə vərdişlərdən, münasibətlərdən və ya kimliklərdən əl çəkmək.

8-ci evin boş olması, bu mövzuların həyatda daha az önə çıxdığı demək deyil — sadəcə bu sahədə daha az ''planet enerjisi'' cəmləşdiyini göstərir. Evin hökmdar planetinə baxmaq, bu sahəni daha dərindən anlamaq üçün faydalıdır.', 'Xəritə', true, now() - interval '4 days', 'The 8th house: intimacy, transformation, and shared resources', '8-й дом: близость, трансформация и общие ресурсы', 'The 8th house governs the deep, below-the-surface themes that bring real transformation.', '8-й дом управляет глубинными, скрытыми темами, которые приносят настоящую трансформацию.', 'The 8th house is one of the deepest and most often misunderstood areas of the birth chart. It isn''t only about death and hidden secrets — in everyday life, it''s more connected to deep emotional intimacy, sexuality, shared financial resources (inheritance, debt, joint property), and personal transformation.

For people with planets in the 8th house, relationships rarely stay surface-level — they tend to seek deep trust, vulnerability, and sometimes intense emotional experiences. This house also governs letting go: releasing old habits, relationships, or identities.

An empty 8th house doesn''t mean these themes play a smaller role in life — it simply means less planetary energy is concentrated there. Looking at the house''s ruling planet is a useful way to understand this area more deeply.', '8-й дом — одна из самых глубоких и часто наименее понятых областей натальной карты. Он не только про смерть и тайны — в повседневной жизни он больше связан с глубокой эмоциональной близостью, сексуальностью, общими финансовыми ресурсами (наследство, долги, совместное имущество) и личной трансформацией.

У людей с планетами в 8-м доме отношения редко остаются поверхностными — они склонны искать глубокое доверие, уязвимость и иногда довольно интенсивные эмоциональные переживания. Этот дом также управляет темой отпускания: старых привычек, отношений или идентичностей.

Пустой 8-й дом не означает, что эти темы играют меньшую роль в жизни — это просто показывает, что в этой сфере сосредоточено меньше планетарной энергии. Чтобы глубже понять эту область, полезно посмотреть на управляющую домом планету.'),
  ('Stellium nədir? Bir bürcdə toplaşan planetlər', 'stellium-nedir-planet-toplusu', 'Üç və ya daha çox planetin bir yerdə cəmləşməsi, xəritədə güclü bir fokus nöqtəsi yaradır.', 'Stellium, natal xəritədə eyni bürcdə (və ya eyni evdə) üç və ya daha çox planetin toplaşması deməkdir. Bu konsentrasiya, o bürcün (və ya evin) mövzularını xəritədə digərlərindən daha da güclü edir.

Məsələn, Əqrəbdə stellium olan insan üçün intensivlik, dərinlik və nəzarət mövzuları həyatın demək olar hər sahəsində önə çıxa bilər. 10-cu evdə stellium olan insan isə karyera və ictimai nüfuzu demək olar ki, hər şeydən üstün tutur.

Stellium gücün cəmləşdiyi yer olduğu üçün, həm böyük potensial, həm də müəyyən bir birtərəflilik riski daşıyır. Xəritənin digər hissələrinə — xüsusən əks tərəfdəki boş sahələrə — diqqət yetirmək, balansı tapmaq üçün faydalıdır.', 'Xəritə', true, now() - interval '5 days', 'What is a stellium? When planets cluster together', 'Что такое стеллиум? Когда планеты скапливаются вместе', 'Three or more planets gathered in one place creates a powerful point of focus in the chart.', 'Три или больше планет, собранных в одном месте, создают мощную точку фокуса в карте.', 'A stellium is when three or more planets cluster in the same sign (or the same house) of the natal chart. That concentration makes the themes of that sign — or house — stand out far more strongly than the rest of the chart.

Someone with a stellium in Scorpio, for instance, might find intensity, depth, and control showing up in nearly every area of life. Someone with a stellium in the 10th house, meanwhile, tends to put career and public standing above almost everything else.

Because a stellium is where power concentrates, it carries both real potential and a certain risk of one-sidedness. Paying attention to the rest of the chart — especially the emptier areas on the opposite side — is useful for finding balance.', 'Стеллиум — это скопление трёх или более планет в одном знаке (или одном доме) натальной карты. Такая концентрация делает темы этого знака или дома значительно сильнее выраженными, чем остальная часть карты.

Например, у человека со стеллиумом в Скорпионе интенсивность, глубина и контроль могут проявляться почти во всех сферах жизни. А у человека со стеллиумом в 10-м доме карьера и общественное положение почти всегда выходят на первый план.

Поскольку стеллиум — это место концентрации силы, он несёт в себе как большой потенциал, так и определённый риск однобокости. Чтобы найти баланс, полезно обращать внимание на остальную часть карты — особенно на более пустые области с противоположной стороны.'),
  ('Retroqrad mövsümü: təkcə Merkuri deyil', 'retroqrad-movsumu-butun-planetler', 'Hər planetin öz retroqrad dövrü və öz dərsi var.', 'Merkuri retroqradı ən tanınmış olsa da, demək olar ki, bütün planetlər (Günəş və Ay istisna olmaqla) müəyyən dövrlərlə retroqrad görünür. Hər birinin öz müddəti və öz tematikası var.

Venera retroqradı (təxminən 18 ayda bir, 6 həftə) sevgi və dəyərləri yenidən nəzərdən keçirməyə çağırır. Mars retroqradı (təxminən 2 ildə bir, 2 ay) enerji və hərəkətlə bağlı məsələləri yavaşladır. Yupiter və Saturn kimi uzaq planetlərin retroqradı isə hər il bir neçə ay davam edir və daha uzunmüddətli, strukturla bağlı dərslər gətirir.

Bütün retroqrad dövrlərinin ortaq cəhəti budur: irəli hərəkət deyil, geriyə baxış vaxtıdır. Hansı planet retroqraddadırsa, onun idarə etdiyi sahədə yenidən qiymətləndirmə, düzəliş və tamamlama üçün fürsət yaranır.', 'Tranzit', true, now() - interval '6 days', 'Retrograde season: it''s not just Mercury', 'Сезон ретроградов: не только Меркурий', 'Every planet has its own retrograde cycle — and its own lesson to offer.', 'У каждой планеты свой ретроградный цикл — и свой урок.', 'Mercury retrograde gets the most attention, but almost every planet (aside from the Sun and Moon) appears to move backward at certain points. Each one has its own duration and its own theme.

Venus retrograde (roughly every 18 months, lasting about 6 weeks) calls for reassessing love and values. Mars retrograde (roughly every 2 years, lasting about 2 months) slows down matters related to energy and action. The retrogrades of farther planets like Jupiter and Saturn last several months each year and bring longer, more structural lessons.

What all retrograde periods share is this: it''s a time for looking back, not pushing forward. Whichever planet is retrograde, the area it governs opens up for reassessment, correction, and completion.', 'Ретроградный Меркурий привлекает больше всего внимания, но практически каждая планета (кроме Солнца и Луны) в определённые периоды кажется движущейся назад. У каждой — своя продолжительность и своя тема.

Ретроградная Венера (примерно раз в 18 месяцев, длится около 6 недель) призывает пересмотреть любовь и ценности. Ретроградный Марс (примерно раз в 2 года, длится около 2 месяцев) замедляет темы энергии и действия. Ретроградность более далёких планет, таких как Юпитер и Сатурн, длится несколько месяцев каждый год и приносит более долгосрочные, структурные уроки.

Общее для всех ретроградных периодов — это время не для движения вперёд, а для взгляда назад. Какая бы планета ни была ретроградной, в управляемой ею сфере открывается возможность для переоценки, исправления и завершения.'),
  ('Xəritədə element çatışmazlığı nə deməkdir?', 'element-chatishmazligi-xaritede', 'Dörd elementdən birinin az olması, çox olması qədər vacib məlumat verir.', 'Natal xəritədəki 10 əsas planet dörd element arasında (Od, Torpaq, Hava, Su) bölüşdürülür. Bəzən bir xəritədə bir element çox üstündür, bəzənsə demək olar ki, heç yoxdur — bu, ''element çatışmazlığı'' adlanır.

Su çatışmazlığı olan insan emosiyaları tanımaqda, onları ifadə etməkdə çətinlik çəkə bilər, lakin bu heç nə hiss etməmək demək deyil — sadəcə bu dili təbii öyrənməyib. Torpaq çatışmazlığı isə praktik məsələlərdə (pul, gündəlik rutina) çətinlik yarada bilər, baxmayaraq ki şəxs başqa sahələrdə çox bacarıqlı ola bilər.

Çatışmazlıq bir çatışmazlıq kimi görünsə də, əslində bu, şüurlu inkişaf üçün bir istiqamətdir. Çatışan elementin keyfiyyətlərini bilərəkdən həyata gətirmək — məsələn Su çatışmazlığı olan üçün bilərəkdən emosional əlaqələrə vaxt ayırmaq — balansı bərpa etməyə kömək edir.', 'Bürclər', true, now() - interval '7 days', 'What does an elemental imbalance in your chart mean?', 'Что значит дисбаланс элементов в карте?', 'Having too little of one element says just as much as having too much.', 'Нехватка одного элемента говорит не меньше, чем его избыток.', 'The 10 main planets in a natal chart are distributed across four elements — Fire, Earth, Air, and Water. Sometimes one element dominates a chart, and sometimes it''s almost entirely missing — this is called an elemental imbalance.

Someone with little Water might struggle to recognize or express emotion, though that doesn''t mean they feel nothing — they simply never learned that language naturally. A lack of Earth can create difficulty with practical matters like money or daily routine, even if the person is quite skilled in other areas.

While it looks like a deficiency, it''s really a direction for conscious growth. Deliberately bringing in the missing element''s qualities — for example, someone low on Water making a point of setting aside time for emotional connection — helps restore the balance.', '10 основных планет натальной карты распределены между четырьмя элементами — Огонь, Земля, Воздух и Вода. Иногда один элемент сильно преобладает в карте, а иногда его почти совсем нет — это называется дисбалансом элементов.

Человеку с малым количеством Воды может быть трудно распознавать и выражать эмоции, но это не значит, что он ничего не чувствует — он просто не научился этому языку естественным образом. Недостаток Земли может создавать сложности с практическими вопросами — деньгами, повседневной рутиной, — даже если человек весьма способен в других сферах.

Хотя это выглядит как нехватка, на самом деле это направление для осознанного роста. Намеренное развитие качеств недостающего элемента — например, человек с малой Водой, который сознательно уделяет время эмоциональной близости, — помогает восстановить баланс.'),
  ('Fortuna nöqtəsi: xəritədəki gizli şans', 'fortuna-noqtesi-gizli-shans', 'Fortuna nöqtəsi, təbii axının və asanlığın harada tapıla biləcəyini göstərir.', 'Fortuna nöqtəsi (Part of Fortune) real planet deyil, Günəş, Ay və Yüksələnin mövqelərindən riyazi yolla hesablanan bir nöqtədir. Ənənəvi astrologiyada o, ''şans'' və ya təbii uğurun harada daha asan tapılacağını göstərən simvolik nöqtə sayılır.

Fortuna nöqtəsinin olduğu ev, insanın az səylə, daha təbii şəkildə müsbət nəticələr əldə etdiyi sahəni göstərə bilər. Məsələn, 5-ci evdə Fortuna yaradıcılıq və özünüifadədə, 10-cu evdə isə karyerada təbii bir ''axın'' hissi gətirə bilər.

Fortuna nöqtəsi ''hər şey asan olacaq'' demək deyil — daha doğrusu, o, harada daha az müqavimətlə irəli getmək mümkün olduğunu göstərən bir işarədir. Çətin dövrlərdə bu sahəyə qayıtmaq, bəzən itirilən tarazlığı tapmağa kömək edir.', 'Xəritə', true, now() - interval '8 days', 'The Part of Fortune: a hidden sweet spot in the chart', 'Точка Фортуны: скрытое удачное место в карте', 'The Part of Fortune points to where natural flow and ease are easiest to find.', 'Точка Фортуны показывает, где легче найти естественный поток и лёгкость.', 'The Part of Fortune isn''t a real planet — it''s a mathematically calculated point derived from the positions of the Sun, Moon, and Ascendant. In traditional astrology, it''s treated as a symbolic marker of where luck, or natural success, tends to be easier to find.

The house that holds the Part of Fortune can point to an area where a person achieves positive outcomes with less effort, more naturally. In the 5th house, for example, it might bring a sense of flow in creativity and self-expression; in the 10th house, in career.

The Part of Fortune doesn''t mean ''everything will be easy'' — it''s more a signpost for where less resistance tends to be found along the way. Returning to this area during harder periods can sometimes help restore a sense of balance that''s been lost.', 'Точка Фортуны — не настоящая планета, а математически рассчитанная точка, выведенная из положений Солнца, Луны и Асцендента. В традиционной астрологии она считается символическим указателем того, где удачу или естественный успех найти легче.

Дом, в котором находится Точка Фортуны, может показывать сферу, где человек достигает положительных результатов с меньшими усилиями, более естественно. В 5-м доме, например, это может давать ощущение потока в творчестве и самовыражении, а в 10-м — в карьере.

Точка Фортуны не означает, что ''всё будет легко'' — это скорее указатель того, где по пути встречается меньше сопротивления. Возвращение к этой сфере в трудные периоды иногда помогает восстановить утраченное равновесие.'),
  ('Kompozit xəritə və sinastriya: fərq nədir?', 'kompozit-xerite-sinastriya-ferqi', 'Sinastriya iki fərdi müqayisə edir, kompozit isə münasibəti öz başına bir ''varlıq'' kimi göstərir.', 'Sinastriya və kompozit xəritə, cütlərin uyğunluğunu araştırmaq üçün istifadə olunan iki fərqli, lakin tamamlayıcı üsuldur. Sinastriya iki natal xəritəni üst-üstə qoyaraq, hər bir tərəfin planetlərinin digərinə necə təsir etdiyini göstərir.

Kompozit xəritə isə fərqli bir yanaşmadır: iki xəritənin orta nöqtələri hesablanaraq, münasibətin özünə aid, üçüncü, müstəqil bir xəritə yaradılır. Bu xəritə, ''mən'' və ''sən'' deyil, məhz ''biz'' — münasibətin özünün — xarakterini, məqsədini və çətinliklərini göstərir.

Sinastriya ''biz bir-birimizə necə təsir edirik'' sualına, kompozit isə ''bu münasibət öz başına nədir, hara gedir'' sualına cavab axtarır. Hər iki üsulu birlikdə istifadə etmək, münasibətin daha dolğun mənzərəsini verir.', 'Sinastriya', true, now() - interval '9 days', 'Composite chart vs. synastry: what''s the difference?', 'Композитная карта и синастрия: в чём разница?', 'Synastry compares two individuals; a composite chart shows the relationship itself as its own entity.', 'Синастрия сравнивает двух людей, а композитная карта показывает сами отношения как отдельную сущность.', 'Synastry and the composite chart are two different, complementary techniques used to study compatibility between two people. Synastry overlays two natal charts to show how each person''s planets affect the other.

A composite chart takes a different approach: the midpoints between the two charts are calculated to create a third, independent chart that belongs to the relationship itself. This chart shows the character, purpose, and challenges of ''we'' — the relationship itself — rather than ''me'' or ''you.''

Synastry asks ''how do we affect each other,'' while the composite chart asks ''what is this relationship on its own, and where is it heading.'' Using both techniques together gives a fuller picture of the relationship.', 'Синастрия и композитная карта — два разных, но взаимодополняющих метода изучения совместимости между двумя людьми. Синастрия накладывает две натальные карты друг на друга, показывая, как планеты каждого влияют на другого.

Композитная карта использует другой подход: вычисляются средние точки между двумя картами, и создаётся третья, самостоятельная карта, принадлежащая самим отношениям. Эта карта показывает характер, цель и трудности именно ''нас'' — самих отношений, — а не ''меня'' или ''тебя''.

Синастрия отвечает на вопрос ''как мы влияем друг на друга'', а композитная карта — на вопрос ''что представляют собой эти отношения сами по себе и куда они движутся''. Использование обоих методов вместе даёт более полную картину отношений.'),
  ('Saturn evlərdə: intizam hansı sahəyə gəlir?', 'saturn-evlerde-intizam', 'Saturnun tranzit etdiyi ev, məhz o sahədə struktur qurmağı tələb edir.', 'Saturn bir bürcdə təxminən 2.5 il qalır və xəritənin hər evini öz növbəsi ilə ziyarət edir. Hansı evdən keçirsə, o sahədə məsuliyyət, struktur və çox zaman çətin, lakin faydalı dərslər gətirir.

Saturn 7-ci evdən keçərkən münasibətlərdə ciddiləşmə və öhdəlik mövzuları, 6-cı evdən keçərkən iş rejimi və sağlamlıqla bağlı intizam, 4-cü evdən keçərkən isə ailə və ev məsələlərində məsuliyyət önə çıxa bilər.

Saturn tranziti çox vaxt məhdudiyyət kimi hiss olunur, amma əslində o, uzunmüddətli nəticə üçün möhkəm təməl qurmağa çağırır. Bu dövrdə qısamüddətli asanlıq axtarmaq əvəzinə, səbirlə struktur qurmaq, gələcəkdə daha sabit nəticələr verir.', 'Tranzit', true, now() - interval '10 days', 'Saturn by house: where discipline is being asked for', 'Сатурн по домам: где требуется дисциплина', 'Whichever house Saturn is transiting calls for building real structure in that area.', 'В каком бы доме ни проходил транзит Сатурна, он требует выстроить там настоящую структуру.', 'Saturn spends about 2.5 years in each sign, visiting each house of the chart in turn. Wherever it''s transiting, it tends to bring responsibility, structure, and often difficult but ultimately useful lessons.

Saturn moving through the 7th house can bring themes of commitment and seriousness in relationships; through the 6th house, discipline around work routine and health; through the 4th house, responsibility around family and home matters.

A Saturn transit often feels restrictive, but it''s really an invitation to build a solid foundation for the long run. Choosing patient structure-building over short-term ease during this period tends to pay off with more stable results later.', 'Сатурн проводит около 2,5 лет в каждом знаке, по очереди проходя через каждый дом карты. Где бы он ни находился транзитом, он, как правило, приносит ответственность, структуру и часто трудные, но в итоге полезные уроки.

Сатурн в 7-м доме может приносить темы серьёзности и обязательств в отношениях, в 6-м — дисциплину в рабочем режиме и здоровье, в 4-м — ответственность в семейных и домашних делах.

Транзит Сатурна часто ощущается как ограничение, но на деле это приглашение выстроить прочный фундамент на долгий срок. Выбор терпеливого строительства структуры вместо поиска краткосрочной лёгкости в этот период обычно окупается более стабильными результатами в будущем.'),
  ('Dolça erası nədir? Presessiya haqqında sadə izah', 'dolca-esri-presessiya', '''Dolça erası'' ifadəsi minlərlə illik astronomik bir dövrəyə işarə edir.', 'Yerin fırlanma oxu çox yavaş şəkildə, təxminən 26 000 illik dövrlə öz ətrafında hərəkət edir — bu hadisə ''presessiya'' adlanır. Bu yavaş hərəkət nəticəsində, tropik bahar bərabərliyi nöqtəsi minlərlə il ərzində zodiak bürcləri arasında ''sürüşür''.

Hər ''era'' təxminən 2150 il davam edir və bahar bərabərliyi nöqtəsinin hansı bürcdə yerləşdiyinə əsaslanır. Son bir neçə min il ''Balıqlar erası'' sayılır, və astroloqlar arasında hazırda ''Dolça erasına'' keçid dövründə olduğumuza dair fikirlər mövcuddur — baxmayaraq ki dəqiq tarix mövzusunda yekdil razılıq yoxdur.

Vacib qeyd: bu, gündəlik istifadə etdiyimiz fərdi Günəş bürcündən tamam fərqli bir mövzudur — fərdi bürc hesablamaları bu minilliklik dövrədən təsirlənmir. ''Era'' anlayışı daha geniş, kollektiv-mədəni dəyişiklikləri simvolik şəkildə izah etmək üçün istifadə olunur.', 'Fəlsəfə', true, now() - interval '11 days', 'What is the Age of Aquarius? A simple look at precession', 'Что такое эра Водолея? Простое объяснение прецессии', '''The Age of Aquarius'' points to a slow astronomical cycle spanning thousands of years.', '''Эра Водолея'' указывает на медленный астрономический цикл, растянутый на тысячелетия.', 'Earth''s rotational axis moves very slowly in a roughly 26,000-year cycle — a phenomenon called precession. As a result of this slow drift, the tropical spring equinox point gradually ''slides'' through the zodiac signs over thousands of years.

Each ''age'' lasts roughly 2,150 years and is defined by which sign the spring equinox point falls in. The last couple thousand years are considered the ''Age of Pisces,'' and there''s ongoing discussion among astrologers about whether we''re now moving into the ''Age of Aquarius'' — though there''s no universal agreement on the exact date.

An important note: this is an entirely different topic from the individual Sun sign used in everyday astrology — personal sign calculations aren''t affected by this millennia-long cycle. The idea of an ''age'' is used, instead, as a symbolic way to talk about broader, collective cultural shifts.', 'Ось вращения Земли очень медленно смещается по циклу продолжительностью около 26 000 лет — это явление называется прецессией. В результате этого медленного смещения точка весеннего равноденствия в тропическом зодиаке постепенно ''скользит'' по знакам зодиака на протяжении тысячелетий.

Каждая ''эра'' длится около 2150 лет и определяется тем, в каком знаке находится точка весеннего равноденствия. Последние пару тысяч лет считаются ''эрой Рыб'', и среди астрологов продолжается дискуссия о том, вступаем ли мы сейчас в ''эру Водолея'' — хотя единого согласия по точной дате нет.

Важное замечание: это совершенно другая тема, не связанная с индивидуальным знаком Солнца, которым мы пользуемся в повседневной астрологии — расчёт личного знака не зависит от этого тысячелетнего цикла. Понятие ''эры'' используется скорее как символический способ говорить о более широких, коллективно-культурных переменах.')
ON CONFLICT (slug) DO NOTHING;

-- 3) 6 yeni forum mövzusu (3 EN + 3 RU), kateqoriya 'sual-cavab'
-- (mövcud 18 AZ mövzuya əlavə, onlara toxunulmur). ON CONFLICT (id) DO NOTHING.
INSERT INTO public.forum_topics (id, user_id, author_name, category, title, body, is_hidden, created_at) VALUES
  ('11111111-1111-4111-8111-111111111101', NULL, 'Sarah Mitchell', 'sual-cavab', 'What''s the actual difference between my Sun sign and Rising sign?', 'I keep reading that my Sun sign and my Rising sign ''aren''t the same thing,'' but I''m struggling to actually feel the difference in real life. Can someone explain it in plain terms, maybe with an example?', false, now() - interval '6 days'),
  ('11111111-1111-4111-8111-111111111102', NULL, 'Emily Novak', 'sual-cavab', 'Is it normal to feel nothing during a big transit everyone''s talking about?', 'There''s apparently a big transit happening right now that a lot of people online are saying is intense, but I genuinely don''t feel any different. Does that mean something''s wrong, or is it normal for a transit to just... not land for some people?', false, now() - interval '5 days'),
  ('11111111-1111-4111-8111-111111111103', NULL, 'Oliver Bennett', 'sual-cavab', 'How do you deal with having your Moon and Sun in conflicting elements?', 'My Sun is in a fire sign and my Moon is in a water sign, and sometimes it genuinely feels like two different people arguing inside my head — one wants to charge ahead, the other wants to retreat and feel things out. Anyone else deal with this combination?', false, now() - interval '4 days'),
  ('11111111-1111-4111-8111-111111111104', NULL, 'Анна Соколова', 'sual-cavab', 'Что на самом деле значит, если в карте вообще нет воды?', 'Посчитала свою натальную карту и обнаружила, что у меня нет ни одной планеты в водных знаках. Подруга сказала, что это значит, что я ''холодная'' в плане эмоций, но мне это не кажется правдой про себя. Это действительно так работает?', false, now() - interval '3 days'),
  ('11111111-1111-4111-8111-111111111105', NULL, 'Мария Петрова', 'sual-cavab', 'Как понять, где у меня восьмой дом, если я не разбираюсь в датах рождения?', 'Хочу разобраться в своей карте, но постоянно путаюсь, когда дело доходит до домов. Кто-то может просто по-человечески объяснить, как вообще найти, в каком доме что находится, без сложной терминологии?', false, now() - interval '2 days'),
  ('11111111-1111-4111-8111-111111111106', NULL, 'Виктор Соколов', 'sual-cavab', 'У кого-то было такое: транзит обещал одно, а случилось совсем другое?', 'Читал прогноз про сильный транзит в этом месяце, который должен был принести ''прорыв в карьере''. В итоге ничего такого не произошло, зато случилось кое-что совсем в личной жизни. Это нормально, что транзиты иногда ''ошибаются'' по теме?', false, now() - interval '1 days')
ON CONFLICT (id) DO NOTHING;

-- 4) Yuxarıdaki 6 mövzuya cavablar (8 ədəd). ON CONFLICT (id) DO NOTHING.
INSERT INTO public.forum_replies (id, topic_id, user_id, author_name, body, is_hidden, created_at) VALUES
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', NULL, 'James Cooper', 'Think of it this way: your Sun sign is who you are underneath everything, your core drive. Your Rising sign is more like the outfit you walk into a room wearing — the first impression people get before they know you well. I''m a Cancer Sun with a Leo Rising, so people assume I''m bold and outgoing at first, but underneath I''m actually pretty sensitive and private.', false, now() - interval '118 hours'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111102', NULL, 'James Cooper', 'Totally normal. A transit only really activates something if it''s hitting a sensitive point in your own chart — a planet, an angle, something specific. If it''s not touching anything of yours directly, it can pass by pretty quietly.', false, now() - interval '93 hours'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111102', NULL, 'Sarah Mitchell', 'Agreed — I''d rather feel nothing than feel everything everyone online is describing, honestly. Not every placement reacts the same way.', false, now() - interval '91 hours'),
  ('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111103', NULL, 'Emily Novak', 'Yes, and honestly it took me years to stop seeing it as a conflict and start seeing it as a conversation. The fire part gets to act, the water part gets to feel it through afterward. It doesn''t have to be either/or all the time.', false, now() - interval '68 hours'),
  ('22222222-2222-4222-8222-222222222205', '11111111-1111-4111-8111-111111111104', NULL, 'Дмитрий Волков', 'Нет, это не значит ''холодная'' — это скорее значит, что эмоциональный язык не является для вас естественным, выученным с детства способом реагировать. Вы вполне можете глубоко чувствовать, просто выражаете и обрабатываете это иначе, часто через действие или мысль, а не через прямое эмоциональное выражение.', false, now() - interval '45 hours'),
  ('22222222-2222-4222-8222-222222222206', '11111111-1111-4111-8111-111111111105', NULL, 'Дмитрий Волков', 'Самый простой способ — посмотреть на расчёт своей карты (на этом сайте это делается автоматически по дате, времени и месту рождения) и найти раздел с 12 секторами, расположенными по кругу. Каждый сектор пронумерован от 1 до 12, начиная от левой горизонтальной линии и идя против часовой стрелки. Там, где показаны планеты внутри этих секторов — это и есть дома. Точное время рождения важно, потому что от него зависят границы секторов.', false, now() - interval '22 hours'),
  ('22222222-2222-4222-8222-222222222207', '11111111-1111-4111-8111-111111111106', NULL, 'Мария Петрова', 'У меня было похожее. Думаю, дело в том, что общие прогнозы описывают тему очень широко, а в вашей личной карте этот транзит может активировать совсем другой дом или планету, чем у большинства читателей.', false, now() - interval '10 hours'),
  ('22222222-2222-4222-8222-222222222208', '11111111-1111-4111-8111-111111111106', NULL, 'Анна Соколова', 'Плюс один транзит редко действует изолированно — в это же время могли происходить и другие, менее заметные движения, которые в итоге и определили, где именно всё проявится.', false, now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

