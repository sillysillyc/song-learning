import type { MarkType, MarkStyle, MarkContent, ILyricMark } from '@/store';

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 预设颜色列表 - 直接输出十六进制颜色值
 */
export const PRESET_COLORS: { label: string; value: string }[] = [
  { label: '蓝色', value: '#1677ff' },
  { label: '红色', value: '#ff4d4f' },
  { label: '绿色', value: '#52c41a' },
  { label: '橙色', value: '#fa8c16' },
  { label: '紫色', value: '#722ed1' },
  { label: '粉色', value: '#eb2f96' },
  { label: '青色', value: '#13c2c2' },
  { label: '灰色', value: '#8c8c8c' },
];

/**
 * 标记类型选项
 */
export const MARK_TYPES: { label: string; value: MarkType; description: string }[] = [
  { label: '高亮', value: 'highlight', description: '背景色高亮显示' },
  { label: '下划线', value: 'underline', description: '文字下方显示下划线（合成拍）' },
  { label: '圆形', value: 'circle', description: '每个字独立圆形背景' },
  { label: '符号', value: 'symbol', description: '显示图标或 emoji' },
  { label: '自定义文本', value: 'text', description: '显示自定义文字标记' },
];

/**
 * 预设符号/图标列表
 */
export const PRESET_ICONS: { label: string; value: string }[] = [
  { label: '无', value: '' },
  { label: '音符', value: '🎵' },
  { label: '星星', value: '⭐' },
  { label: '爱心', value: '❤️' },
  { label: '火焰', value: '🔥' },
  { label: '对勾', value: '✅' },
  { label: '警告', value: '⚠️' },
  { label: '问号', value: '❓' },
];

/**
 * 默认样式配置
 */
export const DEFAULT_MARK_STYLES: Record<MarkType, MarkStyle> = {
  highlight: {
    color: '#1677ff',
    textColor: '#ffffff',
    className: 'mark-highlight',
  },
  underline: {
    color: '#1677ff',
    textColor: 'inherit',
    className: 'mark-underline',
  },
  circle: {
    color: '#1677ff',
    textColor: '#ffffff',
    className: 'mark-circle',
  },
  symbol: {
    color: 'transparent',
    textColor: 'inherit',
    className: 'mark-symbol',
  },
  text: {
    color: '#1677ff',
    textColor: '#ffffff',
    className: 'mark-text',
  },
};

/**
 * 根据标记类型获取渲染样式
 */
export const getMarkStyle = (type: MarkType, customStyle?: MarkStyle): React.CSSProperties => {
  const baseStyle = DEFAULT_MARK_STYLES[type];
  const style: React.CSSProperties = {};

  if (type === 'highlight' || type === 'text' || type === 'circle') {
    style.backgroundColor = customStyle?.color || baseStyle.color;
    style.color = customStyle?.textColor || baseStyle.textColor;
  } else if (type === 'underline') {
    style.borderBottom = `2px solid ${customStyle?.color || baseStyle.color}`;
    style.color = customStyle?.textColor || baseStyle.textColor;
  } else if (type === 'symbol') {
    style.color = customStyle?.color || baseStyle.color;
  }

  return style;
};

/**
 * 创建一个新的歌词标记
 */
export const createLyricMark = (
  lyricId: string,
  startOffset: number,
  length: number,
  originalText: string,
  type: MarkType = 'highlight',
  tag?: string,
  style?: MarkStyle,
  content?: MarkContent,
): ILyricMark => {
  const now = Date.now();
  const baseStyle = DEFAULT_MARK_STYLES[type];

  return {
    id: generateId(),
    lyricId,
    startOffset,
    length,
    originalText,
    type,
    tag,
    style: {
      ...baseStyle,
      ...style,
    },
    content: content || {},
    createTime: now,
    updateTime: now,
  };
};

/**
 * 更新歌词标记
 */
export const updateLyricMark = (
  mark: ILyricMark,
  updates: Partial<Pick<ILyricMark, 'type' | 'tag' | 'style' | 'content'>>,
): ILyricMark => {
  return {
    ...mark,
    ...updates,
    updateTime: Date.now(),
  };
};

/**
 * 获取选中文字的起始和结束位置
 */
export const getSelectionOffset = (
  selection: Selection | null,
  container: HTMLElement,
): { start: number; end: number; selectedText: string } | null => {
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;
  const end = start + range.toString().length;
  const selectedText = range.toString();

  return { start, end, selectedText };
};

/**
 * 将歌词文本分割为单个字符
 * 每个字符作为独立元素，方便原生文本选择和索引计算
 *
 * 返回的每个 segment 对应原字符串中的一个字符位置
 */
export const splitLyricText = (
  text: string,
): { text: string; type: 'chinese' | 'english' | 'punctuation' | 'space' }[] => {
  if (!text) return [];

  const segments: { text: string; type: 'chinese' | 'english' | 'punctuation' | 'space' }[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let charType: 'chinese' | 'english' | 'punctuation' | 'space' = 'chinese';

    // 判断字符类型
    if (/\s/.test(char)) {
      charType = 'space';
    } else if (/[\u4e00-\u9fa5]/.test(char)) {
      charType = 'chinese';
    } else if (/[a-zA-Z]/.test(char)) {
      charType = 'english';
    } else {
      charType = 'punctuation';
    }

    segments.push({ text: char, type: charType });
  }

  return segments;
};
