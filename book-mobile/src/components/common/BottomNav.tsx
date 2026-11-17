import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { MapIcon, BookIcon, TrophyIcon, ChartIcon, SparkleIcon } from './Icons';

export type TabType = 'map' | 'missions' | 'challenge' | 'report' | 'ai';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    {
      key: 'map',
      label: 'المسار',
      icon: <MapIcon size={20} color={currentTab === 'map' ? theme.colors.primary : theme.colors.muted} />,
    },
    {
      key: 'missions',
      label: 'المهام',
      icon: <BookIcon size={20} color={currentTab === 'missions' ? theme.colors.primary : theme.colors.muted} />,
    },
    {
      key: 'challenge',
      label: 'التحدي',
      icon: <TrophyIcon size={20} color={currentTab === 'challenge' ? theme.colors.primary : theme.colors.muted} />,
    },
    {
      key: 'report',
      label: 'تقدمي',
      icon: <ChartIcon size={20} color={currentTab === 'report' ? theme.colors.primary : theme.colors.muted} />,
    },
    {
      key: 'ai',
      label: 'المعلم الذكي',
      icon: <SparkleIcon size={20} color={currentTab === 'ai' ? theme.colors.primary : theme.colors.muted} />,
    },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            {tab.icon}
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.paper,
    borderTopWidth: 1.5,
    borderTopColor: theme.colors.line,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    justifyContent: 'space-around',
    ...theme.shadows.medium,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    minWidth: 58,
  },
  activeTab: {
    backgroundColor: theme.colors.cream,
  },
  label: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 3,
    fontWeight: '500',
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
