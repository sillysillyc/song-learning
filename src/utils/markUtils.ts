import type { BadgeColor, BadgeShape, BadgeSymbol, ILyricMark } from '@/store';

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * 预设颜色列表
 */
export const PRESET_COLORS: { label: string; value: string }[] = [
  { label: '蓝色', value: 'blue' },
  { label: '红色', value: 'red' },
  { label: '绿色', value: 'green' },
  { label: '橙色', value: 'orange' },
  { label: '紫色', value: 'purple' },
  { label: '粉色', value: 'pink' },
  { label: '青色', value: 'cyan' },
  { label: '灰色', value: 'gray' },
];

/**
 * 预设形状列表
 */
export const PRESET_SHAPES: { label: string; value: BadgeShape }[] = [
  { label: '默认', value: 'default' },
  { label: '方形', value: 'square' },
  { label: '圆形', value: 'circle' },
];

/**
 * 预设符号列表
 */
export const PRESET_SYMBOLS: { label: string; value: BadgeSymbol }[] = [
  { label: '无', value: { type: 'none', value: '' } },
  { label: '音符', value: { type: 'emoji', value: '🎵' } },
  { label: '星星', value: { type: 'emoji', value: '⭐' } },
  { label: '爱心', value: { type: 'emoji', value: '❤️' } },
  { label: '火焰', value: { type: 'emoji', value: '🔥' } },
  { label: '对勾', value: { type: 'emoji', value: '✅' } },
  { label: '警告', value: { type: 'emoji', value: '⚠️' } },
  { label: '问号', value: { type: 'emoji', value: '❓' } },
];

/**
 * 获取标记的背景颜色
 */
export const getMarkBackgroundColor = (color: BadgeColor): string => {
  if (color.type === 'custom') {
    return color.value;
  }
  const colorMap: Record<string, string> = {
    blue: '#1677ff',
    red: '#ff4d4f',
    green: '#52c41a',
    orange: '#fa8c16',
    purple: '#722ed1',
    pink: '#eb2f96',
    cyan: '#13c2c2',
    gray: '#8c8c8c',
  };
  return colorMap[color.value] || '#1677ff';
};

/**
 * 创建一个新的歌词标记
 */
export const createLyricMark = (
  lyricIndex: number,
  startOffset: number,
  length: number,
  color: BadgeColor = { type: 'preset', value: 'blue' },
  shape: BadgeShape = 'default',
  symbol: BadgeSymbol = { type: 'none', value: '' },
  note?: string,
): ILyricMark => {
  const now = Date.now().toString();
  return {
    id: generateId(),
    lyricIndex,
    startOffset,
    length,
    color,
    shape,
    symbol,
    note,
    createTime: now,
    updateTime: now,
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
 * 将歌词文本分割为单个字符或单词
 * 中文：每个字作为一个元素
 * 英文：每个单词作为一个元素
 * 标点符号：单独作为一个元素
 */
export const splitLyricText = (
  text: string,
): { text: string; type: 'chinese' | 'english' | 'punctuation' | 'space' }[] => {
  if (!text) return [];

  const segments: { text: string; type: 'chinese' | 'english' | 'punctuation' | 'space' }[] = [];
  let currentSegment = '';
  let currentType: 'chinese' | 'english' | 'punctuation' | 'space' | null = null;

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

    // 如果类型改变，保存当前段并开始新段
    if (currentType !== null && charType !== currentType) {
      if (currentSegment) {
        segments.push({ text: currentSegment, type: currentType });
      }
      currentSegment = char;
      currentType = charType;
    } else {
      // 类型相同，继续累积
      currentSegment += char;
      currentType = charType;
    }
  }

  // 添加最后一个段
  if (currentSegment) {
    segments.push({ text: currentSegment, type: currentType! });
  }

  return segments;
};
