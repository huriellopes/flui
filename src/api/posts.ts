import { apiRequest } from './client';

export interface Post {
  id: string;
  caption: string;
  imageUrl: string | null;
  createdAt: string;
  author: { id: string; name: string };
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
