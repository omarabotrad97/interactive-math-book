import React from 'react';
import Svg, { Path, Circle, Rect, Polygon, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const TrophyIcon: React.FC<IconProps> = ({ size = 24, color = '#bc8b32' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <Path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
    <Path d="M4 3h16v6a8 8 0 0 1-16 0V3z" />
    <Path d="M12 17v4" />
    <Path d="M8 21h8" />
  </Svg>
);

export const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 20,
  color = '#ad343e',
  filled = true,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'none'}
    stroke={color}
    strokeWidth={2}
  >
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 20,
  color = '#bc8b32',
  filled = true,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'none'}
    stroke={color}
    strokeWidth={2}
  >
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Svg>
);

export const SoundIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Svg>
);

export const MuteIcon: React.FC<IconProps> = ({ size = 20, color = '#617366' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="1" y1="1" x2="23" y2="23" />
    <Path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <Path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <Line x1="12" y1="19" x2="12" y2="23" />
    <Line x1="8" y1="23" x2="16" y2="23" />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 20, color = '#617366' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 20, color = '#bc8b32' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </Svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Svg>
);

export const MapIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <Line x1="8" y1="2" x2="8" y2="18" />
    <Line x1="16" y1="6" x2="16" y2="22" />
  </Svg>
);

export const ChartIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="18" y1="20" x2="18" y2="10" />
    <Line x1="12" y1="20" x2="12" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="14" />
    <Line x1="2" y1="20" x2="22" y2="20" />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Path d="M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Path d="M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowDownIcon: React.FC<IconProps> = ({ size = 20, color = '#12584b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
