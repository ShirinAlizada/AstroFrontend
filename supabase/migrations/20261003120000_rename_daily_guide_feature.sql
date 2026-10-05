-- "Günün Bələdçisi" səhifəsi Vedik Panchang sistemindən (Tithi/Nakşatra/
-- Yoga/Karana) tam Qərb (tropik) astrologiyasına keçdi (bax: frontend-dəki
-- src/lib/daily-guide.ts). Standart paketin xüsusiyyət siyahısındaki köhnə
-- "Günün bələdçisi (Panchang)" sətri artıq doğru deyil — "(Panchang)"
-- qeydini çıxarırıq. array_replace yalnız eyni sətri tapıbsa dəyişdirir,
-- əks halda heç nəyə təsir etmir (idempotent).
UPDATE public.subscription_plans
SET features = array_replace(features, 'Günün bələdçisi (Panchang)', 'Günün bələdçisi')
WHERE key = 'standart';
