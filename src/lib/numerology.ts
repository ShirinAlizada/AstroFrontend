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

export const NUMBER_MEANINGS_AZ: Record<number, { title: string; text: string }> = {
  1: { title: "Lider", text: "Müstəqillik, təşəbbüskarlıq və yeni başlanğıclar. Öndə getmək, öz yolunu yaratmaq bacarığı." },
  2: { title: "Diplomat", text: "Əməkdaşlıq, həssaslıq və tarazlıq. Münasibətlərdə körpü qurmaq, səbrlə dinləmək." },
  3: { title: "Yaradıcı", text: "İfadə, ünsiyyət və optimizm. Sənət, söz və özünü göstərmək enerjisi." },
  4: { title: "Quruculu", text: "Nizam, sabitlik və zəhmətkeşlik. Möhkəm təməl qurmaq, ardıcıl addımlar." },
  5: { title: "Sərgərdan", text: "Azadlıq, dəyişkənlik və macəra. Yenilik axtarışı, çevik düşüncə." },
  6: { title: "Qoruyucu", text: "Məsuliyyət, qayğı və ailə dəyərləri. Harmoniya yaratmaq, xidmət etmək." },
  7: { title: "Axtarıcı", text: "Dərinlik, təhlil və mənəvi axtarış. Tənhalıqda güc tapmaq, həqiqəti araşdırmaq." },
  8: { title: "Təşkilatçı", text: "Güc, maddi uğur və idarəetmə. Böyük layihələri həyata keçirmək bacarığı." },
  9: { title: "Humanist", text: "Şəfqət, geniş baxış və tamamlanma. Başqalarına xidmət, universal sevgi." },
  11: { title: "İntuitiv usta (Master)", text: "Yüksək intuisiya və ilham mənbəyi. Mənəvi rəhbərlik potensialı — tarazlıq tələb edir." },
  22: { title: "Böyük qurucu (Master)", text: "Böyük ideyaları reallığa çevirmək gücü. Vizyonu konkret nəticəyə çatdırmaq." },
  33: { title: "Mənəvi müəllim (Master)", text: "Qeydsiz-şərtsiz qayğı və fədakarlıq. Başqalarını ruhən yüksəltmək missiyası." },
};
