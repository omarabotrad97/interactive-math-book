import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { PLACES } from '../constants/places';
import { digit, formatNumber, words, expansion, distort3Digits } from '../services/mathEngine';
import { triggerHaptic } from '../services/audioService';
import { TrophyIcon, SparkleIcon, CheckIcon } from '../components/common/Icons';

interface InfiniteChallengeScreenProps {
  onEarnBonus: (points: number) => void;
  onMistake: () => void;
}

interface Question {
  prompt: string;
  options: (string | number)[];
  correctIndex: number;
  explanation: string;
}

export const InfiniteChallengeScreen: React.FC<InfiniteChallengeScreenProps> = ({
  onEarnBonus,
  onMistake,
}) => {
  const [streak, setStreak] = useState(0);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Generate random curriculum question within millions (1,000,000 to 999,999,999)
  const generateQuestion = (): Question => {
    const qTypes = ['place', 'zeros', 'verbal', 'expanded'];
    const type = qTypes[Math.floor(Math.random() * qTypes.length)];
    const n = Math.floor(Math.random() * 899000000) + 10000000; // 8-9 digits

    if (type === 'place') {
      const p = Math.floor(Math.random() * 8); // 0 to 7
      const d = digit(n, p);
      const val = d * 10 ** p;
      const opts = [
        val,
        val * 10,
        Math.max(d, Math.floor(val / 10)),
        (d === 9 ? 8 : d + 1) * 10 ** p,
      ].sort(() => 0.5 - Math.random());
      const correctIndex = opts.indexOf(val);

      return {
        prompt: `ما القيمة المنزلية للرقم (${d}) في العدد (${formatNumber(n)})؟`,
        options: opts.map((o) => formatNumber(o)),
        correctIndex,
        explanation: `الرقم ${d} يقع في منزلة ${PLACES[p]}، وقيمته = ${formatNumber(val)}.`,
      };
    }

    if (type === 'verbal') {
      const m = Math.floor(n / 1e6);
      const text = `${m} مليونًا`;
      const d1 = `${distort3Digits(m)} مليونًا`;
      const d2 = `${m} ألفًا`;
      const opts = [text, d1, d2].sort(() => 0.5 - Math.random());
      const correctIndex = opts.indexOf(text);

      return {
        prompt: `ما هي قراءة دورة الملايين فقط في العدد (${formatNumber(n)})؟`,
        options: opts,
        correctIndex,
        explanation: `دورة الملايين تحتوي على ${m}، وتُقرأ: ${text}.`,
      };
    }

    // Default expanded question
    const p = 6; // Millions
    const d = digit(n, p);
    const val = d * 10 ** p;
    const opts = [
      formatNumber(val),
      formatNumber(val / 10),
      formatNumber(val * 10),
    ].sort(() => 0.5 - Math.random());
    const correctIndex = opts.indexOf(formatNumber(val));

    return {
      prompt: `في الصيغة التحليلية للعدد (${formatNumber(n)})، ما هو حدّ منزلة آحاد الملايين؟`,
      options: opts,
      correctIndex,
      explanation: `الرقم ${d} في آحاد الملايين يمثل الحد: ${formatNumber(val)}.`,
    };
  };

  useEffect(() => {
    setCurrentQ(generateQuestion());
  }, []);

  const handleAnswer = (idx: number) => {
    if (!currentQ || isDone) return;
    setSelectedIdx(idx);
    setIsDone(true);

    if (idx === currentQ.correctIndex) {
      triggerHaptic('success');
      setStreak(streak + 1);
      onEarnBonus(10);
      setFeedback(`إجابة صحيحة ومتقنة! +10 نقاط. ${currentQ.explanation}`);
    } else {
      triggerHaptic('error');
      setStreak(0);
      onMistake();
      setFeedback(`محاولة غير صحيحة. ${currentQ.explanation}`);
    }
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setFeedback(null);
    setIsDone(false);
    setCurrentQ(generateQuestion());
  };

  if (!currentQ) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Streak Banner */}
      <View style={styles.streakBanner}>
        <View style={styles.streakLeft}>
          <SparkleIcon size={22} color={theme.colors.gold} />
          <Text style={styles.streakText}>سلسلة الإجابات: {streak}</Text>
        </View>
        <View style={styles.streakRight}>
          <TrophyIcon size={18} color={theme.colors.lime} />
          <Text style={styles.bonusText}>+10 نقاط لكل حل</Text>
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text style={styles.promptText}>{currentQ.prompt}</Text>
      </View>

      {/* Options List */}
      <View style={styles.optionsList}>
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedIdx === i;
          const isCorrect = i === currentQ.correctIndex;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionBtn,
                isDone && isCorrect && styles.optCorrect,
                isDone && isSelected && !isCorrect && styles.optWrong,
              ]}
              onPress={() => handleAnswer(i)}
              disabled={isDone}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback Message */}
      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            selectedIdx === currentQ.correctIndex ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Next Question Button */}
      {isDone && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <CheckIcon size={20} color="#ffffff" />
          <Text style={styles.nextBtnText}>المسألة التالية</Text>
        </TouchableOpacity>
      )}
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
  streakBanner: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    ...theme.shadows.soft,
    marginBottom: theme.spacing.md,
  },
  streakLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  streakRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  questionCard: {
    backgroundColor: theme.colors.cream,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    marginBottom: theme.spacing.md,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  optionBtn: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    ...theme.shadows.soft,
  },
  optCorrect: {
    backgroundColor: theme.colors.limeLight,
    borderColor: theme.colors.lime,
  },
  optWrong: {
    backgroundColor: theme.colors.redLight,
    borderColor: theme.colors.red,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
  },
  feedbackBox: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  feedbackCorrect: {
    backgroundColor: theme.colors.limeLight,
  },
  feedbackWrong: {
    backgroundColor: theme.colors.redLight,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.ink,
    textAlign: 'center',
    lineHeight: 20,
  },
  nextBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    ...theme.shadows.medium,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
