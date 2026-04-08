/**
 * 标记的形状类型
 */
export type BadgeShape = 'default' | 'square' | 'circle';

/**
 * 标记的颜色类型（支持预设和自定义）
 */
export interface BadgeColor {
  type: 'preset' | 'custom';
  value: string; // preset: 'blue' | 'red' | 'green' 等，custom: 十六进制颜色
}

/**
 * 标记的符号/图标
 */
export interface BadgeSymbol {
  type: 'none' | 'emoji' | 'icon' | 'text';
  value: string; // emoji: '🎵', icon: 'StarOutlined', text: 自定义文字
}

/**
 * 歌词标记 - PRD 核心功能
 */
export interface ILyricMark {
  id: string;
  /** 标记关联的歌词索引 */
  lyricIndex: number;
  /** 标记起始字符位置 */
  startOffset: number;
  /** 标记长度（字符数） */
  length: number;
  /** 标记颜色 */
  color: BadgeColor;
  /** 标记形状 */
  shape: BadgeShape;
  /** 标记符号/图标 */
  symbol: BadgeSymbol;
  /** 用户备注 */
  note?: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

export interface ILyric {
  content: string;
  /**
   * 这句歌词的时间
   * 在歌曲中第 n 秒出现
   */
  timeTag?: number;
}

export interface ISong {
  id: string;
  name: string;
  singer: string;
  album: string;
  duration: string;
  createTime: string;
  updateTime: string;
  lyrics: ILyric[];
  /** 歌词标记列表 */
  marks: ILyricMark[];
}

export interface IFolder {
  id: string;
  name: string;
  songCount: number;
  createTime: string;
  updateTime: string;
  songs: ISong[];
}

export interface IFoldersInfoState {
  folders: IFolder[];

  /**
   * 侧边抽屉使用的文件夹数据
   */
  currentFolder: IFolder | null,

  /**
   * 正在查看的歌曲
   */
  currentSong: ISong | null;

  /**
   * 侧边抽屉是否打开
   */
  isFolderDrawerOpen: boolean;
}
