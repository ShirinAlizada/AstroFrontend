-- Replaces the launch-time placeholder horoscope text (the same templated
-- sentence copy-pasted for all 12 signs × 3 periods, see
-- 20260911153358_..._.sql) with real, distinct, sign-appropriate content for
-- every sign/period combination. Also fixes period_start: the placeholder
-- seed used CURRENT_DATE for daily, weekly AND monthly rows alike; weekly
-- now starts on the week and monthly on the month, so horoskop.tsx's
-- "most recent period_start" query keeps returning the right row as time
-- passes.

-- Remove only the known placeholder rows (never touches real content an
-- admin may have since written by hand through the admin panel).
DELETE FROM public.horoscopes
WHERE content LIKE 'Bu gün % bürcü üçün səmavi axın güclüdür.%';

INSERT INTO public.horoscopes (sign, period, period_start, content, love, career, finance)
SELECT
  v.sign,
  v.period,
  CASE v.period
    WHEN 'daily' THEN CURRENT_DATE
    WHEN 'weekly' THEN date_trunc('week', CURRENT_DATE)::date
    WHEN 'monthly' THEN date_trunc('month', CURRENT_DATE)::date
  END,
  v.content,
  v.love,
  v.career,
  v.finance
FROM (VALUES
  -- Qoç (Aries)
  ('Qoç','daily','Bu gün enerjin zirvədədir — başladığın işi sona çatdırmaq üçün ideal məqamdasan. Qərarlarını tez ver, amma ətrafındakılarla məsləhətləşməyi unutma.',65,85,60),
  ('Qoç','weekly','Bu həftə liderlik instinktin önə çıxır, komanda içində təşəbbüsü sən götürəcəksən. Maliyyə mövzusunda diqqətli ol, tələsik xərcdən çəkin.',60,80,55),
  ('Qoç','monthly','Bu ay yeni başlanğıclar üçün əlverişlidir — iş yerində və ya şəxsi layihələrdə addım atmağa cəsarət et. Ayın ikinci yarısında münasibətlərə daha çox vaxt ayırmaq sənə yaxşı gələcək.',58,78,62),

  -- Buğa (Taurus)
  ('Buğa','daily','Sabitlik və rahatlıq bu gün sənin üçün prioritetdir — gündəlik rutinini pozmamaq ən doğru seçimdir. Maliyyə qərarlarında tələsmə, axşam saatları düşünməyə həsr olunsun.',70,65,75),
  ('Buğa','weekly','Bu həftə səbrin mükafatlanacaq — uzun müddətdir gözlədiyin bir xəbər gələ bilər. Material məsələlərdə ağıllı planlaşdırma indi öz bəhrəsini verəcək.',68,62,80),
  ('Buğa','monthly','Bu ay əsaslı təməllər qurmaq vaxtıdır — iş və ev məsələlərində möhkəm addımlar at. Sevgi həyatında isə daha açıq olmaq münasibətlərini dərinləşdirəcək.',72,68,77),

  -- Əkizlər (Gemini)
  ('Əkizlər','daily','Zehnin bu gün adətən olduğundan da çevikdir — yeni fikirlər, söhbətlər və təkliflər səni həyəcanlandıracaq. Amma bir mövzuya fokuslanmaqda çətinlik çəkə bilərsən.',62,70,58),
  ('Əkizlər','weekly','Bu həftə ünsiyyət qabiliyyətin ön plana çıxır — danışıqlar, müsahibələr və ya yeni tanışlıqlar uğurlu keçəcək. Qərar verməzdən əvvəl bir az gözlə.',64,74,60),
  ('Əkizlər','monthly','Bu ay öyrənmə və inkişaf ayıdır — yeni bacarıq və ya sahəyə maraq göstərəcəksən. Maliyyədə dəyişkənlik ola bilər, ona görə ehtiyat büdcəsi saxla.',60,76,55),

  -- Xərçəng (Cancer)
  ('Xərçəng','daily','Hisslərin bu gün adətən olduğundan daha güclüdür — ailə və yaxınlarınla vaxt keçirmək sənə rahatlıq gətirəcək. İş yerində emosional qərar verməkdən çəkin.',78,60,65),
  ('Xərçəng','weekly','Bu həftə ev və ailə mövzuları diqqət mərkəzindədir — köhnə bir münasibəti düzəltmək üçün münasib zamandır. Maliyyə planında ehtiyatlı addımlar at.',80,58,63),
  ('Xərçəng','monthly','Bu ay emosional dərinlik və intuisiya sənə yol göstərəcək — qərarlarını ürəyinin səsinə görə ver. Karyerada sakit, amma davamlı irəliləyiş gözlənilir.',82,62,66),

  -- Aslan (Leo)
  ('Aslan','daily','Bu gün diqqət mərkəzində olacaqsan — xarizman və özünəinamın ətrafındakıları təsirləndirəcək. Səxavətli ol, amma büdcəni də nəzarətdə saxla.',68,82,58),
  ('Aslan','weekly','Bu həftə yaradıcı layihələr və ya təqdimatlar üçün ulduzlar səninlədir — özünü göstərmək fürsətini qaçırma. Cütlük münasibətlərində tərifə ehtiyac olduğunu unutma.',70,85,60),
  ('Aslan','monthly','Bu ay liderlik və tanınma ayıdır — zəhmətin nəhayət qiymətləndiriləcək. Sevgidə qürurunu bir az yumşaltmaq münasibətləri gücləndirəcək.',66,88,64),

  -- Qız (Virgo)
  ('Qız','daily','Təfərrüatlara diqqətin bu gün sənə böyük üstünlük verir — işdəki kiçik bir səhvi vaxtında tuta bilərsən. Özünü tənqid etməkdə ölçünü aşma.',55,80,70),
  ('Qız','weekly','Bu həftə təşkilatçılıq bacarığın sayəsində yığılmış işləri nizama salacaqsan. Sağlamlığına da diqqət ayırmağı unutma — fasilə vermək zəiflik deyil.',57,78,72),
  ('Qız','monthly','Bu ay praktiklik və planlaşdırma sənə uğur gətirəcək — uzunmüddətli hədəflər üçün konkret addımlar at. Münasibətlərdə mükəmməllik gözləməkdən bir az əl çək.',60,82,75),

  -- Tərəzi (Libra)
  ('Tərəzi','daily','Tarazlıq axtarışın bu gün münasibətlərdə özünü göstərir — mübahisəli bir məsələdə ədalətli vasitəçi ola bilərsən. Qərarsızlıq vaxt itkisinə səbəb olmasın.',75,65,60),
  ('Tərəzi','weekly','Bu həftə tərəfdaşlıq və əməkdaşlıq mövzuları önə çıxır — iş və ya şəxsi həyatda kiminləsə razılaşma əldə edəcəksən. Estetik zövqün yaradıcı işlərdə köməyinə çatacaq.',78,68,58),
  ('Tərəzi','monthly','Bu ay münasibətlər ayıdır — həm romantik, həm də peşəkar əlaqələrdə harmoniya qurmaq üçün əlverişli vaxtdır. Maliyyədə tərəfdaşlıq əsaslı qərarlar faydalı olacaq.',80,70,62),

  -- Əqrəb (Scorpio)
  ('Əqrəb','daily','Bu gün səthin altındakı həqiqəti görmək bacarığın güclənir — gizli qalan bir məsələ üzə çıxa bilər. Kimə etibar etdiyinə diqqət et.',72,75,68),
  ('Əqrəb','weekly','Bu həftə dərin dəyişikliklər üçün enerji toplayırsan — köhnə bir vərdişi və ya münasibəti arxada qoymaq vaxtı ola bilər. İş məsələlərində strategiyanı gizli saxla.',70,78,65),
  ('Əqrəb','monthly','Bu ay transformasiya ayıdır — maliyyə və ya karyerada köklü bir dəyişiklik baş verə bilər. Sevgidə ehtirasın güclüdür, amma qısqanclığa yer vermə.',74,80,70),

  -- Oxatan (Sagittarius)
  ('Oxatan','daily','Macəra hissi bu gün səni adi gündəlikdən uzaqlaşdırmaq istəyir — qısa bir səyahət və ya yeni təcrübə əhval-ruhiyyəni qaldıracaq. Vədlərini yerinə yetirməyi unutma.',65,72,58),
  ('Oxatan','weekly','Bu həftə üfüqlərini genişləndirən fürsətlər qarşına çıxa bilər — təhsil, səyahət və ya xaricdən təklif mövzusunda xəbər gözlə. Maliyyədə həddən artıq nikbin olma.',63,75,55),
  ('Oxatan','monthly','Bu ay genişlənmə və azadlıq ayıdır — yeni bir sahəyə addım atmaq üçün cəsarətin var. Münasibətlərdə sərbəstliyini qorumaqla bağlılıq arasında tarazlıq tap.',66,77,60),

  -- Oğlaq (Capricorn)
  ('Oğlaq','daily','Məsuliyyət hissi bu gün səni irəli aparır — planlaşdırdığın işi intizamla başa çatdıracaqsan. Özünə bir az mərhəmət göstərməyi unutma.',55,85,72),
  ('Oğlaq','weekly','Bu həftə zəhmətin nəticə verir — rəhbərlik tərəfindən diqqət çəkə bilərsən. Ailə ilə vaxt keçirməyə də yer aç, iş hər şey deyil.',53,88,75),
  ('Oğlaq','monthly','Bu ay karyera və nüfuz ayıdır — uzun müddətdir qurduğun strategiya bəhrəsini verməyə başlayır. Maliyyədə qənaətcil yanaşman sənə sabitlik gətirəcək.',56,90,78),

  -- Dolça (Aquarius)
  ('Dolça','daily','Orijinal fikirlərin bu gün diqqət çəkəcək — adi yoldan fərqli bir həll yolu təklif etmə vaxtıdır. Dostların dəstəyinə ehtiyac duysan, çəkinmədən müraciət et.',60,73,62),
  ('Dolça','weekly','Bu həftə sosial çevrən genişlənir — yeni tanışlıqlar və ya icma layihələri sənə ilham verəcək. Maliyyə məsələlərində qeyri-adi, amma işə yarayan bir yol tapacaqsan.',62,70,65),
  ('Dolça','monthly','Bu ay yenilik və müstəqillik ayıdır — ənənəvi qaydalardan kənara çıxıb öz yolunu getmək istəyin güclənir. Münasibətlərdə məsafəyə ehtiyac duysan, bunu açıq izah et.',58,75,63),

  -- Balıqlar (Pisces)
  ('Balıqlar','daily','Həssaslığın bu gün sənə başqalarının demədiyini hiss etmək imkanı verir — bu bacarığı yaradıcı işində istifadə et. Reallıqdan qaçmaqdansa, üzləş.',76,58,55),
  ('Balıqlar','weekly','Bu həftə xəyal gücün və intuisiyan güclüdür — sənət, musiqi və ya yazıya vaxt ayırsan, gözəl nəticələr alacaqsan. Pul məsələlərində real rəqəmlərə sadiq qal.',78,60,52),
  ('Balıqlar','monthly','Bu ay ruhani və yaradıcı inkişaf ayıdır — daxili səsini dinləmək sənə doğru istiqaməti göstərəcək. Sevgidə dərin bir bağlılıq qurmaq üçün əlverişli zamandır.',80,62,56)
) AS v(sign, period, content, love, career, finance)
ON CONFLICT (sign, period, period_start) DO UPDATE SET
  content = EXCLUDED.content,
  love = EXCLUDED.love,
  career = EXCLUDED.career,
  finance = EXCLUDED.finance;
