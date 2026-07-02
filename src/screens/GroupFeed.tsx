import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  listComments,
  listPosts,
  toggleLike,
  type Comment,
  type Post,
} from '@/api/posts';
import { Card, Field, PrimaryButton } from '@/components/ui';
import { ConfirmModal } from '@/components/ConfirmModal';
import { shortName } from '@/domain/profile';
import { radius, type Palette } from '@/theme/colors';
import { useTheme, useThemedStyles } from '@/theme/ThemeProvider';
import { pickFromCamera, pickFromGallery, type PickedImage } from '@/utils/imagePicker';

function timeAgo(iso: string): string {
  const diff = (new Date().getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}

function Avatar({ url, name, size, s }: { url?: string | null; name: string; size: number; s: S }) {
  if (url) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[s.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.avatarFallbackText, { fontSize: size * 0.42 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function PostCard({
  post,
  currentUserId,
  onAskDelete,
}: {
  post: Post;
  currentUserId?: string;
  onAskDelete: (id: string) => void;
}) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Re-sincroniza com o servidor quando o feed recarrega (mesmo id → sem
  // remontar). Não interfere no update otimista: durante ele as props não mudam.
  useEffect(() => {
    setLiked(post.likedByMe);
    setLikeCount(post.likeCount);
    setCommentCount(post.commentCount);
  }, [post.id, post.likedByMe, post.likeCount, post.commentCount]);

  const like = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const openComments = async () => {
    if (showComments) return setShowComments(false);
    setShowComments(true);
    setLoadingComments(true);
    try {
      setComments(await listComments(post.id));
    } catch {
      /* offline */
    } finally {
      setLoadingComments(false);
    }
  };

  const send = async () => {
    if (text.trim().length === 0) return;
    setSending(true);
    try {
      const comment = await addComment(post.id, text.trim());
      setComments((cur) => [...cur, comment]);
      setCommentCount((n) => n + 1);
      setText('');
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível comentar.');
    } finally {
      setSending(false);
    }
  };

  const removeComment = async (id: string) => {
    try {
      await deleteComment(id);
      setComments((cur) => cur.filter((x) => x.id !== id));
      setCommentCount((n) => Math.max(0, n - 1));
    } catch {
      /* ignore */
    }
  };

  return (
    <Card style={s.post}>
      <View style={s.postHeader}>
        <Avatar url={post.author.avatarUrl} name={post.author.name} size={38} s={s} />
        <View style={s.flex}>
          <Text style={s.postAuthor}>{shortName(post.author.name)}</Text>
          <Text style={s.postTime}>{timeAgo(post.createdAt)}</Text>
        </View>
        {post.author.id === currentUserId && (
          <Pressable onPress={() => onAskDelete(post.id)} hitSlop={10}>
            <Text style={s.postDelete}>🗑️</Text>
          </Pressable>
        )}
      </View>

      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={s.postImage} resizeMode="cover" />}
      {post.caption.length > 0 && <Text style={s.postCaption}>{post.caption}</Text>}

      {/* Ações */}
      <View style={s.actions}>
        <Pressable onPress={like} style={({ pressed }) => [s.actionBtn, pressed && s.pressed]}>
          <Text style={s.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={[s.actionText, liked && { color: c.danger }]}>{likeCount}</Text>
        </Pressable>
        <Pressable onPress={openComments} style={({ pressed }) => [s.actionBtn, pressed && s.pressed]}>
          <Text style={s.actionIcon}>💬</Text>
          <Text style={s.actionText}>{commentCount}</Text>
        </Pressable>
      </View>

      {/* Comentários */}
      {showComments && (
        <View style={s.commentsBox}>
          {loadingComments ? (
            <ActivityIndicator color={c.primary} />
          ) : (
            comments.map((cm) => (
              <View key={cm.id} style={s.commentRow}>
                <Avatar url={cm.author.avatarUrl} name={cm.author.name} size={28} s={s} />
                <View style={s.flex}>
                  <Text style={s.commentAuthor}>{shortName(cm.author.name)}</Text>
                  <Text style={s.commentText}>{cm.text}</Text>
                </View>
                {cm.author.id === currentUserId && (
                  <Pressable onPress={() => removeComment(cm.id)} hitSlop={8}>
                    <Text style={s.commentDelete}>×</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
          <View style={s.commentInputRow}>
            <View style={s.flex}>
              <Field label="" value={text} onChangeText={setText} placeholder="Escreva um comentário…" />
            </View>
            <Pressable
              onPress={send}
              disabled={sending}
              style={({ pressed }) => [s.sendBtn, (pressed || sending) && s.pressed]}
            >
              <Text style={s.sendBtnText}>{sending ? '…' : 'Enviar'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

export function GroupFeed({ groupId, currentUserId }: { groupId: string; currentUserId?: string }) {
  const s = useThemedStyles(makeStyles);
  const c = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
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

  const pickGallery = async () => {
    const img = await pickFromGallery();
    if (img) setImage(img);
  };

  const takePhoto = async () => {
    const img = await pickFromCamera();
    if (img === 'denied') return Alert.alert('Permissão', 'Precisamos da câmera para tirar a foto.');
    if (img) setImage(img);
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

      {loading ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: 20 }} />
      ) : posts.length === 0 ? (
        <Card>
          <Text style={s.empty}>Nenhum post ainda. Seja o primeiro a publicar! 📸</Text>
        </Card>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={currentUserId} onAskDelete={setDeleteId} />
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

type S = ReturnType<typeof makeStyles>;

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.6 },
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
    avatarFallback: { backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    avatarFallbackText: { color: c.primary, fontWeight: '800' },
    post: { gap: 10, marginBottom: 12 },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    postAuthor: { fontSize: 15, fontWeight: '700', color: c.text },
    postTime: { fontSize: 12, color: c.textMuted },
    postDelete: { fontSize: 18 },
    postImage: { width: '100%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
    postCaption: { fontSize: 15, color: c.text, lineHeight: 21 },
    actions: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionIcon: { fontSize: 18 },
    actionText: { fontSize: 14, fontWeight: '700', color: c.textMuted },
    commentsBox: { gap: 12, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 },
    commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    commentAuthor: { fontSize: 13, fontWeight: '700', color: c.text },
    commentText: { fontSize: 14, color: c.text, marginTop: 1 },
    commentDelete: { fontSize: 18, color: c.textFaint, fontWeight: '700', paddingHorizontal: 4 },
    commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sendBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: radius.md,
    },
    sendBtnText: { color: c.white, fontWeight: '800', fontSize: 14 },
  });
