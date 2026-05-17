import React from 'react';

/**
 * 简单的二维码显示组件（Mock 实现）
 * 根据 value 生成确定性伪随机 QR 码图案
 */
export const QRCodeDisplay: React.FC<{ value: string; size?: number }> = ({ value, size = 150 }) => {
  const cells = 19;
  const cellSize = Math.floor(size / cells);
  const actualSize = cellSize * cells;

  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = ((seed << 5) - seed) + value.charCodeAt(i);
    seed |= 0;
  }

  const getBit = (x: number, y: number): boolean => {
    const idx = (x * 7 + y * 13 + seed) % 100;
    const hash = (seed * (idx + 1) * 31) % 100;
    if ((x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7)) {
      const cx = x < 7 ? x : (x >= cells - 7 ? x - (cells - 7) : x);
      const cy = y < 7 ? y : (y >= cells - 7 ? y - (cells - 7) : y);
      if ((cx === 0 || cx === 6) && (cy >= 0 && cy <= 6)) return true;
      if ((cy === 0 || cy === 6) && (cx >= 0 && cx <= 6)) return true;
      if (cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4) return true;
      return false;
    }
    return hash > 45;
  };

  return (
    <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <svg width={actualSize} height={actualSize}>
        {Array.from({ length: cells }).map((_, y) =>
          Array.from({ length: cells }).map((_, x) =>
            getBit(x, y) ? (
              <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill="#000" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
