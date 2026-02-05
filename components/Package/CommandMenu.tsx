/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface Command {
  label: string;
  value: string;
  icon: string;
}

interface CommandMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  items: Command[];
  onSelect: (value: string) => void;
  selectedIndex: number;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, position, items, onSelect, selectedIndex }) => {
  const { theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
        const selectedElement = scrollRef.current.children[selectedIndex] as HTMLElement;
        if (selectedElement) {
            selectedElement.scrollIntoView({
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }
  }, [isOpen, selectedIndex]);

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  const styles: { [key: string]: React.CSSProperties } = {
    menu: {
      position: 'absolute',
      top: position.top,
      left: position.left,
      width: '240px',
      maxHeight: '300px',
      backgroundColor: theme.Color.Base.Surface[2],
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      borderRadius: theme.radius['Radius.M'],
      boxShadow: theme.effects['Effect.Shadow.Drop.3'],
      zIndex: 30,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    list: {
        padding: theme.spacing['Space.S'],
        overflowY: 'auto',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing['Space.M'],
        padding: `${theme.spacing['Space.S']} ${theme.spacing['Space.M']}`,
        borderRadius: theme.radius['Radius.S'],
        cursor: 'pointer',
        color: theme.Color.Base.Content[1],
        fontFamily: theme.Type.Readable.Label.M.fontFamily,
    },
    itemIcon: {
        fontSize: '20px',
        color: theme.Color.Base.Content[2],
    },
    selectedItem: {
        backgroundColor: theme.Color.Accent.Surface[1],
        color: theme.Color.Accent.Content[1],
    },
    selectedItemIcon: {
        color: theme.Color.Accent.Content[1],
    },
    emptyState: {
        padding: theme.spacing['Space.M'],
        color: theme.Color.Base.Content[3],
        textAlign: 'center',
        ...theme.Type.Readable.Label.M
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={styles.menu}
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div ref={scrollRef} style={styles.list}>
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.label}
                  style={{
                    ...styles.item,
                    ...(isSelected ? styles.selectedItem : {}),
                  }}
                  onClick={() => onSelect(item.value)}
                  onMouseMove={() => { /* Consider setting selectedIndex on hover */ }}
                >
                  <i 
                    className={`ph-bold ${item.icon}`} 
                    style={{...styles.itemIcon, ...(isSelected ? styles.selectedItemIcon: {})}}
                  />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandMenu;