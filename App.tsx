import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';
import { AppDataProvider } from '@/state/AppDataProvider';
import { AuthProvider } from '@/state/AuthProvider';
import { ThemeProvider, useTheme, useThemeControl } from '@/theme/ThemeProvider';

function Shell() {
  const c = useTheme();
  const { scheme } = useThemeControl();
  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <AppDataProvider>
          <RootNavigator />
        </AppDataProvider>
      </AuthProvider>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
