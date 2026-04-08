import { store } from './store';
import type { ThunkAction, Action, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { IFoldersInfoState } from './slices';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRootLoadingState extends ILoadingState<GlobalAsyncThunksPrefix> {}

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

// 手动定义 RootState 类型，避免 persistReducer 导致的类型推导问题
export interface RootState {
  folders: IFoldersInfoState;
}

export type AppThunk<ReturnType = undefined> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
