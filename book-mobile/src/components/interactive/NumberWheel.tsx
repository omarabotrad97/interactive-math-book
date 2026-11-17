import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import { theme } from '../../constants/theme';
import { ArrowUpIcon, ArrowDownIcon, SoundIcon } from '../common/Icons';
import { triggerPeriodHaptic, speakArabic } from '../../services/audioService';
import { formatNumber, words } from '../../services/mathEngine';

interface SingleDigitDrumProps {
  digit: number;
  posIndex: number;
  period: 'ones' | 'thousands' | 'millions';
  periodColor: string;
  onStep: (delta: number) => void;
}

const SingleDigitDrum: React.FC<SingleDigitDrumProps> = ({
  digit,
  period,
  periodColor,
  onStep,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragAccumulator = useRef(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        setIsDragging(true);
        dragAccumulator.current = 0;
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          speed: 20,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        dragAccumulator.current += -gestureState.dy * 0.05;
        // Step every threshold
        if (Math.abs(dragAccumulator.current) >= 1) {
          const stepDelta = Math.sign(dragAccumulator.current);
          dragAccumulator.current -= stepDelta;
          triggerPeriodHaptic(period);
          onStep(stepDelta);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 15,
        }).start();

        // Momentum flick
        const vy = gestureState.vy;
        if (Math.abs(vy) > 0.6) {
          const extraSteps = Math.min(3, Math.max(1, Math.round(Math.abs(vy) * 2)));
          const direction = vy < 0 ? 1 : -1;
          for (let i = 1; i <= extraSteps; i++) {
            setTimeout(() => {
              triggerPeriodHaptic(period);
              onStep(direction);
            }, i * 65);
          }
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const prevDigit = (digit - 1 + 10) % 10;
  const nextDigit = (digit + 1) % 10;

  return (
    <Animated.View
      style={[
        styles.drumContainer,
        { transform: [{ scale: scaleAnim }] },
        isDragging && styles.drumDragging,
      ]}
    >
      {/* Top Arrow Button */}
      <TouchableOpacity
        style={styles.arrowBtn}
        onPress={() => {
          triggerPeriodHaptic(period);
          onStep(1);
        }}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 4, left: 4, right: 4 }}
      >
        <ArrowUpIcon size={13} color={periodColor} />
      </TouchableOpacity>

      {/* Rotating Mechanical Cylinder */}
      <View
        style={[
          styles.cylinderSurface,
          { borderColor: isDragging ? periodColor : theme.colors.lineDark },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Top Ghost Digit */}
        <Text style={[styles.ghostDigit, { color: periodColor }]}>{prevDigit}</Text>

        {/* Active Center Digit */}
        <View style={[styles.activeDigitWindow, { borderTopColor: periodColor + '30' }]}>
          <Text style={[styles.activeDigitText, { color: theme.colors.ink }]}>{digit}</Text>
        </View>

        {/* Bottom Ghost Digit */}
        <Text style={[styles.ghostDigit, { color: periodColor }]}>{nextDigit}</Text>
      </View>

      {/* Bottom Arrow Button */}
      <TouchableOpacity
        style={styles.arrowBtn}
        onPress={() => {
          triggerPeriodHaptic(period);
          onStep(-1);
        }}
        activeOpacity={0.6}
        hitSlop={{ top: 4, bottom: 8, left: 4, right: 4 }}
      >
        <ArrowDownIcon size={13} color={periodColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

interface NumberWheelProps {
  value: number; // Current 9-digit number
  onChange: (newValue: number) => void;
  maxDigits?: number;
}

export const NumberWheel: React.FC<NumberWheelProps> = ({
  value,
  onChange,
  maxDigits = 9,
}) => {
  const digits: number[] = [];
  for (let p = maxDigits - 1; p >= 0; p--) {
    digits.push(Math.floor(value / 10 ** p) % 10);
  }

  const handleStep = (posIndex: number, delta: number) => {
    const p = maxDigits - 1 - posIndex;
    const currentD = Math.floor(value / 10 ** p) % 10;
    const newD = (currentD + delta + 10) % 10;
    const diff = (newD - currentD) * 10 ** p;
    onChange(value + diff);
  };

  const getPeriodForPos = (idx: number): { key: 'millions' | 'thousands' | 'ones'; color: string } => {
    if (idx <= 2) return { key: 'millions', color: theme.colors.periodMillions };
    if (idx <= 5) return { key: 'thousands', color: theme.colors.periodThousands };
    return { key: 'ones', color: theme.colors.periodOnes };
  };

  return (
    <View style={styles.vaultWrapper}>
      {/* Vault Rim Header */}
      <View style={styles.vaultHeader}>
        <Text style={styles.vaultTitle}>خزنة الأرقام التفاعلية (اسحب العجلة لأعلى أو لأسفل)</Text>
      </View>

      {/* Periods Labels */}
      <View style={styles.periodsHeader}>
        <View style={[styles.periodBadge, { backgroundColor: theme.colors.periodMillions + '18' }]}>
          <Text style={[styles.periodTitle, { color: theme.colors.periodMillions }]}>دورة الملايين</Text>
        </View>
        <View style={[styles.periodBadge, { backgroundColor: theme.colors.periodThousands + '18' }]}>
          <Text style={[styles.periodTitle, { color: theme.colors.periodThousands }]}>دورة الألوف</Text>
        </View>
        <View style={[styles.periodBadge, { backgroundColor: theme.colors.periodOnes + '18' }]}>
          <Text style={[styles.periodTitle, { color: theme.colors.periodOnes }]}>دورة الآحاد</Text>
        </View>
      </View>

      {/* 9 Mechanical Tumbler Drums */}
      <View style={styles.wheelsRow}>
        {digits.map((d, idx) => {
          const isSeparator = idx === 3 || idx === 6;
          const { key: periodKey, color: periodColor } = getPeriodForPos(idx);

          return (
            <React.Fragment key={idx}>
              {isSeparator && (
                <View style={styles.separatorBox}>
                  <Text style={styles.separator}>،</Text>
                </View>
              )}
              <SingleDigitDrum
                digit={d}
                posIndex={idx}
                period={periodKey}
                periodColor={periodColor}
                onStep={(delta) => handleStep(idx, delta)}
              />
            </React.Fragment>
          );
        })}
      </View>

      {/* Live Value Inspector & Audio Reader */}
      <TouchableOpacity
        style={styles.inspectorBar}
        onPress={() => speakArabic(words(value))}
        activeOpacity={0.7}
      >
        <SoundIcon size={16} color={theme.colors.primary} />
        <Text style={styles.inspectorNum}>{formatNumber(value)}</Text>
        <Text style={styles.inspectorHint}>اضغط للاستماع للعدد بالكلمات</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  vaultWrapper: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.lineDark,
    ...theme.shadows.prominent,
    marginVertical: theme.spacing.sm,
  },
  vaultHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  vaultTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.muted,
    textAlign: 'center',
  },
  periodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    gap: 4,
  },
  periodBadge: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  periodTitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: '#f8faf3',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  drumContainer: {
    alignItems: 'center',
    width: 30,
  },
  drumDragging: {
    zIndex: 10,
  },
  arrowBtn: {
    width: 28,
    height: 22,
    backgroundColor: theme.colors.cream,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  cylinderSurface: {
    width: 30,
    height: 68,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  ghostDigit: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.35,
  },
  activeDigitWindow: {
    width: '100%',
    height: 32,
    backgroundColor: theme.colors.cream + '60',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  activeDigitText: {
    fontSize: 19,
    fontWeight: '800',
  },
  separatorBox: {
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.muted,
  },
  inspectorBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.cream,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    marginTop: theme.spacing.sm,
  },
  inspectorNum: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  inspectorHint: {
    fontSize: 10,
    color: theme.colors.muted,
    fontWeight: '600',
  },
});
