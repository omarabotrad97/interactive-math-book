import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { HeartIcon, TrophyIcon, SoundIcon, MuteIcon } from './Icons';

interface HUDProps {
  score: number;
  hearts: number;
  muted: boolean;
  onToggleSound: () => void;
  onOpenRecharge?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  hearts,
  muted,
  onToggleSound,
  onOpenRecharge,
}) => {
  return (
    <View style={styles.container}>
      {/* Sound Toggle */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onToggleSound}
        accessibilityLabel={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {muted ? <MuteIcon size={20} color={theme.colors.muted} /> : <SoundIcon size={20} color={theme.colors.primary} />}
      </TouchableOpacity>

      {/* Hearts Block */}
      <TouchableOpacity
        style={styles.heartsBox}
        onPress={onOpenRecharge}
        activeOpacity={onOpenRecharge ? 0.7 : 1}
      >
        <View style={styles.heartsRow}>
          {[1, 2, 3].map((h) => (
            <HeartIcon
              key={h}
              size={18}
              color={theme.colors.red}
              filled={h <= hearts}
            />
          ))}
        </View>
        <Text style={styles.heartsLabel}>القلوب</Text>
      </TouchableOpacity>

      {/* Score Block */}
      <View style={styles.scoreBox}>
        <TrophyIcon size={20} color={theme.colors.gold} />
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.scoreLabel}>نقطة</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    ...theme.shadows.soft,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  heartsBox: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  heartsRow: {
    flexDirection: 'row-reverse',
    gap: 4,
  },
  heartsLabel: {
    fontSize: 10,
    color: theme.colors.muted,
    marginTop: 2,
    fontWeight: '600',
  },
  scoreBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  scoreLabel: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
