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
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick }) => {
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

  const styles: React.CSSProperties = {
    position: 'relative',
    padding: `${theme.spacing['Space.S']} ${theme.spacing['Space.M']}`,
    borderRadius: theme.radius['Radius.S'],
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.Color.Base.Content[2],
    cursor: 'pointer',
    fontFamily: theme.Type.Readable.Label.M.fontFamily,
    fontSize: theme.Type.Readable.Label.S.fontSize,
    overflow: 'hidden',
    userSelect: 'none',
    touchAction: 'manipulation'
  };

  return (
    <motion.button
      onClick={onClick}
      style={styles}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      whileTap={{ scale: 0.95 }}
    >
      {label}
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