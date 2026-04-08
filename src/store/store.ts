import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { foldersInfoReducer, initialFoldersInfoState } from './slices';

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    version: 1,
    whitelist: ['folders'],
    debug: process.env.NODE_ENV === 'development',
    // 从 storage 恢复数据时，保留 folders 列表，但重置临时状态
    stateReconciler: (inboundState, _inboundKey, reducedState) => {
      // 首次加载或 localStorage 为空时，使用初始化后的 reducer state
      if (!inboundState) {
        return reducedState;
      }
      const inbound = inboundState as typeof initialFoldersInfoState;
      return {
        folders: Array.isArray(inbound.folders) ? inbound.folders : initialFoldersInfoState.folders,
        currentFolder: null,
        currentSong: null,
        isFolderDrawerOpen: false,
      };
    },
  },
  foldersInfoReducer,
);

export const store = configureStore({
  reducer: { folders: persistedReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
