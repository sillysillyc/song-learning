import { memo, useState } from 'react';
import { ColorPicker, Radio, Select, Space, Card, Input, Tabs } from 'antd';
import type { BadgeColor, BadgeShape, BadgeSymbol } from '@/store';
import { PRESET_COLORS, PRESET_SYMBOLS } from '@/utils/markUtils';
import type { Color } from 'antd/es/color-picker';
import './index.less';

export interface IBadgePickerProps {
  value?: {
    color: BadgeColor;
    shape: BadgeShape;
    symbol: BadgeSymbol;
  };
  onChange?: (value: { color: BadgeColor; shape: BadgeShape; symbol: BadgeSymbol }) => void;
}

export const BadgePicker = memo((props: IBadgePickerProps) => {
  const { value, onChange } = props;

  const [selectedColor, setSelectedColor] = useState<BadgeColor>(value?.color || { type: 'preset', value: 'blue' });
  const [selectedShape, setSelectedShape] = useState<BadgeShape>(value?.shape || 'default');
  const [selectedSymbol, setSelectedSymbol] = useState<BadgeSymbol>(value?.symbol || { type: 'none', value: '' });
  const [customText, setCustomText] = useState('');

  const getShapeClass = () => {
    if (selectedShape === 'circle') return 'circle';
    if (selectedShape === 'square') return 'square';
    return '';
  };

  const handleColorChange = (newColor: BadgeColor) => {
    setSelectedColor(newColor);
    onChange?.({ color: newColor, shape: selectedShape, symbol: selectedSymbol });
  };

  const handleShapeChange = (newShape: BadgeShape) => {
    setSelectedShape(newShape);
    onChange?.({ color: selectedColor, shape: newShape, symbol: selectedSymbol });
  };

  const handleSymbolChange = (newSymbol: BadgeSymbol) => {
    setSelectedSymbol(newSymbol);
    onChange?.({ color: selectedColor, shape: selectedShape, symbol: newSymbol });
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    if (text.trim()) {
      handleSymbolChange({ type: 'text', value: text.trim() });
    } else {
      handleSymbolChange({ type: 'none', value: '' });
    }
  };

  return (
    <Card size="small" title="标记样式" className="badge-picker">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 颜色选择 */}
        <div className="color-section">
          <div className="section-title">颜色</div>
          <div className="color-options">
            {PRESET_COLORS.map((c) => (
              <div
                key={c.value}
                className={`color-option ${getShapeClass()} ${selectedColor.value === c.value ? 'selected' : ''}`}
                onClick={() => handleColorChange({ type: 'preset', value: c.value })}
                style={{ backgroundColor: c.value }}
              >
                {selectedColor.value === c.value && <span className="check-mark">✓</span>}
              </div>
            ))}
            <ColorPicker
              value={selectedColor.type === 'custom' ? selectedColor.value : '#1677ff'}
              onChange={(color: Color) => {
                handleColorChange({ type: 'custom', value: color.toHexString() });
              }}
              showText
            >
              <div
                className={`color-option custom-color-picker ${getShapeClass()} ${selectedColor.type === 'custom' ? 'selected' : ''}`}
              >
                {selectedColor.type === 'custom' && <span className="check-mark">✓</span>}
              </div>
            </ColorPicker>
          </div>
        </div>

        {/* 形状选择 */}
        <div className="shape-section">
          <div className="section-title">形状</div>
          <Radio.Group value={selectedShape} onChange={(e) => handleShapeChange(e.target.value as BadgeShape)}>
            <Radio.Button value="default">默认</Radio.Button>
            <Radio.Button value="square">方形</Radio.Button>
            <Radio.Button value="circle">圆形</Radio.Button>
            <Radio.Button value="underline">下划线</Radio.Button>
          </Radio.Group>
        </div>

        {/* 符号选择 - 使用 Tabs 切换预设和自定义 */}
        <div className="symbol-section">
          <div className="section-title">符号</div>
          <Tabs
            size="small"
            tabBarStyle={{ marginBottom: 12 }}
            items={[
              {
                key: 'preset',
                label: '预设符号',
                children: (
                  <Select
                    className="symbol-select"
                    value={selectedSymbol.type === 'none' ? 'none' : selectedSymbol.value}
                    onChange={(val) => {
                      if (val === 'none') {
                        handleSymbolChange({ type: 'none', value: '' });
                      } else {
                        handleSymbolChange({ type: 'emoji', value: val });
                      }
                    }}
                    options={PRESET_SYMBOLS.map((s) => ({
                      label: `${s.label} ${s.value.type === 'emoji' ? s.value.value : ''}`,
                      value: s.value.type === 'emoji' ? s.value.value : 'none',
                    }))}
                  />
                ),
              },
              {
                key: 'custom',
                label: '自定义文本',
                children: (
                  <Input
                    value={customText}
                    onChange={(e) => handleCustomTextChange(e.target.value)}
                    placeholder="输入自定义符号文本"
                    maxLength={10}
                    showCount
                  />
                ),
              },
            ]}
          />
        </div>
      </Space>
    </Card>
  );
});
