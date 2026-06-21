import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'visora-app-storage',
});

export const mmkvStorage = {
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value !== undefined ? value : null;
  },
  removeItem: (key: string): void => {
    storage.remove(key);
  },
  clearAll: (): void => {
    storage.clearAll();
  }
};
