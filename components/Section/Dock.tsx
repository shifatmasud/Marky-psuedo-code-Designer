/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import ActionButton from '../Core/DockIcon.tsx';

interface ActionPanelProps {
    onInsert: (text: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const TAGS = [
    { label: 'header', value: 'header ', icon: 'ph-arrow-fat-lines-up' },
    { label: 'nav', value: 'nav ', icon: 'ph-compass' },
    { label: 'main', value: 'main ', icon: 'ph-layout' },
    { label: 'section', value: 'section ', icon: 'ph-squares-four' },
    { label: 'article', value: 'article ', icon: 'ph-article' },
    { label: 'aside', value: 'aside ', icon: 'ph-sidebar-simple' },
    { label: 'footer', value: 'footer ', icon: 'ph-arrow-fat-lines-down' },
    { label: 'div', value: 'div ', icon: 'ph-code' },
    { label: 'p', value: 'p ', icon: 'ph-paragraph' },
    { label: 'h1', value: 'h1 ', icon: 'ph-text-h-one' },
    { label: 'h2', value: 'h2 ', icon: 'ph-text-h-two' },
    { label: 'button', value: 'button ', icon: 'ph-cursor-click' },
];

const ActionPanel: React.FC<ActionPanelProps> = ({ onInsert, isOpen, onClose }) => {
    const { theme } = useTheme();

    const drawerVariants = {
        hidden: { y: '100%' },
        visible: { y: '0%' },
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const styles: { [key: string]: React.CSSProperties } = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 19,
        },
        panel: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            maxHeight: '60vh',
            backgroundColor: theme.Color.Base.Surface[2],
            borderTop: `1px solid ${theme.Color.Base.Surface[3]}`,
            borderTopLeftRadius: theme.radius['Radius.L'],
            borderTopRightRadius: theme.radius['Radius.L'],
            boxShadow: theme.effects['Effect.Shadow.Drop.3'],
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            pointerEvents: 'auto',
        },
        handle: {
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: theme.Color.Base.Content[3],
            margin: `${theme.spacing['Space.S']} auto`,
            flexShrink: 0,
        },
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: theme.spacing['Space.M'],
            padding: `${theme.spacing['Space.M']} ${theme.spacing['Space.L']} ${theme.spacing['Space.XL']}`,
            overflowY: 'auto',
        },
    };

    return (
        <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    style={styles.overlay}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
                <motion.div
                    style={styles.panel}
                    variants={drawerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                    <div style={styles.handle} />
                    <div style={styles.gridContainer}>
                        {TAGS.map((item) => (
                            <ActionButton
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                variant="grid"
                                onClick={() => onInsert(item.value)}
                            />
                        ))}
                    </div>
                </motion.div>
            </>
        )}
        </AnimatePresence>
    );
};

export default ActionPanel;