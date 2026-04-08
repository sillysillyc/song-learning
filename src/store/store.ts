import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { foldersInfoReducer } from './slices';

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    version: 1,
    whitelist: ['folders'],
    debug: process.env.NODE_ENV === 'development',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateReconciler: (inboundState, _originalState, _reducedState) => {
      return {
        ...inboundState,
        folders: {
          folders: [],
          currentFolder: null,
          isFolderDrawerOpen: false,
          ...inboundState.folders,
        },
      } as any;
    },
  },
  combineReducers({
    folders: foldersInfoReducer,
  }),
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
