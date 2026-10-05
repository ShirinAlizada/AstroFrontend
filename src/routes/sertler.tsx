import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/Page";

export const Route = createFileRoute("/sertler")({
  head: () => ({
    meta: [
      { title: "İstifadə şərtləri — Virgo Astrology" },
      { name: "description", content: "Virgo Astrology platformasının istifadə şərtləri və qaydaları." },
    ],
  }),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-goldsoft mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-white/85">{children}</div>
    </section>
  );
}

function TermsPage() {
  return (
    <Page>
      <PageHeader
        kicker="Hüquqi"
        title="İstifadə şərtləri"
        subtitle="Son yenilənmə: 2026. Virgo Astrology-dən istifadə etməklə aşağıdakı şərtləri qəbul etmiş olursunuz."
      />

      <div className="max-w-3xl">
        <Section title="1. Ümumi müddəalar">
          <p>
            Bu sənəd Virgo Astrology veb saytı və tətbiqinin ("Platforma", "biz") istifadəsinə dair şərtləri
            müəyyən edir. Platformadan istifadə edərək, bu şərtlərlə razılaşdığınızı təsdiq edirsiniz. Şərtlərlə
            razı deyilsinizsə, Platformadan istifadə etməməyinizi xahiş edirik.
          </p>
        </Section>

        <Section title="2. Xidmətin təsviri">
          <p>
            Platforma aşağıdakı xidmətləri təklif edir: gündəlik/həftəlik/aylıq horoskoplar, doğum (natal) xəritəsi
            hesablamaları, numerologiya və uyğunluq analizləri, qeydiyyatlı astroloqlarla yazılı və ya canlı
            məsləhət sessiyaları, tarot kartları, kristallar, şam və kitab satışı olan mağaza, pullu abunəlik
            paketləri, istifadəçi forumu, şəxsi jurnal və süni intellekt dəstəkli astroloji söhbət köməkçisi.
          </p>
        </Section>

        <Section title="3. Astroloji məzmunun xarakteri">
          <p>
            Platformada təqdim olunan horoskop, natal xəritə, uyğunluq və digər astroloji məzmun yalnız
            <strong> əyləncə və ümumi məlumatlandırma</strong> məqsədi daşıyır. Bu məzmun elmi faktlara əsaslanmır
            və tibbi, hüquqi, maliyyə və ya psixoloji məsləhət əvəzi deyil. Mühüm qərarlar (sağlamlıq, maliyyə,
            hüquqi məsələlər) üçün müvafiq sahə üzrə ixtisaslı mütəxəssisə müraciət etməyiniz tövsiyə olunur.
          </p>
        </Section>

        <Section title="4. Hesab və qeydiyyat">
          <ul className="list-disc pl-5 space-y-1">
            <li>Hesab yaratmaq üçün düzgün və aktual məlumat verməyiniz tələb olunur.</li>
            <li>Hesabınızın təhlükəsizliyinə (şifrənizin məxfiliyinə) görə özünüz məsuliyyət daşıyırsınız.</li>
            <li>Hesabınızdan edilən bütün fəaliyyətə görə siz məsuliyyət daşıyırsınız.</li>
            <li>Şübhəli fəaliyyət aşkar etdikdə bizimlə dərhal əlaqə saxlamalısınız.</li>
          </ul>
        </Section>

        <Section title="5. Forum və istifadəçi davranışı">
          <p>
            Forum bölməsində paylaşılan rəy və şərhlər müəlliflərinin öz fikirləridir, Platformanın mövqeyini əks
            etdirmir. Təhqiramiz, qanunsuz, spam xarakterli və ya başqa istifadəçilərin hüquqlarını pozan məzmun
            paylaşmaq qadağandır. Belə məzmun bildiriş olmadan silinə, müvafiq hesab isə məhdudlaşdırıla bilər.
          </p>
        </Section>

        <Section title="6. Ödənişlər və sifarişlər">
          <p>
            Mağaza sifarişləri və abunəlik ödənişləri sifariş zamanı göstərilən qiymətlər üzərindən həyata
            keçirilir. Sifariş statusu "Sifarişlərim" bölməsindən izlənilə bilər. Ləğv etmə və geri qaytarma
            şərtləri məhsul/xidmət növünə görə dəyişə bilər — konkret sual üçün əlaqə formundan bizə yazın.
          </p>
        </Section>

        <Section title="7. Əqli mülkiyyət">
          <p>
            Platformadakı məzmun (mətnlər, dizayn, loqo, məqalələr) Virgo Astrology-ə və ya müvafiq müəlliflərə
            məxsusdur. Yazılı icazə olmadan kommersiya məqsədilə köçürülə, çoxaldıla və ya yayıla bilməz.
          </p>
        </Section>

        <Section title="8. Məsuliyyətin məhdudlaşdırılması">
          <p>
            Platforma "olduğu kimi" təqdim olunur. Astroloji proqnozların dəqiqliyinə görə, həmçinin Platformanın
            istifadəsi nəticəsində yarana biləcək birbaşa və ya dolayı zərərə görə məsuliyyət daşımırıq, qanunun
            icazə verdiyi maksimum həddə.
          </p>
        </Section>

        <Section title="9. Şərtlərin dəyişdirilməsi">
          <p>
            Bu şərtlər zaman-zaman yenilənə bilər. Əhəmiyyətli dəyişikliklər barədə sayt üzərindən məlumat
            veriləcək. Dəyişiklikdən sonra Platformadan istifadəni davam etdirmək yenilənmiş şərtlərin qəbulu
            deməkdir.
          </p>
        </Section>

        <Section title="10. Əlaqə">
          <p>
            Sualınız varsa, <Link to="/metnu" className="text-goldsoft hover:text-gold underline">əlaqə formu</Link>{" "}
            vasitəsilə bizimlə əlaqə saxlaya bilərsiniz.
          </p>
        </Section>
      </div>
    </Page>
  );
}
