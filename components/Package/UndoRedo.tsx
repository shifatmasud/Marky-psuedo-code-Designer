/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../Core/Button.tsx';
import { useTheme } from '../../Theme.tsx';

interface UndoRedoProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedo: React.FC<UndoRedoProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const { theme } = useTheme();

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'fixed',
      bottom: theme.spacing['Space.L'],
      left: theme.spacing['Space.L'],
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing['Space.XS'],
      backgroundColor: `${theme.Color.Base.Surface[2]}ee`,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      borderRadius: theme.radius['Radius.Full'],
      padding: theme.spacing['Space.XS'],
      boxShadow: theme.effects['Effect.Shadow.Drop.2'],
      zIndex: 1000,
      cursor: 'grab',
      touchAction: 'none',
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: theme.Color.Base.Surface[3],
        margin: `0 ${theme.spacing['Space.XS']}`,
    },
    dragHandle: {
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${theme.spacing['Space.S']}`,
        color: theme.Color.Base.Content[3],
        fontSize: '14px',
    }
  };

  return (
    <motion.div
      style={styles.container}
      drag
      dragMomentum={false}
      whileDrag={{ cursor: 'grabbing', scale: 1.05, boxShadow: theme.effects['Effect.Shadow.Drop.3'] }}
      initial={{ x: 0, y: 0 }}
    >
      <div style={styles.dragHandle}>
        <i className="ph-bold ph-dots-six-vertical" />
      </div>
      <Button
        label=""
        icon="ph-arrow-u-up-left"
        size="S"
        variant="ghost"
        disabled={!canUndo}
        onClick={onUndo}
      />
      <div style={styles.divider} />
      <Button
        label=""
        icon="ph-arrow-u-up-right"
        size="S"
        variant="ghost"
        disabled={!canRedo}
        onClick={onRedo}
      />
    </motion.div>
  );
};

export default UndoRedo;