-- ============================================================
-- Seed: more real-feeling articles (qəzet) and forum content
-- ============================================================

-- Forum topics/replies are shown by author_name text, not by joining
-- to a real user account, so allow seeded/community rows without a
-- real auth.users row behind them.
ALTER TABLE public.forum_topics ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.forum_replies ALTER COLUMN user_id DROP NOT NULL;

-- ------------------------------------------------------------
-- ARTICLES (qəzet)
-- ------------------------------------------------------------
INSERT INTO public.articles (title, slug, excerpt, body, tag, published, published_at, views) VALUES
('Günəş bürcün əslində nə deməkdir?','gunes-burcu-ne-demekdir','Ulduz falının ən çox bilinən hissəsi, əslində xəritənin yalnız bir təbəqəsidir.',
'Kimsə səndən bürcünü soruşanda, əksər hallarda Günəş bürcündən danışılır. Bu, doğulduğun anda Günəşin hansı zodiak işarəsində olduğunu göstərir və şəxsiyyətinin nüvəsini, iradəni və həyatda nəyi ifadə etməyə çalışdığını əks etdirir.

Lakin Günəş bürcü tək başına tam mənzərəni vermir. Ay sənin daxili dünyanı, Yüksələn isə başqalarının səni necə gördüyünü göstərir. Yalnız Günəşə baxaraq özünü tanımaq, kitabın yalnız birinci fəslini oxumağa bənzəyir.

Buna baxmayaraq, Günəş bürcü güclü bir başlanğıc nöqtəsidir. O, sənin əsas enerjini, liderlik tərzini və nəyin səni canlandırdığını göstərir — və natal xəritənin qalan hissəsini anlamaq üçün ən yaxşı yol məhz oradan başlamaqdır.','Günəş', true, now() - interval '58 days', 812),

('Ayın fazaları və emosional dövrələr','ayin-fazalari-emosional-dovrler','Hər ay fazası fərqli bir daxili ritmə uyğun gəlir.',
'Ay təxminən 29.5 gündə Yer ətrafında tam dövr edir və bu müddətdə səkkiz əsas fazadan keçir. Hər faza fərqli bir emosional və enerji ritminə uyğun gəlir.

Yeni ay niyyət qoymaq, toxum əkmək üçün ən əlverişli andır. Artan ay mərhələsində hərəkətə keçmək, planları həyata keçirmək asanlaşır. Dolunay isə kulminasiya, aydınlıq və bəzən emosional intensivlik gətirir.

Azalan ay isə buraxmaq, sadələşdirmək və dincəlmək üçün dəvətdir. Öz emosional ritmini ay fazaları ilə izləmək, daxili dəyişkənliyi anlamaq üçün sadə, lakin güclü bir vasitədir.','Ay', true, now() - interval '51 days', 634),

('Venera retroqradında sevgi həyatına nə olur?','venera-retroqrad-sevgi','Venera geri hərəkət edəndə keçmiş münasibətlər yenidən üzə çıxa bilər.',
'Venera təxminən 18 ayda bir dəfə, 6 həftəyə yaxın müddətdə retroqrad görünür. Bu dövrdə sevgi, münasibətlər, pul və dəyərlər mövzuları xüsusi diqqət tələb edir.

Köhnə tanışlar, keçmiş partnyorlar və ya bitməmiş emosional məsələlər bu dövrdə yenidən gündəmə gələ bilər. Astroloqlar bu müddətdə yeni münasibətə başlamağı və ya vacib maliyyə qərarları verməyi tövsiyə etmirlər — çünki sonradan fikir dəyişə bilərsən.

Əvəzində Venera retroqradı öz dəyərlərini, özünə sevgini və münasibətlərində nəyə həqiqətən ehtiyacın olduğunu yenidən nəzərdən keçirmək üçün əla fürsətdir.','Tranzit', true, now() - interval '45 days', 1204),

('Yüksələn bürc: ilk təəssüratının sirri','yukselen-burc-ilk-teessurat','Yüksələn bürc başqalarının səni ilk anda necə gördüyünü göstərir.',
'Yüksələn bürc (Asendent) doğum anında şərq üfüqündə qalxan zodiak işarəsidir. O, dəqiq doğum saatı olmadan hesablana bilməz — buna görə də natal xəritədə ən çox səhv edilən nöqtələrdən biridir.

Yüksələn bürc sənin xarici görünüşünü, ilk təəssüratını və dünyaya yanaşma tərzini formalaşdırır. Məsələn, Aslan yüksələni olan insan hətta sakit Balıqlar Günəşi ilə belə özündən əmin görünə bilər.

Bu bürc həm də natal xəritənin 1-ci evinin başlanğıcını təyin edir və bütün ev sistemini formalaşdırır — buna görə dəqiq doğum saatı bilmək, xəritəni düzgün oxumaq üçün vacibdir.','Xəritə', true, now() - interval '40 days', 947),

('12 bürcün element və keyfiyyət qruplaşması','burclerin-element-keyfiyyeti','Hər bürc bir elementə və bir keyfiyyətə aiddir — bu, xarakterin açarıdır.',
'12 zodiak bürcü dörd elementə bölünür: Od (Qoç, Aslan, Oxatan), Torpaq (Buğa, Qız, Oğlaq), Hava (Əkizlər, Tərəzi, Dolça) və Su (Xərçəng, Əqrəb, Balıqlar). Element sənin əsas enerji tipini göstərir — Od hərəkətli, Torpaq praktik, Hava intellektual, Su isə emosionaldır.

Eyni zamanda hər bürc üç keyfiyyətdən birinə aiddir: Sabit-başlanğıc (Qoç, Xərçəng, Tərəzi, Oğlaq), Sabit (Buğa, Aslan, Əqrəb, Dolça) və Dəyişkən (Əkizlər, Qız, Oxatan, Balıqlar).

Bu iki təsnifatı birləşdirəndə hər bürcün unikal xarakteri aydınlaşır — məsələn Aslan həm Od, həm də Sabitdir, buna görə də ehtiraslı, lakin sabit liderlik enerjisi daşıyır.','Bürclər', true, now() - interval '34 days', 1560),

('Sinastriya nədir və necə oxunur?','sinastriya-nedir','İki natal xəritənin üst-üstə qoyulması münasibətin dinamikasını göstərir.',
'Sinastriya iki insanın natal xəritələrini müqayisə edərək aralarındakı astroloji dinamikanı öyrənən üsuldur. Hər iki xəritədəki planetlərin bir-birinə formalaşdırdığı bucaqlar (aspektlər) münasibətin güclü və çətin tərəflərini göstərir.

Məsələn, bir tərəfin Venerasının digərinin Marsı ilə harmonik aspekti cazibə və ehtirası artıra bilər, Ay-Ay kvadratı isə emosional anlaşılmazlıqlara işarə edə bilər.

Sinastriya təkcə "uyğunuq, ya yox" sualına cavab vermir — o, münasibətdə hansı sahələrin işlənməli olduğunu göstərən bir xəritədir. Heç bir kombinasiya mükəmməl deyil, hər biri öz dərsi ilə gəlir.','Sinastriya', true, now() - interval '29 days', 2103),

('Saturn qayıdışı: 29 yaş böhranının astrologiyası','saturn-qayidisi-29-yas','Saturn təqribən 29 ildən bir doğum mövqeyinə qayıdır və həyatı yenidən qurur.',
'Saturn Günəş ətrafında tam dövrünü təxminən 29.5 ildə tamamlayır. Bu o deməkdir ki, hər insan 27-30 yaşları arasında "Saturn qayıdışı" adlanan dövrü yaşayır — Saturn doğum anındakı mövqeyinə geri qayıdır.

Bu dövr çox zaman böyük yaşam dəyişiklikləri ilə müşayiət olunur: karyera dəyişikliyi, münasibətlərin ciddiləşməsi və ya bitməsi, məsuliyyətin artması. Saturn struktur və nizam planetidir — bu qayıdış səni "böyüməyə" məcbur edir.

Çətin görünsə də, Saturn qayıdışı əslində özünü daha möhkəm təməllər üzərində qurmaq üçün bir dəvətdir. İkinci qayıdış 58-60 yaşlarında baş verir və oxşar, lakin daha müdrik bir mərhələ gətirir.','Tranzit', true, now() - interval '23 days', 1789),

('Natal Ay bürcün emosional ehtiyaclarını necə göstərir?','natal-ay-burcun-emosional-ehtiyaclar','Ay bürcün, təhlükəsizlik hissi üçün nəyə ehtiyacın olduğunu açıqlayır.',
'Natal xəritədə Ay, daxili dünyanı, instinktiv reaksiyaları və emosional ehtiyacları göstərir. Günəş kim olmaq istədiyimizi, Ay isə özümüzü təhlükəsiz hiss etmək üçün nəyə ehtiyacımız olduğunu göstərir.

Məsələn, Xərçəng Ayı olan insan üçün ev və ailə təhlükəsizlik mənbəyidir, Dolça Ayı olan üçün isə azadlıq və intellektual əlaqə vacibdir. Ay bürcünü tanımaq, öz emosional tetiklərini və rahatlama üsullarını anlamağa kömək edir.

Münasibətlərdə partnyorunun Ay bürcünü bilmək də faydalıdır — bu, onun stress anında nəyə ehtiyac duyduğunu anlamağın açarı ola bilər.','Ay', true, now() - interval '18 days', 876),

('Şimal Node və həyat missiyası','shimal-node-heyat-missiyasi','Node oxu, keçmiş vərdişlərdən böyümə istiqamətinə doğru yolu göstərir.',
'Ay Nodeları — Şimal və Cənub Node — real planetlər deyil, Ayın orbitinin ekliptika ilə kəsişdiyi riyazi nöqtələrdir. Astrologiyada onlar həyat yolunu və ruhani böyüməni simvolizə edir.

Cənub Node rahat, tanış olan, "artıq bilinən" keyfiyyətləri göstərir — bəzən keçmiş vərdişlər kimi başa düşülür. Şimal Node isə bizi çağıran, çətin gələn, amma böyümə gətirən istiqamətdir.

Məsələn, Əkizlər Cənub Node — Oxatan Şimal Node olan insan üçün detallardan çıxıb daha geniş mənaya, fəlsəfəyə doğru hərəkət etmək inkişaf yolu ola bilər. Node oxu tez-tez "bu həyatda nə öyrənməliyəm" sualına cavab axtaranlar üçün maraqlıdır.','Xəritə', true, now() - interval '14 days', 592),

('Astrokartoqrafiya: harada yaşamaq sənə uyğundur?','astrokartografiya-harada-yasamaq','Natal xəritən dünya xəritəsi üzərinə köçürüləndə fərqli yerlərin təsiri üzə çıxır.',
'Astrokartoqrafiya natal xəritədəki planet xətlərini dünya xəritəsi üzərinə köçürən bir texnikadır. Fikir sadədir: planetlərin təsiri coğrafi məkandan asılı olaraq dəyişir.

Məsələn, Veneranın xəttinin keçdiyi şəhərdə yaşamaq və ya səyahət etmək sevgi, gözəllik və harmoniya ilə bağlı təcrübələri gücləndirə bilər, Marsın xətti isə enerji və rəqabəti artıra bilər, bəzən də gərginlik gətirə bilər.

Bu üsul köçmək, iş üçün şəhər seçmək və ya sadəcə müəyyən yerlərdə niyə fərqli hiss etdiyini anlamaq istəyənlər üçün maraqlı bir alətdir — elmi sübutu olmasa da, minlərlə insanın təcrübəsi ilə formalaşıb.','Praktika', true, now() - interval '11 days', 445),

('Merkurinin bürcü düşüncə tərzini necə formalaşdırır?','merkurinin-burcu-dushunce-tarzi','Merkuri necə düşündüyünü və ünsiyyət qurduğunu göstərir.',
'Merkuri Günəşdən heç vaxt çox uzaqlaşmadığı üçün onun bürcü adətən Günəş bürcünə yaxın (eyni və ya qonşu bürclərdə) olur. Merkuri düşüncə tərzini, öyrənmə üslubunu və ünsiyyət tərzini idarə edir.

Od bürclərində Merkuri sürətli və birbaşa düşünür, Torpaq bürclərində praktik və detallı, Hava bürclərində analitik və sosial, Su bürclərində isə intuitiv və emosional əsaslı düşünür.

Öz Merkuri bürcünü bilmək, həm öz düşüncə tərzini qəbul etmək, həm də başqaları ilə daha effektiv ünsiyyət qurmaq üçün faydalıdır — xüsusilə fərqli Merkuri tiplərinə malik insanlarla işləyərkən.','Ünsiyyət', true, now() - interval '8 days', 321),

('Marsın bürcü: enerjini haraya yönəldirsən?','marsin-burcu-enerji','Mars hərəkətə keçmə tərzini və nəyin səni motivasiya etdiyini göstərir.',
'Mars istək, hərəkət və mübarizə planetidir. Onun bürcü sənin necə hərəkətə keçdiyini, nəyin səni qıcıqlandırdığını və enerjini necə ifadə etdiyini göstərir.

Qoç Marsı — təbii evində — birbaşa və impulsivdir, Oğlaq Marsı isə strateji və səbirlidir. Tərəzi Marsı münaqişədən çəkinə bilər, Əqrəb Marsı isə dərin və intensiv enerji daşıyır.

Marsın çətin aspektləri (məsələn Saturn ilə kvadrat) enerjini ifadə etməkdə maneələr yarada bilər, harmonik aspektlər isə hərəkətə keçməyi asanlaşdırır. Öz Mars bürcünü tanımaq, motivasiya itirdiyin anlarda özünü daha yaxşı başa düşməyə kömək edir.','Enerji', true, now() - interval '5 days', 210),

('Cütlərin uyğunluğunda Veneranın rolu','cutlerin-uygunlugunda-venera','Venera cazibəni və münasibətdə nəyə dəyər verdiyini göstərir.',
'Venera sevgi, gözəllik və dəyərlər planetidir. Sinastriyada iki insanın Venera mövqeləri arasındakı aspektlər, cazibənin təbiətini və münasibətdə nəyin vacib sayıldığını göstərir.

Venera-Venera harmonik aspektləri adətən ortaq zövq və dəyərlərə işarə edir — rahat, təbii bir uyğunluq hissi yaradır. Venera-Mars aspektləri isə fiziki cazibəni və ehtirası gücləndirir.

Amma çətin aspektlər də faydasız deyil — onlar münasibətə dərinlik və böyümə üçün fürsət gətirə bilər, sadəcə daha çox şüurlu səy tələb edir. Venera tək başına münasibətin taleyini müəyyən etmir, amma onun emosional tonunu formalaşdırmaqda mühüm rol oynayır.','Sinastriya', true, now() - interval '3 days', 156),

('Astrologiya və meditasiya: gündəlik praktika üçün 5 addım','astrologiya-meditasiya-5-addim','Astroloji məlumatı gündəlik daxili işə çevirən sadə praktika.',
'Astrologiya yalnız proqnozlaşdırma aləti deyil — o, həm də özünütanıma və daxili işə dəvətdir. Aşağıdakı sadə praktika astroloji məlumatı gündəlik həyata inteqrasiya etməyə kömək edə bilər.

1. Səhər bugünkü Ay bürcünü yoxla və özündən soruş: bu enerji ilə necə hərəkət edə bilərəm? 2. Öz Günəş, Ay və Yüksələn bürclərini xatırla və onların hər birinin bu gün necə özünü göstərdiyini müşahidə et. 3. Beş dəqiqə sakit otur və nəfəsinə fokuslan.

4. Cari tranzitlərdən biri (məsələn retroqrad bir planet) haqqında düşün və həyatında necə əks olunduğunu qeyd et. 5. Gün sonunda jurnal yazaraq müşahidələrini qeyd et — zamanla bu, öz daxili ritmini daha dərindən tanımana kömək edəcək.','Meditasiya', true, now() - interval '1 days', 89);

-- ------------------------------------------------------------
-- FORUM TOPICS
-- ------------------------------------------------------------
INSERT INTO public.forum_topics (id, user_id, author_name, category, title, body, is_hidden, created_at) VALUES
('8097ac7f-3ff3-4f8e-911c-5be8ba3a4890', NULL, 'Aynur Məmmədova', 'ümumi', 'İlk dəfə buradayam, salam hamıya!', 'Salam! Bu yaxınlarda natal xəritəmi hesabladım və astrologiyaya maraq göstərməyə başladım. Bu forumda təcrübəli insanlar görürəm, ümid edirəm burda çox şey öyrənəcəm 🙂', false, now() - interval '21 days'),
('d5543b12-dd45-42e0-9649-9fe53f2476ff', NULL, 'Elvin Qasımov', 'ümumi', 'Astrologiyaya necə başladınız?', 'Maraqlıdır, hamınız astrologiyaya necə maraq göstərməyə başlamısınız? Mənimki bir dostumun natal xəritəmi oxumasından sonra oldu, çox təəccübləndim doğruluğuna.', false, now() - interval '19 days'),
('dc12e285-b011-48a7-9374-b7ff6fa4c284', NULL, 'Günay Səfərova', 'tranzitlər', 'Bu ay Merkuri retroqraddadır, kimin başına iş gəldi?', 'Mənim telefonum sındı, iş yerində sənəd itdi, bir də köhnə tanışım mesaj yazdı — klassik Merkuri retroqrad əlamətləri deyilmi? Sizdə necədir bu dövr?', false, now() - interval '17 days'),
('bfff6ecf-3324-4e5c-9b0a-4fce0336feef', NULL, 'Tural Hüseynov', 'tranzitlər', 'Saturn Balıqlarda — kim hiss edir təsirini?', 'Saturn Balıqlar bürcünə keçəli hədsiz yorğunluq hiss edirəm, xüsusən yaradıcı işlərdə. Balıqlar/Qız yüksələni olanlar necə hiss edir özlərini?', false, now() - interval '15 days'),
('371511ef-8de2-43dd-a93b-7926f553a2fe', NULL, 'Nərmin Abbasova', 'tranzitlər', 'Yupiter keçidi karyeramda dəyişiklik gətirdi', 'Yupiter 10-cu evimə keçəndən sonra tamam gözlənilməz bir iş təklifi aldım. Sizdə də karyerada belə "açılma" hiss olub bu il?', false, now() - interval '13 days'),
('720e4749-b98f-4244-b86c-a1e333bd7292', NULL, 'Kamran Əliyev', 'natal xəritə', 'Xəritəmdə 8-ci ev boşdur, bu normaldırmı?', 'Xəritəmi yoxlayanda gördüm ki 8-ci evdə heç bir planet yoxdur. Narahat olmalıyammı, yoxsa boş evlər tamam normaldır?', false, now() - interval '12 days'),
('c8ab975c-7dce-435c-ae3a-1a0d7b77d1e3', NULL, 'Səbinə Rzayeva', 'natal xəritə', 'Yüksələnim Əkizlər amma özümü heç oxşatmıram', 'Yüksələn bürcüm Əkizlərdir amma özümü daha çox sakit, introvert insan kimi tanıyıram. Bu normal ola bilərmi, yoxsa doğum saatımda səhvlik var?', false, now() - interval '10 days'),
('6d195eb7-f0b4-4192-9b45-3c1518669939', NULL, 'Orxan Məmmədli', 'natal xəritə', 'Ay-Plüton kvadratı olan var? Necə idarə edirsiniz?', 'Natal xəritəmdə Ay-Plüton kvadratı var və çox intensiv emosiyalar yaşayıram bəzən. Bu aspekti olan varmı, necə balanslaşdırırsınız?', false, now() - interval '9 days'),
('0f645468-a6c1-412d-a6ca-c3843c7a3b37', NULL, 'Leyla Vəliyeva', 'natal xəritə', 'Xəritəmi necə oxumaq lazımdır, kömək edin', 'Xəritə bölməsindən hesabladım amma hər şey mənə çox mürəkkəb görünür. Haradan başlamaq lazımdır ki, öz xəritəmi başa düşüm?', false, now() - interval '8 days'),
('08b068f0-baf3-4a45-811f-8b1d31e05312', NULL, 'Aygün Nəbiyeva', 'cütlük xəritəsi', 'Partnyorumla Günəş-Ay kvadratımız var, çətindir', 'Uyğunluq bölməsində yoxladım, mənim Günəşimlə onun Ayı arasında kvadrat var. İlk vaxtlar çox cəlbedici idi amma indi tez-tez anlaşılmazlıq yaşayırıq. Belə təcrübəsi olan var?', false, now() - interval '7 days'),
('3de96ec8-ed19-4dcc-97d8-9d0878263e56', NULL, 'Rəşad Qurbanov', 'cütlük xəritəsi', 'Sinastriyada Venera-Mars trigonu nə deməkdir?', 'Sevgilimlə xəritələrimizi müqayisə etdim, Venera-Mars arasında trigon çıxdı. Bu praktikada özünü necə göstərir, kimin təcrübəsi var?', false, now() - interval '6 days'),
('f002a41c-41ec-4ee5-9c4d-20b0b3393fc1', NULL, 'Şəbnəm Hacıyeva', 'cütlük xəritəsi', 'Balıqlar və Oğlaq uyğunluğu təcrübəniz varmı?', 'Mən Balıqlar Günəşiyəm, sevgilim isə Oğlaq. Çox fərqli görünürük amma çox yaxşı tamamlayırıq bir-birimizi. Bu kombinasiyanı yaşayan var burada?', false, now() - interval '5 days'),
('e117f7be-e611-4d5d-873f-3b92d396c7dd', NULL, 'Elnur Bağırov', 'sual-cavab', 'Doğum saatımı bilmirəm, nə etməliyəm?', 'Doğum şəhadətnaməmdə saat yazılmayıb, valideynlərim də dəqiq xatırlamır. Xəritəmi necə hesablaya bilərəm, yoxsa mümkün deyil?', false, now() - interval '4 days'),
('979b8b98-c6cc-471c-95b8-510a18d1bea0', NULL, 'Nigar Cəfərova', 'sual-cavab', 'Sidereal və tropik zodiak fərqi nədir?', 'Bəzi saytlarda mənim bürcüm fərqli çıxır. Sonra öyrəndim ki sidereal və tropik sistem var. Bu saytda hansı sistem işlədilir, fərq nədir?', false, now() - interval '3 days'),
('814d121f-19db-4036-8c05-5521694eda78', NULL, 'Fərid Novruzov', 'sual-cavab', 'Şimal Node hansı evdədirsə nəyə işarədir?', 'Mənim Şimal Node-um 7-ci evdədir. Bu münasibətlərlə bağlı bir mesaj ola bilərmi? Fikirlərinizi bilmək istərdim.', false, now() - interval '2 days'),
('fc9a7f8a-4262-4995-8418-24190eaadc9a', NULL, 'Aynur Məmmədova', 'ümumi', 'Bu forumda kim natal xəritəsini paylaşmaq istəyir?', 'Fikirləşdim bəlkə bir mövzu açaq, hərə öz Günəş-Ay-Yüksələn kombinasiyasını yazsın, maraqlı ola bilər müqayisə etmək 🙂 Mən başlayıram: Qoç-Əqrəb-Şir.', false, now() - interval '2 days'),
('9831a20d-c320-4e2f-b1b6-dbf525f3a116', NULL, 'Günay Səfərova', 'tranzitlər', 'Növbəti dolunay hansı bürcdə olacaq?', 'Bilən var bu ayın dolunayı hansı bürcdə baş verəcək? Günün bələdçisi bölməsinə baxdım amma dəqiq tarixi tapa bilmədim.', false, now() - interval '1 days'),
('4baa69b5-20c8-46fc-b1fd-a469511ee1ad', NULL, 'Kamran Əliyev', 'sual-cavab', 'Uyğunluq balı aşağıdır, deməli uyğun deyilikmi?', 'Partnyorumla uyğunluq balımız 45% çıxdı. Bu o deməkdirmi ki bizə uyğun deyilik, yoxsa bal tək amil deyil?', false, now() - interval '12 hours');

-- ------------------------------------------------------------
-- FORUM REPLIES
-- ------------------------------------------------------------
INSERT INTO public.forum_replies (topic_id, user_id, author_name, body, is_hidden, created_at) VALUES
('dc12e285-b011-48a7-9374-b7ff6fa4c284', NULL, 'Tural Hüseynov', 'Mənim də noutbukum xarab oldu bu dövrdə 😅 Ən yaxşısı vacib sənədləri iki dəfə yoxlamaqdır bu müddətdə.', false, now() - interval '16 days'),
('dc12e285-b011-48a7-9374-b7ff6fa4c284', NULL, 'Nərmin Abbasova', 'Köhnə iş yoldaşım mesaj yazdı mənə də, tam Merkuri retroqrad effekti. Amma yaxşı söhbətləşdik, deməli hər şey pis olmur bu dövrdə.', false, now() - interval '15 days'),
('dc12e285-b011-48a7-9374-b7ff6fa4c284', NULL, 'Leyla Vəliyeva', 'Mən bu dövrdə yeni telefon almaqdan çəkindim, məsləhətlərə əsasən düzgün etmişəm deyəsən 🙂', false, now() - interval '15 days'),
('bfff6ecf-3324-4e5c-9b0a-4fce0336feef', NULL, 'Aygün Nəbiyeva', 'Mən Qız yüksələniyəm, doğrudan da son aylarda özümü çox yorğun hiss edirəm. Yuxu rejiminə daha çox fikir verməyə başladım.', false, now() - interval '14 days'),
('bfff6ecf-3324-4e5c-9b0a-4fce0336feef', NULL, 'Orxan Məmmədli', 'Bəlkə də bu, sadəcə daha çox istirahət etmək lazım olduğuna işarədir. Saturn həmişə yavaşlamağı öyrədir.', false, now() - interval '14 days'),
('720e4749-b98f-4244-b86c-a1e333bd7292', NULL, 'Rəşad Qurbanov', 'Tamamilə normaldır, boş evlər sadəcə o sahədə daha az "hadisə" olduğunu göstərir, problem demək deyil.', false, now() - interval '11 days'),
('720e4749-b98f-4244-b86c-a1e333bd7292', NULL, 'Nigar Cəfərova', 'Dəqiq, əksinə boş evlər bəzən daha sabit sahələr kimi də şərh olunur. Evin hökmdarına baxmaq daha vacibdir.', false, now() - interval '11 days'),
('c8ab975c-7dce-435c-ae3a-1a0d7b77d1e3', NULL, 'Fərid Novruzov', 'Yüksələn həmişə açıq-aşkar görünmür, xüsusən Günəş və Ay bürcün güclü fərqli enerjiyə sahibdirsə. Doğum saatı bir neçə dəqiqə səhv olsa belə bürc dəyişə bilər, dəqiqliyi yoxlamaq faydalı olar.', false, now() - interval '9 days'),
('c8ab975c-7dce-435c-ae3a-1a0d7b77d1e3', NULL, 'Şəbnəm Hacıyeva', 'Mənim də oxşar vəziyyətim var, amma yaxın dostlarım deyir ki əslində insanlarla tanış olanda Əkizlər enerjisi üzə çıxır, sadəcə tanımadığın insanlarla yox.', false, now() - interval '9 days'),
('6d195eb7-f0b4-4192-9b45-3c1518669939', NULL, 'Elnur Bağırov', 'Mənim də var bu aspekt. Terapiya və jurnal yazmaq çox köməkçi oldu emosiyaları tanımaqda.', false, now() - interval '8 days'),
('0f645468-a6c1-412d-a6ca-c3843c7a3b37', NULL, 'Aynur Məmmədova', 'Ən yaxşısı Günəş-Ay-Yüksələn üçlüyündən başlamaqdır, sonra planetlərin evlərinə baxarsan. Addım-addım gedəndə daha asan olur.', false, now() - interval '7 days'),
('0f645468-a6c1-412d-a6ca-c3843c7a3b37', NULL, 'Elvin Qasımov', 'Mən də elə başlamışdım, indi aspektlərə baxıram. Vaxt aparır amma maraqlı prosesdir.', false, now() - interval '7 days'),
('08b068f0-baf3-4a45-811f-8b1d31e05312', NULL, 'Şəbnəm Hacıyeva', 'Bizdə də oxşar aspekt var. Açıq ünsiyyət və bir-birinin emosional dilini öyrənmək çox kömək etdi.', false, now() - interval '6 days'),
('08b068f0-baf3-4a45-811f-8b1d31e05312', NULL, 'Tural Hüseynov', 'Çətin aspektlər həm də ən çox böyümə gətirən aspektlərdir, o baxımdan pis şey deyil.', false, now() - interval '6 days'),
('3de96ec8-ed19-4dcc-97d8-9d0878263e56', NULL, 'Aygün Nəbiyeva', 'Bizdə də var bu trigon, doğrudan da rahat və təbii bir cazibə yaradır, heç bir gərginlik hiss etmirik.', false, now() - interval '5 days'),
('e117f7be-e611-4d5d-873f-3b92d396c7dd', NULL, 'Nigar Cəfərova', 'Təxmini saatla da xəritə hesablaya bilərsən, sadəcə ev sərhədləri və Yüksələn dəqiq olmaya bilər. Günəş və Ay bürcün adətən düzgün çıxır.', false, now() - interval '3 days'),
('e117f7be-e611-4d5d-873f-3b92d396c7dd', NULL, 'Fərid Novruzov', 'Bəzi ölkələrdə doğum haqqında arayış xəstəxanadan alına bilir, saat da orda qeyd olunur. Yoxlamağa dəyər.', false, now() - interval '3 days'),
('979b8b98-c6cc-471c-95b8-510a18d1bea0', NULL, 'Kamran Əliyev', 'Bu sayt tropik zodiakdan istifadə edir, Qərb astrologiyasında ən çox yayılan sistemdir. Sidereal sistem isə Vedik astrologiyada işlədilir, fərq ayanamsa düzəlişindən qaynaqlanır.', false, now() - interval '2 days'),
('814d121f-19db-4036-8c05-5521694eda78', NULL, 'Səbinə Rzayeva', '7-ci evdə Şimal Node çox tez-tez münasibətlər vasitəsilə böyümə mənasında şərh olunur — bəlkə də tək başına deyil, başqaları ilə əlaqədə inkişaf etmək sənin yolundur.', false, now() - interval '1 days'),
('fc9a7f8a-4262-4995-8418-24190eaadc9a', NULL, 'Orxan Məmmədli', 'Maraqlı fikirdir! Mənim də: Xərçəng-Balıq-Əqrəb. Çox su enerjisi 🌊', false, now() - interval '1 days'),
('fc9a7f8a-4262-4995-8418-24190eaadc9a', NULL, 'Leyla Vəliyeva', 'Buğa-Oğlaq-Qız burda, tam torpaq insanıyam deyəsən 😄', false, now() - interval '20 hours'),
('4baa69b5-20c8-46fc-b1fd-a469511ee1ad', NULL, 'Rəşad Qurbanov', 'Bal tək amil deyil, sadəcə bəzi sahələrdə daha çox səy lazım olduğunu göstərir. Real münasibətlərdə ünsiyyət balı üstələyir.', false, now() - interval '10 hours');
