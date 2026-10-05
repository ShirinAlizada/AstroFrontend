const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

/**
 * Brauzer/ƏS lokalından asılı olan 12 saatlıq (AM/PM) görünüşün qarşısını
 * almaq üçün həmişə 24 saatlıq formatda işləyən saat seçici. Doğum saatı
 * kimi dəqiq saat tələb edən bütün formalarda native `<input type="time">`
 * əvəzinə istifadə olunur — native sahə Chrome-da ƏS-in region ayarına görə
 * AM/PM göstərə bilir, bunu `lang` atributu ilə düzəltmək mümkün deyil.
 */
export function TimeField24({
  value,
  onChange,
  idPrefix,
}: {
  value: string;
  onChange: (v: string) => void;
  idPrefix?: string;
}) {
  const [hh, mm] = value.includes(":") ? value.split(":") : ["", ""];

  function setHour(nextHour: string) {
    onChange(`${nextHour}:${mm || "00"}`);
  }
  function setMinute(nextMinute: string) {
    onChange(`${hh || "00"}:${nextMinute}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        id={idPrefix ? `${idPrefix}-hour` : undefined}
        aria-label="Saat"
        value={hh}
        onChange={(e) => setHour(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
      >
        <option value="" disabled className="bg-ink">--</option>
        {HOURS_24.map((h) => (
          <option key={h} value={h} className="bg-ink">{h}</option>
        ))}
      </select>
      <span className="text-mist">:</span>
      <select
        id={idPrefix ? `${idPrefix}-minute` : undefined}
        aria-label="Dəqiqə"
        value={mm}
        onChange={(e) => setMinute(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
      >
        <option value="" disabled className="bg-ink">--</option>
        {MINUTES_60.map((m) => (
          <option key={m} value={m} className="bg-ink">{m}</option>
        ))}
      </select>
    </div>
  );
}
