import type { Lang } from "@/lib/i18n/translations";

/**
 * Piфaqor (Pythagorean) numerologiya sistemi.
 *
 * Standart Pifaqor hərf-ədəd cədvəli (ingilis əlifbası üçün klassik sxem):
 *   1=A J S   2=B K T   3=C L U   4=D M V   5=E N W   6=F O X   7=G P Y   8=H Q Z   9=I R
 *
 * Azərbaycan əlifbasının latın olmayan/əlavə hərfləri fonetik qarşılığına görə
 * eyni sütuna yerləşdirilib (məs. Ə→E, Ç→C, Ş→S, Ö→O, Ü→U, Ğ→G, İ→I, I→U-ya yaxın səs).
 * Bu, adların dəqiq ədədini hesablamaq üçün beynəlxalq numerologiyada
 * qəbul olunan adaptasiya üsuludur.
 */
const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1, ş: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3, ü: 3, ç: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, ə: 5,
  f: 6, o: 6, x: 6, ö: 6,
  g: 7, p: 7, y: 7, ğ: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9, ı: 3, İ: 9,
};

const VOWELS = new Set(["a", "e", "ə", "i", "ı", "o", "ö", "u", "ü"]);

const MASTER_NUMBERS = new Set([11, 22, 33]);

function reduceNumber(n: number, keepMaster = true): number {
  let value = n;
  while (value > 9 && !(keepMaster && MASTER_NUMBERS.has(value))) {
    value = String(value)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return value;
}

function letterValue(ch: string): number {
  return LETTER_VALUES[ch.toLowerCase()] ?? 0;
}

export interface NumerologyProfile {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthday: number;
}

export interface BirthDateInput {
  date: string; // YYYY-MM-DD
}

export function lifePathNumber(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "").split("").map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceNumber(sum);
}

export function birthdayNumber(dateStr: string): number {
  const [, , d] = dateStr.split("-").map(Number);
  return reduceNumber(d ?? 1);
}

export function destinyNumber(fullName: string): number {
  const letters = fullName.replace(/[^a-zA-ZəıöüçşğƏİÖÜÇŞĞ]/g, "");
  const sum = letters.split("").reduce((s, ch) => s + letterValue(ch), 0);
  return reduceNumber(sum);
}

export function soulUrgeNumber(fullName: string): number {
  const letters = fullName.replace(/[^a-zA-ZəıöüçşğƏİÖÜÇŞĞ]/g, "");
  const sum = letters
    .split("")
    .filter((ch) => VOWELS.has(ch.toLowerCase()))
    .reduce((s, ch) => s + letterValue(ch), 0);
  return reduceNumber(sum);
}

export function personalityNumber(fullName: string): number {
  const letters = fullName.replace(/[^a-zA-ZəıöüçşğƏİÖÜÇŞĞ]/g, "");
  const sum = letters
    .split("")
    .filter((ch) => !VOWELS.has(ch.toLowerCase()))
    .reduce((s, ch) => s + letterValue(ch), 0);
  return reduceNumber(sum);
}

export function computeNumerology(fullName: string, dateStr: string): NumerologyProfile {
  return {
    lifePath: lifePathNumber(dateStr),
    destiny: destinyNumber(fullName),
    soulUrge: soulUrgeNumber(fullName),
    personality: personalityNumber(fullName),
    birthday: birthdayNumber(dateStr),
  };
}

/**
 * Yetkinlik (Maturity) ədədi — Həyat yolu və Tale ədədlərinin cəmindən alınır.
 * Həyatın ikinci yarısında üzə çıxan, "əsl potensial" sayılan ədəd.
 */
export function maturityNumber(lifePath: number, destiny: number): number {
  return reduceNumber(lifePath + destiny);
}

/**
 * Şəxsi il ədədi — doğum günü + doğum ayı + hədəf ilin rəqəmləri. `keepMaster`
 * yoxdur (klassik konvensiyaya görə şəxsi il həmişə 1-9 arasına endirilir).
 */
export function personalYearNumber(dateStr: string, forYear?: number): number {
  const [, mo, d] = dateStr.split("-").map(Number);
  const year = forYear ?? new Date().getFullYear();
  const digits = `${d ?? 1}${mo ?? 1}${year}`.split("").map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceNumber(sum, false);
}

export interface NumberMeaning {
  title: Record<Lang, string>;
  text: Record<Lang, string>;
  keywords: Record<Lang, string[]>;
  /** Bu əsas ədədlə təbii uyğunluq göstərən digər əsas ədədlər. */
  compatible: number[];
}

export const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    title: { az: "Lider", en: "Leader", ru: "Лидер" },
    text: {
      az: "Müstəqillik, təşəbbüskarlıq və yeni başlanğıclar. Öndə getmək, öz yolunu yaratmaq bacarığı.",
      en: "Independence, initiative and new beginnings. The drive to go first and carve your own path.",
      ru: "Независимость, инициативность и новые начинания. Стремление идти первым и прокладывать свой путь.",
    },
    keywords: {
      az: ["Liderlik", "Müstəqillik", "Təşəbbüs"],
      en: ["Leadership", "Independence", "Initiative"],
      ru: ["Лидерство", "Независимость", "Инициатива"],
    },
    compatible: [3, 5],
  },
  2: {
    title: { az: "Diplomat", en: "Diplomat", ru: "Дипломат" },
    text: {
      az: "Əməkdaşlıq, həssaslıq və tarazlıq. Münasibətlərdə körpü qurmaq, səbrlə dinləmək.",
      en: "Cooperation, sensitivity and balance. A gift for building bridges and listening with patience.",
      ru: "Сотрудничество, чуткость и баланс. Дар строить мосты и терпеливо слушать.",
    },
    keywords: {
      az: ["Əməkdaşlıq", "Həssaslıq", "Tarazlıq"],
      en: ["Cooperation", "Sensitivity", "Balance"],
      ru: ["Сотрудничество", "Чуткость", "Баланс"],
    },
    compatible: [6, 9],
  },
  3: {
    title: { az: "Yaradıcı", en: "Creative", ru: "Творец" },
    text: {
      az: "İfadə, ünsiyyət və optimizm. Sənət, söz və özünü göstərmək enerjisi.",
      en: "Expression, communication and optimism. The energy of art, words and showing yourself to the world.",
      ru: "Самовыражение, общение и оптимизм. Энергия искусства, слова и умения проявить себя.",
    },
    keywords: {
      az: ["İfadə", "Ünsiyyət", "Optimizm"],
      en: ["Expression", "Communication", "Optimism"],
      ru: ["Самовыражение", "Общение", "Оптимизм"],
    },
    compatible: [1, 5],
  },
  4: {
    title: { az: "Quruculu", en: "Builder", ru: "Строитель" },
    text: {
      az: "Nizam, sabitlik və zəhmətkeşlik. Möhkəm təməl qurmaq, ardıcıl addımlar.",
      en: "Order, stability and hard work. Laying solid foundations and moving forward step by step.",
      ru: "Порядок, стабильность и трудолюбие. Умение закладывать прочный фундамент и идти к цели шаг за шагом.",
    },
    keywords: {
      az: ["Nizam", "Sabitlik", "Zəhmət"],
      en: ["Order", "Stability", "Discipline"],
      ru: ["Порядок", "Стабильность", "Труд"],
    },
    compatible: [7, 8],
  },
  5: {
    title: { az: "Sərgərdan", en: "Wanderer", ru: "Странник" },
    text: {
      az: "Azadlıq, dəyişkənlik və macəra. Yenilik axtarışı, çevik düşüncə.",
      en: "Freedom, change and adventure. A restless search for novelty and a flexible mind.",
      ru: "Свобода, перемены и приключения. Неутомимый поиск нового и гибкость мышления.",
    },
    keywords: {
      az: ["Azadlıq", "Dəyişkənlik", "Macəra"],
      en: ["Freedom", "Change", "Adventure"],
      ru: ["Свобода", "Перемены", "Приключения"],
    },
    compatible: [1, 3],
  },
  6: {
    title: { az: "Qoruyucu", en: "Guardian", ru: "Хранитель" },
    text: {
      az: "Məsuliyyət, qayğı və ailə dəyərləri. Harmoniya yaratmaq, xidmət etmək.",
      en: "Responsibility, care and family values. Creating harmony and being of service to others.",
      ru: "Ответственность, забота и семейные ценности. Умение создавать гармонию и служить другим.",
    },
    keywords: {
      az: ["Məsuliyyət", "Qayğı", "Ailə"],
      en: ["Responsibility", "Care", "Family"],
      ru: ["Ответственность", "Забота", "Семья"],
    },
    compatible: [2, 9],
  },
  7: {
    title: { az: "Axtarıcı", en: "Seeker", ru: "Искатель" },
    text: {
      az: "Dərinlik, təhlil və mənəvi axtarış. Tənhalıqda güc tapmaq, həqiqəti araşdırmaq.",
      en: "Depth, analysis and a spiritual search. Finding strength in solitude and uncovering the truth.",
      ru: "Глубина, анализ и духовный поиск. Умение находить силу в одиночестве и доходить до истины.",
    },
    keywords: {
      az: ["Dərinlik", "Təhlil", "Mənəviyyat"],
      en: ["Depth", "Analysis", "Spirituality"],
      ru: ["Глубина", "Анализ", "Духовность"],
    },
    compatible: [4, 8],
  },
  8: {
    title: { az: "Təşkilatçı", en: "Organizer", ru: "Организатор" },
    text: {
      az: "Güc, maddi uğur və idarəetmə. Böyük layihələri həyata keçirmək bacarığı.",
      en: "Power, material success and management. The ability to carry out big projects and lead.",
      ru: "Сила, материальный успех и управление. Способность реализовывать крупные проекты и вести за собой.",
    },
    keywords: {
      az: ["Güc", "Maddi uğur", "İdarəetmə"],
      en: ["Power", "Material success", "Management"],
      ru: ["Сила", "Материальный успех", "Управление"],
    },
    compatible: [4, 7],
  },
  9: {
    title: { az: "Humanist", en: "Humanitarian", ru: "Гуманист" },
    text: {
      az: "Şəfqət, geniş baxış və tamamlanma. Başqalarına xidmət, universal sevgi.",
      en: "Compassion, a broad perspective and completion. Serving others with a universal kind of love.",
      ru: "Сострадание, широкий взгляд и завершение. Служение другим во имя всеобщей любви.",
    },
    keywords: {
      az: ["Şəfqət", "Geniş baxış", "Tamamlanma"],
      en: ["Compassion", "Broad perspective", "Completion"],
      ru: ["Сострадание", "Широкий взгляд", "Завершение"],
    },
    compatible: [2, 6],
  },
  11: {
    title: { az: "İntuitiv usta (Master)", en: "Intuitive Master", ru: "Интуитивный мастер" },
    text: {
      az: "Yüksək intuisiya və ilham mənbəyi. Mənəvi rəhbərlik potensialı — tarazlıq tələb edir.",
      en: "High intuition and a source of inspiration. Potential for spiritual guidance — balance is required.",
      ru: "Высокая интуиция и источник вдохновения. Потенциал духовного наставничества — требует баланса.",
    },
    keywords: {
      az: ["İntuisiya", "İlham", "Mənəvi rəhbərlik"],
      en: ["Intuition", "Inspiration", "Spiritual guidance"],
      ru: ["Интуиция", "Вдохновение", "Духовное наставничество"],
    },
    compatible: [2, 6],
  },
  22: {
    title: { az: "Böyük qurucu (Master)", en: "Master Builder", ru: "Великий строитель" },
    text: {
      az: "Böyük ideyaları reallığa çevirmək gücü. Vizyonu konkret nəticəyə çatdırmaq.",
      en: "The power to turn big ideas into reality. Carrying a vision all the way to a concrete result.",
      ru: "Сила превращать большие идеи в реальность. Умение довести видение до конкретного результата.",
    },
    keywords: {
      az: ["Vizyon", "Reallaşdırma", "Böyük ideyalar"],
      en: ["Vision", "Realization", "Big ideas"],
      ru: ["Видение", "Реализация", "Большие идеи"],
    },
    compatible: [4, 8],
  },
  33: {
    title: { az: "Mənəvi müəllim (Master)", en: "Master Teacher", ru: "Духовный учитель" },
    text: {
      az: "Qeydsiz-şərtsiz qayğı və fədakarlıq. Başqalarını ruhən yüksəltmək missiyası.",
      en: "Unconditional care and devotion. A mission to spiritually uplift others.",
      ru: "Безусловная забота и самоотдача. Миссия духовно возвышать других.",
    },
    keywords: {
      az: ["Fədakarlıq", "Qayğı", "Ruhən yüksəltmə"],
      en: ["Devotion", "Care", "Spiritual upliftment"],
      ru: ["Самоотдача", "Забота", "Духовное возвышение"],
    },
    compatible: [6, 9],
  },
};

/** Verilmiş əsas ədədin (1-9, 11, 22, 33) seçilmiş dildəki mənasını qaytarır. */
export function localizedNumberMeaning(
  n: number,
  lang: Lang,
): { title: string; text: string; keywords: string[]; compatible: number[] } | undefined {
  const m = NUMBER_MEANINGS[n];
  if (!m) return undefined;
  return { title: m.title[lang], text: m.text[lang], keywords: m.keywords[lang], compatible: m.compatible };
}

/** Şəxsi il ədədinin (1-9) qısa mövzusu. */
const PERSONAL_YEAR_THEMES: Record<number, Record<Lang, string>> = {
  1: {
    az: "Yeni başlanğıclar ili — toxum əkmə vaxtıdır.",
    en: "A year of new beginnings — time to plant the seeds.",
    ru: "Год новых начинаний — время сажать семена.",
  },
  2: {
    az: "Səbr və əməkdaşlıq ili — münasibətlər önə çıxır.",
    en: "A year of patience and partnership — relationships take the lead.",
    ru: "Год терпения и сотрудничества — на первом плане отношения.",
  },
  3: {
    az: "Yaradıcılıq və ünsiyyət ili — özünü ifadə et.",
    en: "A year of creativity and self-expression — let yourself be seen.",
    ru: "Год творчества и общения — время проявить себя.",
  },
  4: {
    az: "Zəhmət və quruculuq ili — möhkəm təməl qur.",
    en: "A year of discipline and building — lay a solid foundation.",
    ru: "Год труда и строительства — закладывай прочный фундамент.",
  },
  5: {
    az: "Dəyişiklik və azadlıq ili — gözlənilməzliyə açıq ol.",
    en: "A year of change and freedom — stay open to the unexpected.",
    ru: "Год перемен и свободы — будь открыт неожиданностям.",
  },
  6: {
    az: "Məsuliyyət və ailə ili — ev və münasibətlər önəmlidir.",
    en: "A year of responsibility and family — home and relationships matter most.",
    ru: "Год ответственности и семьи — дом и отношения выходят на первый план.",
  },
  7: {
    az: "Dərinləşmə və düşüncə ili — içinə çək, araşdır.",
    en: "A year of reflection and inner work — turn inward and explore.",
    ru: "Год размышлений и внутренней работы — обратись внутрь себя.",
  },
  8: {
    az: "Güc və nailiyyət ili — zəhmətin bəhrəsini yığırsan.",
    en: "A year of power and achievement — you reap what you've sown.",
    ru: "Год силы и достижений — пора собирать плоды труда.",
  },
  9: {
    az: "Tamamlanma ili — buraxmaq və yekunlaşdırmaq vaxtıdır.",
    en: "A year of completion — time to let go and close a chapter.",
    ru: "Год завершения — время отпускать и подводить итоги.",
  },
};

export function localizedPersonalYearTheme(n: number, lang: Lang): string {
  return PERSONAL_YEAR_THEMES[n]?.[lang] ?? "";
}
