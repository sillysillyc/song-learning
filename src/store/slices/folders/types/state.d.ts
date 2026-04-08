/**
 * 标记类型 - 用于区分不同的渲染方式
 */
export type MarkType = 'highlight' | 'underline' | 'symbol' | 'text' | 'circle';

/**
 * 标记的样式配置
 */
export interface MarkStyle {
  /** 背景颜色或主颜色 */
  color: string;
  /** 文字颜色 */
  textColor?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 标记的内容配置 - 根据不同 type 显示不同内容
 */
export interface MarkContent {
  /** 显示的文字内容，为空则显示原文本 */
  text?: string;
  /** 显示的图标/emoji */
  icon?: string;
  /** 额外的备注信息 */
  note?: string;
}

/**
 * 歌词标记 - 基于 type/tag 的设计
 */
export interface ILyricMark {
  /** 唯一标识 */
  id: string;
  /** 标记关联的歌词行 ID（而非索引） */
  lyricId: string;
  /** 标记起始字符位置 */
  startOffset: number;
  /** 标记长度（字符数） */
  length: number;
  /** 创建时选中的原始文本，用于校验和冲突检测 */
  originalText?: string;
  /** 标记类型，决定渲染方式 */
  type: MarkType;
  /** 自定义标签，可用于业务分类（如：合成拍、重点、难点等） */
  tag?: string;
  /** 样式配置 */
  style: MarkStyle;
  /** 内容配置 */
  content: MarkContent;
  /** 创建时间 */
  createTime: number;
  /** 更新时间 */
  updateTime: number;
}

export interface ILyric {
  /** 歌词行唯一标识 */
  id: string;
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
  createTime: number;
  updateTime: number;
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
