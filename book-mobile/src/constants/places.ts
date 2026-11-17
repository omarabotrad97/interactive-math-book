export const PLACES = [
  'الآحاد',
  'العشرات',
  'المئات',
  'آحاد الألوف',
  'عشرات الألوف',
  'مئات الألوف',
  'آحاد الملايين',
  'عشرات الملايين',
  'مئات الملايين',
] as const;

export interface PeriodInfo {
  key: 'ones' | 'thousands' | 'millions';
  name: 'دورة الآحاد' | 'دورة الألوف' | 'دورة الملايين';
  shortName: 'الآحاد' | 'الألوف' | 'الملايين';
  range: [number, number]; // [startPower, endPower]
  color: string;
}

export const PERIODS: PeriodInfo[] = [
  {
    key: 'millions',
    name: 'دورة الملايين',
    shortName: 'الملايين',
    range: [6, 8],
    color: '#2a5b84',
  },
  {
    key: 'thousands',
    name: 'دورة الألوف',
    shortName: 'الألوف',
    range: [3, 5],
    color: '#755420',
  },
  {
    key: 'ones',
    name: 'دورة الآحاد',
    shortName: 'الآحاد',
    range: [0, 2],
    color: '#1b6440',
  },
];
