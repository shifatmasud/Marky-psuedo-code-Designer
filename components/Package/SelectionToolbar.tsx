/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface SelectionToolbarProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onFormat: (format: 'bold' | 'italic' | 'underline') => void;
}

const ToolbarButton = ({ icon, onClick, label }: { icon: string; onClick: () => void; label: string; }) => {
    const { theme } = useTheme();
    const styles = {
        button: {
            background: 'transparent',
            border: 'none',
            color: theme.Color.Base.Content[2],
            cursor: 'pointer',
            padding: theme.spacing['Space.S'],
            borderRadius: theme.radius['Radius.S'],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        icon: {
            fontSize: '20px',
        }
    };

    return (
        <motion.button
            style={styles.button}
            onClick={onClick}
            aria-label={label}
            whileHover={{ backgroundColor: theme.Color.Base.Surface[3], color: theme.Color.Base.Content[1] }}
            whileTap={{ scale: 0.9 }}
        >
            <i className={`ph-bold ${icon}`} style={styles.icon} />
        </motion.button>
    );
};

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({ isOpen, position, onFormat }) => {
    const { theme } = useTheme();

    const toolbarVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 },
    };

    const styles: { [key: string]: React.CSSProperties } = {
        toolbar: {
            position: 'absolute',
            top: position.top,
            left: position.left,
            display: 'flex',
            gap: theme.spacing['Space.XS'],
            backgroundColor: theme.Color.Base.Surface[2],
            padding: theme.spacing['Space.XS'],
            borderRadius: theme.radius['Radius.M'],
            border: `1px solid ${theme.Color.Base.Surface[3]}`,
            boxShadow: theme.effects['Effect.Shadow.Drop.3'],
            zIndex: 40,
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    style={styles.toolbar}
                    variants={toolbarVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                    <ToolbarButton icon="ph-text-b" onClick={() => onFormat('bold')} label="Bold" />
                    <ToolbarButton icon="ph-text-italic" onClick={() => onFormat('italic')} label="Italic" />
                    <ToolbarButton icon="ph-text-underline" onClick={() => onFormat('underline')} label="Underline" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SelectionToolbar;