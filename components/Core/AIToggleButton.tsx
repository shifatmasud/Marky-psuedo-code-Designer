/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface AIToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const AIToggleButton: React.FC<AIToggleButtonProps> = ({ onClick, isOpen }) => {
  const { theme } = useTheme();

  const styles: { [key: string]: React.CSSProperties } = {
    button: {
      position: 'absolute',
      top: theme.spacing['Space.L'],
      right: `calc(${theme.spacing['Space.L']} + 52px)`,
      width: '44px',
      height: '44px',
      borderRadius: theme.radius['Radius.Full'],
      backgroundColor: isOpen ? theme.Color.Signal.Surface[1] : theme.Color.Base.Surface['2'],
      border: 'none',
      cursor: 'grab',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isOpen ? theme.Color.Signal.Content[1] : theme.Color.Base.Content['2'],
      boxShadow: theme.effects['Effect.Shadow.Drop.1'],
      zIndex: 1001,
      touchAction: 'none',
    },
    icon: {
      fontSize: '24px',
      lineHeight: '0',
    }
  };

  return (
    <motion.button
      style={styles.button}
      onClick={onClick}
      aria-label="Toggle AI Assistant"
      whileHover={{ scale: 1.1, boxShadow: theme.effects['Effect.Shadow.Drop.2'] }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.1, cursor: 'grabbing', boxShadow: theme.effects['Effect.Shadow.Drop.3'] }}
      drag
      dragMomentum={false}
      transition={{ duration: 0.2 }}
    >
      <i className={isOpen ? "ph-fill ph-sparkle" : "ph-bold ph-sparkle"} style={styles.icon} />
    </motion.button>
  );
};

export default AIToggleButton;