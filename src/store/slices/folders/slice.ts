import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IFoldersInfoState, FoldersInfoPayloads } from './types';

// import asyncThunks from './async-thunks';
// export type FoldersInfoAsyncThunksPrefix = (typeof asyncThunks)[number]['typePrefix'];

export const initialFoldersInfoState: IFoldersInfoState = {
  folders: [],
  currentFolder: null,
  currentSong: null,
  isFolderDrawerOpen: false,
};

export const foldersInfoSlice = createSlice({
  name: 'folders',
  initialState: initialFoldersInfoState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    updateFolderInfo: (state, action: PayloadAction<FoldersInfoPayloads.UpdateFoldersInfo>) => {
      state.folders = state.folders.map((folder) => {
        if (folder.id === action.payload.folder.id) {
          return action.payload.folder;
        }
        return folder;
      });
    },
    setFoldersInfo: (state, action: PayloadAction<FoldersInfoPayloads.SetFoldersInfo>) => {
      state.folders = action.payload;
    },
    setCurrentFolder: (state, action: PayloadAction<FoldersInfoPayloads.SetCurrentFolder>) => {
      state.currentFolder = action.payload;
    },
    updateIsFolderDrawerOpen: (state, action: PayloadAction<FoldersInfoPayloads.UpdateIsFolderDrawerOpen>) => {
      state.isFolderDrawerOpen = action.payload;
    },
    setCurrentSong: (state, action: PayloadAction<FoldersInfoPayloads.SetCurrentSong>) => {
      state.currentSong = action.payload;
    },
    /** 歌词标记相关 reducers */
    addLyricMark: (state, action: PayloadAction<FoldersInfoPayloads.AddLyricMark>) => {
      if (state.currentSong) {
        state.currentSong.marks.push(action.payload.mark);
      }
    },
    updateLyricMark: (state, action: PayloadAction<FoldersInfoPayloads.UpdateLyricMark>) => {
      if (state.currentSong) {
        const mark = state.currentSong.marks.find((m) => m.id === action.payload.markId);
        if (mark) {
          Object.assign(mark, action.payload.mark);
        }
      }
    },
    deleteLyricMark: (state, action: PayloadAction<FoldersInfoPayloads.DeleteLyricMark>) => {
      if (state.currentSong) {
        state.currentSong.marks = state.currentSong.marks.filter((m) => m.id !== action.payload.markId);
      }
    },
    setLyricMarks: (state, action: PayloadAction<FoldersInfoPayloads.SetLyricMarks>) => {
      if (state.currentSong) {
        state.currentSong.marks = action.payload;
      }
    },
  },
});
// 解构 reducer actions
const { reducer: foldersInfoReducer, actions } = foldersInfoSlice;

// 导出 actions
export const {
  updateFolderInfo,
  setFoldersInfo,
  setCurrentFolder,
  updateIsFolderDrawerOpen,
  setCurrentSong,
  addLyricMark,
  updateLyricMark,
  deleteLyricMark,
  setLyricMarks,
} = actions;

// 默认导出 reducer
export { foldersInfoReducer };
