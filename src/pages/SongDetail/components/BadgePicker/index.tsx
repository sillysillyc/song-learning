import { memo, useState } from 'react';
import { ColorPicker, Radio, Select, Space, Card, Input } from 'antd';
import type { MarkType, MarkStyle, MarkContent } from '@/store';
import { PRESET_COLORS, PRESET_ICONS, MARK_TYPES, DEFAULT_MARK_STYLES } from '@/utils/markUtils';
import type { Color } from 'antd/es/color-picker';
import './index.less';

export interface IBadgePickerProps {
  value?: {
    type: MarkType;
    style: MarkStyle;
    content: MarkContent;
  };
  onChange?: (value: { type: MarkType; style: MarkStyle; content: MarkContent }) => void;
}

export const BadgePicker = memo((props: IBadgePickerProps) => {
  const { value, onChange } = props;

  const currentType = value?.type || 'highlight';
  const currentColor = value?.style?.color || DEFAULT_MARK_STYLES[currentType].color;
  const [selectedType, setSelectedType] = useState<MarkType>(currentType);
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [customText, setCustomText] = useState(value?.content?.text || '');
  const [selectedIcon, setSelectedIcon] = useState(value?.content?.icon || '');

  const handleTypeChange = (type: MarkType) => {
    setSelectedType(type);
    const baseStyle = DEFAULT_MARK_STYLES[type];
    onChange?.({
      type,
      style: { ...baseStyle, color: selectedColor },
      content: { ...value?.content },
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onChange?.({
      type: selectedType,
      style: { ...value?.style, color },
      content: { ...value?.content },
    });
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    onChange?.({
      type: 'text',
      style: value?.style || DEFAULT_MARK_STYLES.text,
      content: { ...(value?.content || {}), text: text.trim() },
    });
  };

  const handleIconChange = (icon: string) => {
    setSelectedIcon(icon);
    onChange?.({
      type: 'symbol',
      style: value?.style || DEFAULT_MARK_STYLES.symbol,
      content: { ...(value?.content || {}), icon },
    });
  };

  return (
    <Card size="small" title="标记样式" className="badge-picker">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 标记类型选择 */}
        <div className="type-section">
          <div className="section-title">标记类型</div>
          <Radio.Group
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value as MarkType)}
            buttonStyle="solid"
          >
            {MARK_TYPES.map((t) => (
              <Radio.Button key={t.value} value={t.value} title={t.description}>
                {t.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        {/* 颜色选择 */}
        <div className="color-section">
          <div className="section-title">颜色</div>
          <div className="color-options">
            {PRESET_COLORS.map((c) => (
              <div
                key={c.value}
                className={`color-option ${selectedColor === c.value ? 'selected' : ''}`}
                onClick={() => handleColorChange(c.value)}
                style={{ backgroundColor: c.value }}
              >
                {selectedColor === c.value && <span className="check-mark">✓</span>}
              </div>
            ))}
            <ColorPicker
              value={selectedColor}
              onChange={(color: Color) => {
                handleColorChange(color.toHexString());
              }}
              showText
            >
              <div className={`color-option custom-color-picker ${selectedColor.startsWith('#') && !PRESET_COLORS.some(c => c.value === selectedColor) ? 'selected' : ''}`}>
                自定义
              </div>
            </ColorPicker>
          </div>
        </div>

        {/* 符号/文本选择 - 根据类型显示 */}
        {selectedType === 'symbol' && (
          <div className="symbol-section">
            <div className="section-title">图标</div>
            <Select
              className="symbol-select"
              value={selectedIcon || 'none'}
              onChange={(val) => handleIconChange(val === 'none' ? '' : val)}
              options={[
                { label: '无', value: 'none' },
                ...PRESET_ICONS.filter(i => i.value).map((i) => ({
                  label: `${i.label} ${i.value}`,
                  value: i.value,
                })),
              ]}
            />
          </div>
        )}

        {selectedType === 'text' && (
          <div className="text-section">
            <div className="section-title">自定义文本</div>
            <Input
              value={customText}
              onChange={(e) => handleCustomTextChange(e.target.value)}
              placeholder="输入自定义标记文本"
              maxLength={10}
              showCount
            />
          </div>
        )}

        {/* 备注 */}
        <div className="note-section">
          <div className="section-title">备注</div>
          <Input.TextArea
            value={value?.content?.note || ''}
            onChange={(e) => {
              onChange?.({
                type: selectedType,
                style: value?.style || DEFAULT_MARK_STYLES[selectedType],
                content: { ...(value?.content || {}), note: e.target.value },
              });
            }}
            placeholder="可选：添加备注说明"
            rows={2}
          />
        </div>
      </Space>
    </Card>
  );
});
