import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Typography, Space, Button, Modal, Input, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  addLyricMark,
  updateLyricMark,
  deleteLyricMark,
  selectCurrentSong,
  type ILyricMark,
} from '@/store';
import { BadgePicker } from '../BadgePicker';
import { createLyricMark, splitLyricText } from '@/utils/markUtils';
import type { BadgeColor, BadgeShape, BadgeSymbol } from '@/store';
import './index.less';

const { Title } = Typography;

export interface ILyricsEditorProps {
  lyrics?: { content: string; timeTag?: number }[];
}

interface EditingMarkState {
  isEditing: boolean;
  markId?: string;
  selectedText: string;
  lyricIndex: number;
  startOffset: number;
  length: number;
}

// 获取选中文字在歌词行中的位置（基于字符数）
const getSelectionInLine = (
  selection: Selection,
  lineElement: HTMLElement,
): { start: number; end: number; text: string } | null => {
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return null;

  // 检查选择是否在此行内
  if (!lineElement.contains(range.commonAncestorContainer)) return null;

  // 获取行内纯文本内容（排除索引编号）
  const charsContainer = lineElement.querySelector('.lyric-chars');
  if (!charsContainer) return null;

  // 使用文本范围计算位置
  const preRange = range.cloneRange();
  preRange.selectNodeContents(charsContainer);
  preRange.setEnd(range.startContainer, range.startOffset);

  // 计算起始位置 - 统计字符数
  const start = preRange.toString().length;
  const end = start + range.toString().length;
  const text = range.toString();

  return { start, end, text };
};

export const LyricsEditor = memo((props: ILyricsEditorProps) => {
  const { lyrics = [] } = props;
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const marks = currentSong?.marks || [];

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMark, setEditingMark] = useState<EditingMarkState | null>(null);
  const [selectedMarkStyle, setSelectedMarkStyle] = useState<{
    color: BadgeColor;
    shape: BadgeShape;
    symbol: BadgeSymbol;
  }>({
    color: { type: 'preset', value: 'blue' },
    shape: 'default',
    symbol: { type: 'none', value: '' },
  });
  const [editingNote, setEditingNote] = useState('');

  const lyricsRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // 处理鼠标松开 - 获取原生选择
  const handleMouseUp = useCallback(() => {
    if (!isEditMode) return;

    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      if (!selectedText) return;

      // 查找选择在哪一行
      let lyricIndex = -1;
      let selectionInfo: { start: number; end: number; text: string } | null = null;

      lyricsRefs.current.forEach((ref, index) => {
        if (selectionInfo) return;
        const info = getSelectionInLine(selection, ref);
        if (info) {
          lyricIndex = index;
          selectionInfo = info;
        }
      });

      if (lyricIndex === -1 || !selectionInfo) return;

      const { start, end, text } = selectionInfo;

      // 检查是否选择在已有标记范围内
      const hasExistingMark = marks.some(
        (mark: ILyricMark) =>
          mark.lyricIndex === lyricIndex &&
          ((start >= mark.startOffset && start < mark.startOffset + mark.length) ||
            (end > mark.startOffset && end <= mark.startOffset + mark.length) ||
            (start <= mark.startOffset && end >= mark.startOffset + mark.length)),
      );

      if (hasExistingMark) {
        Modal.warning({
          title: '无法创建标记',
          content: '该区域已有标记，请先删除现有标记',
        });
        selection.removeAllRanges();
        return;
      }

      // 创建新的选择状态
      setEditingMark({
        isEditing: true,
        lyricIndex,
        selectedText: text,
        startOffset: start,
        length: end - start,
      });

      // 清除原生选择
      selection.removeAllRanges();
    }, 10);
  }, [isEditMode, marks]);

  // 点击已有标记
  const handleMarkClick = useCallback(
    (mark: ILyricMark) => {
      if (!isEditMode) return;

      setEditingMark({
        isEditing: true,
        markId: mark.id,
        selectedText: '',
        lyricIndex: mark.lyricIndex,
        startOffset: mark.startOffset,
        length: mark.length,
      });
      setSelectedMarkStyle({
        color: mark.color,
        shape: mark.shape,
        symbol: mark.symbol,
      });
      setEditingNote(mark.note || '');
    },
    [isEditMode],
  );

  // 保存标记
  const handleSaveMark = () => {
    if (!editingMark) return;

    const newMark = createLyricMark(
      editingMark.lyricIndex,
      editingMark.startOffset,
      editingMark.length,
      selectedMarkStyle.color,
      selectedMarkStyle.shape,
      selectedMarkStyle.symbol,
      editingNote,
    );

    dispatch(addLyricMark({ mark: newMark }));
    resetEditingState();
  };

  // 取消创建标记
  const handleCancelMark = () => {
    resetEditingState();
  };

  // 删除标记
  const handleDeleteMark = (markId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此标记吗？',
      onOk: () => {
        dispatch(deleteLyricMark({ markId }));
        resetEditingState();
      },
    });
  };

  // 更新标记
  const handleUpdateMark = () => {
    if (!editingMark || !editingMark.markId) return;

    dispatch(
      updateLyricMark({
        markId: editingMark.markId,
        mark: {
          color: selectedMarkStyle.color,
          shape: selectedMarkStyle.shape,
          symbol: selectedMarkStyle.symbol,
          note: editingNote,
          updateTime: Date.now().toString(),
        },
      }),
    );
    resetEditingState();
  };

  // 重置编辑状态
  const resetEditingState = () => {
    setEditingMark(null);
    setSelectedMarkStyle({
      color: { type: 'preset', value: 'blue' },
      shape: 'default',
      symbol: { type: 'none', value: '' },
    });
    setEditingNote('');
  };

  // 渲染歌词中的标记（按字/单词展示）
  const renderLyricWithChars = useCallback(
    (lyricContent: string, lyricIndex: number) => {
      const segments = splitLyricText(lyricContent);
      const lyricMarks = marks.filter((m: ILyricMark) => m.lyricIndex === lyricIndex);

      return segments.map((segment, charIndex) => {
        // 检查这个字符是否属于某个标记
        const mark = lyricMarks.find(
          (m) => charIndex >= m.startOffset && charIndex < m.startOffset + m.length,
        );

        return (
          <span
            key={`${lyricIndex}-${charIndex}`}
            className={`lyric-char ${mark ? 'marked' : ''} ${isEditMode ? 'editable' : ''}`}
            onClick={() => mark && handleMarkClick(mark)}
          >
            {segment.text}
          </span>
        );
      });
    },
    [marks, isEditMode, handleMarkClick],
  );

  // 注册歌词行 ref
  useEffect(() => {
    return () => {
      lyricsRefs.current.clear();
    };
  }, []);

  return (
    <div className="lyrics-editor" onMouseUp={handleMouseUp}>
      {isEditMode ? (
        // 编辑模式：左右分栏布局
        <div className="edit-mode-layout">
          {/* 左侧：歌词面板 */}
          <div className="lyrics-panel">
            <Title level={5}>歌词</Title>
            <div className="lyrics-container">
              {lyrics.map((lyric, index) => (
                <div
                  key={index}
                  className="lyric-line"
                  ref={(el) => {
                    if (el) lyricsRefs.current.set(index, el);
                  }}
                >
                  <span className="lyric-index">[{String(index + 1).padStart(2, '0')}]</span>
                  <div className="lyric-chars">{renderLyricWithChars(lyric.content, index)}</div>
                </div>
              ))}
            </div>
            {/* 提示信息 */}
            {!editingMark && (
              <div className="edit-hint">💡 在文字上按住鼠标左键并拖动来选择范围</div>
            )}
          </div>

          {/* 右侧：工具面板 */}
          <div className="tools-panel">
            <Title level={5}>标记工具</Title>
            {editingMark ? (
              <div className="edit-form">
                {editingMark.selectedText && (
                  <div className="selected-text-info">
                    <strong>选中的文字：</strong>
                    <span className="text">{editingMark.selectedText}</span>
                  </div>
                )}

                <Divider />

                <BadgePicker
                  value={selectedMarkStyle}
                  onChange={(value: { color: BadgeColor; shape: BadgeShape; symbol: BadgeSymbol }) =>
                    setSelectedMarkStyle(value)
                  }
                />

                <div className="note-section">
                  <div className="section-title">备注</div>
                  <Input.TextArea
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    placeholder="可选：添加备注说明"
                    rows={3}
                  />
                </div>

                <Divider />

                <Space className="action-buttons">
                  {editingMark.markId ? (
                    <>
                      <Button type="primary" onClick={handleUpdateMark} block>
                        更新标记
                      </Button>
                      <Button danger onClick={() => handleDeleteMark(editingMark.markId!)} block>
                        删除标记
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button type="primary" onClick={handleSaveMark} block>
                        保存标记
                      </Button>
                      <Button onClick={handleCancelMark} block>
                        取消
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            ) : (
              <div className="empty-state">
                <p>请在左侧拖动鼠标选择要标记的文字</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 查看模式：单栏显示
        <div>
          <Title level={5}>歌词</Title>
          <div className="lyrics-container">
            {lyrics.map((lyric, index) => (
              <div key={index} className="lyric-line">
                <span className="lyric-index">[{String(index + 1).padStart(2, '0')}]</span>
                <div className="lyric-chars">{renderLyricWithChars(lyric.content, index)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 编辑模式切换按钮 */}
      <div className="edit-mode-toggle">
        <Button type={isEditMode ? 'primary' : 'default'} onClick={() => setIsEditMode(!isEditMode)}>
          {isEditMode ? '完成编辑' : '编辑歌词'}
        </Button>
      </div>
    </div>
  );
});
