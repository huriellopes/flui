import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { AppDataProvider } from '@/state/AppDataProvider';
import { colors } from '@/theme/colors';

export default function App() {
  return (
    <AppDataProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaView>
    </AppDataProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
