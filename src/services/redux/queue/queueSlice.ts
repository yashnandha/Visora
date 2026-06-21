import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mmkvStorage } from '../mmkvStorage';

export interface QueueItem {
  id: string;
  uri: string;
  name: string;
  type: 'photo' | 'video';
  size: number;
  status: 'pending' | 'uploading' | 'synced' | 'failed';
  progress: number;
  error: string | null;
  timestamp: number;
  driveFileId: string | null;
}

export interface QueueState {
  items: QueueItem[];
  wifiOnly: boolean;
  autoSync: boolean;
}

// Hydrate from MMKV
const savedItems = mmkvStorage.getItem('queue_items');
const savedWifiOnly = mmkvStorage.getItem('settings_wifi_only');
const savedAutoSync = mmkvStorage.getItem('settings_auto_sync');

const initialState: QueueState = {
  items: savedItems ? JSON.parse(savedItems) : [],
  wifiOnly: savedWifiOnly ? savedWifiOnly === 'true' : false,
  autoSync: savedAutoSync ? savedAutoSync === 'true' : true,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    addToQueue: (state, action: PayloadAction<Omit<QueueItem, 'status' | 'progress' | 'error' | 'driveFileId'>>) => {
      const newItem: QueueItem = {
        ...action.payload,
        status: 'pending',
        progress: 0,
        error: null,
        driveFileId: null,
      };
      state.items.unshift(newItem);
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    },
    updateUploadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.progress = action.payload.progress;
        if (item.status !== 'uploading') {
          item.status = 'uploading';
        }
      }
    },
    uploadStart: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.status = 'uploading';
        item.progress = 0;
        item.error = null;
      }
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    },
    uploadSuccess: (state, action: PayloadAction<{ id: string; driveFileId: string }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.status = 'synced';
        item.progress = 100;
        item.driveFileId = action.payload.driveFileId;
        item.error = null;
      }
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    },
    uploadFailure: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.status = 'failed';
        item.error = action.payload.error;
        item.progress = 0;
      }
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    },
    clearCompleted: (state) => {
      state.items = state.items.filter(i => i.status !== 'synced');
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    },
    toggleWifiOnly: (state) => {
      state.wifiOnly = !state.wifiOnly;
      mmkvStorage.setItem('settings_wifi_only', String(state.wifiOnly));
    },
    toggleAutoSync: (state) => {
      state.autoSync = !state.autoSync;
      mmkvStorage.setItem('settings_auto_sync', String(state.autoSync));
    },
    resetQueueStatus: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.status = 'pending';
        item.progress = 0;
        item.error = null;
      }
      mmkvStorage.setItem('queue_items', JSON.stringify(state.items));
    }
  },
});

export const {
  addToQueue,
  updateUploadProgress,
  uploadStart,
  uploadSuccess,
  uploadFailure,
  removeFromQueue,
  clearCompleted,
  toggleWifiOnly,
  toggleAutoSync,
  resetQueueStatus,
} = queueSlice.actions;

export default queueSlice.reducer;
