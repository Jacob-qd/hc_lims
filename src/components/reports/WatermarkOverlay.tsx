import React from 'react';

/** 报告水印 */
export const WatermarkOverlay: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none', overflow: 'hidden',
  }}>
    <div style={{
      fontSize: 48, fontWeight: 'bold', color: 'rgba(0,0,0,0.06)',
      transform: 'rotate(-30deg)', whiteSpace: 'nowrap',
      userSelect: 'none',
    }}>
      {text}
    </div>
  </div>
);
