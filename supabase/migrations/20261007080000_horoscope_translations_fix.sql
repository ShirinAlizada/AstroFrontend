-- Horoskop EN/RU tərcüməsinin SON, özü-özünü düzəldən (idempotent) tətbiqi.
--
-- Niyə bu fayl lazımdır: əvvəlki 20261006190000 migrasiyası content_en/content_ru
-- sütunlarını yalnız AZ `content` mətni ƏVVƏLKİ 20261001000200 migrasiyasındaki
-- dəqiq mətnlə HƏRFİ EYNİ olduqda doldururdu. Əgər 20261001000200 tətbiq
-- olunmayıbsa (sətirlər hələ ilkin ümumi "Bu gün {bürc} üçün səmavi axın
-- güclüdür..." mətnini daşıyır), uyğunluq tapılmır və content_en/content_ru
-- NULL olaraq qalır — nəticədə dil dəyişəndə horoskop mətni heç dəyişmir.
--
-- Bu fayl ehtiyat etmədən (sign, period) üzrə YALNIZ UI-ın göstərdiyi sətri
-- (ən son period_start) tapıb content/content_en/content_ru-nu BİRGƏ yazır —
-- əvvəlki migrasiyaların tətbiq olunub-olunmamasından asılı olmadan, bu faylı
-- işə saldıqdan sonra bütün 36 sətir (12 bürc × gündəlik/həftəlik/aylıq) həmişə
-- düzgün və 3 dildə tam olacaq. Sütunlar `IF NOT EXISTS` ilə əlavə olunur ki,
-- bu fayl neçə dəfə işə salınsa da problem yaratmasın.
ALTER TABLE public.horoscopes
  ADD COLUMN IF NOT EXISTS content_en text,
  ADD COLUMN IF NOT EXISTS content_ru text;

COMMENT ON COLUMN public.horoscopes.content_en IS 'NULL olduqda UI-da content (AZ) göstərilir';
COMMENT ON COLUMN public.horoscopes.content_ru IS 'NULL olduqda UI-da content (AZ) göstərilir';

UPDATE public.horoscopes SET
  content = 'Bu gün enerjin zirvədədir — başladığın işi sona çatdırmaq üçün ideal məqamdasan. Qərarlarını tez ver, amma ətrafındakılarla məsləhətləşməyi unutma.',
  content_en = 'Your energy is at its peak today — this is the ideal moment to finish what you started. Make your decisions quickly, but don''t forget to consult the people around you.',
  content_ru = 'Сегодня твоя энергия на пике — идеальный момент, чтобы завершить начатое. Принимай решения быстро, но не забывай советоваться с окружающими.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Qoç' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə liderlik instinktin önə çıxır, komanda içində təşəbbüsü sən götürəcəksən. Maliyyə mövzusunda diqqətli ol, tələsik xərcdən çəkin.',
  content_en = 'Your leadership instinct takes the lead this week — you''ll be the one taking initiative within the team. Be careful with finances, and avoid impulsive spending.',
  content_ru = 'На этой неделе на первый план выходит твой лидерский инстинкт — именно ты возьмёшь на себя инициативу в команде. Будь внимателен в финансах, избегай поспешных трат.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Qoç' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay yeni başlanğıclar üçün əlverişlidir — iş yerində və ya şəxsi layihələrdə addım atmağa cəsarət et. Ayın ikinci yarısında münasibətlərə daha çox vaxt ayırmaq sənə yaxşı gələcək.',
  content_en = 'This month favors new beginnings — have the courage to take action at work or on personal projects. In the second half of the month, giving more time to your relationships will do you good.',
  content_ru = 'Этот месяц благоприятен для новых начинаний — не бойся сделать шаг вперёд на работе или в личных проектах. Во второй половине месяца тебе будет полезно уделить больше времени отношениям.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Qoç' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Sabitlik və rahatlıq bu gün sənin üçün prioritetdir — gündəlik rutinini pozmamaq ən doğru seçimdir. Maliyyə qərarlarında tələsmə, axşam saatları düşünməyə həsr olunsun.',
  content_en = 'Stability and comfort are your priority today — sticking to your daily routine is the right choice. Don''t rush financial decisions; set aside the evening hours for reflection.',
  content_ru = 'Стабильность и комфорт сегодня в приоритете — лучший выбор — не нарушать привычный распорядок дня. Не торопись с финансовыми решениями, вечерние часы посвяти размышлениям.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Buğa' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə səbrin mükafatlanacaq — uzun müddətdir gözlədiyin bir xəbər gələ bilər. Material məsələlərdə ağıllı planlaşdırma indi öz bəhrəsini verəcək.',
  content_en = 'Your patience will be rewarded this week — news you''ve been waiting a long time for may arrive. Smart planning in material matters will start paying off now.',
  content_ru = 'На этой неделе твоё терпение будет вознаграждено — может прийти новость, которую ты давно ждал. Разумное планирование в материальных делах начнёт приносить плоды.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Buğa' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay əsaslı təməllər qurmaq vaxtıdır — iş və ev məsələlərində möhkəm addımlar at. Sevgi həyatında isə daha açıq olmaq münasibətlərini dərinləşdirəcək.',
  content_en = 'This month is the time to build solid foundations — take firm steps in work and home matters. In your love life, being more open will deepen your relationships.',
  content_ru = 'Этот месяц — время строить прочный фундамент: делай уверенные шаги в работе и домашних делах. А в любви большая открытость сделает твои отношения глубже.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Buğa' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Zehnin bu gün adətən olduğundan da çevikdir — yeni fikirlər, söhbətlər və təkliflər səni həyəcanlandıracaq. Amma bir mövzuya fokuslanmaqda çətinlik çəkə bilərsən.',
  content_en = 'Your mind is even sharper than usual today — new ideas, conversations, and offers will excite you. But you may find it hard to focus on just one topic.',
  content_ru = 'Сегодня твой ум особенно живой — новые идеи, разговоры и предложения будут тебя радовать. Но тебе может быть трудно сосредоточиться на одной теме.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Əkizlər' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə ünsiyyət qabiliyyətin ön plana çıxır — danışıqlar, müsahibələr və ya yeni tanışlıqlar uğurlu keçəcək. Qərar verməzdən əvvəl bir az gözlə.',
  content_en = 'Your communication skills take center stage this week — negotiations, interviews, or new acquaintances will go well. Wait a little before making a decision.',
  content_ru = 'На этой неделе на первый план выходят твои коммуникативные способности — переговоры, собеседования или новые знакомства пройдут удачно. Перед принятием решения немного подожди.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Əkizlər' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay öyrənmə və inkişaf ayıdır — yeni bacarıq və ya sahəyə maraq göstərəcəksən. Maliyyədə dəyişkənlik ola bilər, ona görə ehtiyat büdcəsi saxla.',
  content_en = 'This month is about learning and growth — you''ll take an interest in a new skill or field. Finances may be unpredictable, so keep a reserve budget.',
  content_ru = 'Этот месяц — месяц обучения и развития: ты заинтересуешься новым навыком или сферой. В финансах возможна нестабильность, поэтому держи резервный бюджет.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Əkizlər' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Hisslərin bu gün adətən olduğundan daha güclüdür — ailə və yaxınlarınla vaxt keçirmək sənə rahatlıq gətirəcək. İş yerində emosional qərar verməkdən çəkin.',
  content_en = 'Your feelings run stronger than usual today — spending time with family and loved ones will bring you comfort. Avoid making emotional decisions at work.',
  content_ru = 'Сегодня твои чувства сильнее обычного — время, проведённое с семьёй и близкими, принесёт тебе утешение. На работе избегай эмоциональных решений.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Xərçəng' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə ev və ailə mövzuları diqqət mərkəzindədir — köhnə bir münasibəti düzəltmək üçün münasib zamandır. Maliyyə planında ehtiyatlı addımlar at.',
  content_en = 'Home and family matters take center stage this week — it''s a good time to mend an old relationship. Take cautious steps in your financial planning.',
  content_ru = 'На этой неделе в центре внимания темы дома и семьи — подходящее время, чтобы наладить старые отношения. В финансовом планировании действуй осторожно.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Xərçəng' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay emosional dərinlik və intuisiya sənə yol göstərəcək — qərarlarını ürəyinin səsinə görə ver. Karyerada sakit, amma davamlı irəliləyiş gözlənilir.',
  content_en = 'This month, emotional depth and intuition will guide you — make your decisions by listening to your heart. Expect quiet but steady progress in your career.',
  content_ru = 'В этом месяце эмоциональная глубина и интуиция будут твоим проводником — принимай решения, слушая своё сердце. В карьере ожидается тихий, но устойчивый прогресс.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Xərçəng' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu gün diqqət mərkəzində olacaqsan — xarizman və özünəinamın ətrafındakıları təsirləndirəcək. Səxavətli ol, amma büdcəni də nəzarətdə saxla.',
  content_en = 'You''ll be the center of attention today — your charisma and self-confidence will make an impression on those around you. Be generous, but keep your budget under control.',
  content_ru = 'Сегодня ты будешь в центре внимания — твоя харизма и уверенность в себе произведут впечатление на окружающих. Будь щедрым, но держи бюджет под контролем.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Aslan' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə yaradıcı layihələr və ya təqdimatlar üçün ulduzlar səninlədir — özünü göstərmək fürsətini qaçırma. Cütlük münasibətlərində tərifə ehtiyac olduğunu unutma.',
  content_en = 'The stars are with you this week for creative projects or presentations — don''t miss the chance to shine. In your romantic relationship, remember that praise matters.',
  content_ru = 'На этой неделе звёзды на твоей стороне в творческих проектах и презентациях — не упусти шанс проявить себя. В отношениях не забывай, что похвала важна.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Aslan' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay liderlik və tanınma ayıdır — zəhmətin nəhayət qiymətləndiriləcək. Sevgidə qürurunu bir az yumşaltmaq münasibətləri gücləndirəcək.',
  content_en = 'This month is about leadership and recognition — your hard work will finally be appreciated. In love, softening your pride a little will strengthen your relationships.',
  content_ru = 'Этот месяц — месяц лидерства и признания: твой труд наконец оценят по заслугам. В любви немного смягчить гордость поможет укрепить отношения.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Aslan' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Təfərrüatlara diqqətin bu gün sənə böyük üstünlük verir — işdəki kiçik bir səhvi vaxtında tuta bilərsən. Özünü tənqid etməkdə ölçünü aşma.',
  content_en = 'Your attention to detail gives you a real edge today — you may catch a small mistake at work just in time. Don''t overdo it with self-criticism.',
  content_ru = 'Сегодня твоё внимание к деталям даёт тебе большое преимущество — ты можешь вовремя заметить небольшую ошибку на работе. Не переусердствуй с самокритикой.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Qız' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə təşkilatçılıq bacarığın sayəsində yığılmış işləri nizama salacaqsan. Sağlamlığına da diqqət ayırmağı unutma — fasilə vermək zəiflik deyil.',
  content_en = 'This week, your organizational skills will help you bring order to a backlog of tasks. Don''t forget to look after your health too — taking a break isn''t a weakness.',
  content_ru = 'На этой неделе благодаря своим организаторским способностям ты наведёшь порядок в накопившихся делах. Не забывай и о здоровье — отдыхать — не слабость.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Qız' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay praktiklik və planlaşdırma sənə uğur gətirəcək — uzunmüddətli hədəflər üçün konkret addımlar at. Münasibətlərdə mükəmməllik gözləməkdən bir az əl çək.',
  content_en = 'This month, practicality and planning will bring you success — take concrete steps toward your long-term goals. Ease up a little on expecting perfection in relationships.',
  content_ru = 'Этот месяц принесёт тебе успех благодаря практичности и планированию — сделай конкретные шаги к долгосрочным целям. В отношениях немного отступи от ожидания совершенства.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Qız' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Tarazlıq axtarışın bu gün münasibətlərdə özünü göstərir — mübahisəli bir məsələdə ədalətli vasitəçi ola bilərsən. Qərarsızlıq vaxt itkisinə səbəb olmasın.',
  content_en = 'Your search for balance shows up in your relationships today — you may end up being the fair mediator in a dispute. Don''t let indecision waste your time.',
  content_ru = 'Сегодня твой поиск равновесия проявляется в отношениях — ты можешь стать справедливым посредником в спорном вопросе. Не позволяй нерешительности отнимать время.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Tərəzi' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə tərəfdaşlıq və əməkdaşlıq mövzuları önə çıxır — iş və ya şəxsi həyatda kiminləsə razılaşma əldə edəcəksən. Estetik zövqün yaradıcı işlərdə köməyinə çatacaq.',
  content_en = 'Partnership and collaboration take the spotlight this week — you''ll reach an agreement with someone, at work or in your personal life. Your aesthetic taste will help you in creative work.',
  content_ru = 'На этой неделе на первый план выходят темы партнёрства и сотрудничества — ты достигнешь согласия с кем-то на работе или в личной жизни. Твой эстетический вкус поможет в творческих делах.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Tərəzi' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay münasibətlər ayıdır — həm romantik, həm də peşəkar əlaqələrdə harmoniya qurmaq üçün əlverişli vaxtdır. Maliyyədə tərəfdaşlıq əsaslı qərarlar faydalı olacaq.',
  content_en = 'This month is about relationships — a favorable time to build harmony in both romantic and professional connections. Partnership-based financial decisions will work in your favor.',
  content_ru = 'Этот месяц — месяц отношений: благоприятное время для построения гармонии и в романтических, и в профессиональных связях. В финансах решения, основанные на партнёрстве, окажутся полезными.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Tərəzi' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu gün səthin altındakı həqiqəti görmək bacarığın güclənir — gizli qalan bir məsələ üzə çıxa bilər. Kimə etibar etdiyinə diqqət et.',
  content_en = 'Your ability to see beneath the surface is heightened today — something that''s been hidden may come to light. Pay attention to who you trust.',
  content_ru = 'Сегодня усиливается твоя способность видеть правду под поверхностью — может всплыть скрытый до этого вопрос. Будь внимателен к тому, кому доверяешь.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Əqrəb' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə dərin dəyişikliklər üçün enerji toplayırsan — köhnə bir vərdişi və ya münasibəti arxada qoymaq vaxtı ola bilər. İş məsələlərində strategiyanı gizli saxla.',
  content_en = 'This week you''re gathering energy for deep change — it may be time to leave an old habit or relationship behind. Keep your strategy at work to yourself.',
  content_ru = 'На этой неделе ты накапливаешь энергию для глубоких перемен — возможно, пришло время оставить в прошлом старую привычку или отношения. В рабочих вопросах держи свою стратегию в секрете.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Əqrəb' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay transformasiya ayıdır — maliyyə və ya karyerada köklü bir dəyişiklik baş verə bilər. Sevgidə ehtirasın güclüdür, amma qısqanclığa yer vermə.',
  content_en = 'This month is about transformation — a fundamental change may happen in your finances or career. In love, your passion is strong, but don''t give room to jealousy.',
  content_ru = 'Этот месяц — месяц трансформации: в финансах или карьере может произойти коренная перемена. В любви твоя страсть сильна, но не давай места ревности.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Əqrəb' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Macəra hissi bu gün səni adi gündəlikdən uzaqlaşdırmaq istəyir — qısa bir səyahət və ya yeni təcrübə əhval-ruhiyyəni qaldıracaq. Vədlərini yerinə yetirməyi unutma.',
  content_en = 'Your sense of adventure wants to pull you away from the usual routine today — a short trip or a new experience will lift your mood. Don''t forget to keep your promises.',
  content_ru = 'Сегодня чувство авантюризма хочет увести тебя от обычной рутины — короткая поездка или новый опыт поднимут настроение. Не забывай выполнять свои обещания.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Oxatan' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə üfüqlərini genişləndirən fürsətlər qarşına çıxa bilər — təhsil, səyahət və ya xaricdən təklif mövzusunda xəbər gözlə. Maliyyədə həddən artıq nikbin olma.',
  content_en = 'Opportunities that expand your horizons may come your way this week — expect news about education, travel, or an offer from abroad. Don''t be overly optimistic about finances.',
  content_ru = 'На этой неделе тебе могут встретиться возможности, расширяющие горизонты — ожидай новостей об образовании, путешествии или предложении из-за границы. В финансах не будь чрезмерно оптимистичен.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Oxatan' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay genişlənmə və azadlıq ayıdır — yeni bir sahəyə addım atmaq üçün cəsarətin var. Münasibətlərdə sərbəstliyini qorumaqla bağlılıq arasında tarazlıq tap.',
  content_en = 'This month is about expansion and freedom — you have the courage to step into a new field. In relationships, find the balance between keeping your independence and staying committed.',
  content_ru = 'Этот месяц — месяц расширения и свободы: у тебя есть смелость сделать шаг в новую сферу. В отношениях найди баланс между сохранением свободы и привязанностью.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Oxatan' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Məsuliyyət hissi bu gün səni irəli aparır — planlaşdırdığın işi intizamla başa çatdıracaqsan. Özünə bir az mərhəmət göstərməyi unutma.',
  content_en = 'A sense of responsibility carries you forward today — you''ll finish the task you planned with discipline. Don''t forget to show yourself a little compassion.',
  content_ru = 'Сегодня чувство ответственности ведёт тебя вперёд — ты с дисциплиной завершишь запланированное дело. Не забывай проявлять немного сострадания к себе.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Oğlaq' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə zəhmətin nəticə verir — rəhbərlik tərəfindən diqqət çəkə bilərsən. Ailə ilə vaxt keçirməyə də yer aç, iş hər şey deyil.',
  content_en = 'Your hard work pays off this week — you may catch the attention of your superiors. Make room for time with family too — work isn''t everything.',
  content_ru = 'На этой неделе твой труд приносит результат — ты можешь привлечь внимание руководства. Найди время и для семьи — работа — не всё.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Oğlaq' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay karyera və nüfuz ayıdır — uzun müddətdir qurduğun strategiya bəhrəsini verməyə başlayır. Maliyyədə qənaətcil yanaşman sənə sabitlik gətirəcək.',
  content_en = 'This month is about career and standing — the strategy you''ve been building for a long time starts to bear fruit. Your frugal approach to finances will bring you stability.',
  content_ru = 'Этот месяц — месяц карьеры и влияния: стратегия, которую ты выстраивал долгое время, начинает приносить плоды. Бережливый подход к финансам принесёт тебе стабильность.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Oğlaq' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Orijinal fikirlərin bu gün diqqət çəkəcək — adi yoldan fərqli bir həll yolu təklif etmə vaxtıdır. Dostların dəstəyinə ehtiyac duysan, çəkinmədən müraciət et.',
  content_en = 'Your original ideas will draw attention today — it''s a good time to propose a solution that breaks from the usual path. If you need your friends'' support, don''t hesitate to ask.',
  content_ru = 'Сегодня твои оригинальные идеи привлекут внимание — время предложить решение, отличное от привычного пути. Если тебе нужна поддержка друзей, не стесняйся обратиться.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Dolça' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə sosial çevrən genişlənir — yeni tanışlıqlar və ya icma layihələri sənə ilham verəcək. Maliyyə məsələlərində qeyri-adi, amma işə yarayan bir yol tapacaqsan.',
  content_en = 'Your social circle expands this week — new acquaintances or community projects will inspire you. In financial matters, you''ll find an unusual but workable solution.',
  content_ru = 'На этой неделе твой круг общения расширяется — новые знакомства или общественные проекты вдохновят тебя. В финансовых вопросах ты найдёшь необычный, но рабочий путь.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Dolça' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay yenilik və müstəqillik ayıdır — ənənəvi qaydalardan kənara çıxıb öz yolunu getmək istəyin güclənir. Münasibətlərdə məsafəyə ehtiyac duysan, bunu açıq izah et.',
  content_en = 'This month is about innovation and independence — your urge to step outside traditional rules and follow your own path grows stronger. If you need distance in a relationship, explain it openly.',
  content_ru = 'Этот месяц — месяц новаторства и независимости: усиливается желание выйти за рамки традиционных правил и идти своим путём. Если в отношениях нужна дистанция, объясни это открыто.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Dolça' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Həssaslığın bu gün sənə başqalarının demədiyini hiss etmək imkanı verir — bu bacarığı yaradıcı işində istifadə et. Reallıqdan qaçmaqdansa, üzləş.',
  content_en = 'Your sensitivity today lets you sense what others leave unsaid — put that gift to use in your creative work. Rather than escaping reality, face it.',
  content_ru = 'Сегодня твоя чувствительность позволяет улавливать то, что другие не говорят вслух — используй эту способность в творческой работе. Вместо того чтобы убегать от реальности, посмотри ей в лицо.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Balıqlar' AND period = 'daily'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu həftə xəyal gücün və intuisiyan güclüdür — sənət, musiqi və ya yazıya vaxt ayırsan, gözəl nəticələr alacaqsan. Pul məsələlərində real rəqəmlərə sadiq qal.',
  content_en = 'Your imagination and intuition are strong this week — if you give time to art, music, or writing, you''ll get beautiful results. In money matters, stick to the real numbers.',
  content_ru = 'На этой неделе твоё воображение и интуиция сильны — если уделишь время искусству, музыке или писательству, получишь прекрасные результаты. В денежных вопросах держись реальных цифр.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Balıqlar' AND period = 'weekly'
  ORDER BY period_start DESC LIMIT 1
);

UPDATE public.horoscopes SET
  content = 'Bu ay ruhani və yaradıcı inkişaf ayıdır — daxili səsini dinləmək sənə doğru istiqaməti göstərəcək. Sevgidə dərin bir bağlılıq qurmaq üçün əlverişli zamandır.',
  content_en = 'This month is about spiritual and creative growth — listening to your inner voice will show you the right direction. It''s a favorable time to build a deep bond in love.',
  content_ru = 'Этот месяц — месяц духовного и творческого роста: умение слушать свой внутренний голос покажет тебе верное направление. Это благоприятное время для построения глубокой связи в любви.'
WHERE id = (
  SELECT id FROM public.horoscopes WHERE sign = 'Balıqlar' AND period = 'monthly'
  ORDER BY period_start DESC LIMIT 1
);
