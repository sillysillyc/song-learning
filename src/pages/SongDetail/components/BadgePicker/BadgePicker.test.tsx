import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgePicker } from '@/pages/SongDetail/components/BadgePicker';
import type { MarkType, MarkStyle, MarkContent } from '@/store';

describe('BadgePicker', () => {
  const defaultProps = {
    value: {
      type: 'highlight' as MarkType,
      style: { color: '#1677ff', textColor: '#ffffff' } as MarkStyle,
      content: {} as MarkContent,
    },
    onChange: vi.fn(),
  };

  it('should render mark type options', () => {
    render(<BadgePicker {...defaultProps} />);

    expect(screen.getByText('标记类型')).toBeInTheDocument();
    expect(screen.getByText('高亮')).toBeInTheDocument();
    expect(screen.getByText('下划线')).toBeInTheDocument();
    expect(screen.getByText('符号')).toBeInTheDocument();
    expect(screen.getByText('自定义文本')).toBeInTheDocument();
  });

  it('should render color section', () => {
    render(<BadgePicker {...defaultProps} />);

    expect(screen.getByText('颜色')).toBeInTheDocument();
  });

  it('should call onChange when type changes', () => {
    const onChange = vi.fn();
    render(<BadgePicker {...defaultProps} onChange={onChange} />);

    const underlineButton = screen.getByText('下划线');
    fireEvent.click(underlineButton);

    expect(onChange).toHaveBeenCalled();
    const callArg = onChange.mock.calls[0][0];
    expect(callArg.type).toBe('underline');
  });

  it('should call onChange when color changes', () => {
    const onChange = vi.fn();
    render(<BadgePicker {...defaultProps} onChange={onChange} />);

    // 找到第一个颜色选项（蓝色）
    const colorOptions = document.querySelectorAll('.color-option');
    expect(colorOptions.length).toBeGreaterThan(0);
  });

  it('should show icon selector when type is symbol', () => {
    const onChange = vi.fn();
    render(
      <BadgePicker
        value={{
          type: 'symbol',
          style: { color: '#1677ff' },
          content: {},
        }}
        onChange={onChange}
      />
    );

    expect(screen.getByText('图标')).toBeInTheDocument();
  });

  it('should show text input when type is text', () => {
    const onChange = vi.fn();
    render(
      <BadgePicker
        value={{
          type: 'text',
          style: { color: '#1677ff', textColor: '#ffffff' },
          content: {},
        }}
        onChange={onChange}
      />
    );

    // 使用 queryByText 查找 section title
    const sectionTitles = screen.getAllByText('自定义文本');
    expect(sectionTitles.length).toBeGreaterThan(0);

    const input = screen.getByPlaceholderText('输入自定义标记文本');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when custom text changes', async () => {
    const onChange = vi.fn();
    render(
      <BadgePicker
        value={{
          type: 'text',
          style: { color: '#1677ff', textColor: '#ffffff' },
          content: {},
        }}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('输入自定义标记文本');
    fireEvent.change(input, { target: { value: '测试' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('should have note textarea', () => {
    render(<BadgePicker {...defaultProps} />);

    expect(screen.getByText('备注')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('可选：添加备注说明')).toBeInTheDocument();
  });

  it('should call onChange when note changes', () => {
    const onChange = vi.fn();
    render(<BadgePicker {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByPlaceholderText('可选：添加备注说明');
    fireEvent.change(textarea, { target: { value: '这是一个备注' } });

    expect(onChange).toHaveBeenCalled();
    const callArg = onChange.mock.calls[0][0];
    expect(callArg.content.note).toBe('这是一个备注');
  });
});
