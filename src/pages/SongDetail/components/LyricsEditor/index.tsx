import { memo, useState, useRef } from 'react';
import { Typography, Space, Button, Modal, Input, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addLyricMark, updateLyricMark, deleteLyricMark, selectCurrentSong, type ILyricMark } from '@/store';
import { MarkItem } from '../MarkItem';
import { BadgePicker } from '../BadgePicker';
import { createLyricMark, getSelectionOffset } from '@/utils/markUtils';
import type { BadgeColor, BadgeShape, BadgeSymbol } from '@/store';
import './index.less';

const { Paragraph } = Typography;

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

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // 处理文字选择
  const handleTextSelection = (lyricIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const container = e.currentTarget;
    const offsetInfo = getSelectionOffset(selection, container);

    if (!offsetInfo || !offsetInfo.selectedText.trim()) return;

    // 检查是否已有标记覆盖此区域
    const hasExistingMark = marks.some(
      (mark: ILyricMark) =>
        mark.lyricIndex === lyricIndex &&
        ((offsetInfo.start >= mark.startOffset && offsetInfo.start < mark.startOffset + mark.length) ||
          (offsetInfo.end > mark.startOffset && offsetInfo.end <= mark.startOffset + mark.length) ||
          (offsetInfo.start <= mark.startOffset && offsetInfo.end >= mark.startOffset + mark.length)),
    );

    if (hasExistingMark) {
      Modal.warning({
        title: '无法创建标记',
        content: '该区域已有标记，请先删除现有标记',
      });
      selection.removeAllRanges();
      return;
    }

    // 开始创建新标记
    setEditingMark({
      isEditing: true,
      selectedText: offsetInfo.selectedText,
      lyricIndex,
      startOffset: offsetInfo.start,
      length: offsetInfo.end - offsetInfo.start,
    });

    // 清除选择
    selection.removeAllRanges();
  };

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
      },
    });
  };

  // 编辑标记
  const handleEditMark = (mark: ILyricMark) => {
    setEditingMark({
      isEditing: true,
      markId: mark.id,
      selectedText: '', // 编辑时不需要选中文本
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

  // 渲染歌词中的标记
  const renderLyricWithMarks = (lyricContent: string, lyricIndex: number) => {
    const lyricMarks = marks.filter((m: ILyricMark) => m.lyricIndex === lyricIndex);

    if (lyricMarks.length === 0) {
      return <span>{lyricContent}</span>;
    }

    // 按起始位置排序标记
    const sortedMarks = [...lyricMarks].sort((a, b) => a.startOffset - b.startOffset);

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedMarks.forEach((mark, index) => {
      // 标记前的普通文本
      if (mark.startOffset > lastIndex) {
        elements.push(<span key={`text-${index}`}>{lyricContent.substring(lastIndex, mark.startOffset)}</span>);
      }

      // 标记文本
      const markedText = lyricContent.substring(mark.startOffset, mark.startOffset + mark.length);
      elements.push(
        <MarkItem
          key={mark.id}
          mark={mark}
          selectedText={markedText}
          onDelete={() => handleDeleteMark(mark.id)}
          onEdit={() => handleEditMark(mark)}
        />,
      );

      lastIndex = mark.startOffset + mark.length;
    });

    // 标记后的普通文本
    if (lastIndex < lyricContent.length) {
      elements.push(<span key="text-end">{lyricContent.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div ref={lyricsContainerRef} className="lyrics-editor">
      {isEditMode ? (
        // 编辑模式：左右分栏布局
        <div className="edit-mode-layout">
          {/* 左侧：歌词列表 */}
          <div className="lyrics-panel">
            <Typography.Title level={5}>歌词</Typography.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              {lyrics.map((lyric, index) => (
                <div key={index} className="lyric-item edit-mode" onMouseUp={(e) => handleTextSelection(index, e)}>
                  <span className="lyric-index">[{String(index + 1).padStart(2, '0')}]</span>
                  {renderLyricWithMarks(lyric.content, index)}
                </div>
              ))}
            </div>
            {/* 提示信息 */}
            {!editingMark && <div className="edit-hint">💡 在歌词上拖动选择文字，即可创建标记</div>}
          </div>

          {/* 右侧：编辑工具面板 */}
          <div className="tools-panel">
            <Typography.Title level={5}>标记工具</Typography.Title>
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
                  <Button type="primary" onClick={editingMark.markId ? handleUpdateMark : handleSaveMark} block>
                    {editingMark.markId ? '更新标记' : '保存标记'}
                  </Button>
                  <Button onClick={handleCancelMark} block>
                    取消
                  </Button>
                </Space>
              </div>
            ) : (
              <div className="empty-state">
                <p>请先在左侧选择要标记的歌词文字</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 查看模式：单栏显示
        <div>
          <Paragraph className="view-mode">
            <Typography.Title level={5}>歌词</Typography.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              {lyrics.map((lyric, index) => (
                <div key={index} className="lyric-item view-mode">
                  <span className="lyric-index">[{String(index + 1).padStart(2, '0')}]</span>
                  {renderLyricWithMarks(lyric.content, index)}
                </div>
              ))}
            </div>
          </Paragraph>
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
