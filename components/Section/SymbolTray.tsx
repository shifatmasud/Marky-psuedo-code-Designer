/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: theme.spacing['Space.S'],
            backgroundColor: theme.Color.Base.Surface[2],
            border: `1px solid ${theme.Color.Base.Surface[3]}`,
            borderRadius: theme.radius['Radius.M'],
            padding: theme.spacing['Space.S'],
            marginBottom: theme.spacing['Space.M'],
            boxShadow: theme.effects['Effect.Shadow.Drop.2'],
            pointerEvents: 'auto', // Enable pointer events for this tray
        }
    };

    return (
        <div style={styles.tray}>
            {SYMBOLS.map((item) => (
                <ActionButton
                    key={item.label}
                    label={item.label}
                    onClick={() => onInsert(item.value)}
                />
            ))}
        </div>
    );
};

export default SymbolTray;