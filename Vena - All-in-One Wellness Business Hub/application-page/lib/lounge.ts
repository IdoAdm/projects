import type { LoungePost, ProfileConfig } from '../index';

const generateLoungeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `lounge-${Date.now()}`;
};

export const createEmptyLoungePost = (config: ProfileConfig): LoungePost => ({
  id: generateLoungeId(),
  title: 'New lounge update',
  body: 'Share an update your members will appreciate.',
  tags: [],
  authorName: config.name?.trim() || 'Coach',
  authorRole: 'Update',
  authorAvatarUrl: '',
  coverImageUrl: '',
  createdAt: new Date().toISOString(),
  likes: 0,
  saves: 0,
  pinned: false,
});
