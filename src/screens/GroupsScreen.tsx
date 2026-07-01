import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
import { colors } from '@/theme/colors';

export function GroupsScreen() {
  const { isLoggedIn } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [ranking, setRanking] = useState<{ group: Group; entries: RankEntry[] } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await myGroups());
    } catch {
      // offline ou erro — mantém o que tem
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Grupos</Text>
        <Card>
          <Text style={styles.hint}>
            Crie ou entre em grupos para competir com amigos no ranking de XP. É preciso ter uma
            conta.
          </Text>
          <View style={styles.spacer} />
          <PrimaryButton label="Entrar / Criar conta" onPress={() => setShowAuth(true)} />
        </Card>
      </ScrollView>
    );
  }

  const doCreate = async () => {
    if (name.trim().length < 2) return Alert.alert('Ops', 'Dê um nome ao grupo.');
    setBusy(true);
    try {
      await createGroup(name.trim());
      setName('');
      await refresh();
      Alert.alert('Grupo criado! 🎉', 'Compartilhe o código de convite com seus amigos.');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const doJoin = async () => {
    if (code.trim().length < 4) return Alert.alert('Ops', 'Informe o código de convite.');
    setBusy(true);
    try {
      await joinGroup(code.trim());
      setCode('');
      await refresh();
      Alert.alert('Pronto! 🙌', 'Você entrou no grupo.');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Código inválido.');
    } finally {
      setBusy(false);
    }
  };

  const openRanking = async (group: Group) => {
    try {
      const entries = await groupRanking(group.id);
      setRanking({ group, entries });
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível carregar o ranking.');
    }
  };

  if (ranking) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{ranking.group.name}</Text>
        <Text style={styles.subtitle}>Código: {ranking.group.inviteCode}</Text>
        <SectionTitle>Ranking por XP</SectionTitle>
        <Card style={styles.gap}>
          {ranking.entries.map((e, i) => (
            <View key={e.userId} style={styles.rankRow}>
              <Text style={styles.rankPos}>{i + 1}º</Text>
              <Text style={styles.rankName}>{e.name}</Text>
              <Text style={styles.rankXp}>{e.xp} XP</Text>
            </View>
          ))}
        </Card>
        <GhostButton label="Voltar" onPress={() => setRanking(null)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grupos</Text>

      <SectionTitle>Meus grupos</SectionTitle>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : groups.length === 0 ? (
        <Card>
          <Text style={styles.hint}>Você ainda não participa de nenhum grupo.</Text>
        </Card>
      ) : (
        groups.map((g) => (
          <Pressable key={g.id} onPress={() => openRanking(g)}>
            <Card style={styles.groupCard}>
              <View>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupMeta}>
                  {g._count?.members ?? 0} membro(s) · código {g.inviteCode}
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
        <PrimaryButton label={busy ? 'Aguarde…' : 'Criar grupo'} onPress={doCreate} disabled={busy} />
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
        <PrimaryButton label={busy ? 'Aguarde…' : 'Entrar'} onPress={doJoin} disabled={busy} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
  container: { padding: 20, gap: 12, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  hint: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  spacer: { height: 12 },
  groupCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupName: { fontSize: 16, fontWeight: '700', color: colors.text },
  groupMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 26, color: colors.textMuted },
  rankRow: { flexDirection: 'row', alignItems: 'center' },
  rankPos: { width: 36, fontSize: 15, fontWeight: '800', color: colors.primary },
  rankName: { flex: 1, fontSize: 15, color: colors.text },
  rankXp: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
});
