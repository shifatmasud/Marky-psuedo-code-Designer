/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import ActionButton from '../Core/DockIcon.tsx';

interface SymbolTrayProps {
    onInsert: (text: string) => void;
}

const SYMBOLS = [
    { label: '│', value: '│  ' },
    { label: '├─', value: '├─ ' },
    { label: '└─', value: '└─ ' },
];


const SymbolTray: React.FC<SymbolTrayProps> = ({ onInsert }) => {
    const { theme } = useTheme();

    const styles: { [key: string]: React.CSSProperties } = {
        tray: {
            position: 'fixed',
            bottom: `calc(${theme.spacing['Space.L']} + 56px + ${theme.spacing['Space.M']})`, // Position above FAB
            left: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: theme.spacing['Space.S'],
            backgroundColor: theme.Color.Base.Surface[2],
            border: `1px solid ${theme.Color.Base.Surface[3]}`,
            borderRadius: theme.radius['Radius.M'],
            padding: theme.spacing['Space.S'],
            boxShadow: theme.effects['Effect.Shadow.Drop.2'],
            pointerEvents: 'auto',
            zIndex: 10,
            cursor: 'grab',
            touchAction: 'none',
        }
    };

    return (
        <motion.div
            style={styles.tray}
            drag
            dragMomentum={false}
            initial={{ x: '-50%', y: 0 }}
            whileDrag={{ cursor: 'grabbing', scale: 1.05, boxShadow: theme.effects['Effect.Shadow.Drop.3'] }}
        >
            {SYMBOLS.map((item) => (
                <ActionButton
                    key={item.label}
                    label={item.label}
                    onClick={() => onInsert(item.value)}
                />
            ))}
        </motion.div>
    );
};

export default SymbolTray;