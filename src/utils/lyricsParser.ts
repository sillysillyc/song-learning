import type { ILyric } from '@/store';

/**
 * 解析 LRC 格式歌词
 * @param lrcText - LRC 格式的歌词文本
 * @returns 解析后的歌词数组
 */
export const parseLrc = (lrcText: string): ILyric[] => {
  if (!lrcText.trim()) return [];

  const lines = lrcText.split(/\r?\n/);
  const lyrics: ILyric[] = [];
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach((line) => {
    const match = line.match(timeReg);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3], 10);
      const timeTag = minutes * 60 + seconds + centiseconds / 100;

      const content = line.replace(timeReg, '').trim();
      if (content) {
        lyrics.push({ content, timeTag });
      }
    }
  });

  return lyrics;
};

/**
 * 解析纯文本歌词（按行分割）
 * @param text - 纯文本歌词
 * @returns 解析后的歌词数组
 */
export const parsePlainText = (text: string): ILyric[] => {
  if (!text.trim()) return [];

  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => ({
      content: line.trim(),
    }));
};

/**
 * 智能解析歌词
 * 自动检测是 LRC 格式还是纯文本格式
 * @param text - 歌词文本
 * @returns 解析后的歌词数组
 */
export const parseLyrics = (text: string): ILyric[] => {
  if (!text.trim()) return [];

  // 检测是否包含 LRC 时间标签
  const hasTimeTag = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(text);

  if (hasTimeTag) {
    return parseLrc(text);
  }

  return parsePlainText(text);
};
