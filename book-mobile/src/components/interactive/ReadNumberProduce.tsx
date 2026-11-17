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
  evaluateArabicNumberReading,
  NumberReadingEvaluation,
} from '../../services/aiEvaluationService';
import { formatNumber } from '../../services/mathEngine';
import { stopSpeech } from '../../services/audioService';

export interface ReadNumberProduceProps {
  level?: number;
  initialNumber?: number;
  onSuccess?: (isIndependent: boolean) => void;
  onTeacherReview?: (targetNum: number) => void;
  apiKey?: string;
}

export type AnswerMode = 'voice' | 'write' | 'teacher';

export const ReadNumberProduce: React.FC<ReadNumberProduceProps> = ({
  level = 1,
  initialNumber = 3040125,
  onSuccess,
  onTeacherReview,
  apiKey,
}) => {
  const [currentNumber, setCurrentNumber] = useState<number>(initialNumber);
  const [mode, setMode] = useState<AnswerMode>('write');
  const [writtenText, setWrittenText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState<boolean>(false);
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const [usedHelp, setUsedHelp] = useState<boolean>(false);
  const [showHintCard, setShowHintCard] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<NumberReadingEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [statusBadge, setStatusBadge] = useState<string>('لم يحاول بعد');

  // Timer for recording duration
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      setIsRecording(false);
    };
  }, []);

  const handleStartRecording = async () => {
    setMicError(null);
    setEvaluation(null);
    stopSpeech();

    // Check environment support
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('لا بأس، يمكنك كتابة قراءتك أو قراءتها.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted
        setIsRecording(true);
        // Clean stream on stop
        (window as any).__currentStream = stream;
      } catch (err) {
        setMicError('لا بأس، يمكنك كتابة قراءتك أو قراءتها.');
        setIsRecording(false);
      }
    } else {
      // Mobile / simulated
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecordedAudio(true);

    if (Platform.OS === 'web' && (window as any).__currentStream) {
      const stream = (window as any).__currentStream as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      (window as any).__currentStream = null;
    }
  };

  const handleDeleteRecording = () => {
    setHasRecordedAudio(false);
    setAudioTranscript('');
    setEvaluation(null);
  };

  const handleRequestHelp = () => {
    setUsedHelp(true);
    setShowHintCard(true);
    setStatusBadge('أنجز بمساعدة');
  };

  const handleSubmitEvaluation = async () => {
    const textToEvaluate = mode === 'write' ? writtenText : audioTranscript;
    if (!textToEvaluate.trim()) {
      if (mode === 'voice' && hasRecordedAudio) {
        // Voice recorded without transcription
        setStatusBadge('بانتظار مراجعة المعلم');
        setEvaluation({
          status: 'unclear',
          feedback: 'تم حفظ تسجيلك الصوتي بنجاح وهو بانتظار مراجعة المعلم. يمكنك أيضاً تجربة الكتابة.',
        });
        if (onTeacherReview) onTeacherReview(currentNumber);
        return;
      }
      setEvaluation({
        status: 'empty',
        feedback: 'يرجى إدخال القراءة أولاً للمتابعة.',
      });
      return;
    }

    setIsEvaluating(true);
    const result = await evaluateArabicNumberReading(textToEvaluate, currentNumber, apiKey);
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

  const handleNextChallenge = () => {
    // Generate new independent number based on level
    let nextNum = 7060314;
    if (currentNumber === 3040125) nextNum = 7060314;
    else if (currentNumber === 25000084) nextNum = 42000019;
    else if (currentNumber === 604200007) nextNum = 805400003;

    setCurrentNumber(nextNum);
    setWrittenText('');
    setHasRecordedAudio(false);
    setAudioTranscript('');
    setEvaluation(null);
    setShowHintCard(false);
    setUsedHelp(false);
    setIsCompleted(false);
    setStatusBadge('لم يحاول بعد');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Owl Greeting Header */}
      <View style={styles.owlCard}>
        <View style={styles.owlHeaderRow}>
          <Text style={styles.owlBadge}>البومة الحكيمة</Text>
          <Text style={[styles.statusBadge, (styles as Record<string, any>)[`status_${statusBadge}`] || styles.statusDefault]}>
            الحالة: {statusBadge}
          </Text>
        </View>
        <Text style={styles.owlInstruction}>
          تدرّبت جيدًا! الآن اقرأ هذا العدد بنفسك.
        </Text>
      </View>

      {/* Target Number Display */}
      <View style={styles.numberBox}>
        <Text style={styles.numberLabel}>العدد المطلوب قراءته:</Text>
        <Text style={styles.numberDigits}>{formatNumber(currentNumber)}</Text>
      </View>

      {/* Answer Mode Selector */}
      <View style={styles.modeTabs}>
        <Pressable
          style={[styles.tabButton, mode === 'write' && styles.tabButtonActive]}
          onPress={() => setMode('write')}
          accessibilityRole="button"
          accessibilityLabel="أكتب قراءتي"
        >
          <Text style={[styles.tabText, mode === 'write' && styles.tabTextActive]}>
            أكتب قراءتي
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, mode === 'voice' && styles.tabButtonActive]}
          onPress={() => setMode('voice')}
          accessibilityRole="button"
          accessibilityLabel="أقرأ بصوتي"
        >
          <Text style={[styles.tabText, mode === 'voice' && styles.tabTextActive]}>
            أقرأ بصوتي
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
        <View style={styles.inputSection}>
          <Text style={styles.inputPrompt}>
            اكتب قراءة العدد بالكلمات باللغة العربية الفصحى:
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="مثال: ثلاثة ملايين وأربعون ألفًا..."
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={4}
            value={writtenText}
            onChangeText={setWrittenText}
            textAlign="right"
            accessibilityLabel="حقل كتابة قراءة العدد"
          />
        </View>
      )}

      {/* Mode 2: Voice Recording */}
      {mode === 'voice' && (
        <View style={styles.voiceSection}>
          {micError ? (
            <View style={styles.errorNotice}>
              <Text style={styles.errorNoticeText}>{micError}</Text>
            </View>
          ) : null}

          {!isRecording && !hasRecordedAudio && (
            <Pressable
              style={styles.recordButton}
              onPress={handleStartRecording}
              accessibilityRole="button"
              accessibilityLabel="ابدأ التسجيل الصوتي"
            >
              <Text style={styles.recordButtonText}>ابدأ التسجيل</Text>
            </Pressable>
          )}

          {isRecording && (
            <View style={styles.recordingActiveBox}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                جاري التسجيل... ({recordingSeconds} ثانية)
              </Text>
              <Pressable
                style={styles.stopButton}
                onPress={handleStopRecording}
                accessibilityRole="button"
                accessibilityLabel="انتهيت من التسجيل"
              >
                <Text style={styles.stopButtonText}>انتهيت</Text>
              </Pressable>
            </View>
          )}

          {hasRecordedAudio && !isRecording && (
            <View style={styles.recordedBox}>
              <Text style={styles.recordedLabel}>تم حفظ تسجيلك الصوتي بنجاح</Text>
              <View style={styles.audioActionRow}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={handleDeleteRecording}
                  accessibilityRole="button"
                  accessibilityLabel="حذف وإعادة التسجيل"
                >
                  <Text style={styles.secondaryButtonText}>حذف وإعادة التسجيل</Text>
                </Pressable>
              </View>

              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>نص القراءة المسجلة (للتأكيد قبل الاعتماد):</Text>
                <TextInput
                  style={styles.transcriptInput}
                  placeholder="إذا ظهر التفريغ الصوتي، يمكنك مراجعته وتعديله هنا..."
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
        <View style={styles.teacherSection}>
          <Text style={styles.teacherPrompt}>
            اقرأ هذا العدد بصوت واضح ومسموع لمعلمك أو ولي أمرك:
          </Text>
          <View style={styles.teacherCard}>
            <Text style={styles.teacherCardNum}>{formatNumber(currentNumber)}</Text>
          </View>
          <Pressable
            style={styles.teacherSubmitBtn}
            onPress={() => {
              setStatusBadge('بانتظار مراجعة المعلم');
              if (onTeacherReview) onTeacherReview(currentNumber);
            }}
            accessibilityRole="button"
            accessibilityLabel="تمت القراءة أمام المعلم"
          >
            <Text style={styles.teacherSubmitBtnText}>تسجيل كـ «بانتظار مراجعة المعلم»</Text>
          </Pressable>
        </View>
      )}

      {/* Scaffolding Hint Area */}
      {showHintCard && (
        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>تلميح البومة لمساعدتك:</Text>
          <Text style={styles.hintStep}>1. دورة الملايين: حدد كم مليوناً في أقصى اليسار.</Text>
          <Text style={styles.hintStep}>2. دورة الألوف: اقرأ المنازل الثلاث في الوسط (تجاوز الأصفار إذا كانت الدورة كلها أصفاراً).</Text>
          <Text style={styles.hintStep}>3. دورة الآحاد: اقرأ المنازل الثلاث الأخيرة في اليمين.</Text>
          <Text style={styles.hintNote}>
            ملاحظة تربوية: تم تسجيل محاولتك الحالية «بمساعدة». بعد إتمامها سيظهر لك عدد جديد لتثبت إتقانك مستقلًا!
          </Text>
        </View>
      )}

      {/* Feedback Message */}
      {evaluation && (
        <View
          style={[
            styles.feedbackBox,
            evaluation.status === 'correct' ? styles.feedbackSuccess : styles.feedbackWarning,
          ]}
        >
          <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
        </View>
      )}

      {/* Action Footer Buttons */}
      <View style={styles.footerRow}>
        {!showHintCard && !isCompleted && (
          <Pressable
            style={styles.helpButton}
            onPress={handleRequestHelp}
            accessibilityRole="button"
            accessibilityLabel="طلب مساعدة من البومة"
          >
            <Text style={styles.helpButtonText}>أحتاج مساعدة</Text>
          </Pressable>
        )}

        {!isCompleted && mode !== 'teacher' && (
          <Pressable
            style={[styles.primaryButton, isEvaluating && styles.buttonDisabled]}
            onPress={handleSubmitEvaluation}
            disabled={isEvaluating}
            accessibilityRole="button"
            accessibilityLabel="تحقق من قراءتي"
          >
            <Text style={styles.primaryButtonText}>
              {isEvaluating ? 'جاري الفحص...' : 'تحقق من قراءتي'}
            </Text>
          </Pressable>
        )}

        {isCompleted && (
          <Pressable
            style={styles.nextChallengeBtn}
            onPress={handleNextChallenge}
            accessibilityRole="button"
            accessibilityLabel="تحدي جديد مستقل"
          >
            <Text style={styles.nextChallengeText}>تحدي جديد مستقل</Text>
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
  owlCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
  },
  owlHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  owlBadge: {
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
  status_نجح_مستقلا: {
    backgroundColor: theme.colors.limeLight,
    color: theme.colors.primaryDark,
  },
  status_أنجز_بمساعدة: {
    backgroundColor: theme.colors.goldLight,
    color: theme.colors.gold,
  },
  owlInstruction: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
    lineHeight: 26,
  },
  numberBox: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  numberLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  numberDigits: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primaryDark,
    letterSpacing: 2,
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
  inputSection: {
    marginBottom: theme.spacing.md,
  },
  inputPrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.sm,
    textAlign: 'right',
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.ink,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  voiceSection: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  recordButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  recordingActiveBox: {
    backgroundColor: theme.colors.redLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.red,
  },
  recordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.red,
    marginBottom: 6,
  },
  recordingText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.red,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: theme.colors.red,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: theme.radius.full,
  },
  stopButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  recordedBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  recordedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  audioActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  transcriptBox: {
    marginTop: 8,
  },
  transcriptLabel: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 4,
    textAlign: 'right',
  },
  transcriptInput: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 8,
    fontSize: 14,
    color: theme.colors.ink,
  },
  teacherSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  teacherPrompt: {
    fontSize: 15,
    color: theme.colors.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  teacherCard: {
    backgroundColor: theme.colors.cream,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: 14,
  },
  teacherCardNum: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  teacherSubmitBtn: {
    backgroundColor: theme.colors.inkLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
  },
  teacherSubmitBtnText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  errorNotice: {
    backgroundColor: theme.colors.goldLight,
    padding: 10,
    borderRadius: theme.radius.sm,
    marginBottom: 10,
    width: '100%',
  },
  errorNoticeText: {
    fontSize: 14,
    color: theme.colors.gold,
    textAlign: 'center',
  },
  hintCard: {
    backgroundColor: theme.colors.goldLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  hintTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.ink,
    marginBottom: 6,
    textAlign: 'right',
  },
  hintStep: {
    fontSize: 14,
    color: theme.colors.ink,
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 4,
  },
  hintNote: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'right',
    marginTop: 6,
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
  feedbackWarning: {
    backgroundColor: theme.colors.goldLight,
    borderColor: theme.colors.gold,
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.ink,
    textAlign: 'right',
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: theme.spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  helpButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  helpButtonText: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
  },
  secondaryButtonText: {
    color: theme.colors.ink,
    fontSize: 13,
  },
  nextChallengeBtn: {
    flex: 1,
    backgroundColor: theme.colors.lime,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  nextChallengeText: {
    color: theme.colors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
