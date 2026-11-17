import { PLACES } from '../constants/places';

const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const teens = [
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = [
  '',
  'مئة',
  'مئتان',
  'ثلاثمئة',
  'أربعمئة',
  'خمسمئة',
  'ستمئة',
  'سبعمئة',
  'ثمانمئة',
  'تسعمئة',
];

export function digit(n: number, p: number): number {
  return Math.floor(n / 10 ** p) % 10;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function below100(n: number): string {
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  return [units[n % 10], tens[Math.floor(n / 10)]].filter(Boolean).join(' و');
}

export function below1000(n: number): string {
  return [hundreds[Math.floor(n / 100)], below100(n % 100)].filter(Boolean).join(' و');
}

export function groupWords(n: number, single: string, dual: string, plural: string): string {
  if (!n) return '';
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (!r) return (h === 2 ? 'مئتا' : hundreds[h]) + ' ' + single;
  const last = r === 1 ? single : r === 2 ? dual : below100(r) + ' ' + (r <= 10 ? plural : single + 'ًا');
  return [hundreds[h], last].filter(Boolean).join(' و');
}

export function words(n: number): string {
  if (n === 0) return 'صفر';
  return [
    groupWords(Math.floor(n / 1e6), 'مليون', 'مليونان', 'ملايين'),
    groupWords(Math.floor(n / 1e3) % 1e3, 'ألف', 'ألفان', 'آلاف'),
    below1000(n % 1000),
  ]
    .filter(Boolean)
    .join(' و');
}

export interface ExpansionTerm {
  p: number;
  placeName: string;
  value: number;
}

export function expansion(n: number): ExpansionTerm[] {
  const result: ExpansionTerm[] = [];
  for (let p = 8; p >= 0; p--) {
    const d = digit(n, p);
    if (d > 0) {
      result.push({
        p,
        placeName: PLACES[p],
        value: d * 10 ** p,
      });
    }
  }
  return result;
}

export function parseNum(raw: string): number | null {
  const s = raw
    .trim()
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776));
  if (!/^(?:[0-9]+|[0-9]{1,3}(?:[,٬ ][0-9]{3})+)$/.test(s)) return null;
  const n = Number(s.replace(/[,٬ ]/g, ''));
  return Number.isSafeInteger(n) && n >= 0 && n <= 999999999 ? n : null;
}

export function distort3Digits(num: number): number {
  if (num < 10) return num === 9 ? 8 : num + 1;
  if (num < 100) {
    const t = Math.floor(num / 10);
    const u = num % 10;
    if (t !== u) return u * 10 + t;
    return num > 50 ? num - 10 : num + 10;
  }
  const h = Math.floor(num / 100);
  const rem = num % 100;
  const t = Math.floor(rem / 10);
  const u = rem % 10;
  if (t !== u) return h * 100 + u * 10 + t;
  return h * 100 + (t > 5 ? (t - 1) * 10 : (t + 1) * 10) + u;
}

export interface PeriodCardPart {
  periodKey: 'millions' | 'thousands' | 'ones';
  periodName: string;
  value: number;
  text: string;
  distractors: string[];
}

export function getPeriodParts(n: number): PeriodCardPart[] {
  const m = Math.floor(n / 1e6);
  const k = Math.floor(n / 1e3) % 1000;
  const o = n % 1000;
  const parts: PeriodCardPart[] = [];

  if (m > 0) {
    const mWord = groupWords(m, 'مليون', 'مليونان', 'ملايين');
    const d1 = groupWords(distort3Digits(m), 'مليون', 'مليونان', 'ملايين');
    const d2 = groupWords(m, 'ألف', 'ألفان', 'آلاف');
    parts.push({
      periodKey: 'millions',
      periodName: 'دورة الملايين',
      value: m,
      text: mWord,
      distractors: [d1 !== mWord ? d1 : mWord + ' وثلاثة', d2],
    });
  }

  if (k > 0) {
    const prefix = parts.length > 0 ? 'و' : '';
    const kWord = prefix + groupWords(k, 'ألف', 'ألفان', 'آلاف');
    const d1 = prefix + groupWords(distort3Digits(k), 'ألف', 'ألفان', 'آلاف');
    const d2 = prefix + below1000(k);
    parts.push({
      periodKey: 'thousands',
      periodName: 'دورة الألوف',
      value: k,
      text: kWord,
      distractors: [d1 !== kWord ? d1 : kWord + ' ومئة', d2],
    });
  }

  if (o > 0) {
    const prefix = parts.length > 0 ? 'و' : '';
    const oWord = prefix + below1000(o);
    const d1 = prefix + below1000(distort3Digits(o));
    const d2 = prefix + groupWords(o, 'ألف', 'ألفان', 'آلاف');
    parts.push({
      periodKey: 'ones',
      periodName: 'دورة الآحاد',
      value: o,
      text: oWord,
      distractors: [d1 !== oWord ? d1 : oWord + ' وخمسة', d2],
    });
  }

  return parts;
}
