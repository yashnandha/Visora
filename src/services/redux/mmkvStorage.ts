import { createMMKV } from 'react-native-mmkv';
import { Storage } from 'redux-persist';

// create mmkv instance
const storage = createMMKV({
  id: 'app-storage',
  encryptionKey: 'visora2026',
});

export const mmkvStorage: Storage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: key => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: key => {
    storage.remove(key);
    return Promise.resolve();
  },
};
