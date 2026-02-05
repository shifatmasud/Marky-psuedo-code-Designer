/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import StateLayer from './StateLayer.tsx';

interface ActionButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'grid';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, onClick, variant = 'default' }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const getCoords = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    const { width, height } = getCoords(e);
    setDimensions({ width, height });
    setIsHovered(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = getCoords(e);
    setCoords({ x, y });
  };

  const handlePointerLeave = () => setIsHovered(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    const { x, y, width, height } = getCoords(e);
    setCoords({ x, y });
    setDimensions({ width, height });
  };

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.Color.Base.Content[2],
    cursor: 'pointer',
    fontFamily: theme.Type.Readable.Label.M.fontFamily,
    overflow: 'hidden',
    userSelect: 'none',
    touchAction: 'manipulation',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const variantStyles = {
    default: {
      padding: `${theme.spacing['Space.S']} ${theme.spacing['Space.M']}`,
      borderRadius: theme.radius['Radius.S'],
      fontSize: theme.Type.Readable.Label.S.fontSize,
      flexDirection: 'row' as 'row',
      gap: theme.spacing['Space.S'],
    },
    grid: {
      flexDirection: 'column' as 'column',
      gap: theme.spacing['Space.XS'],
      borderRadius: theme.radius['Radius.M'],
      width: '100%',
      aspectRatio: '1 / 1',
      fontSize: theme.Type.Readable.Label.S.fontSize,
      padding: theme.spacing['Space.S'],
    }
  };

  const iconStyle: React.CSSProperties = {
      fontSize: variant === 'grid' ? '24px' : '16px',
      lineHeight: 1,
  };

  return (
    <motion.button
      onClick={onClick}
      style={{...baseStyles, ...variantStyles[variant]}}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      whileTap={{ scale: 0.95 }}
    >
      {icon && <i className={`ph-bold ${icon}`} style={iconStyle} />}
      <span>{label}</span>
      <StateLayer 
        color={theme.Color.Base.Content[1]} 
        isActive={isHovered} 
        x={coords.x} y={coords.y} 
        width={dimensions.width} 
        height={dimensions.height} 
      />
    </motion.button>
  );
};

export default ActionButton;