import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '@/screens/DashboardScreen';
import { GroupsScreen } from '@/screens/GroupsScreen';
import { LogScreen } from '@/screens/LogScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useAppData } from '@/state/AppDataProvider';
import { colors, radius } from '@/theme/colors';

type Tab = 'home' | 'log' | 'groups' | 'profile';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Início', icon: '🏠' },
  { key: 'log', label: 'Registrar', icon: '➕' },
  { key: 'groups', label: 'Grupos', icon: '👥' },
  { key: 'profile', label: 'Perfil', icon: '👤' },
];

export function RootNavigator() {
  const { loading, profile } = useAppData();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('home');

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return <View style={[styles.flex, { paddingTop: insets.top }]}>{<OnboardingScreen />}</View>;
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        {tab === 'home' && <DashboardScreen />}
        {tab === 'log' && <LogScreen />}
        {tab === 'groups' && <GroupsScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
              <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                <Text style={[styles.tabIcon, { opacity: active ? 1 : 0.55 }]}>{t.icon}</Text>
              </View>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIconWrap: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tabIconWrapActive: { backgroundColor: colors.primarySoft },
  tabIcon: { fontSize: 19 },
  tabLabel: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  tabLabelActive: { color: colors.primary, fontWeight: '800' },
});
