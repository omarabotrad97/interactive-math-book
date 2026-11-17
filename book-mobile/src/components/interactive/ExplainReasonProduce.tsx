import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { theme } from '../../constants/theme';
import {
  evaluatePlaceValueJustification,
  JustificationEvaluation,
} from '../../services/aiEvaluationService';
import { formatNumber } from '../../services/mathEngine';
import { stopSpeech } from '../../services/audioService';

export interface ExplainReasonProduceProps {
  initialPair?: [number, number];
  targetDigit?: number;
  onSuccess?: (isIndependent: boolean) => void;
  onTeacherReview?: () => void;
  apiKey?: string;
}

export type AnswerMode = 'write' | 'voice' | 'teacher';

export const ExplainReasonProduce: React.FC<ExplainReasonProduceProps> = ({
  initialPair = [9605, 149605],
  targetDigit = 9,
  onSuccess,
  onTeacherReview,
  apiKey,
}) => {
  const [comparePair, setComparePair] = useState<[number, number]>(initialPair);
  const [activeDigit, setActiveDigit] = useState<number>(targetDigit);
  const [mode, setMode] = useState<AnswerMode>('write');
  const [writtenReason, setWrittenReason] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(false);
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // Scaffolding hint levels (1 to 3)
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [usedHelp, setUsedHelp] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<JustificationEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [statusBadge, setStatusBadge] = useState<string>('لم يحاول بعد');
  const [isCounterExampleMode, setIsCounterExampleMode] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopSpeech();
      setIsRecording(false);
    };
  }, []);

  const handleStartRecording = async () => {
    setMicNotice(null);
    setEvaluation(null);
    stopSpeech();

    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicNotice('لا بأس، يمكنك كتابة قراءتك أو قراءتها.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        (window as any).__currentStream = stream;
      } catch (err) {
        setMicNotice('لا بأس، يمكنك كتابة قراءتك أو قراءتها.');
        setIsRecording(false);
      }
    } else {
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecordedAudio(true);
    if (Platform.OS === 'web' && (window as any).__currentStream) {
      const stream = (window as any).__currentStream as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      (window as any).__currentStream = null;
    }
  };

  const handleDeleteRecording = () => {
    setHasRecordedAudio(false);
    setAudioTranscript('');
    setEvaluation(null);
  };

  const handleNextHint = () => {
    setUsedHelp(true);
    setStatusBadge('أنجز بمساعدة');
    setHintLevel((prev) => Math.min(3, prev + 1));
  };

  const handleSubmitEvaluation = async () => {
    const text = mode === 'write' ? writtenReason : audioTranscript;
    if (!text.trim()) {
      if (mode === 'voice' && hasRecordedAudio) {
        setStatusBadge('بانتظار مراجعة المعلم');
        setEvaluation({
          status: 'unclear',
          feedback: 'تم حفظ تسجيلك الصوتي لتبريرك الرياضي وهو بانتظار مراجعة المعلم. يمكنك أيضاً كتابة التبرير.',
        });
        if (onTeacherReview) onTeacherReview();
        return;
      }
      setEvaluation({
        status: 'empty',
        feedback: 'يرجى كتابة التبرير أو تسجيله أولاً.',
      });
      return;
    }

    setIsEvaluating(true);
    const result = await evaluatePlaceValueJustification(text, comparePair, activeDigit, apiKey);
    setIsEvaluating(false);
    setEvaluation(result);

    if (result.status === 'correct') {
      setIsCompleted(true);
      const isIndep = !usedHelp;
      setStatusBadge(isIndep ? 'نجح مستقلًا' : 'أنجز بمساعدة');
      if (onSuccess) onSuccess(isIndep);
    } else {
      setStatusBadge('حاول ويحتاج مراجعة');
    }
  };

  const handleLoadCounterExample = () => {
    // Counter-example where the digit values differ (e.g. 7,420 vs 72,400)
    setComparePair([7420, 72400]);
    setActiveDigit(7);
    setIsCounterExampleMode(true);
    setWrittenReason('');
    setHasRecordedAudio(false);
    setAudioTranscript('');
    setEvaluation(null);
    setHintLevel(0);
    setUsedHelp(false);
    setIsCompleted(false);
    setStatusBadge('لم يحاول بعد');
  };

  const renderHighlightedNumber = (num: number, target: number) => {
    const formatted = formatNumber(num);
    const targetStr = String(target);
    return (
      <View style={styles.numBadge}>
        {formatted.split('').map((char, idx) => {
          const isTarget = char === targetStr;
          return (
            <Text
              key={idx}
              style={[
                styles.numChar,
                isTarget ? styles.numCharHighlight : styles.numCharRegular,
              ]}
            >
              {char}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.activityBadge}>السؤال 17 · فسّر بطريقتك</Text>
          <Text style={[styles.statusBadge, (styles as Record<string, any>)[`status_${statusBadge}`] || styles.statusDefault]}>
            الحالة: {statusBadge}
          </Text>
        </View>
        <Text style={styles.headerTitle}>
          {isCounterExampleMode
            ? 'تحدي التحقق المستقل: هل تتساوى قيمة الرقم 7 في هذين العددين؟'
            : 'هل تتساوى القيمة المنزلية للرقم 9 في العددين الآتيين؟ ولماذا؟'}
        </Text>
      </View>

      {/* Number Comparison Display */}
      <View style={styles.comparisonBox}>
        <Text style={styles.comparisonPrompt}>قارن بين موقع الرقم الملوّن في العددين:</Text>
        <View style={styles.pairRow}>
          {renderHighlightedNumber(comparePair[0], activeDigit)}
          <Text style={styles.andText}>وَ</Text>
          {renderHighlightedNumber(comparePair[1], activeDigit)}
        </View>
      </View>

      {/* Sentence Stem */}
      <View style={styles.stemBox}>
        <Text style={styles.stemText}>
          {isCounterExampleMode
            ? 'بيّن بالتبرير الرياضي: هل تختلف قيمة الرقم 7 في العددين؟'
            : `قيمة الرقم ${activeDigit} متساوية في العددين لأن…`}
        </Text>
      </View>

      {/* Mode Switcher */}
      <View style={styles.modeTabs}>
        <Pressable
          style={[styles.tabButton, mode === 'write' && styles.tabButtonActive]}
          onPress={() => setMode('write')}
          accessibilityRole="button"
          accessibilityLabel="أكتب تبريري"
        >
          <Text style={[styles.tabText, mode === 'write' && styles.tabTextActive]}>
            أكتب تبريري
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, mode === 'voice' && styles.tabButtonActive]}
          onPress={() => setMode('voice')}
          accessibilityRole="button"
          accessibilityLabel="أفسّر بصوتي"
        >
          <Text style={[styles.tabText, mode === 'voice' && styles.tabTextActive]}>
            أفسّر بصوتي
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, mode === 'teacher' && styles.tabButtonActive]}
          onPress={() => setMode('teacher')}
          accessibilityRole="button"
          accessibilityLabel="أعرض على المعلم"
        >
          <Text style={[styles.tabText, mode === 'teacher' && styles.tabTextActive]}>
            أعرض على المعلم
          </Text>
        </Pressable>
      </View>

      {/* Mode 1: Written Input */}
      {mode === 'write' && (
        <View style={styles.sectionArea}>
          <Text style={styles.inputLabel}>اكتب تبريرك الرياضي بأسلوبك وبكلماتك الخاصة:</Text>
          <TextInput
            style={styles.textInputArea}
            placeholder="مثال: يقع في منزلة آحاد الألوف في العددين..."
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={4}
            value={writtenReason}
            onChangeText={setWrittenReason}
            textAlign="right"
            accessibilityLabel="حقل كتابة التبرير الرياضي"
          />
        </View>
      )}

      {/* Mode 2: Voice Input */}
      {mode === 'voice' && (
        <View style={styles.sectionArea}>
          {micNotice ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{micNotice}</Text>
            </View>
          ) : null}

          {!isRecording && !hasRecordedAudio && (
            <Pressable
              style={styles.voiceRecordBtn}
              onPress={handleStartRecording}
              accessibilityRole="button"
              accessibilityLabel="ابدأ تسجيل التبرير"
            >
              <Text style={styles.voiceRecordBtnText}>ابدأ التسجيل الصوتي</Text>
            </Pressable>
          )}

          {isRecording && (
            <View style={styles.recordingRow}>
              <View style={styles.redDot} />
              <Text style={styles.recordingText}>جاري تسجيل تبريرك ({recordingSeconds} ث)...</Text>
              <Pressable
                style={styles.stopRecordBtn}
                onPress={handleStopRecording}
                accessibilityRole="button"
                accessibilityLabel="انتهيت من التبرير"
              >
                <Text style={styles.stopRecordBtnText}>انتهيت</Text>
              </Pressable>
            </View>
          )}

          {hasRecordedAudio && !isRecording && (
            <View style={styles.recordedCard}>
              <Text style={styles.recordedTitle}>تم تسجيل تبريرك الصوتي بنجاح</Text>
              <View style={styles.recordedBtnRow}>
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={handleDeleteRecording}
                  accessibilityRole="button"
                  accessibilityLabel="حذف وإعادة التسجيل"
                >
                  <Text style={styles.secondaryBtnText}>إعادة التسجيل</Text>
                </Pressable>
              </View>

              <View style={styles.transcriptWrap}>
                <Text style={styles.transcriptWrapLabel}>تأكيد النص المفرغ قبل الإرسال:</Text>
                <TextInput
                  style={styles.transcriptField}
                  placeholder="إذا توفر التفريغ، يمكنك تعديله هنا..."
                  placeholderTextColor={theme.colors.muted}
                  value={audioTranscript}
                  onChangeText={setAudioTranscript}
                  textAlign="right"
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Mode 3: Teacher Presentation */}
      {mode === 'teacher' && (
        <View style={styles.sectionArea}>
          <Text style={styles.teacherInstruction}>
            اشرح لمعلمك شفهياً لماذا تتساوى القيمة المنزلية للرقم 9 في العددين.
          </Text>
          <Pressable
            style={styles.teacherSaveBtn}
            onPress={() => {
              setStatusBadge('بانتظار مراجعة المعلم');
              if (onTeacherReview) onTeacherReview();
            }}
            accessibilityRole="button"
            accessibilityLabel="تم الشرح أمام المعلم"
          >
            <Text style={styles.teacherSaveBtnText}>تسجيل كـ «بانتظار مراجعة المعلم»</Text>
          </Pressable>
        </View>
      )}

      {/* Scaffolding Hints (Levels 1 to 3) */}
      {hintLevel >= 1 && (
        <View style={styles.scaffoldBox}>
          <Text style={styles.scaffoldHeader}>تلميح متدرج (المستوى {hintLevel} من 3):</Text>
          {hintLevel >= 1 && (
            <Text style={styles.scaffoldStep}>
              • تلميح 1: ابدأ من الآحاد، وحدّد مكان الرقم {activeDigit}.
            </Text>
          )}
          {hintLevel >= 2 && (
            <Text style={styles.scaffoldStep}>
              • تلميح 2: كم خانة على يمين الرقم {activeDigit} في كل عدد؟
            </Text>
          )}
          {hintLevel >= 3 && (
            <Text style={styles.scaffoldStep}>
              • تلميح 3: أكمل: يقع الرقم {activeDigit} في منزلة آحاد الألوف في العددين، لذلك قيمته 9,000 في كليهما.
            </Text>
          )}
          <Text style={styles.scaffoldNotice}>
            ملاحظة: استخدام التلميح يسجّل الإنجاز «بمساعدة»، وسيعرض لك بعدها مثالاً مستقلاً لتأكيد فهمك.
          </Text>
        </View>
      )}

      {/* Evaluation Feedback Box */}
      {evaluation && (
        <View
          style={[
            styles.feedbackBox,
            evaluation.status === 'correct' ? styles.feedbackSuccess : styles.feedbackWarn,
          ]}
        >
          <Text style={styles.feedbackTitle}>
            {evaluation.status === 'correct'
              ? 'تبرير رياضي رائع!'
              : evaluation.status === 'incomplete'
              ? 'إجابة جيدة ولكن تنقصها خطوة:'
              : evaluation.status === 'insufficient'
              ? 'تنبيه رياضي مهم:'
              : evaluation.status === 'misconception'
              ? 'تصحيح مفهوم رياضي:'
              : 'ملاحظة:'}
          </Text>
          <Text style={styles.feedbackMsg}>{evaluation.feedback}</Text>
        </View>
      )}

      {/* Footer Buttons */}
      <View style={styles.footerRow}>
        {!isCompleted && hintLevel < 3 && (
          <Pressable
            style={styles.hintBtn}
            onPress={handleNextHint}
            accessibilityRole="button"
            accessibilityLabel="طلب تلميح متدرج"
          >
            <Text style={styles.hintBtnText}>
              {hintLevel === 0 ? 'أحتاج تلميحاً' : 'تلميح أعمق'}
            </Text>
          </Pressable>
        )}

        {!isCompleted && mode !== 'teacher' && (
          <Pressable
            style={[styles.primarySubmitBtn, isEvaluating && styles.buttonDisabled]}
            onPress={handleSubmitEvaluation}
            disabled={isEvaluating}
            accessibilityRole="button"
            accessibilityLabel="تحقق من التبرير"
          >
            <Text style={styles.primarySubmitBtnText}>
              {isEvaluating ? 'جاري التقييم...' : 'تحقق من تبريري'}
            </Text>
          </Pressable>
        )}

        {isCompleted && !isCounterExampleMode && (
          <Pressable
            style={styles.counterExampleBtn}
            onPress={handleLoadCounterExample}
            accessibilityRole="button"
            accessibilityLabel="تطبيق على مثال مغاير للتحقق المستقل"
          >
            <Text style={styles.counterExampleBtnText}>
              تطبيق على مثال مغاير (تحقق مستقل)
            </Text>
          </Pressable>
        )}
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
    padding: theme.spacing.lg,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  activityBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.limeLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
  },
  statusDefault: {
    backgroundColor: theme.colors.cream,
    color: theme.colors.ink,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
    lineHeight: 25,
  },
  comparisonBox: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  comparisonPrompt: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 10,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  andText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  numBadge: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
  },
  numChar: {
    fontSize: 26,
    fontWeight: '800',
  },
  numCharRegular: {
    color: theme.colors.ink,
  },
  numCharHighlight: {
    color: theme.colors.red,
    backgroundColor: theme.colors.redLight,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  stemBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
  },
  stemText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    textAlign: 'right',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  tabTextActive: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  sectionArea: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInputArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.ink,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  voiceRecordBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    alignItems: 'center',
  },
  voiceRecordBtnText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  recordingRow: {
    backgroundColor: theme.colors.redLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.red,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.red,
    marginBottom: 6,
  },
  recordingText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.red,
    marginBottom: 10,
  },
  stopRecordBtn: {
    backgroundColor: theme.colors.red,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: theme.radius.full,
  },
  stopRecordBtnText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  recordedCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  recordedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  recordedBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.cream,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
  },
  secondaryBtnText: {
    color: theme.colors.ink,
    fontSize: 13,
  },
  transcriptWrap: {
    marginTop: 6,
  },
  transcriptWrapLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 4,
    textAlign: 'right',
  },
  transcriptField: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 8,
    fontSize: 14,
    color: theme.colors.ink,
  },
  teacherInstruction: {
    fontSize: 15,
    color: theme.colors.ink,
    textAlign: 'center',
    marginBottom: 14,
  },
  teacherSaveBtn: {
    backgroundColor: theme.colors.inkLight,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  teacherSaveBtnText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  noticeBox: {
    backgroundColor: theme.colors.goldLight,
    padding: 10,
    borderRadius: theme.radius.sm,
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 13,
    color: theme.colors.gold,
    textAlign: 'center',
  },
  scaffoldBox: {
    backgroundColor: theme.colors.goldLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  scaffoldHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 6,
    textAlign: 'right',
  },
  scaffoldStep: {
    fontSize: 14,
    color: theme.colors.ink,
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 22,
  },
  scaffoldNotice: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 6,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  feedbackBox: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: theme.colors.limeLight,
    borderColor: theme.colors.lime,
  },
  feedbackWarn: {
    backgroundColor: theme.colors.goldLight,
    borderColor: theme.colors.gold,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 4,
    textAlign: 'right',
  },
  feedbackMsg: {
    fontSize: 14,
    color: theme.colors.ink,
    textAlign: 'right',
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  hintBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBtnText: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  primarySubmitBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primarySubmitBtnText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  counterExampleBtn: {
    flex: 1,
    backgroundColor: theme.colors.lime,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterExampleBtnText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
