import type { RootState } from '@/store/types';

export const selectCurrentFolder = (state: RootState) => state.folders.currentFolder;
export const selectFolders = (state: RootState) => state.folders.folders;
export const selectIsFolderDrawerOpen = (state: RootState) => state.folders.isFolderDrawerOpen;
export const selectCurrentSong = (state: RootState) => state.folders.currentSong;
