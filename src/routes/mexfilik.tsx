import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/Page";

export const Route = createFileRoute("/mexfilik")({
  head: () => ({
    meta: [
      { title: "Məxfilik siyasəti — Virgo Astrology" },
      { name: "description", content: "Virgo Astrology platformasının məxfilik siyasəti: hansı məlumatları topluyuruq və necə istifadə edirik." },
    ],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-goldsoft mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-white/85">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <Page>
      <PageHeader
        kicker="Hüquqi"
        title="Məxfilik siyasəti"
        subtitle="Son yenilənmə: 2026. Məlumatlarınızın necə toplandığını və istifadə olunduğunu bu səhifədə izah edirik."
      />

      <div className="max-w-3xl">
        <Section title="1. Hansı məlumatları topluyuruq">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Hesab məlumatları:</strong> ad, e-poçt ünvanı, (seçimlə) profil şəkli.</li>
            <li><strong>Astroloji məlumatlar:</strong> doğum tarixi, saatı və yeri (natal xəritə hesablamaq üçün) — yalnız sizin təqdim etdiyiniz halda.</li>
            <li><strong>Sifariş məlumatları:</strong> ad, telefon, çatdırılma ünvanı (mağaza sifarişləri üçün).</li>
            <li><strong>Əlaqə formu:</strong> ad, e-poçt və yazdığınız mesaj.</li>
            <li><strong>İstifadə məlumatları:</strong> forum paylaşımları, jurnal qeydləri (şəxsi, yalnız sizə görünür), AI söhbət tarixçəsi.</li>
            <li><strong>Texniki məlumatlar:</strong> brauzer push bildiriş abunəliyi (yalnız icazə verdiyiniz halda).</li>
          </ul>
        </Section>

        <Section title="2. Məlumatlardan necə istifadə edirik">
          <ul className="list-disc pl-5 space-y-1">
            <li>Xidməti göstərmək üçün (horoskop, natal xəritə, sifariş emalı, astroloqla sessiya).</li>
            <li>Sifariş statusu, forum cavabı və digər hadisələr barədə sizə bildiriş (in-app, push, e-poçt) göndərmək üçün.</li>
            <li>Dəstək tələblərinizə cavab vermək üçün.</li>
            <li>Platformanı təkmilləşdirmək üçün ümumi, şəxsiləşdirilməmiş statistika şəklində.</li>
          </ul>
          <p>Məlumatlarınızı heç bir halda üçüncü tərəflərə satmırıq.</p>
        </Section>

        <Section title="3. Cookies və brauzer yaddaşı (localStorage)">
          <p>
            Platforma giriş sessiyasını, dil seçiminizi, səbət və sevimlilər siyahınızı brauzerinizin yaddaşında
            (localStorage) saxlayır. Bu məlumatlar yalnız sizin cihazınızda qalır və hesabınızı silməyincə və ya
            brauzer yaddaşını təmizləməyincə saxlanılır. Marketinq məqsədli izləmə cookie-lərindən istifadə etmirik.
          </p>
        </Section>

        <Section title="4. Push bildirişlər">
          <p>
            Zəng (bildiriş) menyusundan "Bildirişlərə icazə ver" düyməsinə basdıqda, brauzeriniz bizə bildiriş
            göndərmək üçün unikal bir abunəlik ünvanı yaradır — bu, sizi şəxsən tanıtmır, yalnız həmin brauzer
            profilinə bildiriş çatdırmağa xidmət edir. İstənilən vaxt brauzer tənzimləmələrindən və ya eyni
            düymədən icazəni geri ala bilərsiniz.
          </p>
        </Section>

        <Section title="5. Üçüncü tərəf xidmətləri">
          <p>
            Platformanı işlətmək üçün etibarlı infrastruktur provayderlərindən istifadə edirik: verilənlər bazası
            və autentifikasiya üçün Supabase, tranzaksiya e-poçtları üçün Resend, brauzer push bildirişləri üçün
            Web Push standartı (Google/Mozilla kimi brauzer istehsalçılarının push xidmətləri vasitəsilə). Bu
            provayderlər məlumatlarınızı yalnız bizim adımızdan xidməti yerinə yetirmək üçün emal edir.
          </p>
        </Section>

        <Section title="6. Məlumatların saxlanması">
          <p>
            Məlumatlarınızı hesabınız aktiv olduğu müddətdə saxlayırıq. Hesabınızı silməyi tələb etdikdə, qanuni
            saxlama öhdəliyi olmayan bütün şəxsi məlumatlarınız (jurnal qeydləri, sifariş tarixçəsi istisna ola
            bilər) ağlabatan müddət ərzində silinir.
          </p>
        </Section>

        <Section title="7. Sizin hüquqlarınız">
          <ul className="list-disc pl-5 space-y-1">
            <li>Hansı məlumatlarınızın saxlanıldığını öyrənmək hüququ.</li>
            <li>Yanlış məlumatın düzəldilməsini tələb etmək hüququ.</li>
            <li>Hesabınızın və əlaqəli məlumatların silinməsini tələb etmək hüququ.</li>
            <li>Push bildirişlər və e-poçt bildirişlərindən istənilən vaxt imtina etmək hüququ.</li>
          </ul>
          <p>Bu hüquqlardan istifadə etmək üçün əlaqə formundan bizə müraciət edə bilərsiniz.</p>
        </Section>

        <Section title="8. Uşaqların məxfiliyi">
          <p>Platforma 18 yaşdan kiçik şəxslər üçün nəzərdə tutulmayıb və onlardan şüurlu şəkildə məlumat toplamırıq.</p>
        </Section>

        <Section title="9. Dəyişikliklər">
          <p>
            Bu siyasət zaman-zaman yenilənə bilər. Əhəmiyyətli dəyişikliklər sayt üzərindən elan olunacaq.
          </p>
        </Section>

        <Section title="10. Əlaqə">
          <p>
            Məxfiliklə bağlı sualınız varsa,{" "}
            <Link to="/metnu" className="text-goldsoft hover:text-gold underline">əlaqə formu</Link> vasitəsilə
            bizə yaza bilərsiniz.
          </p>
        </Section>
      </div>
    </Page>
  );
}
