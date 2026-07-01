import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { DashboardScreen } from '@/screens/DashboardScreen';
import { GroupsScreen } from '@/screens/GroupsScreen';
import { LogScreen } from '@/screens/LogScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useAppData } from '@/state/AppDataProvider';
import { colors } from '@/theme/colors';

type Tab = 'home' | 'log' | 'groups' | 'profile';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Início', icon: '🏠' },
  { key: 'log', label: 'Registrar', icon: '➕' },
  { key: 'groups', label: 'Grupos', icon: '👥' },
  { key: 'profile', label: 'Perfil', icon: '👤' },
];

export function RootNavigator() {
  const { loading, profile } = useAppData();
  const [tab, setTab] = useState<Tab>('home');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return <OnboardingScreen />;
  }

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        {tab === 'home' && <DashboardScreen />}
        {tab === 'log' && <LogScreen />}
        {tab === 'groups' && <GroupsScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
});
