import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { MISSIONS, Mission, MissionStep } from '../constants/curriculum';
import { PlaceValueTable } from '../components/interactive/PlaceValueTable';
import { NumberWheel } from '../components/interactive/NumberWheel';
import { PeriodCardSelector } from '../components/interactive/PeriodCardSelector';
import { getPeriodParts, formatNumber } from '../services/mathEngine';
import { triggerHaptic, speakArabic } from '../services/audioService';
import { CheckIcon, SoundIcon, ArrowRightIcon } from '../components/common/Icons';

interface MissionScreenProps {
  missionId: number;
  onMissionComplete: (missionId: number, scoreAward: number) => void;
  onMistake: () => void;
  onBackToMap: () => void;
  muted: boolean;
}

export const MissionScreen: React.FC<MissionScreenProps> = ({
  missionId,
  onMissionComplete,
  onMistake,
  onBackToMap,
  muted,
}) => {
  const mission: Mission = MISSIONS.find((m: Mission) => m.id === missionId) || MISSIONS[0];
  const [stepIndex, setStepIndex] = useState(0);
  const [wheelVal, setWheelVal] = useState<number>(mission.steps[0]?.initial || 0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);

  const step: MissionStep = mission.steps[stepIndex] || mission.steps[0];

  const handleNextStep = () => {
    if (stepIndex + 1 < mission.steps.length) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setFeedback(null);
      setStepCompleted(false);
      const nextStep = mission.steps[stepIndex + 1];
      if (nextStep.initial !== undefined) setWheelVal(nextStep.initial);
    } else {
      triggerHaptic('success');
      onMissionComplete(mission.id, 20);
    }
  };

  const handleChoice = (optIdx: number) => {
    setSelectedChoice(optIdx);
    if (optIdx === step.correct) {
      triggerHaptic('success');
      setFeedback({
        isCorrect: true,
        text: step.reason || 'إجابة صحيحة وممتازة! أحسنت صنعاً.',
      });
      setStepCompleted(true);
    } else {
      triggerHaptic('error');
      onMistake();
      setFeedback({
        isCorrect: false,
        text: 'محاولة غير صحيحة. ' + (step.hint || 'تذكّر عدّ المنازل بدقة.'),
      });
    }
  };

  const handleVaultCheck = () => {
    if (wheelVal === step.n) {
      triggerHaptic('success');
      setFeedback({
        isCorrect: true,
        text: 'فُتحت الخزنة بنجاح! كوّنت العدد القياسي بدقة.',
      });
      setStepCompleted(true);
    } else {
      triggerHaptic('error');
      onMistake();
      setFeedback({
        isCorrect: false,
        text: 'العدد الموجود على الخزنة لا يطابق المطلوب. ' + (step.hint || ''),
      });
    }
  };

  const handlePlaceSelect = (p: number) => {
    if (step.type === 'target') {
      if (p === step.p) {
        triggerHaptic('success');
        setFeedback({
          isCorrect: true,
          text: step.reason || 'أحسنت! هذا هو البيت المطلوب.',
        });
        setStepCompleted(true);
      } else {
        triggerHaptic('error');
        onMistake();
        setFeedback({
          isCorrect: false,
          text: step.hint || 'حاول مرة أخرى.',
        });
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar with Navigation */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToMap}>
          <ArrowRightIcon size={18} color={theme.colors.primary} />
          <Text style={styles.backBtnText}>العودة للخريطة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listenBtn}
          onPress={() => speakArabic(step.prompt, muted)}
        >
          <SoundIcon size={18} color={theme.colors.primary} />
          <Text style={styles.listenBtnText}>استمع</Text>
        </TouchableOpacity>
      </View>

      {/* Mission Title Card */}
      <View style={styles.titleCard}>
        <View style={styles.metaRow}>
          <Text style={styles.sourceTag}>{mission.source}</Text>
          <Text style={styles.stepProgress}>
            خطوة {stepIndex + 1} من {mission.steps.length}
          </Text>
        </View>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.missionGoal}>{mission.goal}</Text>
      </View>

      {/* Current Step Prompt */}
      <View style={styles.promptCard}>
        <Text style={styles.promptText}>{step.prompt}</Text>
        {step.hint ? <Text style={styles.hintText}>تلميح: {step.hint}</Text> : null}
      </View>

      {/* Interactive Step Content by Type */}
      {step.type === 'target' && step.n && (
        <PlaceValueTable
          n={step.n}
          highlightP={stepCompleted ? step.p : undefined}
          onSelectPlace={handlePlaceSelect}
        />
      )}

      {step.type === 'wheels' && (
        <View>
          <NumberWheel value={wheelVal} onChange={setWheelVal} />
          {!stepCompleted && (
            <TouchableOpacity style={styles.submitBtn} onPress={handleVaultCheck}>
              <Text style={styles.submitBtnText}>تحقق من الخزنة</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {step.type === 'verbal' && step.n && (
        <PeriodCardSelector
          parts={getPeriodParts(step.n)}
          onComplete={() => {
            setFeedback({
              isCorrect: true,
              text: 'أحسنت! كوّنت الصيغة اللفظية بالترتيب السليم.',
            });
            setStepCompleted(true);
          }}
        />
      )}

      {step.options && step.options.length > 0 && (
        <View style={styles.optionsList}>
          {step.options.map((opt: string | number, i: number) => {
            const isSelected = selectedChoice === i;
            const isCorrect = i === step.correct;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionBtn,
                  isSelected && (isCorrect ? styles.optCorrect : styles.optWrong),
                ]}
                onPress={() => !stepCompleted && handleChoice(i)}
                disabled={stepCompleted}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>
                  {typeof opt === 'number' ? formatNumber(opt) : opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Feedback Message Box */}
      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              feedback.isCorrect ? styles.feedbackCorrectText : styles.feedbackWrongText,
            ]}
          >
            {feedback.text}
          </Text>
        </View>
      )}

      {/* Next Step / Complete Button */}
      {stepCompleted && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
          <CheckIcon size={20} color="#ffffff" />
          <Text style={styles.nextBtnText}>
            {stepIndex + 1 < mission.steps.length ? 'الانتقال للخطوة التالية' : 'إكمال المهمة (+20 نقطة)'}
          </Text>
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
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  backBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.sm,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  listenBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.sm,
  },
  listenBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  titleCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    ...theme.shadows.soft,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sourceTag: {
    fontSize: 11,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  stepProgress: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
  },
  missionGoal: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'right',
    marginTop: 2,
  },
  promptCard: {
    backgroundColor: theme.colors.cream,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    marginBottom: theme.spacing.sm,
  },
  promptText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    textAlign: 'right',
    lineHeight: 22,
  },
  hintText: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '500',
  },
  optionsList: {
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
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
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackBox: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: theme.colors.limeLight,
    borderColor: theme.colors.lime,
  },
  feedbackWrong: {
    backgroundColor: theme.colors.redLight,
    borderColor: theme.colors.red,
  },
  feedbackText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
  feedbackCorrectText: {
    color: theme.colors.primaryDark,
  },
  feedbackWrongText: {
    color: theme.colors.red,
  },
  nextBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
