import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import {
  createGroup,
  groupRanking,
  joinGroup,
  myGroups,
  type Group,
  type RankEntry,
} from '@/api/groups';
import { Card, Field, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAuth } from '@/state/AuthProvider';
import { colors, radius } from '@/theme/colors';

export function GroupsScreen() {
  const { isLoggedIn } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  // Estados de carregamento SEPARADOS — evita os dois botões ativarem juntos.
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [ranking, setRanking] = useState<{ group: Group; entries: RankEntry[] } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await myGroups());
    } catch {
      /* offline: mantém estado atual */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) refresh();
  }, [isLoggedIn, refresh]);

  if (showAuth) return <AuthScreen onClose={() => setShowAuth(false)} />;

  if (!isLoggedIn) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Grupos</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.bigEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>Compita com amigos</Text>
          <Text style={styles.hint}>
            Crie ou entre em grupos e dispute o ranking de XP. Precisa de uma conta (opcional — o
            app funciona offline).
          </Text>
          <View style={styles.spacer} />
          <PrimaryButton label="Entrar / Criar conta" onPress={() => setShowAuth(true)} />
        </Card>
      </ScrollView>
    );
  }

  const doCreate = async () => {
    if (name.trim().length < 2) return Alert.alert('Ops', 'Dê um nome ao grupo (mín. 2 letras).');
    setCreating(true);
    try {
      await createGroup(name.trim());
      setName('');
      await refresh();
      Alert.alert('Grupo criado! 🎉', 'Compartilhe o código de convite com seus amigos.');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const doJoin = async () => {
    if (code.trim().length < 4) return Alert.alert('Ops', 'Informe o código de convite.');
    setJoining(true);
    try {
      await joinGroup(code.trim());
      setCode('');
      await refresh();
      Alert.alert('Pronto! 🙌', 'Você entrou no grupo.');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Código inválido.');
    } finally {
      setJoining(false);
    }
  };

  const openRanking = async (group: Group) => {
    try {
      const entries = await groupRanking(group.id);
      setRanking({ group, entries });
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível carregar.');
    }
  };

  if (ranking) {
    const medals = ['🥇', '🥈', '🥉'];
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{ranking.group.name}</Text>
        <Text style={styles.codeLine}>Código: {ranking.group.inviteCode}</Text>
        <SectionTitle>Ranking por XP</SectionTitle>
        <Card style={styles.rankCard}>
          {ranking.entries.map((e, i) => (
            <View key={e.userId} style={[styles.rankRow, i > 0 && styles.rankDivider]}>
              <Text style={styles.rankPos}>{medals[i] ?? `${i + 1}º`}</Text>
              <View style={styles.flex}>
                <Text style={styles.rankName}>{e.name}</Text>
                <Text style={styles.rankSub}>Nível {e.level} · 🔥 {e.currentStreak}</Text>
              </View>
              <Text style={styles.rankXp}>{e.xp} XP</Text>
            </View>
          ))}
        </Card>
        <GhostButton label="← Voltar aos grupos" onPress={() => setRanking(null)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Grupos</Text>

      <SectionTitle>Meus grupos</SectionTitle>
      {groups.length === 0 ? (
        <Card>
          <Text style={styles.hint}>
            {loading ? 'Carregando…' : 'Você ainda não participa de nenhum grupo.'}
          </Text>
        </Card>
      ) : (
        groups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => openRanking(g)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Card style={styles.groupCard}>
              <View style={styles.groupAvatar}>
                <Text style={styles.groupAvatarText}>{g.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupMeta}>
                  {g._count?.members ?? 0} membro(s) · {g.inviteCode}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Card>
          </Pressable>
        ))
      )}

      <SectionTitle>Criar grupo</SectionTitle>
      <Card>
        <Field label="Nome do grupo" value={name} onChangeText={setName} placeholder="Ex: Família Fit" />
        <PrimaryButton label="Criar grupo" onPress={doCreate} loading={creating} disabled={joining} />
      </Card>

      <SectionTitle>Entrar em um grupo</SectionTitle>
      <Card>
        <Field
          label="Código de convite"
          value={code}
          onChangeText={setCode}
          placeholder="ex: e7357ed4"
          autoCapitalize="none"
        />
        <PrimaryButton label="Entrar" onPress={doJoin} loading={joining} disabled={creating} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 28, gap: 12, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  codeLine: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  hint: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  spacer: { height: 14 },
  emptyCard: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  bigEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  pressed: { opacity: 0.7 },
  groupCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  groupAvatar: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  groupName: { fontSize: 16, fontWeight: '700', color: colors.text },
  groupMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 28, color: colors.textFaint, fontWeight: '300' },
  rankCard: { gap: 0 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rankDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  rankPos: { width: 34, fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  rankName: { fontSize: 15, fontWeight: '700', color: colors.text },
  rankSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rankXp: { fontSize: 15, fontWeight: '800', color: colors.primary },
});
