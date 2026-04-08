import { store } from './store';
import type { ThunkAction, Action, ThunkDispatch, AnyAction, Dispatch } from '@reduxjs/toolkit';
import type { CounterAsyncThunksPrefix } from './slices';

export interface IRootLoadingState extends ILoadingState<CounterAsyncThunksPrefix | GlobalAsyncThunksPrefix> {}

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction> & Dispatch<AnyAction>;

export type RootState = ReturnType<typeof store.getState> & IRootLoadingState;

export type AppThunk<ReturnType = undefined> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
