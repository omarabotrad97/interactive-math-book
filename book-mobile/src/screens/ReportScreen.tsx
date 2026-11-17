import React from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { TrophyIcon, StarIcon, CheckIcon, BookIcon } from '../components/common/Icons';

interface ReportScreenProps {
  score: number;
  completedMissionsCount: number;
  errorsCount: number;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  skillStats: {
    place: { ok: number; err: number };
    verbal: { ok: number; err: number };
    standard: { ok: number; err: number };
    expanded: { ok: number; err: number };
  };
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  score,
  completedMissionsCount,
  errorsCount,
  studentName,
  onUpdateStudentName,
  skillStats,
}) => {
  const skillsList = [
    { key: 'place', label: 'المنزلة والقيمة المنزلية', ok: skillStats.place.ok, err: skillStats.place.err },
    { key: 'verbal', label: 'الصيغة اللفظية (قراءة الأعداد)', ok: skillStats.verbal.ok, err: skillStats.verbal.err },
    { key: 'standard', label: 'الصيغة القياسية (الخزنة والأرقام)', ok: skillStats.standard.ok, err: skillStats.standard.err },
    { key: 'expanded', label: 'الصيغة التحليلية واكتشاف الخطأ', ok: skillStats.expanded.ok, err: skillStats.expanded.err },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Summary */}
      <View style={styles.headerCard}>
        <TrophyIcon size={40} color={theme.colors.gold} />
        <Text style={styles.headerTitle}>تقرير الإنجاز وتشخيص المهارات</Text>
        <Text style={styles.headerSubtitle}>
          تابع مستواك في مهارات الأعداد ضمن الملايين واستلم شهادتك
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{score}</Text>
            <Text style={styles.statLabel}>مجموع النقاط</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{completedMissionsCount}/12</Text>
            <Text style={styles.statLabel}>مهام الكتاب</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{errorsCount}</Text>
            <Text style={styles.statLabel}>محاولات تعلّمت منها</Text>
          </View>
        </View>
      </View>

      {/* Skills Diagnostic Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>تشخيص المهارات الأربع</Text>
        <View style={styles.skillsList}>
          {skillsList.map((sk) => {
            const total = sk.ok + sk.err;
            const pct = total === 0 ? 100 : Math.round((sk.ok / total) * 100);
            return (
              <View key={sk.key} style={styles.skillRow}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillName}>{sk.label}</Text>
                  <Text style={styles.skillPct}>{pct}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Student Name Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>اسم بطل أو بطلة الأعداد:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="اكتب اسمك ليظهر في الشهادة..."
          placeholderTextColor={theme.colors.muted}
          value={studentName}
          onChangeText={onUpdateStudentName}
          textAlign="right"
          maxLength={40}
        />
      </View>

      {/* Certificate Card */}
      <View style={styles.certCard}>
        <View style={styles.certBorder}>
          <Text style={styles.certCountry}>
            المملكة الأردنية الهاشمية · وزارة التربية والتعليم
          </Text>
          <Text style={styles.certGrade}>الرياضيات · الصف الخامس الأساسي</Text>
          <Text style={styles.certTitle}>شهادة أسطورة الملايين</Text>

          <Text style={styles.certIntro}>تُمنح هذه الشهادة بفخر واعتزاز إلى البطل:</Text>
          <Text style={styles.certName}>{studentName.trim() || 'بطل رحلة الملايين'}</Text>

          <Text style={styles.certReason}>
            لإتقانه قراءة الأعداد الكبيرة ضمن الملايين، وتحديد قيمها المنزلية وصيغها القياسية والتحليلية واللفظية بدقة وتفوق.
          </Text>

          <View style={styles.certFooter}>
            <View style={styles.badgeItem}>
              <StarIcon size={18} color={theme.colors.gold} filled />
              <Text style={styles.badgeText}>النقاط: {score}</Text>
            </View>
            <View style={styles.badgeItem}>
              <CheckIcon size={16} color={theme.colors.primary} />
              <Text style={styles.badgeText}>المهام: {completedMissionsCount}/12</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    marginTop: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    paddingTop: theme.spacing.md,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
    marginBottom: theme.spacing.sm,
  },
  skillsList: {
    gap: theme.spacing.md,
  },
  skillRow: {},
  skillHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  skillPct: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.cream,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  inputCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.paper,
    borderWidth: 1.5,
    borderColor: theme.colors.lineDark,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.ink,
  },
  certCard: {
    backgroundColor: '#fffcf0',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 3,
    borderColor: theme.colors.gold,
    ...theme.shadows.medium,
  },
  certBorder: {
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  certCountry: {
    fontSize: 11,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  certGrade: {
    fontSize: 11,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  certTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.sm,
  },
  certIntro: {
    fontSize: 12,
    color: theme.colors.ink,
  },
  certName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.gold,
    marginVertical: theme.spacing.xs,
    textAlign: 'center',
  },
  certReason: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  certFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    paddingTop: theme.spacing.sm,
  },
  badgeItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.ink,
  },
});
