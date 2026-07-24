import React from 'react';

interface AlertProps {
  type: 'success' | 'error';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type, children }) => {
  const isSuccess = type === 'success';
  const color = isSuccess ? '#4ade80' : '#f87171';
  const bg = isSuccess ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)';
  const icon = isSuccess ? '✓' : '⚠';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        background: bg,
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '0.6rem',
        padding: '0.65rem 1rem',
        marginBottom: '1.25rem',
        color: '#fff',
        fontSize: '0.9rem',
      }}
    >
      <span style={{ color, fontWeight: 700 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
};