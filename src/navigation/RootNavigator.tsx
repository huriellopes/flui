import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '@/screens/DashboardScreen';
import { GroupsScreen } from '@/screens/GroupsScreen';
import { LogScreen } from '@/screens/LogScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useAppData } from '@/state/AppDataProvider';
import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';

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
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const [tab, setTab] = useState<Tab>('home');

  if (loading) {
    return (
      <View style={[s.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <OnboardingScreen />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        {tab === 'home' && <DashboardScreen />}
        {tab === 'log' && <LogScreen />}
        {tab === 'groups' && <GroupsScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>

      <View style={[s.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
              <View style={[s.tabIconWrap, active && s.tabIconWrapActive]}>
                <Text style={[styles.tabIcon, { opacity: active ? 1 : 0.55 }]}>{t.icon}</Text>
              </View>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIcon: { fontSize: 19 },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      paddingTop: 10,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 8,
    },
    tabIconWrap: { paddingHorizontal: 18, paddingVertical: 5, borderRadius: radius.pill },
    tabIconWrapActive: { backgroundColor: c.primarySoft },
    tabLabel: { fontSize: 11, color: c.textFaint, fontWeight: '600' },
    tabLabelActive: { color: c.primary, fontWeight: '800' },
  });
