import { store } from './store';
import type { ThunkAction, Action, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { GlobalAsyncThunksPrefix } from './slices';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRootLoadingState extends ILoadingState<GlobalAsyncThunksPrefix> {}

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

export type RootState = ReturnType<typeof store.getState> & IRootLoadingState;

export type AppThunk<ReturnType = undefined> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
