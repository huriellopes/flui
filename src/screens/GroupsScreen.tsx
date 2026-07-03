import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
import { Card, Chip, Field, GhostButton, PrimaryButton, SectionTitle } from '@/components/ui';
import { ConfirmModal } from '@/components/ConfirmModal';
import { shortName } from '@/domain/profile';
import { AuthScreen } from '@/screens/AuthScreen';
import { GroupFeed } from '@/screens/GroupFeed';
import { useAuth } from '@/state/AuthProvider';
import Svg, { Circle, Path } from 'react-native-svg';

import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';

export function GroupsScreen() {
  const { isLoggedIn, user } = useAuth();
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const [showAuth, setShowAuth] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [ranking, setRanking] = useState<{ group: Group; entries: RankEntry[] } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'feed' | 'ranking'>('feed');

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
        <Card style={s.heroCard}>
          <View style={s.heroIconWrap}>
            <GroupIcon color={c.primary} />
          </View>
          <Text style={s.emptyTitle}>Compita com amigos</Text>
          <Text style={s.heroSub}>Crie ou entre em grupos e dispute quem se cuida melhor.</Text>

          <View style={s.benefits}>
            <Benefit s={s} icon="🏆" title="Ranking de XP" desc="Veja quem lidera na hidratação e nos treinos." />
            <Benefit s={s} icon="📸" title="Feed do grupo" desc="Poste fotos, curta e comente com a galera." />
            <Benefit s={s} icon="🔗" title="Código de convite" desc="Chame amigos com um código simples." />
          </View>

          <View style={s.cta}>
            <PrimaryButton label="Entrar ou criar conta" onPress={() => setShowAuth(true)} />
          </View>
          <Text style={s.freeNote}>Grátis · o app continua funcionando offline</Text>
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
      setDetailTab('feed');
      setRanking({ group, entries });
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível carregar.');
    }
  };

  const copyCode = async (value: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copiado! 📋', `Código ${value} copiado para a área de transferência.`);
  };

  const doDelete = async (group: Group) => {
    try {
      await deleteGroup(group.id);
      setRanking(null);
      await refresh();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível excluir.');
    }
  };

  if (ranking) {
    const medals = ['🥇', '🥈', '🥉'];
    const isOwner = ranking.group.ownerId === user?.id;
    return (
      <>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

        <View style={s.tabRow}>
          <View style={s.flex}>
            <Chip label="📸 Feed" full selected={detailTab === 'feed'} onPress={() => setDetailTab('feed')} />
          </View>
          <View style={s.flex}>
            <Chip label="🏆 Ranking" full selected={detailTab === 'ranking'} onPress={() => setDetailTab('ranking')} />
          </View>
        </View>

        {detailTab === 'feed' ? (
          <GroupFeed groupId={ranking.group.id} currentUserId={user?.id} />
        ) : (
          <Card>
            {ranking.entries.map((e, i) => (
              <View key={e.userId} style={[s.rankRow, i > 0 && s.rankDivider]}>
                <Text style={s.rankPos}>{medals[i] ?? `${i + 1}º`}</Text>
                {e.avatarUrl ? (
                  <Image source={{ uri: e.avatarUrl }} style={s.rankAvatar} />
                ) : (
                  <View style={s.rankAvatar}>
                    <Text style={s.rankAvatarText}>{e.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={s.flex}>
                  <Text style={s.rankName}>{shortName(e.name)}</Text>
                  <Text style={s.rankSub}>Nível {e.level} · 🔥 {e.currentStreak}</Text>
                </View>
                <Text style={s.rankXp}>{e.xp} XP</Text>
              </View>
            ))}
          </Card>
        )}

        <GhostButton label="← Voltar aos grupos" onPress={() => setRanking(null)} />
        {isOwner && (
          <GhostButton label="🗑️ Excluir grupo" tone="danger" onPress={() => setDeleteOpen(true)} />
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={deleteOpen}
        icon="🗑️"
        title="Excluir grupo?"
        message={`"${ranking.group.name}" e todos os dados serão removidos permanentemente. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={() => {
          setDeleteOpen(false);
          doDelete(ranking.group);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Grupos</Text>

      <SectionTitle>Meus grupos</SectionTitle>
      {groups.length === 0 ? (
        <Card style={s.noGroups}>
          <Text style={s.noGroupsEmoji}>{loading ? '⏳' : '🫂'}</Text>
          <Text style={s.noGroupsText}>
            {loading ? 'Carregando seus grupos…' : 'Você ainda não participa de nenhum grupo.'}
          </Text>
          {!loading && (
            <Text style={s.noGroupsHint}>Crie o seu abaixo ou entre com um código de convite.</Text>
          )}
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

type S = ReturnType<typeof makeStyles>;

/** Ícone de grupo (3 pessoas) em SVG, na cor da marca. */
function GroupIcon({ color, size = 50 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* pessoas de trás (mais suaves) */}
      <Circle cx={17} cy={27} r={6.5} fill={color} opacity={0.45} />
      <Path d="M17 34.5c-6.4 0-10 4.6-10 11h20c0-6.4-3.6-11-10-11z" fill={color} opacity={0.45} />
      <Circle cx={47} cy={27} r={6.5} fill={color} opacity={0.45} />
      <Path d="M47 34.5c-6.4 0-10 4.6-10 11h20c0-6.4-3.6-11-10-11z" fill={color} opacity={0.45} />
      {/* pessoa da frente (destaque) */}
      <Circle cx={32} cy={24} r={9} fill={color} />
      <Path d="M32 34c-9 0-14 6.2-14 15h28c0-8.8-5-15-14-15z" fill={color} />
    </Svg>
  );
}

function Benefit({ s, icon, title, desc }: { s: S; icon: string; title: string; desc: string }) {
  return (
    <View style={s.benefitRow}>
      <View style={s.benefitIcon}>
        <Text style={s.benefitEmoji}>{icon}</Text>
      </View>
      <View style={s.flex}>
        <Text style={s.benefitTitle}>{title}</Text>
        <Text style={s.benefitDesc}>{desc}</Text>
      </View>
    </View>
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
    emptyTitle: { fontSize: 20, fontWeight: '800', color: c.text, textAlign: 'center' },
    pressed: { opacity: 0.6 },
    // Hero (deslogado)
    heroCard: { alignItems: 'center', paddingVertical: 26, paddingHorizontal: 18, gap: 6 },
    heroIconWrap: {
      width: 88,
      height: 88,
      borderRadius: radius.pill,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    heroEmoji: { fontSize: 44 },
    heroSub: {
      fontSize: 15,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 6,
    },
    benefits: { alignSelf: 'stretch', gap: 12, marginVertical: 14 },
    cta: { alignSelf: 'stretch' },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    benefitIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    benefitEmoji: { fontSize: 20 },
    benefitTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    benefitDesc: { fontSize: 13, color: c.textMuted, marginTop: 1, lineHeight: 18 },
    freeNote: { fontSize: 12, color: c.textFaint, textAlign: 'center', marginTop: 12 },
    // Vazio (logado, sem grupos)
    noGroups: { alignItems: 'center', paddingVertical: 24, gap: 6 },
    noGroupsEmoji: { fontSize: 36 },
    noGroupsText: { fontSize: 15, color: c.text, fontWeight: '600', textAlign: 'center' },
    noGroupsHint: { fontSize: 13, color: c.textMuted, textAlign: 'center', lineHeight: 18 },
    tabRow: { flexDirection: 'row', gap: 8 },
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
    rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    rankDivider: { borderTopWidth: 1, borderTopColor: c.border },
    rankPos: { width: 28, fontSize: 18, fontWeight: '800', color: c.text, textAlign: 'center' },
    rankAvatar: {
      width: 38,
      height: 38,
      borderRadius: radius.pill,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankAvatarText: { color: c.primary, fontWeight: '800', fontSize: 16 },
    rankName: { fontSize: 15, fontWeight: '700', color: c.text },
    rankSub: { fontSize: 12, color: c.textMuted, marginTop: 1 },
    rankXp: { fontSize: 15, fontWeight: '800', color: c.primary },
  });
