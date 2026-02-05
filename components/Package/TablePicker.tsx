
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface TablePickerProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (rows: number, cols: number) => void;
  onClose: () => void;
}

const MAX_SIZE = 8;

const TablePicker: React.FC<TablePickerProps> = ({ isOpen, position, onSelect, onClose }) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState({ r: 0, c: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'absolute',
      top: position.top,
      left: position.left,
      backgroundColor: theme.Color.Base.Surface[2],
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      borderRadius: theme.radius['Radius.M'],
      boxShadow: theme.effects['Effect.Shadow.Drop.3'],
      padding: theme.spacing['Space.M'],
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing['Space.M'],
      minWidth: '200px',
      touchAction: 'none', // Prevent scrolling while dragging on the picker
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${MAX_SIZE}, 1fr)`,
      gap: '6px',
      position: 'relative',
    },
    cell: {
      width: '20px',
      height: '20px',
      borderRadius: '3px',
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    label: {
      ...theme.Type.Readable.Label.S,
      color: theme.Color.Base.Content[1],
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '16px',
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (r > 0 && c > 0) {
      onSelect(r, c);
    }
  };

  const updateSelectionFromCoord = (clientX: number, clientY: number) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    
    // Relative position within the grid
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate dimensions of each cell + gap
    const cellWidth = rect.width / MAX_SIZE;
    const cellHeight = rect.height / MAX_SIZE;

    const c = Math.ceil(x / cellWidth);
    const r = Math.ceil(y / cellHeight);

    const clampedR = Math.min(Math.max(r, 0), MAX_SIZE);
    const clampedC = Math.min(Math.max(c, 0), MAX_SIZE);

    if (clampedR !== hovered.r || clampedC !== hovered.c) {
      setHovered({ r: clampedR, c: clampedC });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    updateSelectionFromCoord(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (hovered.r > 0 && hovered.c > 0) {
      handleCellClick(hovered.r, hovered.c);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              zIndex: 99,
              cursor: 'default'
            }} 
            onClick={onClose} 
          />
          <motion.div
            style={styles.container}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseLeave={() => setHovered({ r: 0, c: 0 })}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div style={styles.label}>
              {hovered.r > 0 ? (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${hovered.r}x${hovered.c}`}
                >
                  {hovered.r} rows × {hovered.c} cols
                </motion.span>
              ) : (
                'Pick Table Size'
              )}
            </div>
            
            <div 
              ref={gridRef}
              style={styles.grid}
            >
              {Array.from({ length: MAX_SIZE }).map((_, rIdx) => {
                const r = rIdx + 1;
                return Array.from({ length: MAX_SIZE }).map((_, cIdx) => {
                  const c = cIdx + 1;
                  const isInRange = r <= hovered.r && c <= hovered.c;
                  const isSpecificPoint = r === hovered.r && c === hovered.c;

                  return (
                    <motion.div
                      key={`${rIdx}-${cIdx}`}
                      style={{
                        ...styles.cell,
                        backgroundColor: isInRange 
                            ? theme.Color.Signal.Surface[1] 
                            : 'transparent',
                        borderColor: isInRange 
                            ? theme.Color.Signal.Content[1] 
                            : theme.Color.Base.Surface[3],
                        boxShadow: isSpecificPoint 
                            ? `0 0 8px ${theme.Color.Signal.Content[1]}44` 
                            : 'none',
                      }}
                      onMouseEnter={() => setHovered({ r, c })}
                      onClick={() => handleCellClick(r, c)}
                      animate={{
                        scale: isInRange ? 1.05 : 1,
                        opacity: isInRange ? 1 : 0.6,
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  );
                });
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TablePicker;
