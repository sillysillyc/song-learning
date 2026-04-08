import { memo, useState } from 'react';
import { ColorPicker, Radio, Select, Space, Card, type Color } from 'antd';
import type { BadgeColor, BadgeShape, BadgeSymbol } from '@/store';
import { PRESET_COLORS, PRESET_SHAPES, PRESET_SYMBOLS } from '@/utils/markUtils';

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

  const [selectedColor, setSelectedColor] = useState<BadgeColor>(
    value?.color || { type: 'preset', value: 'blue' },
  );
  const [selectedShape, setSelectedShape] = useState<BadgeShape>(value?.shape || 'default');
  const [selectedSymbol, setSelectedSymbol] = useState<BadgeSymbol>(
    value?.symbol || { type: 'none', value: '' },
  );

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

  return (
    <Card size="small" title="标记样式" style={{ marginTop: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 颜色选择 */}
        <div>
          <div style={{ marginBottom: 8 }}>颜色</div>
          <Space wrap>
            {PRESET_COLORS.map((c) => (
              <div
                key={c.value}
                onClick={() => handleColorChange({ type: 'preset', value: c.value })}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: selectedShape === 'circle' ? '50%' : selectedShape === 'square' ? 4 : 8,
                  backgroundColor: c.value,
                  cursor: 'pointer',
                  border: selectedColor.value === c.value ? '2px solid #000' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedColor.value === c.value && (
                  <span style={{ color: '#fff', fontSize: 16 }}>✓</span>
                )}
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
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: selectedShape === 'circle' ? '50%' : 4,
                  background: `linear-gradient(45deg, #ff0000, #00ff00, #0000ff)`,
                  cursor: 'pointer',
                  border: selectedColor.type === 'custom' ? '2px solid #000' : '2px solid #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedColor.type === 'custom' && <span style={{ color: '#fff', fontSize: 16 }}>✓</span>}
              </div>
            </ColorPicker>
          </Space>
        </div>

        {/* 形状选择 */}
        <div>
          <div style={{ marginBottom: 8 }}>形状</div>
          <Radio.Group value={selectedShape} onChange={(e) => handleShapeChange(e.target.value)}>
            <Radio.Button value="default">默认</Radio.Button>
            <Radio.Button value="square">方形</Radio.Button>
            <Radio.Button value="circle">圆形</Radio.Button>
          </Radio.Group>
        </div>

        {/* 符号选择 */}
        <div>
          <div style={{ marginBottom: 8 }}>符号</div>
          <Select
            value={selectedSymbol.type === 'none' ? 'none' : selectedSymbol.value}
            onChange={(val) => {
              if (val === 'none') {
                handleSymbolChange({ type: 'none', value: '' });
              } else {
                handleSymbolChange({ type: 'emoji', value: val });
              }
            }}
            style={{ width: '100%' }}
            options={PRESET_SYMBOLS.map((s) => ({
              label: `${s.label} ${s.value.type === 'emoji' ? s.value.value : ''}`,
              value: s.value.type === 'emoji' ? s.value.value : 'none',
            }))}
          />
        </div>
      </Space>
    </Card>
  );
});
