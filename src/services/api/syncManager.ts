import { store } from '../redux/store';
import { uploadStart, uploadSuccess, uploadFailure } from '../redux/queue/queueSlice';
import { updateAccessToken } from '../redux/users/userSlice';
import { gdriveService, googleAuthService } from './gdrive';

let isSyncing = false;

export const triggerSync = async (): Promise<void> => {
  // Prevent parallel sync execution loops
  if (isSyncing) {
    return;
  }

  const state = store.getState();
  const { items, autoSync } = state.queue;
  const { isAuthenticated } = state.users;

  if (!isAuthenticated) {
    console.log('[Sync Manager] User not authenticated. Skipping sync.');
    return;
  }

  // Find next pending or failed item to upload
  const nextItem = items.find(item => item.status === 'pending');
  if (!nextItem) {
    return;
  }

  isSyncing = true;
  console.log(`[Sync Manager] Found pending item: ${nextItem.name}. Starting upload...`);

  try {
    store.dispatch(uploadStart(nextItem.id));

    // Get fresh token (refreshed automatically by Google Sign-in library if expired)
    const freshToken = await googleAuthService.getAccessToken();
    store.dispatch(updateAccessToken(freshToken));

    // Get or create parent folder on Google Drive
    const folderId = await gdriveService.getOrCreateFolder(freshToken);

    // Upload
    const driveFileId = await gdriveService.uploadFile(
      nextItem.uri,
      nextItem.name,
      nextItem.type === 'photo' ? 'image/jpeg' : 'video/mp4',
      freshToken,
      folderId
    );

    store.dispatch(uploadSuccess({ id: nextItem.id, driveFileId }));
    console.log(`[Sync Manager] Item synced successfully: ${nextItem.name}`);
  } catch (error: any) {
    console.error(`[Sync Manager] Sync failed for ${nextItem.name}:`, error);
    store.dispatch(uploadFailure({ 
      id: nextItem.id, 
      error: error.message || 'Unknown network error occurred.' 
    }));
  } finally {
    isSyncing = false;
    // Process next item recursively
    setTimeout(() => {
      triggerSync();
    }, 1000);
  }
};
