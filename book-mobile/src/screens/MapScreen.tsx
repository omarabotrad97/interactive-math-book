import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { PATH_NODES, PathNode } from '../constants/curriculum';
import { LockIcon, CheckIcon, StarIcon, BookIcon, SparkleIcon, TrophyIcon } from '../components/common/Icons';
import { triggerHaptic } from '../services/audioService';

interface MapScreenProps {
  completedNodes: number[];
  activeNode: number;
  onSelectNode: (node: PathNode) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  completedNodes,
  activeNode,
  onSelectNode,
}) => {
  const isCompleted = (id: number) => completedNodes.includes(id);
  const isUnlocked = (id: number) => id === 0 || completedNodes.includes(id - 1) || completedNodes.includes(id);

  const renderIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'book':
        return <BookIcon size={20} color={color} />;
      case 'trophy':
        return <TrophyIcon size={20} color={color} />;
      default:
        return <SparkleIcon size={20} color={color} />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>خريطة مسار الملايين</Text>
        <Text style={styles.bannerSubtitle}>
          20 محطة متدرجة تغطي الصفحات 8 إلى 11 من كتاب الرياضيات
        </Text>
      </View>

      {/* Nodes List */}
      <View style={styles.nodesWrapper}>
        {PATH_NODES.map((node: PathNode, index: number) => {
          const unlocked = isUnlocked(node.id);
          const done = isCompleted(node.id);
          const isCurrent = activeNode === node.id;

          const isUnitChange = index === 10;

          return (
            <React.Fragment key={node.id}>
              {isUnitChange && (
                <View style={styles.unitDivider}>
                  <Text style={styles.unitDividerText}>فصل التدريبات والمسائل (ص 10 - 11)</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.nodeCard,
                  !unlocked && styles.nodeLocked,
                  isCurrent && styles.nodeCurrent,
                  done && styles.nodeCompleted,
                ]}
                onPress={() => {
                  if (unlocked) {
                    triggerHaptic('light');
                    onSelectNode(node);
                  } else {
                    triggerHaptic('error');
                  }
                }}
                activeOpacity={unlocked ? 0.7 : 1}
              >
                {/* Node Status Icon */}
                <View style={[styles.statusIconBox, done && styles.statusDone, !unlocked && styles.statusLocked]}>
                  {done ? (
                    <CheckIcon size={18} color="#ffffff" />
                  ) : unlocked ? (
                    renderIcon(node.icon, theme.colors.primary)
                  ) : (
                    <LockIcon size={16} color={theme.colors.muted} />
                  )}
                </View>

                {/* Node Info */}
                <View style={styles.nodeInfo}>
                  <View style={styles.tagRow}>
                    <Text style={styles.nodeTag}>{node.tag}</Text>
                    {done && (
                      <View style={styles.starsRow}>
                        <StarIcon size={14} color={theme.colors.gold} filled />
                        <StarIcon size={14} color={theme.colors.gold} filled />
                        <StarIcon size={14} color={theme.colors.gold} filled />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.nodeTitle, !unlocked && styles.textMuted]}>{node.title}</Text>
                  <Text style={styles.nodeSub}>{node.sub}</Text>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
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
  banner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: theme.colors.limeLight,
    textAlign: 'center',
    marginTop: 4,
  },
  nodesWrapper: {
    gap: theme.spacing.sm,
  },
  unitDivider: {
    marginVertical: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: 'center',
  },
  unitDividerText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  nodeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    ...theme.shadows.soft,
    gap: theme.spacing.md,
  },
  nodeCurrent: {
    borderColor: theme.colors.lime,
    backgroundColor: theme.colors.limeLight + '20',
  },
  nodeCompleted: {
    borderColor: theme.colors.primaryLight,
  },
  nodeLocked: {
    opacity: 0.65,
    backgroundColor: theme.colors.cream,
  },
  statusIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lineDark,
  },
  statusDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusLocked: {
    backgroundColor: '#eaece5',
    borderColor: '#d0d4c8',
  },
  nodeInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tagRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  nodeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.ink,
    textAlign: 'right',
  },
  nodeSub: {
    fontSize: 11,
    color: theme.colors.muted,
    textAlign: 'right',
    marginTop: 2,
    lineHeight: 16,
  },
  textMuted: {
    color: theme.colors.muted,
  },
});
