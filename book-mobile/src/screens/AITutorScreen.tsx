import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../constants/theme';
import { askGeminiTutor, StudentContext } from '../services/geminiAI';
import { speakArabic } from '../services/audioService';
import { SparkleIcon, SoundIcon } from '../components/common/Icons';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
}

interface AITutorScreenProps {
  studentContext: StudentContext;
  geminiApiKey: string;
  onSaveApiKey: (key: string) => void;
  muted: boolean;
}

export const AITutorScreen: React.FC<AITutorScreenProps> = ({
  studentContext,
  geminiApiKey,
  onSaveApiKey,
  muted,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `مرحباً بك يا ${
        studentContext.studentName || 'بطل الرياضيات'
      }! أنا «البومة الحكيمة»، معلمك الذكي لدرس القيمة المنزلية ضمن الملايين. اسألني عن أي منزلة أو فكرة وسأشرحها لك خطوة بخطوة.`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey);

  const quickQuestions = [
    'اشرح لي دورة الملايين بالتفصيل',
    'ما الفرق بين الصيغة القياسية والتحليلية؟',
    'كيف أحدد عدد الأصفار في القيمة المنزلية؟',
    'شخّص مستواي الحالي في الدرس',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const reply = await askGeminiTutor(userMsg.text, studentContext, geminiApiKey);

    const tutorMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'tutor',
      text: reply.text,
    };

    setMessages((prev) => [...prev, tutorMsg]);
    setLoading(false);
    speakArabic(reply.text, muted);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <SparkleIcon size={24} color={theme.colors.gold} />
          <View>
            <Text style={styles.tutorName}>المعلم الذكي · البومة الحكيمة</Text>
            <Text style={styles.tutorStatus}>
              {geminiApiKey ? 'مدعوم بنماذج Gemini الحية' : 'المرشد السقراطي المدمج (Offline)'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Text style={styles.settingsText}>{showSettings ? 'إغلاق' : 'المفتاح'}</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Box (Collapsible) */}
      {showSettings && (
        <View style={styles.settingsBox}>
          <Text style={styles.settingsLabel}>مفتاح Google Gemini API (اختياري):</Text>
          <TextInput
            style={styles.keyInput}
            placeholder="ألصق مفتاح AI Studio هنا..."
            placeholderTextColor={theme.colors.muted}
            value={tempKey}
            onChangeText={setTempKey}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.saveKeyBtn}
            onPress={() => {
              onSaveApiKey(tempKey);
              setShowSettings(false);
            }}
          >
            <Text style={styles.saveKeyText}>حفظ المفتاح</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages Scroll Area */}
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.msgRow, msg.sender === 'user' ? styles.userRow : styles.tutorRow]}
          >
            <View
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.tutorBubble,
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  msg.sender === 'user' ? styles.userText : styles.tutorText,
                ]}
              >
                {msg.text}
              </Text>

              {msg.sender === 'tutor' && (
                <TouchableOpacity
                  style={styles.speakBtn}
                  onPress={() => speakArabic(msg.text, muted)}
                >
                  <SoundIcon size={14} color={theme.colors.primary} />
                  <Text style={styles.speakText}>استمع</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>البومة الحكيمة تفكّر...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {quickQuestions.map((q, i) => (
            <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(q)}>
              <Text style={styles.chipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          placeholder="اكتب سؤالك هنا..."
          placeholderTextColor={theme.colors.muted}
          value={inputText}
          onChangeText={setInputText}
          textAlign="right"
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendText}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.line,
    ...theme.shadows.soft,
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  tutorName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
  },
  tutorStatus: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  settingsToggle: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.sm,
  },
  settingsText: {
    fontSize: 11,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  settingsBox: {
    backgroundColor: theme.colors.cream,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  settingsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
    marginBottom: 4,
  },
  keyInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    borderRadius: theme.radius.sm,
    padding: 8,
    fontSize: 12,
    color: theme.colors.ink,
  },
  saveKeyBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  saveKeyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  msgRow: {
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-start',
  },
  tutorRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 2,
  },
  tutorBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    borderBottomRightRadius: 2,
    ...theme.shadows.soft,
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'right',
  },
  userText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  tutorText: {
    color: theme.colors.ink,
  },
  speakBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  speakText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  chipsRow: {
    paddingVertical: 6,
    backgroundColor: theme.colors.paper,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  chipsContent: {
    paddingHorizontal: theme.spacing.md,
    gap: 8,
    flexDirection: 'row-reverse',
  },
  chip: {
    backgroundColor: theme.colors.cream,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
  },
  chipText: {
    fontSize: 11,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row-reverse',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1.5,
    borderTopColor: theme.colors.line,
    alignItems: 'center',
    gap: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: theme.colors.paper,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.ink,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
