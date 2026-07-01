import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { createPost, deletePost, listPosts, type Post } from '@/api/posts';
import { Card, Field, PrimaryButton } from '@/components/ui';
import { ConfirmModal } from '@/components/ConfirmModal';
import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';

type Picked = { base64: string; mime?: string; uri: string };

function timeAgo(iso: string): string {
  const diff = (new Date().getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}

export function GroupFeed({ groupId, currentUserId }: { groupId: string; currentUserId?: string }) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<Picked | null>(null);
  const [posting, setPosting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await listPosts(groupId));
    } catch {
      /* offline */
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const fromResult = (res: ImagePicker.ImagePickerResult) => {
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const a = res.assets[0];
    setImage({ base64: a.base64!, mime: a.mimeType, uri: a.uri });
  };

  const pickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4,
      base64: true,
      allowsEditing: true,
    });
    fromResult(res);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permissão', 'Precisamos da câmera para tirar a foto.');
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.4,
      base64: true,
      allowsEditing: true,
    });
    fromResult(res);
  };

  const submit = async () => {
    if (caption.trim().length === 0 && !image) {
      return Alert.alert('Ops', 'Escreva algo ou adicione uma foto.');
    }
    setPosting(true);
    try {
      await createPost(groupId, {
        caption: caption.trim(),
        imageBase64: image?.base64,
        imageMime: image?.mime,
      });
      setCaption('');
      setImage(null);
      await load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível publicar.');
    } finally {
      setPosting(false);
    }
  };

  const doDelete = async (id: string) => {
    try {
      await deletePost(id);
      await load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível excluir.');
    }
  };

  return (
    <View>
      {/* Compor */}
      <Card style={s.compose}>
        {image && <Image source={{ uri: image.uri }} style={s.preview} resizeMode="cover" />}
        <View style={s.pickRow}>
          <Pressable onPress={takePhoto} style={({ pressed }) => [s.pickBtn, pressed && s.pressed]}>
            <Text style={s.pickBtnText}>📷 Câmera</Text>
          </Pressable>
          <Pressable onPress={pickGallery} style={({ pressed }) => [s.pickBtn, pressed && s.pressed]}>
            <Text style={s.pickBtnText}>🖼️ Galeria</Text>
          </Pressable>
          {image && (
            <Pressable onPress={() => setImage(null)} style={({ pressed }) => [s.pickBtn, pressed && s.pressed]}>
              <Text style={[s.pickBtnText, { color: c.danger }]}>✕ Remover</Text>
            </Pressable>
          )}
        </View>
        <Field label="O que você quer compartilhar?" value={caption} onChangeText={setCaption} placeholder="Escreva uma legenda…" multiline />
        <PrimaryButton label="Publicar" onPress={submit} loading={posting} />
      </Card>

      {/* Feed */}
      {loading ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: 20 }} />
      ) : posts.length === 0 ? (
        <Card>
          <Text style={s.empty}>Nenhum post ainda. Seja o primeiro a publicar! 📸</Text>
        </Card>
      ) : (
        posts.map((p) => (
          <Card key={p.id} style={s.post}>
            <View style={s.postHeader}>
              <View style={s.postAvatar}>
                <Text style={s.postAvatarText}>{p.author.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.postAuthor}>{p.author.name}</Text>
                <Text style={s.postTime}>{timeAgo(p.createdAt)}</Text>
              </View>
              {p.author.id === currentUserId && (
                <Pressable onPress={() => setDeleteId(p.id)} hitSlop={10}>
                  <Text style={s.postDelete}>🗑️</Text>
                </Pressable>
              )}
            </View>
            {p.imageUrl && <Image source={{ uri: p.imageUrl }} style={s.postImage} resizeMode="cover" />}
            {p.caption.length > 0 && <Text style={s.postCaption}>{p.caption}</Text>}
          </Card>
        ))
      )}

      <ConfirmModal
        visible={deleteId !== null}
        icon="🗑️"
        title="Excluir post?"
        message="Este post será removido permanentemente."
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={() => {
          const id = deleteId;
          setDeleteId(null);
          if (id) doDelete(id);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.7 },
    compose: { gap: 10, marginBottom: 12 },
    preview: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
    pickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    pickBtn: {
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    pickBtnText: { color: c.text, fontWeight: '700', fontSize: 13 },
    empty: { color: c.textMuted, fontSize: 14 },
    post: { gap: 10, marginBottom: 12 },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    postAvatar: {
      width: 38,
      height: 38,
      borderRadius: radius.pill,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    postAvatarText: { color: c.primary, fontWeight: '800', fontSize: 16 },
    postAuthor: { fontSize: 15, fontWeight: '700', color: c.text },
    postTime: { fontSize: 12, color: c.textMuted },
    postDelete: { fontSize: 18 },
    postImage: { width: '100%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
    postCaption: { fontSize: 15, color: c.text, lineHeight: 21 },
  });
