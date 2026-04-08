import { memo, useState, useCallback, useRef } from 'react';
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

interface LyricCharProps {
  text: string;
  index: number;
  lyricIndex: number;
  isEditMode: boolean;
  isSelected: boolean;
  isMarked: boolean;
  mark?: ILyricMark;
  onMouseDown: (index: number, lyricIndex: number) => void;
  onMouseEnter: (index: number, lyricIndex: number) => void;
  onClick: () => void;
}

// 单个字符/单词组件
const LyricChar = memo((props: LyricCharProps) => {
  const { text, index, lyricIndex, isEditMode, isSelected, isMarked, onMouseDown, onMouseEnter, onClick } = props;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onMouseDown(index, lyricIndex);
    },
    [index, lyricIndex, onMouseDown],
  );

  const handleMouseEnter = useCallback(() => {
    if (isEditMode) {
      onMouseEnter(index, lyricIndex);
    }
  }, [isEditMode, index, lyricIndex, onMouseEnter]);

  return (
    <span
      className={`lyric-char ${isSelected ? 'selected' : ''} ${isMarked ? 'marked' : ''} ${isEditMode ? 'editable' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {text}
    </span>
  );
});

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

  const isSelectingRef = useRef(false);
  const anchorRef = useRef<{ index: number; lyricIndex: number } | null>(null);

  // 鼠标按下 - 开始选择
  const handleMouseDown = useCallback(
    (charIndex: number, lyricIndex: number) => {
      if (!isEditMode) return;

      isSelectingRef.current = true;
      anchorRef.current = { index: charIndex, lyricIndex };

      // 检查是否点击在已有标记上
      const existingMark = marks.find(
        (mark: ILyricMark) =>
          mark.lyricIndex === lyricIndex &&
          charIndex >= mark.startOffset &&
          charIndex < mark.startOffset + mark.length,
      );

      if (existingMark) {
        // 点击已有标记，进入编辑模式
        setEditingMark({
          isEditing: true,
          markId: existingMark.id,
          selectedText: '',
          lyricIndex,
          startOffset: existingMark.startOffset,
          length: existingMark.length,
        });
        setSelectedMarkStyle({
          color: existingMark.color,
          shape: existingMark.shape,
          symbol: existingMark.symbol,
        });
        setEditingNote(existingMark.note || '');
        isSelectingRef.current = false;
        anchorRef.current = null;
      } else {
        // 开始新的选择
        setEditingMark({
          isEditing: true,
          lyricIndex,
          selectedText: lyrics[lyricIndex]?.content[charIndex] || '',
          startOffset: charIndex,
          length: 1,
        });
      }
    },
    [isEditMode, marks, lyrics],
  );

  // 鼠标移入 - 扩展选择
  const handleMouseEnter = useCallback(
    (charIndex: number, lyricIndex: number) => {
      if (!isEditMode || !isSelectingRef.current || !anchorRef.current) return;

      // 只允许在同一行内选择
      if (lyricIndex !== anchorRef.current.lyricIndex) return;

      const anchor = anchorRef.current.index;
      const start = Math.min(anchor, charIndex);
      const length = Math.abs(charIndex - anchor) + 1;
      const lyricContent = lyrics[lyricIndex]?.content || '';

      setEditingMark((prev) => {
        if (!prev || prev.lyricIndex !== lyricIndex) return prev;
        return {
          ...prev,
          startOffset: start,
          length,
          selectedText: lyricContent.substring(start, start + length),
        };
      });
    },
    [isEditMode, lyrics],
  );

  // 鼠标松开
  const handleMouseUp = useCallback(() => {
    isSelectingRef.current = false;
  }, []);

  // 点击已有标记
  const handleMarkClick = useCallback((mark: ILyricMark) => {
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
  }, [isEditMode]);

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

        // 检查是否在当前选择范围内
        const isSelected = editingMark?.lyricIndex === lyricIndex &&
          charIndex >= editingMark.startOffset &&
          charIndex < editingMark.startOffset + editingMark.length;

        return (
          <LyricChar
            key={`${lyricIndex}-${charIndex}`}
            text={segment.text}
            index={charIndex}
            lyricIndex={lyricIndex}
            isEditMode={isEditMode}
            isSelected={!!isSelected}
            isMarked={!!mark}
            mark={mark}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onClick={() => mark && handleMarkClick(mark)}
          />
        );
      });
    },
    [marks, editingMark, isEditMode, handleMouseDown, handleMouseEnter, handleMarkClick],
  );

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
                <div key={index} className="lyric-line">
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
