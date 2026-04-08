import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateId,
  PRESET_COLORS,
  PRESET_ICONS,
  MARK_TYPES,
  DEFAULT_MARK_STYLES,
  getMarkStyle,
  createLyricMark,
  updateLyricMark,
  splitLyricText,
  getSelectionOffset,
} from '@/utils/markUtils';
import type { MarkType, MarkStyle, ILyricMark } from '@/store';

describe('markUtils', () => {
  describe('generateId', () => {
    it('should generate a unique id', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should return a string format', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^\d+_[a-z0-9]+$/);
    });
  });

  describe('PRESET_COLORS', () => {
    it('should be an array with label and value', () => {
      expect(Array.isArray(PRESET_COLORS)).toBe(true);
      expect(PRESET_COLORS.length).toBeGreaterThan(0);
      PRESET_COLORS.forEach((color) => {
        expect(color).toHaveProperty('label');
        expect(color).toHaveProperty('value');
        expect(color.value).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('PRESET_ICONS', () => {
    it('should be an array with label and value', () => {
      expect(Array.isArray(PRESET_ICONS)).toBe(true);
      expect(PRESET_ICONS.length).toBeGreaterThan(0);
      PRESET_ICONS.forEach((icon) => {
        expect(icon).toHaveProperty('label');
        expect(icon).toHaveProperty('value');
      });
    });

    it('should have an empty value option for "none"', () => {
      const noneIcon = PRESET_ICONS.find((i) => i.label === '无');
      expect(noneIcon).toBeDefined();
      expect(noneIcon?.value).toBe('');
    });
  });

  describe('MARK_TYPES', () => {
    it('should contain all mark types', () => {
      expect(MARK_TYPES.length).toBe(5);
      const types = MARK_TYPES.map((t) => t.value);
      expect(types).toContain('highlight');
      expect(types).toContain('underline');
      expect(types).toContain('circle');
      expect(types).toContain('symbol');
      expect(types).toContain('text');
    });

    it('should have label, value, and description for each type', () => {
      MARK_TYPES.forEach((type) => {
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('description');
      });
    });
  });

  describe('DEFAULT_MARK_STYLES', () => {
    it('should have styles for all mark types', () => {
      const types: MarkType[] = ['highlight', 'underline', 'symbol', 'text'];
      types.forEach((type) => {
        expect(DEFAULT_MARK_STYLES[type]).toBeDefined();
        expect(DEFAULT_MARK_STYLES[type].color).toBeDefined();
      });
    });

    it('highlight should have backgroundColor and textColor', () => {
      const style = DEFAULT_MARK_STYLES.highlight;
      expect(style.color).toBe('#1677ff');
      expect(style.textColor).toBe('#ffffff');
    });

    it('underline should have borderColor', () => {
      const style = DEFAULT_MARK_STYLES.underline;
      expect(style.color).toBe('#1677ff');
      expect(style.textColor).toBe('inherit');
    });
  });

  describe('getMarkStyle', () => {
    it('should return highlight style with backgroundColor', () => {
      const style = getMarkStyle('highlight');
      expect(style.backgroundColor).toBe('#1677ff');
      expect(style.color).toBe('#ffffff');
    });

    it('should return underline style with borderBottom', () => {
      const style = getMarkStyle('underline');
      expect(style.borderBottom).toBe('2px solid #1677ff');
      expect(style.color).toBe('inherit');
    });

    it('should return symbol style with color', () => {
      const style = getMarkStyle('symbol');
      expect(style.color).toBe('transparent');
    });

    it('should return text style with backgroundColor', () => {
      const style = getMarkStyle('text');
      expect(style.backgroundColor).toBe('#1677ff');
      expect(style.color).toBe('#ffffff');
    });

    it('should apply custom style override', () => {
      const customStyle: MarkStyle = { color: '#ff0000', textColor: '#000000' };
      const style = getMarkStyle('highlight', customStyle);
      expect(style.backgroundColor).toBe('#ff0000');
      expect(style.color).toBe('#000000');
    });
  });

  describe('createLyricMark', () => {
    it('should create a mark with default values', () => {
      const mark = createLyricMark('lyric-1', 0, 5, '测试文本');
      expect(mark.id).toBeDefined();
      expect(mark.lyricId).toBe('lyric-1');
      expect(mark.startOffset).toBe(0);
      expect(mark.length).toBe(5);
      expect(mark.originalText).toBe('测试文本');
      expect(mark.type).toBe('highlight');
      expect(mark.style.color).toBe('#1677ff');
      expect(mark.createTime).toBeDefined();
      expect(mark.updateTime).toBeDefined();
    });

    it('should create a mark with custom type and style', () => {
      const customStyle: MarkStyle = { color: '#ff0000', textColor: '#ffffff' };
      const mark = createLyricMark('lyric-1', 0, 5, '测试文本', 'underline', '重点', customStyle, {
        note: '这是一个备注',
      });
      expect(mark.type).toBe('underline');
      expect(mark.tag).toBe('重点');
      expect(mark.style.color).toBe('#ff0000');
      expect(mark.content.note).toBe('这是一个备注');
    });
  });

  describe('updateLyricMark', () => {
    it('should update mark properties', () => {
      const originalMark: ILyricMark = createLyricMark('lyric-1', 0, 5, '测试文本');

      // 等待一小段时间以确保 updateTime 不同
      const updatedMark = updateLyricMark(originalMark, {
        type: 'underline',
        style: { color: '#ff0000' },
      });

      expect(updatedMark.type).toBe('underline');
      expect(updatedMark.style.color).toBe('#ff0000');
      expect(updatedMark.updateTime).toBeGreaterThanOrEqual(originalMark.updateTime);
      expect(updatedMark.id).toBe(originalMark.id);
      expect(updatedMark.lyricId).toBe(originalMark.lyricId);
    });

    it('should only update specified properties', () => {
      const originalMark: ILyricMark = createLyricMark('lyric-1', 0, 5, '测试文本', 'highlight', undefined, {
        color: '#1677ff',
        textColor: '#ffffff',
      });
      const updatedMark = updateLyricMark(originalMark, {
        content: { note: '新备注' },
      });

      expect(updatedMark.type).toBe('highlight');
      expect(updatedMark.style.color).toBe('#1677ff');
      expect(updatedMark.content.note).toBe('新备注');
    });
  });

  describe('splitLyricText', () => {
    it('should split chinese text into characters', () => {
      const result = splitLyricText('你好世界');
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ text: '你', type: 'chinese' });
      expect(result[1]).toEqual({ text: '好', type: 'chinese' });
    });

    it('should split english text into characters', () => {
      const result = splitLyricText('Hello');
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ text: 'H', type: 'english' });
      expect(result[1]).toEqual({ text: 'e', type: 'english' });
    });

    it('should handle mixed text', () => {
      const result = splitLyricText('你好 Hello');
      // 2 个中文字符 + 1 个空格 + 5 个英文字符 = 8 个字符
      expect(result).toHaveLength(8);
      expect(result[0]).toEqual({ text: '你', type: 'chinese' });
      expect(result[2]).toEqual({ text: ' ', type: 'space' });
      expect(result[3]).toEqual({ text: 'H', type: 'english' });
    });

    it('should handle punctuation', () => {
      const result = splitLyricText('你好!');
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual({ text: '!', type: 'punctuation' });
    });

    it('should return empty array for empty string', () => {
      const result = splitLyricText('');
      expect(result).toEqual([]);
    });

    it('should correctly identify all character types', () => {
      const result = splitLyricText('你好 Hello 123!@#');
      const types = result.map((r) => r.type);
      expect(types).toContain('chinese');
      expect(types).toContain('english');
      expect(types).toContain('space');
      expect(types).toContain('punctuation');
    });
  });

  describe('getSelectionOffset', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.textContent = 'Hello World';
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return null if no selection', () => {
      const result = getSelectionOffset(null, container);
      expect(result).toBeNull();
    });

    it('should return null if selection is outside container', () => {
      const otherContainer = document.createElement('div');
      otherContainer.textContent = 'Other text';
      document.body.appendChild(otherContainer);

      const range = document.createRange();
      range.selectNodeContents(otherContainer);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const result = getSelectionOffset(selection, container);
      expect(result).toBeNull();

      document.body.removeChild(otherContainer);
    });

    it('should return correct offsets for valid selection', () => {
      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const result = getSelectionOffset(selection, container);
      expect(result).not.toBeNull();
      expect(result?.start).toBe(0);
      expect(result?.end).toBe(11);
      expect(result?.selectedText).toBe('Hello World');
    });
  });
});
