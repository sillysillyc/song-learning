import type { IFolder, ISong, ILyricMark } from './state';
export declare namespace FoldersInfoPayloads {
  export interface UpdateFoldersInfo {
    folder: IFolder;
  }
  export type SetFoldersInfo = IFolder[];
  export type SetCurrentFolder = IFolder;
  export type UpdateIsFolderDrawerOpen = boolean;
  export type SetCurrentSong = ISong;

  /** 歌词标记相关 payloads */
  export interface AddLyricMark {
    mark: ILyricMark;
  }
  export interface UpdateLyricMark {
    markId: string;
    mark: Partial<ILyricMark>;
  }
  export interface DeleteLyricMark {
    markId: string;
  }
  export type SetLyricMarks = ILyricMark[];
}
