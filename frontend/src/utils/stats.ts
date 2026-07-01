const MONTHS_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

export type MonthPoint = {
  key: string; // "YYYY-MM"
  label: string; // "jun"
  year: number;
  month: number; // 0-11
  value: number;
};

/**
 * Converte books_by_month ({ "YYYY-MM": n }) numa série contínua ordenada,
 * preenchendo meses sem leitura com 0 (entre o primeiro e o último mês).
 */
export function monthsSeries(byMonth: Record<string, number>): MonthPoint[] {
  const keys = Object.keys(byMonth).filter((k) => /^\d{4}-\d{2}$/.test(k));
  if (keys.length === 0) return [];
  keys.sort();

  const parse = (k: string): [number, number] => {
    const [y, m] = k.split('-');
    return [Number(y), Number(m) - 1];
  };

  const firstKey = keys[0];
  const lastKey = keys[keys.length - 1];
  if (!firstKey || !lastKey) return [];

  const [startY, startM] = parse(firstKey);
  const [endY, endM] = parse(lastKey);

  const out: MonthPoint[] = [];
  let y = startY;
  let m = startM;
  // Limite de segurança contra ranges absurdos.
  for (let i = 0; i < 600; i++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    out.push({
      key,
      label: MONTHS_PT[m] ?? '',
      year: y,
      month: m,
      value: byMonth[key] ?? 0,
    });
    if (y === endY && m === endM) break;
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}
