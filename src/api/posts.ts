import { apiRequest } from './client';

export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Post {
  id: string;
  caption: string;
  imageUrl: string | null;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: PostAuthor;
}

export function listPosts(groupId: string) {
  return apiRequest<Post[]>(`/groups/${groupId}/posts`, { auth: true });
}

export function createPost(
  groupId: string,
  data: { caption: string; imageBase64?: string; imageMime?: string },
) {
  return apiRequest<Post>(`/groups/${groupId}/posts`, { method: 'POST', auth: true, body: data });
}

export function deletePost(id: string) {
  return apiRequest<{ ok: boolean }>(`/posts/${id}`, { method: 'DELETE', auth: true });
}

export function toggleLike(postId: string) {
  return apiRequest<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
    method: 'POST',
    auth: true,
  });
}

export function listComments(postId: string) {
  return apiRequest<Comment[]>(`/posts/${postId}/comments`, { auth: true });
}

export function addComment(postId: string, text: string) {
  return apiRequest<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    auth: true,
    body: { text },
  });
}

export function deleteComment(id: string) {
  return apiRequest<{ ok: boolean }>(`/comments/${id}`, { method: 'DELETE', auth: true });
}
