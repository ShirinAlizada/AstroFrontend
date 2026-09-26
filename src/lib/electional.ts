import type { PanchangToday, TithiType } from "./panchang";

/**
 * Klassik Muhurta (elektiv-astrologiya) qaydalarına əsaslanan gündəlik
 * tövsiyələr. Hər kateqoriya üçün əlverişlilik Tithi növü (Nanda/Bhadra/
 * Jaya/Rikta/Purna) və Nakşatranın təbiətinə (Sabit/Hərəkətli/Yumşaq/
 * Kəskin/Sürətli) görə müəyyənləşir — bunlar ənənəvi Pançanq
 * təqvimlərində istifadə olunan tanınmış təsnifatlardır.
 */

export type Verdict = "əlverişli" | "neytral" | "ehtiyatlı ol";

export interface GuidanceItem {
  category: string;
  verdict: Verdict;
  reason: string;
}

function tithiFavors(type: TithiType, favorable: TithiType[], unfavorable: TithiType[]): Verdict {
  if (favorable.includes(type)) return "əlverişli";
  if (unfavorable.includes(type)) return "ehtiyatlı ol";
  return "neytral";
}

function combine(a: Verdict, b: Verdict): Verdict {
  if (a === "ehtiyatlı ol" || b === "ehtiyatlı ol") return "ehtiyatlı ol";
  if (a === "əlverişli" && b === "əlverişli") return "əlverişli";
  return "neytral";
}

export function dailyGuidance(p: PanchangToday): GuidanceItem[] {
  const items: GuidanceItem[] = [];

  // Diş / kiçik tibbi müdaxilələr (kəsmə-çıxarma xarakterli işlər)
  {
    const tithiV = tithiFavors(p.tithiType, ["Rikta"], ["Purna"]);
    const nakV: Verdict = p.nakshatraQuality === "Kəskin" ? "əlverişli" : p.nakshatraQuality === "Yumşaq" ? "ehtiyatlı ol" : "neytral";
    const verdict = combine(tithiV, nakV);
    items.push({
      category: "Diş",
      verdict,
      reason:
        verdict === "əlverişli"
          ? `${p.tithiName} tithisi və ${p.nakshatraName} nakşatrasının kəskin təbiəti "çıxarma" xarakterli müdaxilələr üçün ənənəvi olaraq münasibdir.`
          : verdict === "ehtiyatlı ol"
            ? `${p.tithiName} (Purna) tamamlanma tithisidir — kəsmə/çıxarma xarakterli işlərə ənənəvi olaraq tövsiyə edilmir, təxirə salmaq düşünülə bilər.`
            : `Bu gün nə xüsusi əlverişli, nə də əngəlləyici bir kombinasiyadır — adi ehtiyat kifayətdir.`,
    });
  }

  // Əmlak, torpaq işləri (təməl, tikinti, daşınmaz əmlak)
  {
    const tithiV = tithiFavors(p.tithiType, ["Bhadra"], ["Rikta"]);
    const nakV: Verdict = p.nakshatraQuality === "Sabit" ? "əlverişli" : p.nakshatraQuality === "Hərəkətli" ? "ehtiyatlı ol" : "neytral";
    const verdict = combine(tithiV, nakV);
    items.push({
      category: "Əmlak, Torpaq işləri",
      verdict,
      reason:
        verdict === "əlverişli"
          ? `${p.nakshatraName} (Sabit) nakşatrası təməl və daşınmaz əmlakla bağlı davamlı qərarlar üçün klassik olaraq güclü sayılır.`
          : verdict === "ehtiyatlı ol"
            ? `${p.nakshatraName} nakşatrasının hərəkətli təbiəti sabitlik tələb edən əmlak addımları üçün ideal deyil — daha sabit günü gözləmək olar.`
            : `Neytral gündür — böyük qərarları başqa əlamətlərlə də dəstəklə.`,
    });
  }

  // Sənəd, Rəsmi işlər
  {
    const tithiV = tithiFavors(p.tithiType, ["Purna", "Jaya"], ["Rikta"]);
    const nakV: Verdict = p.nakshatraQuality === "Sürətli" ? "əlverişli" : "neytral";
    const verdict = combine(tithiV, nakV);
    items.push({
      category: "Sənəd, Rəsmi işlər",
      verdict,
      reason:
        verdict === "əlverişli"
          ? `${p.tithiName} tithisi tamamlanma/uğur enerjisi daşıyır — imza, müraciət və rəsmi addımlar üçün əlverişlidir.`
          : verdict === "ehtiyatlı ol"
            ? `Rikta ("boş") tithi ənənəvi olaraq vacib sənəd və rəsmi başlanğıclar üçün tövsiyə edilmir.`
            : `Orta əlverişlilik — təcili deyilsə, sabaha saxlamaq da olar.`,
    });
  }

  // Ev işləri, Təmizlik
  {
    const tithiV: Verdict = p.tithiType === "Nanda" ? "əlverişli" : p.tithiType === "Rikta" ? "neytral" : "neytral";
    const nakV: Verdict = p.nakshatraQuality === "Yumşaq" ? "əlverişli" : p.nakshatraQuality === "Kəskin" ? "neytral" : "neytral";
    const verdict = combine(tithiV, nakV);
    items.push({
      category: "Ev İşləri, Təmizlik",
      verdict,
      reason:
        verdict === "əlverişli"
          ? `${p.nakshatraName} nakşatrasının yumşaq təbiəti ev harmoniyası və nizam-intizam işləri üçün münasibdir.`
          : `Adi gündəlik ev işləri üçün maneə yoxdur.`,
    });
  }

  return items;
}
