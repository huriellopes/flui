import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import {
  createGroup,
  deleteGroup,
  groupRanking,
  joinGroup,
  myGroups,
  type Group,
  type RankEntry,
} from '@/api/groups';
import { Card, Field, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAuth } from '@/state/AuthProvider';
import { radius, type Palette } from '@/theme/colors';
import { useThemedStyles } from '@/theme/ThemeProvider';

export function GroupsScreen() {
  const { isLoggedIn, user } = useAuth();
  const s = useThemedStyles(makeStyles);
  const [showAuth, setShowAuth] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [ranking, setRanking] = useState<{ group: Group; entries: RankEntry[] } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await myGroups());
    } catch {
      /* offline */
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
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Grupos</Text>
        <Card style={s.emptyCard}>
          <Text style={s.bigEmoji}>👥</Text>
          <Text style={s.emptyTitle}>Compita com amigos</Text>
          <Text style={s.hint}>
            Crie ou entre em grupos e dispute o ranking de XP. Precisa de uma conta (opcional — o
            app funciona offline).
          </Text>
          <View style={s.spacer} />
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

  const copyCode = async (value: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copiado! 📋', `Código ${value} copiado para a área de transferência.`);
  };

  const confirmDelete = (group: Group) => {
    Alert.alert(
      'Excluir grupo?',
      `"${group.name}" e todos os seus dados serão removidos permanentemente. Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(group.id);
              setRanking(null);
              await refresh();
              Alert.alert('Excluído', 'O grupo foi removido.');
            } catch (e) {
              Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível excluir.');
            }
          },
        },
      ],
    );
  };

  if (ranking) {
    const medals = ['🥇', '🥈', '🥉'];
    const isOwner = ranking.group.ownerId === user?.id;
    return (
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>{ranking.group.name}</Text>

        <Card style={s.codeCard}>
          <View style={s.flex}>
            <Text style={s.codeLabel}>Código de convite</Text>
            <Text style={s.codeValue}>{ranking.group.inviteCode}</Text>
          </View>
          <Pressable
            onPress={() => copyCode(ranking.group.inviteCode)}
            style={({ pressed }) => [s.copyBtn, pressed && s.pressed]}
          >
            <Text style={s.copyBtnText}>📋 Copiar</Text>
          </Pressable>
        </Card>

        <SectionTitle>Ranking por XP</SectionTitle>
        <Card>
          {ranking.entries.map((e, i) => (
            <View key={e.userId} style={[s.rankRow, i > 0 && s.rankDivider]}>
              <Text style={s.rankPos}>{medals[i] ?? `${i + 1}º`}</Text>
              <View style={s.flex}>
                <Text style={s.rankName}>{e.name}</Text>
                <Text style={s.rankSub}>Nível {e.level} · 🔥 {e.currentStreak}</Text>
              </View>
              <Text style={s.rankXp}>{e.xp} XP</Text>
            </View>
          ))}
        </Card>

        <GhostButton label="← Voltar aos grupos" onPress={() => setRanking(null)} />
        {isOwner && (
          <GhostButton label="🗑️ Excluir grupo" tone="danger" onPress={() => confirmDelete(ranking.group)} />
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Grupos</Text>

      <SectionTitle>Meus grupos</SectionTitle>
      {groups.length === 0 ? (
        <Card>
          <Text style={s.hint}>
            {loading ? 'Carregando…' : 'Você ainda não participa de nenhum grupo.'}
          </Text>
        </Card>
      ) : (
        groups.map((g) => (
          <Pressable key={g.id} onPress={() => openRanking(g)} style={({ pressed }) => pressed && s.pressed}>
            <Card style={s.groupCard}>
              <View style={s.groupAvatar}>
                <Text style={s.groupAvatarText}>{g.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.groupName}>{g.name}</Text>
                <Text style={s.groupMeta}>
                  {g._count?.members ?? 0} membro(s) · {g.inviteCode}
                </Text>
              </View>
              <Pressable
                onPress={() => copyCode(g.inviteCode)}
                hitSlop={10}
                style={({ pressed }) => [s.cardCopy, pressed && s.pressed]}
              >
                <Text style={s.cardCopyText}>📋</Text>
              </Pressable>
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { padding: 20, paddingBottom: 28, gap: 12, backgroundColor: c.background },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    hint: { fontSize: 14, color: c.textMuted, lineHeight: 21 },
    spacer: { height: 14 },
    emptyCard: { alignItems: 'center', paddingVertical: 28, gap: 6 },
    bigEmoji: { fontSize: 44 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: c.text },
    pressed: { opacity: 0.6 },
    codeCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    codeLabel: { fontSize: 12, color: c.textMuted, fontWeight: '700' },
    codeValue: { fontSize: 20, fontWeight: '900', color: c.text, letterSpacing: 1, marginTop: 2 },
    copyBtn: {
      backgroundColor: c.primarySoft,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: radius.md,
    },
    copyBtnText: { color: c.primary, fontWeight: '800', fontSize: 14 },
    groupCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    groupAvatar: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupAvatarText: { fontSize: 20, fontWeight: '800', color: c.primary },
    groupName: { fontSize: 16, fontWeight: '700', color: c.text },
    groupMeta: { fontSize: 13, color: c.textMuted, marginTop: 2 },
    cardCopy: { padding: 6 },
    cardCopyText: { fontSize: 20 },
    rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    rankDivider: { borderTopWidth: 1, borderTopColor: c.border },
    rankPos: { width: 34, fontSize: 20, fontWeight: '800', color: c.text, textAlign: 'center' },
    rankName: { fontSize: 15, fontWeight: '700', color: c.text },
    rankSub: { fontSize: 12, color: c.textMuted, marginTop: 1 },
    rankXp: { fontSize: 15, fontWeight: '800', color: c.primary },
  });
