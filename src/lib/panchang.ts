import { Origin, Horoscope } from "circular-natal-horoscope-js";

/**
 * Vedik Pançanq (Panchang) hesablamaları — real astronomik mövqeyə
 * (Günəş və Ayın tropik ekliptik uzunluğuna) əsaslanır, sonra Lahiri
 * ayanamsasına görə sidereal uzunluğa çevrilir. Klassik elektiv-astrologiya
 * (Muhurta) sistemi beş "əsas" (Panchanga) üzərində qurulur: Tithi, Vara,
 * Nakşatra, Yoga, Karana.
 *
 * Qeyd: Ayanamsa üçün Lahiri sisteminin xətti approksimasiyası istifadə
 * olunur (illik ~50.29" sürüşmə). Bu, gündəlik bələdçi məqsədləri üçün
 * kifayət qədər dəqiqdir, lakin peşəkar Panchang təqvimləri ilə bir neçə
 * dəqiqəlik fərq ola bilər.
 */

const LAHIRI_AYANAMSA_2000 = 23.85; // 2000-01-01 üçün, dərəcə
const AYANAMSA_RATE_PER_YEAR = 50.29 / 3600; // dərəcə/il (~0.013969°)

function ayanamsa(date: Date): number {
  const year = date.getUTCFullYear() + date.getUTCMonth() / 12;
  return LAHIRI_AYANAMSA_2000 + (year - 2000) * AYANAMSA_RATE_PER_YEAR;
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export const TITHI_NAMES_AZ = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya",
] as const;

export type TithiType = "Nanda" | "Bhadra" | "Jaya" | "Rikta" | "Purna";

const TITHI_TYPE_BY_MOD5: TithiType[] = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"];

export const NAKSHATRAS_AZ: { name: string; quality: string } [] = [
  { name: "Aşvini", quality: "Sürətli" },
  { name: "Bharani", quality: "Kəskin" },
  { name: "Krittika", quality: "Kəskin" },
  { name: "Rohini", quality: "Sabit" },
  { name: "Mriqaşira", quality: "Yumşaq" },
  { name: "Ardra", quality: "Kəskin" },
  { name: "Punarvasu", quality: "Hərəkətli" },
  { name: "Puşya", quality: "Sürətli" },
  { name: "Aşleşa", quality: "Kəskin" },
  { name: "Maqha", quality: "Kəskin" },
  { name: "Purva Falquni", quality: "Kəskin" },
  { name: "Uttara Falquni", quality: "Sabit" },
  { name: "Hasta", quality: "Sürətli" },
  { name: "Çitra", quality: "Yumşaq" },
  { name: "Svati", quality: "Hərəkətli" },
  { name: "Vişaxa", quality: "Kəskin" },
  { name: "Anuradha", quality: "Yumşaq" },
  { name: "Cyeştha", quality: "Kəskin" },
  { name: "Mula", quality: "Kəskin" },
  { name: "Purva Aşadha", quality: "Kəskin" },
  { name: "Uttara Aşadha", quality: "Sabit" },
  { name: "Şravana", quality: "Hərəkətli" },
  { name: "Dhanişta", quality: "Hərəkətli" },
  { name: "Şatabhişa", quality: "Hərəkətli" },
  { name: "Purva Bhadrapada", quality: "Kəskin" },
  { name: "Uttara Bhadrapada", quality: "Sabit" },
  { name: "Revati", quality: "Yumşaq" },
];

export const YOGA_NAMES_AZ = [
  "Vişkambha", "Priti", "Ayuşman", "Saubhaqya", "Şobhana", "Atiqanda", "Sukarma", "Dhrti",
  "Şula", "Qanda", "Vrddhi", "Dhruva", "Vyaqhata", "Harşana", "Vajra", "Siddhi",
  "Vyatipata", "Variyan", "Parigha", "Şiva", "Siddha", "Sadhya", "Şubha", "Şukla",
  "Brahma", "Indra", "Vaidhrti",
];

export const KARANA_NAMES_AZ = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vişti",
];
const FIXED_KARANAS_AZ = ["Şakuni", "Çatuşpada", "Naga", "Kimstughna"];

const DAY_COLORS_AZ: Record<number, string> = {
  0: "Qırmızı", // Bazar — Günəş
  1: "Ağ", // Bazar ertəsi — Ay
  2: "Al-qırmızı", // Çərşənbə axşamı — Mars
  3: "Yaşıl", // Çərşənbə — Merkuri
  4: "Sarı", // Cümə axşamı — Yupiter
  5: "Açıq mavi", // Cümə — Venera
  6: "Tünd göy", // Şənbə — Saturn
};

export interface PanchangToday {
  dateISO: string;
  tithiIndex: number; // 1-30
  tithiName: string;
  paksha: "Şukla" | "Krişna";
  tithiType: TithiType;
  nakshatraIndex: number; // 0-26
  nakshatraName: string;
  nakshatraQuality: string;
  yogaIndex: number; // 0-26
  yogaName: string;
  karanaName: string;
  weekday: number; // 0-6
  dayColor: string;
  sunSidereal: number;
  moonSidereal: number;
}

export function computePanchang(date: Date, latitude: number, longitude: number): PanchangToday {
  const origin = new Origin({
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    latitude,
    longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies"],
    aspectWithPoints: ["bodies"],
    aspectTypes: ["major"],
    language: "en",
  });

  const bodies = horoscope.CelestialBodies.all as any[];
  const sun = bodies.find((b) => String(b.key).toLowerCase() === "sun");
  const moon = bodies.find((b) => String(b.key).toLowerCase() === "moon");

  const ayan = ayanamsa(date);
  const sunTropical = Number(sun?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0);
  const moonTropical = Number(moon?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0);
  const sunSidereal = norm360(sunTropical - ayan);
  const moonSidereal = norm360(moonTropical - ayan);

  // Tithi: Ay-Günəş bucaq fərqi / 12°, 1-30 (hər biri 12°)
  const tithiRaw = norm360(moonSidereal - sunSidereal);
  const tithiIndex = Math.floor(tithiRaw / 12) + 1; // 1..30
  const paksha: "Şukla" | "Krişna" = tithiIndex <= 15 ? "Şukla" : "Krişna";
  const tithiInHalf = ((tithiIndex - 1) % 15) + 1; // 1..15
  const tithiName = TITHI_NAMES_AZ[tithiInHalf - 1] ?? TITHI_NAMES_AZ[14]!;
  const tithiType = TITHI_TYPE_BY_MOD5[(tithiInHalf - 1) % 5]!;

  // Nakşatra: Ayın sidereal uzunluğu / (360/27)
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(moonSidereal / nakshatraSpan) % 27;
  const nak = NAKSHATRAS_AZ[nakshatraIndex]!;

  // Yoga: (Günəş+Ay sidereal cəmi) / (360/27)
  const yogaSum = norm360(sunSidereal + moonSidereal);
  const yogaIndex = Math.floor(yogaSum / nakshatraSpan) % 27;
  const yogaName = YOGA_NAMES_AZ[yogaIndex]!;

  // Karana: yarım-tithi (0-59), ilk 4-ü sabit karanalar, qalan 56-sı 7 təkrarlanan
  const karanaRaw = Math.floor(tithiRaw / 6); // 0..59
  let karanaName: string;
  if (karanaRaw === 0) karanaName = FIXED_KARANAS_AZ[3]!; // Kimstughna (ilk yarım)
  else if (karanaRaw >= 57) karanaName = FIXED_KARANAS_AZ[(karanaRaw - 57) % 3]!;
  else karanaName = KARANA_NAMES_AZ[(karanaRaw - 1) % 7]!;

  const weekday = date.getDay();

  return {
    dateISO: date.toISOString().slice(0, 10),
    tithiIndex,
    tithiName,
    paksha,
    tithiType,
    nakshatraIndex,
    nakshatraName: nak.name,
    nakshatraQuality: nak.quality,
    yogaIndex,
    yogaName,
    karanaName,
    weekday,
    dayColor: DAY_COLORS_AZ[weekday] ?? "Ağ",
    sunSidereal,
    moonSidereal,
  };
}
