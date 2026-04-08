import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Typography, Space, Button, Modal, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  addLyricMark,
  updateLyricMark,
  deleteLyricMark,
  selectCurrentSong,
  type ILyricMark,
} from '@/store';
import { BadgePicker } from '../BadgePicker';
import { createLyricMark, splitLyricText, getMarkStyle } from '@/utils/markUtils';
import type { MarkType, MarkStyle, MarkContent } from '@/store';
import './index.less';

const { Title } = Typography;

export interface ILyricsEditorProps {
  lyrics?: { content: string; timeTag?: number }[];
}

interface EditingMarkState {
  isEditing: boolean;
  markId?: string;
  selectedText: string;
  lyricId: string;
  startOffset: number;
  length: number;
}

// 获取选中文字在歌词行中的位置（基于字符数）
const getSelectionInLine = (
  selection: Selection,
  charsContainer: Element,
  lyricText: string, // 传入原始歌词文本用于精确计算
): { start: number; end: number; text: string } | null => {
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return null;

  // 检查选择是否在此容器内
  if (!charsContainer.contains(range.commonAncestorContainer)) return null;

  const selectedText = range.toString();
  if (!selectedText) return null;

  // 使用更可靠的方法：在原始文本中查找选中文字的起始位置
  // 首先获取选区开始和结束的节点
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  // 找到 startContainer 在整个歌词文本中的位置
  let startOffset = 0;
  let endOffset = 0;

  // 方法：遍历所有文本节点，累积计算位置
  const textNodes: { node: Text; start: number; end: number }[] = [];
  let currentPos = 0;

  const collectTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      textNodes.push({
        node: node as Text,
        start: currentPos,
        end: currentPos + text.length,
      });
      currentPos += text.length;
    } else {
      node.childNodes.forEach((child) => collectTextNodes(child));
    }
  };

  collectTextNodes(charsContainer);

  // 找到选区起始位置
  for (const { node, start, end } of textNodes) {
    if (node === startContainer) {
      startOffset = start + range.startOffset;
    }
    if (node === endContainer) {
      endOffset = end - (node.length - range.endOffset);
    }
  }

  // 如果找不到精确位置，尝试在原始文本中搜索选中的文字
  if (startOffset === 0 && endOffset === 0) {
    const searchStart = lyricText.indexOf(selectedText);
    if (searchStart !== -1) {
      startOffset = searchStart;
      endOffset = searchStart + selectedText.length;
    }
  }

  if (startOffset >= endOffset) return null;

  return {
    start: startOffset,
    end: endOffset,
    text: selectedText,
  };
};

export const LyricsEditor = memo((props: ILyricsEditorProps) => {
  const { lyrics = [] } = props;
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const marks = currentSong?.marks || [];

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMark, setEditingMark] = useState<EditingMarkState | null>(null);
  // 保存原始标记数据用于取消时恢复
  const [originalMarkData, setOriginalMarkData] = useState<{
    type: MarkType;
    style: MarkStyle;
    content: MarkContent;
  } | null>(null);

  const [selectedMarkStyle, setSelectedMarkStyle] = useState<{
    type: MarkType;
    style: MarkStyle;
    content: MarkContent;
  }>({
    type: 'highlight',
    style: { color: '#1677ff', textColor: '#ffffff' },
    content: {},
  });

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
        const charsContainer = ref.querySelector('.lyric-chars');
        if (!charsContainer || !lyrics[index]) return;
        const info = getSelectionInLine(selection, charsContainer, lyrics[index].content);
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
          mark.lyricId === `${lyricIndex}` &&
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
        lyricId: `${lyricIndex}`,
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
        lyricId: mark.lyricId,
        startOffset: mark.startOffset,
        length: mark.length,
      });
      // 保存原始数据用于取消时恢复
      setOriginalMarkData({
        type: mark.type,
        style: mark.style,
        content: mark.content,
      });
      setSelectedMarkStyle({
        type: mark.type,
        style: mark.style,
        content: mark.content,
      });
    },
    [isEditMode],
  );

  // 保存标记（新建）
  const handleSaveMark = () => {
    if (!editingMark) return;

    const newMark = createLyricMark(
      editingMark.lyricId,
      editingMark.startOffset,
      editingMark.length,
      editingMark.selectedText,
      selectedMarkStyle.type,
      undefined, // tag
      selectedMarkStyle.style,
      selectedMarkStyle.content,
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

  // 即时更新标记（修改即保存）
  const handleUpdateMark = useCallback(() => {
    if (!editingMark || !editingMark.markId) return;

    dispatch(
      updateLyricMark({
        markId: editingMark.markId,
        mark: {
          type: selectedMarkStyle.type,
          style: selectedMarkStyle.style,
          content: selectedMarkStyle.content,
          updateTime: Date.now(),
        },
      }),
    );
  }, [dispatch, editingMark, selectedMarkStyle]);

  // 取消编辑并恢复原始数据
  const handleCancelEdit = () => {
    if (editingMark?.markId && originalMarkData) {
      // 恢复原始数据（如果需要可以调用 update，但这里只是放弃编辑）
      setSelectedMarkStyle(originalMarkData);
    }
    resetEditingState();
  };

  // 重置编辑状态
  const resetEditingState = () => {
    setEditingMark(null);
    setOriginalMarkData(null);
    setSelectedMarkStyle({
      type: 'highlight',
      style: { color: '#1677ff', textColor: '#ffffff' },
      content: {},
    });
  };

  // 即时保存标记变化（当用户修改标记样式时自动应用）
  useEffect(() => {
    if (editingMark?.markId && !editingMark.isEditing) {
      handleUpdateMark();
    }
  }, [selectedMarkStyle]);

  // 渲染歌词中的标记（按字/单词展示）
  const renderLyricWithChars = useCallback(
    (lyricContent: string, lyricIndex: number) => {
      const segments = splitLyricText(lyricContent);
      const lyricId = `${lyricIndex}`;
      const lyricMarks = marks.filter((m: ILyricMark) => m.lyricId === lyricId);

      if (lyricMarks.length === 0) {
        // 没有标记，直接渲染所有字符
        return segments.map((segment, charIndex) => (
          <span
            key={`${lyricIndex}-${charIndex}`}
            className={`lyric-char ${isEditMode ? 'editable' : ''}`}
          >
            {segment.text}
          </span>
        ));
      }

      // 有标记，需要分段渲染：标记文本 + 普通文本
      const elements: React.ReactNode[] = [];
      let currentPos = 0;

      // 按 startOffset 排序标记
      const sortedMarks = [...lyricMarks].sort((a, b) => a.startOffset - b.startOffset);

      sortedMarks.forEach((mark) => {
        // 渲染标记前的普通文本
        if (mark.startOffset > currentPos) {
          for (let i = currentPos; i < mark.startOffset; i++) {
            elements.push(
              <span
                key={`${lyricIndex}-text-${i}`}
                className={`lyric-char ${isEditMode ? 'editable' : ''}`}
              >
                {segments[i]?.text || ''}
              </span>,
            );
          }
        }

        // 渲染标记文本
        const markedText = lyricContent.substring(mark.startOffset, mark.startOffset + mark.length);
        const markStyle = getMarkStyle(mark.type, mark.style);
        const showContent = mark.content?.text || mark.content?.icon;
        const isCircleType = mark.type === 'circle';
        const isSymbolType = mark.type === 'symbol' && mark.content?.icon;

        // 圆形标记：每个字符独立圆形背景
        if (isCircleType) {
          for (let i = mark.startOffset; i < mark.startOffset + mark.length; i++) {
            const charText = segments[i]?.text || '';
            elements.push(
              <span
                key={`${lyricIndex}-mark-circle-${i}`}
                className={`lyric-char marked mark-type-circle ${isEditMode ? 'editable' : ''}`}
                style={markStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkClick(mark);
                }}
              >
                {charText}
              </span>,
            );
          }
        }
        // 符号标记：每个字符下方显示符号
        else if (isSymbolType) {
          for (let i = mark.startOffset; i < mark.startOffset + mark.length; i++) {
            const charText = segments[i]?.text || '';
            elements.push(
              <span
                key={`${lyricIndex}-mark-symbol-${i}`}
                className={`lyric-char marked mark-type-symbol ${isEditMode ? 'editable' : ''}`}
                style={markStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkClick(mark);
                }}
              >
                {charText}
                <span className="symbol-under">{mark.content!.icon}</span>
              </span>,
            );
          }
        }
        // 其他标记类型：整体渲染
        else {
          elements.push(
            <span
              key={`${lyricIndex}-mark-${mark.id}`}
              className={`lyric-char marked mark-type-${mark.type} ${isEditMode ? 'editable' : ''}`}
              style={markStyle}
              data-content={showContent || ''}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkClick(mark);
              }}
            >
              {showContent || markedText}
            </span>,
          );
        }

        currentPos = mark.startOffset + mark.length;
      });

      // 渲染剩余的普通文本
      for (let i = currentPos; i < segments.length; i++) {
        elements.push(
          <span
            key={`${lyricIndex}-text-${i}`}
            className={`lyric-char ${isEditMode ? 'editable' : ''}`}
          >
            {segments[i]?.text || ''}
          </span>,
        );
      }

      return elements;
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
                  onChange={(value: { type: MarkType; style: MarkStyle; content: MarkContent }) =>
                    setSelectedMarkStyle(value)
                  }
                />

                <Divider />

                <Space className="action-buttons">
                  {editingMark.markId ? (
                    <>
                      <div className="auto-save-hint">修改已自动保存</div>
                      <Button onClick={handleCancelEdit} block>
                        取消编辑
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
