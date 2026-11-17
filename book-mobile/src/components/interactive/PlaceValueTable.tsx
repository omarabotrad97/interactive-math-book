import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { PLACES } from '../../constants/places';
import { digit, formatNumber } from '../../services/mathEngine';
import { triggerHaptic } from '../../services/audioService';

interface PlaceValueTableProps {
  n: number;
  highlightP?: number;
  onSelectPlace?: (p: number) => void;
}

export const PlaceValueTable: React.FC<PlaceValueTableProps> = ({
  n,
  highlightP,
  onSelectPlace,
}) => {
  return (
    <View style={styles.container}>
      {/* Table Header: Periods */}
      <View style={styles.periodsRow}>
        <View style={[styles.periodCol, { backgroundColor: theme.colors.periodMillions + '15' }]}>
          <Text style={[styles.periodText, { color: theme.colors.periodMillions }]}>دورة الملايين</Text>
        </View>
        <View style={[styles.periodCol, { backgroundColor: theme.colors.periodThousands + '15' }]}>
          <Text style={[styles.periodText, { color: theme.colors.periodThousands }]}>دورة الألوف</Text>
        </View>
        <View style={[styles.periodCol, { backgroundColor: theme.colors.periodOnes + '15' }]}>
          <Text style={[styles.periodText, { color: theme.colors.periodOnes }]}>دورة الآحاد</Text>
        </View>
      </View>

      {/* Places Subheader */}
      <View style={styles.placesRow}>
        {[8, 7, 6, 5, 4, 3, 2, 1, 0].map((p) => {
          const isHigh = highlightP === p;
          return (
            <View key={p} style={[styles.placeCell, isHigh && styles.activePlaceCell]}>
              <Text style={[styles.placeText, isHigh && styles.activePlaceText]} numberOfLines={1}>
                {PLACES[p].split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Digits Row */}
      <View style={styles.digitsRow}>
        {[8, 7, 6, 5, 4, 3, 2, 1, 0].map((p) => {
          const d = digit(n, p);
          const isHigh = highlightP === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.digitCell, isHigh && styles.activeDigitCell]}
              onPress={() => {
                triggerHaptic('light');
                onSelectPlace?.(p);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.digitNum, isHigh && styles.activeDigitNum]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Inspector Details if highlighted */}
      {highlightP !== undefined && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            الرقم: <Text style={styles.bold}>{digit(n, highlightP)}</Text> في منزلة: <Text style={styles.bold}>{PLACES[highlightP]}</Text>
          </Text>
          <Text style={styles.detailsValue}>
            قيمته المنزلية = <Text style={styles.highlightVal}>{formatNumber(digit(n, highlightP) * 10 ** highlightP)}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  periodsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  periodCol: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.line,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
  },
  placesRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  placeCell: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: theme.colors.line,
  },
  activePlaceCell: {
    backgroundColor: theme.colors.primaryLight + '30',
  },
  placeText: {
    fontSize: 8.5,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  activePlaceText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  digitsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.paper,
  },
  digitCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: theme.colors.line,
  },
  activeDigitCell: {
    backgroundColor: theme.colors.goldLight,
  },
  digitNum: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  activeDigitNum: {
    color: theme.colors.gold,
    fontSize: 20,
  },
  detailsBox: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.cream,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 13,
    color: theme.colors.ink,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  detailsValue: {
    fontSize: 13,
    color: theme.colors.ink,
    marginTop: 2,
    textAlign: 'center',
  },
  highlightVal: {
    fontWeight: '700',
    color: theme.colors.red,
    fontSize: 15,
  },
});
