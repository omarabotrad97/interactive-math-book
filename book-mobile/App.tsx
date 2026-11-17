import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { theme } from './src/constants/theme';
import { HUD } from './src/components/common/HUD';
import { BottomNav, TabType } from './src/components/common/BottomNav';
import { MapScreen } from './src/screens/MapScreen';
import { MissionScreen } from './src/screens/MissionScreen';
import { InfiniteChallengeScreen } from './src/screens/InfiniteChallengeScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { AITutorScreen } from './src/screens/AITutorScreen';
import { loadState, saveState, AppState, defaultState } from './src/services/storage';
import { PathNode } from './src/constants/curriculum';
import { triggerHaptic } from './src/services/audioService';
import { HeartIcon } from './src/components/common/Icons';

export default function App() {
  const [appState, setAppState] = useState<AppState>(defaultState);
  const [currentTab, setCurrentTab] = useState<TabType>('map');
  const [activeMissionId, setActiveMissionId] = useState<number>(0);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Initialize and load saved state
  useEffect(() => {
    async function init() {
      const saved = await loadState();
      setAppState(saved);
      setLoaded(true);
    }
    init();
  }, []);

  // Save on updates
  useEffect(() => {
    if (loaded) {
      saveState(appState);
    }
  }, [appState, loaded]);

  const handleToggleSound = () => {
    setAppState((prev) => ({ ...prev, muted: !prev.muted }));
  };

  const handleMistake = () => {
    setAppState((prev) => {
      const newHearts = Math.max(0, prev.hearts - 1);
      if (newHearts === 0) {
        setShowRechargeModal(true);
      }
      return {
        ...prev,
        hearts: newHearts,
        errors: prev.errors + 1,
      };
    });
  };

  const handleEarnScore = (points: number) => {
    setAppState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));
  };

  const handleMissionComplete = (mId: number, scoreAward: number) => {
    setAppState((prev) => {
      const updatedMissions = prev.completedMissions.includes(mId)
        ? prev.completedMissions
        : [...prev.completedMissions, mId];

      const nextNodeId = Math.min(19, prev.activeNode + 1);
      const updatedNodes = prev.completedNodes.includes(prev.activeNode)
        ? prev.completedNodes
        : [...prev.completedNodes, prev.activeNode];

      return {
        ...prev,
        completedMissions: updatedMissions,
        completedNodes: updatedNodes,
        activeNode: nextNodeId,
        score: prev.score + scoreAward,
      };
    });

    setCurrentTab('map');
  };

  const handleSelectNode = (node: PathNode) => {
    if (node.type === 'mission' && node.missionId !== undefined) {
      setActiveMissionId(node.missionId);
      setCurrentTab('missions');
    } else {
      // Story / Playground node
      setAppState((prev) => {
        const updatedNodes = prev.completedNodes.includes(node.id)
          ? prev.completedNodes
          : [...prev.completedNodes, node.id];
        return {
          ...prev,
          completedNodes: updatedNodes,
          activeNode: Math.min(19, node.id + 1),
          score: prev.score + 5,
        };
      });
    }
  };

  const handleRechargeSuccess = () => {
    triggerHaptic('success');
    setAppState((prev) => ({ ...prev, hearts: 3 }));
    setShowRechargeModal(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* HUD Top Bar */}
        <HUD
          score={appState.score}
          hearts={appState.hearts}
          muted={appState.muted}
          onToggleSound={handleToggleSound}
          onOpenRecharge={() => setShowRechargeModal(true)}
        />

        {/* Active Screen Tab View */}
        <View style={styles.screenWrapper}>
          {currentTab === 'map' && (
            <MapScreen
              completedNodes={appState.completedNodes}
              activeNode={appState.activeNode}
              onSelectNode={handleSelectNode}
            />
          )}

          {currentTab === 'missions' && (
            <MissionScreen
              missionId={activeMissionId}
              onMissionComplete={handleMissionComplete}
              onMistake={handleMistake}
              onBackToMap={() => setCurrentTab('map')}
              muted={appState.muted}
            />
          )}

          {currentTab === 'challenge' && (
            <InfiniteChallengeScreen
              onEarnBonus={handleEarnScore}
              onMistake={handleMistake}
            />
          )}

          {currentTab === 'report' && (
            <ReportScreen
              score={appState.score}
              completedMissionsCount={appState.completedMissions.length}
              errorsCount={appState.errors}
              studentName={appState.studentName}
              onUpdateStudentName={(name) => setAppState((prev) => ({ ...prev, studentName: name }))}
              skillStats={appState.skillStats}
            />
          )}

          {currentTab === 'ai' && (
            <AITutorScreen
              studentContext={{
                studentName: appState.studentName,
                score: appState.score,
                completedCount: appState.completedMissions.length,
                weakSkillLabel: 'القيمة المنزلية ضمن الملايين',
                currentStationTitle: 'رحلة الملايين',
              }}
              geminiApiKey={appState.geminiApiKey}
              onSaveApiKey={(key) => setAppState((prev) => ({ ...prev, geminiApiKey: key }))}
              muted={appState.muted}
            />
          )}
        </View>

        {/* Bottom Tab Bar */}
        <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Heart Recharge Educational Modal */}
        <Modal
          visible={showRechargeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRechargeModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.rechargeBox}>
              <HeartIcon size={36} color={theme.colors.red} filled />
              <Text style={styles.rechargeTitle}>تحدي استعادة القلوب السريع</Text>
              <Text style={styles.rechargeSubtitle}>
                أجب عن هذا السؤال السريع لتستعيد قلوبك الثلاثة فوراً وتواصل التعلم:
              </Text>

              <View style={styles.quickQBox}>
                <Text style={styles.quickQText}>
                  كم صفراً يوجد في القيمة المنزلية لأصغر عدد في دورة الملايين (1,000,000)؟
                </Text>
                <View style={styles.qChoicesRow}>
                  <TouchableOpacity
                    style={styles.qChoiceBtn}
                    onPress={() => {
                      triggerHaptic('error');
                    }}
                  >
                    <Text style={styles.qChoiceText}>4 أصفار</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.qChoiceBtn, styles.qChoiceCorrect]}
                    onPress={handleRechargeSuccess}
                  >
                    <Text style={styles.qChoiceText}>6 أصفار</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qChoiceBtn}
                    onPress={() => {
                      triggerHaptic('error');
                    }}
                  >
                    <Text style={styles.qChoiceText}>8 أصفار</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  screenWrapper: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  rechargeBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.red,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    ...theme.shadows.prominent,
  },
  rechargeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.red,
    marginTop: theme.spacing.sm,
  },
  rechargeSubtitle: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  quickQBox: {
    width: '100%',
    backgroundColor: theme.colors.cream,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
    alignItems: 'center',
  },
  quickQText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  qChoicesRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  qChoiceBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    alignItems: 'center',
  },
  qChoiceCorrect: {
    borderColor: theme.colors.lime,
  },
  qChoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.ink,
  },
});
