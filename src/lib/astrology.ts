import { Origin, Horoscope } from "circular-natal-horoscope-js";

export const SIGNS_AZ = [
  "Qoç",
  "Buğa",
  "Əkizlər",
  "Xərçəng",
  "Aslan",
  "Qız",
  "Tərəzi",
  "Əqrəb",
  "Oxatan",
  "Oğlaq",
  "Dolça",
  "Balıqlar",
] as const;

export type SignAz = (typeof SIGNS_AZ)[number];

export const SIGN_SYMBOLS: Record<string, string> = {
  Qoç: "♈",
  Buğa: "♉",
  Əkizlər: "♊",
  Xərçəng: "♋",
  Aslan: "♌",
  Qız: "♍",
  Tərəzi: "♎",
  Əqrəb: "♏",
  Oxatan: "♐",
  Oğlaq: "♑",
  Dolça: "♒",
  Balıqlar: "♓",
};

const SIGN_EN_TO_AZ: Record<string, SignAz> = {
  aries: "Qoç",
  taurus: "Buğa",
  gemini: "Əkizlər",
  cancer: "Xərçəng",
  leo: "Aslan",
  virgo: "Qız",
  libra: "Tərəzi",
  scorpio: "Əqrəb",
  sagittarius: "Oxatan",
  capricorn: "Oğlaq",
  aquarius: "Dolça",
  pisces: "Balıqlar",
};

const BODY_EN_TO_AZ: Record<string, string> = {
  sun: "Günəş",
  moon: "Ay",
  mercury: "Merkuri",
  venus: "Venera",
  mars: "Mars",
  jupiter: "Yupiter",
  saturn: "Saturn",
  uranus: "Uran",
  neptune: "Neptun",
  pluto: "Pluton",
  chiron: "Xiron",
  sirius: "Sirius",
  northnode: "Şimal düyünü",
  southnode: "Cənub düyünü",
  lilith: "Lilith",
};

export const BODY_SYMBOLS: Record<string, string> = {
  Günəş: "☉",
  Ay: "☾",
  Merkuri: "☿",
  Venera: "♀",
  Mars: "♂",
  Yupiter: "♃",
  Saturn: "♄",
  Uran: "♅",
  Neptun: "♆",
  Pluton: "♇",
  Xiron: "⚷",
};

export const ELEMENTS: Record<string, "Od" | "Torpaq" | "Hava" | "Su"> = {
  Qoç: "Od",
  Aslan: "Od",
  Oxatan: "Od",
  Buğa: "Torpaq",
  Qız: "Torpaq",
  Oğlaq: "Torpaq",
  Əkizlər: "Hava",
  Tərəzi: "Hava",
  Dolça: "Hava",
  Xərçəng: "Su",
  Əqrəb: "Su",
  Balıqlar: "Su",
};

export interface BirthInput {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  latitude: number;
  longitude: number;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  minute: number;
  house: number | null;
  retrograde: boolean;
}

export interface HousePosition {
  index: number;
  sign: string;
  degree: number;
  minute: number;
}

export interface NatalChart {
  planets: PlanetPosition[];
  houses: HousePosition[];
  ascendant: { sign: string; degree: number; minute: number };
  midheaven: { sign: string; degree: number; minute: number };
  sun: string;
  moon: string;
}

/** Ondalık dərəcəni (bürc daxilində, 0-30°) dəqiq° və dəqiqəyə bölür. */
function splitDegree(rawWithinSign: number): { degree: number; minute: number } {
  const totalMinutes = Math.round(rawWithinSign * 60);
  let degree = Math.floor(totalMinutes / 60);
  let minute = totalMinutes % 60;
  if (degree >= 30) {
    degree = 29;
    minute = 59;
  }
  return { degree, minute };
}

/** "27°40′" formatında dəqiq dərəcə mətni. `minute` hər hansı səbəbdən (köhnə keş, əskik məlumat) rəqəm olmasa belə "undefined" göstərilməsin deyə 0-a düşür. */
export function formatDegree(degree: number, minute: number): string {
  const safeDeg = Number.isFinite(degree) ? degree : 0;
  const safeMin = Number.isFinite(minute) ? minute : 0;
  return `${safeDeg}°${String(safeMin).padStart(2, "0")}′`;
}

/** Bürc+dərəcədən 0-360° ekliptik uzunluğa çevirir */
export function toLongitude(sign: string, degree: number): number {
  const idx = SIGNS_AZ.indexOf(sign as SignAz);
  if (idx < 0) return degree;
  return idx * 30 + degree;
}

function az(signKey: string | undefined): string {
  if (!signKey) return "—";
  return SIGN_EN_TO_AZ[signKey.toLowerCase()] ?? signKey;
}

export function computeNatalChart(input: BirthInput): NatalChart {
  const [y, mo, d] = input.date.split("-").map(Number);
  const [h, mi] = input.time.split(":").map(Number);
  const year = y ?? 2000;
  const month = (mo ?? 1) - 1; // 0-əsaslı
  const day = d ?? 1;
  const hour = h ?? 12;
  const minute = mi ?? 0;

  const origin = new Origin({
    year,
    month,
    date: day,
    hour,
    minute,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies", "points"],
    aspectWithPoints: ["bodies", "points"],
    aspectTypes: ["major"],
    language: "en",
  });

  const planets: PlanetPosition[] = (horoscope.CelestialBodies.all as any[])
    .filter((b) => BODY_EN_TO_AZ[String(b.key).toLowerCase()])
    .map((b) => {
      const { degree, minute } = splitDegree(Number(b.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0) % 30);
      return {
        name: BODY_EN_TO_AZ[String(b.key).toLowerCase()] ?? b.label,
        sign: az(b.Sign?.key),
        degree,
        minute,
        house: b.House?.id ?? null,
        retrograde: Boolean(b.isRetrograde),
      };
    });

  const houses: HousePosition[] = (horoscope.Houses as any[]).map((h, i) => {
    const { degree, minute } = splitDegree(Number(h.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees ?? 0) % 30);
    return { index: i + 1, sign: az(h.Sign?.key), degree, minute };
  });

  const ascRaw = horoscope.Ascendant as any;
  const mcRaw = horoscope.Midheaven as any;

  return {
    planets,
    houses,
    ascendant: {
      sign: az(ascRaw?.Sign?.key),
      degree: houses[0]?.degree ?? 0,
      minute: houses[0]?.minute ?? 0,
    },
    midheaven: {
      sign: az(mcRaw?.Sign?.key),
      degree: houses[9]?.degree ?? 0,
      minute: houses[9]?.minute ?? 0,
    },
    sun: planets.find((p) => p.name === "Günəş")?.sign ?? "—",
    moon: planets.find((p) => p.name === "Ay")?.sign ?? "—",
  };
}

/** İki xəritə arasında uyğunluq (sinastriya) */
export interface SynastryResult {
  overall: number;
  love: number;
  friendship: number;
  communication: number;
  notes: string[];
}

function signIndex(sign: string) {
  return SIGNS_AZ.indexOf(sign as SignAz);
}

export function pairScore(a: string, b: string): number {
  const ia = signIndex(a);
  const ib = signIndex(b);
  if (ia < 0 || ib < 0) return 50;
  const diff = Math.min((ia - ib + 12) % 12, (ib - ia + 12) % 12);
  // trigon (4), sextil (2), konyunksiya (0) yaxşı; kvadrat (3), oppozisiya (6) gərgin
  const table: Record<number, number> = { 0: 85, 1: 55, 2: 80, 3: 45, 4: 95, 5: 50, 6: 70 };
  return table[diff] ?? 60;
}

export function computeSynastry(a: NatalChart, b: NatalChart): SynastryResult {
  const get = (c: NatalChart, name: string) => c.planets.find((p) => p.name === name)?.sign ?? "—";

  const sun = pairScore(get(a, "Günəş"), get(b, "Günəş"));
  const moon = pairScore(get(a, "Ay"), get(b, "Ay"));
  const venus = pairScore(get(a, "Venera"), get(b, "Venera"));
  const mars = pairScore(get(a, "Mars"), get(b, "Mars"));
  const mercury = pairScore(get(a, "Merkuri"), get(b, "Merkuri"));
  const asc = pairScore(a.ascendant.sign, b.ascendant.sign);

  const love = Math.round((venus * 0.45 + moon * 0.35 + mars * 0.2));
  const friendship = Math.round((sun * 0.4 + asc * 0.3 + mercury * 0.3));
  const communication = Math.round((mercury * 0.6 + sun * 0.2 + asc * 0.2));
  const overall = Math.round((love + friendship + communication) / 3);

  const notes: string[] = [];
  const ea = ELEMENTS[get(a, "Günəş")];
  const eb = ELEMENTS[get(b, "Günəş")];
  if (ea && eb) {
    notes.push(
      ea === eb
        ? `Hər iki Günəş ${ea} elementindədir — təbii anlaşma və oxşar ritm.`
        : `Günəş elementləri fərqlidir (${ea} və ${eb}) — bir-birinizi tamamlaya bilərsiniz.`,
    );
  }
  notes.push(
    moon >= 75
      ? "Ay bağlantınız güclüdür: emosional təhlükəsizlik hissi yüksəkdir."
      : "Ay bağlantısı gərginlik yarada bilər: hisslərinizi açıq danışın.",
  );
  notes.push(
    venus >= 75
      ? "Venera harmoniyası romantikanı və estetik zövqləri birləşdirir."
      : "Venera fərqi sevgi dilinizin fərqli olduğunu göstərir.",
  );
  notes.push(
    mercury >= 70
      ? "Merkuri uyğunluğu ünsiyyəti asanlaşdırır."
      : "Merkuri gərginliyi anlaşılmazlıq riski yaradır — səbirli olun.",
  );

  return { overall, love, friendship, communication, notes };
}

/** Aspekt adı (bürc fərqinə görə) */
export function aspectNameAz(a: string, b: string): string {
  const ia = signIndex(a);
  const ib = signIndex(b);
  if (ia < 0 || ib < 0) return "—";
  const diff = Math.min((ia - ib + 12) % 12, (ib - ia + 12) % 12);
  const names: Record<number, string> = {
    0: "Konyunksiya",
    1: "Yarımsekstil",
    2: "Sekstil",
    3: "Kvadrat",
    4: "Trigon",
    5: "Kvinkuns",
    6: "Oppozisiya",
  };
  return names[diff] ?? "—";
}

export interface PlanetPairDetail {
  planet: string;
  symbol: string;
  signA: string;
  signB: string;
  elementA: string;
  elementB: string;
  aspect: string;
  score: number;
}

const SYNASTRY_PLANETS = ["Günəş", "Ay", "Venera", "Mars", "Merkuri"] as const;

/** Hər planet üçün ayrı-ayrı cüt təhlili (Cütlük Xəritəsi səhifəsinin genişləndirilmiş görünüşü üçün) */
export function synastryDetails(a: NatalChart, b: NatalChart): PlanetPairDetail[] {
  const get = (c: NatalChart, name: string) => c.planets.find((p) => p.name === name)?.sign ?? "—";

  return SYNASTRY_PLANETS.map((planet) => {
    const signA = get(a, planet);
    const signB = get(b, planet);
    return {
      planet,
      symbol: BODY_SYMBOLS[planet] ?? "•",
      signA,
      signB,
      elementA: ELEMENTS[signA] ?? "—",
      elementB: ELEMENTS[signB] ?? "—",
      aspect: aspectNameAz(signA, signB),
      score: pairScore(signA, signB),
    };
  });
}

const PLANET_MEANING_AZ: Record<string, string> = {
  Günəş: "əsas xarakter və ümumi ritm",
  Ay: "emosional ehtiyaclar və daxili təhlükəsizlik",
  Venera: "sevgi dili, estetik zövq və cazibə",
  Mars: "ehtiras, motivasiya və münaqişə tərzi",
  Merkuri: "ünsiyyət tərzi və düşüncə axını",
};

export function planetMeaningAz(planet: string): string {
  return PLANET_MEANING_AZ[planet] ?? "";
}

/** Yalnız tarixdən Günəş bürcünü tapır (təxmini sərhədlər) */
export function sunSignFromDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const bounds: [number, number, string][] = [
    [3, 21, "Qoç"],
    [4, 20, "Buğa"],
    [5, 21, "Əkizlər"],
    [6, 21, "Xərçəng"],
    [7, 23, "Aslan"],
    [8, 23, "Qız"],
    [9, 23, "Tərəzi"],
    [10, 23, "Əqrəb"],
    [11, 22, "Oxatan"],
    [12, 22, "Oğlaq"],
    [1, 20, "Dolça"],
    [2, 19, "Balıqlar"],
  ];
  let sign = "Oğlaq";
  for (const [bm, bd, s] of bounds) {
    if (m > bm || (m === bm && day >= bd)) sign = s;
  }
  if (m === 1 && day < 20) sign = "Oğlaq";
  if (m === 2) sign = day >= 19 ? "Balıqlar" : "Dolça";
  if (m === 3 && day < 21) sign = "Balıqlar";
  return sign;
}

/** Klassik (xaldey) günlərin hakim planetləri */
export const DAY_RULERS_AZ: Record<number, string> = {
  0: "Günəş",
  1: "Ay",
  2: "Mars",
  3: "Merkuri",
  4: "Yupiter",
  5: "Venera",
  6: "Saturn",
};

export interface TodaysSky {
  dayRuler: string;
  moonSign: string;
  moonDegree: number;
}

/** Bugünkü hakim planet və Ayın hansı bürcdə olduğu (naveqasiya çipi üçün) */
export function todaysSky(): TodaysSky {
  const now = new Date();
  const baku = CITIES[0]!;

  const origin = new Origin({
    year: now.getFullYear(),
    month: now.getMonth(),
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude: baku.lat,
    longitude: baku.lon,
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

  const moon = (horoscope.CelestialBodies.all as any[]).find(
    (b) => String(b.key).toLowerCase() === "moon",
  );

  return {
    dayRuler: DAY_RULERS_AZ[now.getDay()] ?? "Günəş",
    moonSign: az(moon?.Sign?.key),
    moonDegree: Math.floor(Number(moon?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0) % 30),
  };
}

/** Əsas (major) aspektlər — bucaq və icazə verilən orb (dərəcə fərqi) */
export const ASPECT_DEFS = [
  { key: "conjunction", nameAz: "Konyunksiya", symbol: "☌", angle: 0, orb: 8, color: "#e7ce88" },
  { key: "sextile", nameAz: "Sekstil", symbol: "⚹", angle: 60, orb: 4, color: "#8b7bef" },
  { key: "square", nameAz: "Kvadrat", symbol: "□", angle: 90, orb: 6, color: "#f26d6d" },
  { key: "trine", nameAz: "Trigon", symbol: "△", angle: 120, orb: 6, color: "#6ddc8f" },
  { key: "opposition", nameAz: "Oppozisiya", symbol: "☍", angle: 180, orb: 8, color: "#f26d6d" },
] as const;

export interface AspectHit {
  a: string;
  b: string;
  aspect: (typeof ASPECT_DEFS)[number];
  orb: number; // dəqiq bucaqdan fərq (dərəcə)
}

/** Xəritə daxilindəki planetlər arasında əsas aspektləri hesablayır (orb daxilində olanlar) */
export function computeAspects(chart: NatalChart): AspectHit[] {
  const bodies = chart.planets;
  const hits: AspectHit[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const la = toLongitude(bodies[i]!.sign, bodies[i]!.degree);
      const lb = toLongitude(bodies[j]!.sign, bodies[j]!.degree);
      let diff = Math.abs(la - lb) % 360;
      if (diff > 180) diff = 360 - diff;

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          hits.push({ a: bodies[i]!.name, b: bodies[j]!.name, aspect: def, orb: Math.round(orb * 10) / 10 });
          break; // hər cüt üçün ən yaxın aspekti götür
        }
      }
    }
  }

  return hits.sort((x, y) => x.orb - y.orb);
}

/** Bugünkü/hazırkı planet xəritəsini (Bakı vaxtı üzrə) natal xəritə formatında qaytarır — "Cari planetlər" paneli üçün. */
export function computeCurrentSky(): NatalChart {
  const now = new Date();
  const baku = CITIES[0]!;
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return computeNatalChart({ date, time, latitude: baku.lat, longitude: baku.lon });
}

/** Sadə şəhər kataloqu (doğum yeri seçimi üçün) */
export const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: "Bakı", lat: 40.4093, lon: 49.8671 },
  { name: "Gəncə", lat: 40.6828, lon: 46.3606 },
  { name: "Sumqayıt", lat: 40.5897, lon: 49.6686 },
  { name: "Şəki", lat: 41.1919, lon: 47.1706 },
  { name: "Lənkəran", lat: 38.7529, lon: 48.8475 },
  { name: "Naxçıvan", lat: 39.2089, lon: 45.4122 },
  { name: "Quba", lat: 41.3606, lon: 48.5127 },
  { name: "Şirvan", lat: 39.9316, lon: 48.9207 },
  { name: "Mingəçevir", lat: 40.7703, lon: 47.0496 },
  { name: "İstanbul", lat: 41.0082, lon: 28.9784 },
  { name: "Ankara", lat: 39.9334, lon: 32.8597 },
  { name: "Moskva", lat: 55.7558, lon: 37.6173 },
  { name: "Tbilisi", lat: 41.7151, lon: 44.8271 },
  { name: "London", lat: 51.5072, lon: -0.1276 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Nyu-York", lat: 40.7128, lon: -74.006 },
];
