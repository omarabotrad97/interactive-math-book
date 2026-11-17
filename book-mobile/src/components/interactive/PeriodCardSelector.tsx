import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { PeriodCardPart } from '../../services/mathEngine';
import { triggerHaptic } from '../../services/audioService';

interface PeriodCardSelectorProps {
  parts: PeriodCardPart[];
  onComplete: () => void;
}

export const PeriodCardSelector: React.FC<PeriodCardSelectorProps> = ({
  parts,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  if (parts.length === 0) return null;

  const currentPart = parts[currentStepIndex];
  const allChoices = currentPart
    ? [currentPart.text, ...currentPart.distractors].sort(() => 0.5 - Math.random())
    : [];

  const handleSelectChoice = (choice: string) => {
    if (choice === currentPart.text) {
      triggerHaptic('success');
      setErrorMessage('');
      const newSelected = [...selectedWords, choice];
      setSelectedWords(newSelected);

      if (currentStepIndex + 1 < parts.length) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onComplete();
      }
    } else {
      triggerHaptic('error');
      setErrorMessage('حاول مرة أخرى! راقب الدورة والمنازل بعناية.');
    }
  };

  const isFinished = currentStepIndex >= parts.length;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>
        {isFinished
          ? 'أحسنت! كوّنت الصيغة اللفظية بنجاح:'
          : `اختر بطاقة (${currentPart?.periodName}) الصحيحة:`}
      </Text>

      {/* Selected Sentence Box */}
      <View style={styles.sentenceBox}>
        <Text style={styles.sentenceText}>
          {selectedWords.length > 0 ? selectedWords.join(' ') : 'اضغط على البطاقة المناسبة لبدء تكوين العدد...'}
        </Text>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Options Cards */}
      {!isFinished && (
        <View style={styles.optionsList}>
          {allChoices.map((choice, i) => (
            <TouchableOpacity
              key={i}
              style={styles.cardBtn}
              onPress={() => handleSelectChoice(choice)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardText}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    ...theme.shadows.soft,
    marginVertical: theme.spacing.sm,
  },
  prompt: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  sentenceBox: {
    backgroundColor: theme.colors.cream,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  sentenceText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    color: theme.colors.red,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  optionsList: {
    gap: theme.spacing.sm,
  },
  cardBtn: {
    backgroundColor: theme.colors.paper,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
  },
});
