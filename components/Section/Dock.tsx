/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useTheme } from '../../Theme.tsx';
import ActionButton from '../Core/DockIcon.tsx';

interface ActionPanelProps {
    onInsert: (text: string) => void;
}

const TAGS = [
    { label: 'header', value: '<header></header>' },
    { label: 'nav', value: '<nav></nav>' },
    { label: 'main', value: '<main></main>' },
    { label: 'section', value: '<section></section>' },
    { label: 'article', value: '<article></article>' },
    { label: 'aside', value: '<aside></aside>' },
    { label: 'footer', value: '<footer></footer>' },
    { label: 'div', value: '<div></div>' },
    { label: 'p', value: '<p></p>' },
    { label: 'h1', value: '<h1></h1>' },
    { label: 'h2', value: '<h2></h2>' },
];

const ActionPanel: React.FC<ActionPanelProps> = ({ onInsert }) => {
    const { theme } = useTheme();

    const styles: { [key: string]: React.CSSProperties } = {
        panel: {
            width: '100%',
            backgroundColor: theme.Color.Base.Surface[2],
            borderTop: `1px solid ${theme.Color.Base.Surface[3]}`,
            display: 'flex',
            justifyContent: 'center',
            padding: `${theme.spacing['Space.S']} 0`,
            overflowX: 'auto',
            pointerEvents: 'auto', // Re-enable pointer events for this panel
        },
        container: {
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing['Space.S'],
            padding: `0 ${theme.spacing['Space.L']}`
        },
    };

    return (
        <div style={styles.panel}>
            <div style={styles.container}>
                {TAGS.map((item) => (
                    <ActionButton
                        key={item.label}
                        label={item.label}
                        onClick={() => onInsert(item.value)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActionPanel;