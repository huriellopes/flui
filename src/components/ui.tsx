import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const s = useThemedStyles(makeStyles);
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const s = useThemedStyles(makeStyles);
  return <Text style={[s.sectionTitle, style]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [s.primaryBtn, off && s.btnDisabled, pressed && !off && s.btnPressed]}
    >
      {loading ? (
        <ActivityIndicator color={c.white} />
      ) : (
        <Text style={s.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
}) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.ghostBtn, pressed && s.btnPressed]}>
      <Text style={[s.ghostBtnText, tone === 'danger' && { color: c.danger }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({
  value,
  color,
  height = 10,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const c = useTheme();
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: c.track,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color ?? c.primary,
        }}
      />
    </View>
  );
}

export function CircularProgress({
  size = 200,
  strokeWidth = 16,
  progress,
  color,
  trackColor,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const c = useTheme();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress || 0));
  const offset = circumference * (1 - p);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={styles.ring}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor ?? c.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? c.water}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  full,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  full?: boolean;
}) {
  const s = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, full && s.chipFull, selected && s.chipSelected]}
    >
      <Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  return (
    <View style={s.field}>
      {label.length > 0 && <Text style={s.fieldLabel}>{label}</Text>}
      <TextInput placeholderTextColor={c.textFaint} style={s.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: 18,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 2,
      marginTop: 4,
    },
    primaryBtn: {
      backgroundColor: c.primary,
      borderRadius: radius.md,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 3,
    },
    primaryBtnText: { color: c.white, fontSize: 16, fontWeight: '700' },
    ghostBtn: {
      borderRadius: radius.md,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    ghostBtnText: { color: c.primary, fontSize: 15, fontWeight: '700' },
    btnDisabled: { opacity: 0.45 },
    btnPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
    chip: {
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    chipFull: { width: '100%', alignItems: 'center' },
    chipSelected: { borderColor: c.primary, backgroundColor: c.primarySoft },
    chipText: { color: c.text, fontSize: 15, fontWeight: '600' },
    chipTextSelected: { color: c.primary, fontWeight: '800' },
    field: { marginBottom: 14 },
    fieldLabel: { fontSize: 13, color: c.textMuted, marginBottom: 6, fontWeight: '700' },
    input: {
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.surface,
    },
  });
