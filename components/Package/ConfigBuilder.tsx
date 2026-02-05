
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import Button from '../Core/Button.tsx';
import CommandMenu from './CommandMenu.tsx';
import { getCaretCoordinates } from '../../utils/caretPosition.ts';

interface ConfigEntry {
  id: string;
  key: string;
  value: string;
  depth: number;
}

interface ConfigBuilderProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (configMarkdown: string) => void;
  onClose: () => void;
}

const KEY_COMMANDS = [
    { label: 'display', value: 'display', icon: 'ph-square' },
    { label: 'position', value: 'position', icon: 'ph-navigation-arrow' },
    { label: 'flex-direction', value: 'flex-direction', icon: 'ph-arrows-left-right' },
    { label: 'justify-content', value: 'justify-content', icon: 'ph-align-center-horizontal' },
    { label: 'align-items', value: 'align-items', icon: 'ph-align-center-vertical' },
    { label: 'margin', value: 'margin', icon: 'ph-arrows-out' },
    { label: 'padding', value: 'padding', icon: 'ph-arrows-in' },
    { label: 'color', value: 'color', icon: 'ph-palette' },
    { label: 'background', value: 'background', icon: 'ph-paint-bucket' },
    { label: 'font-size', value: 'font-size', icon: 'ph-text-h' },
    { label: 'line-height', value: 'line-height', icon: 'ph-text-line-spacing' },
    { label: 'font-weight', value: 'font-weight', icon: 'ph-text-bolder' },
    { label: 'text-align', value: 'text-align', icon: 'ph-text-align-center' },
    { label: 'border', value: 'border', icon: 'ph-rectangle' },
    { label: 'border-radius', value: 'border-radius', icon: 'ph-corners-out' },
    { label: 'box-shadow', value: 'box-shadow', icon: 'ph-stack' },
    { label: 'opacity', value: 'opacity', icon: 'ph-circle-half' },
    { label: 'width', value: 'width', icon: 'ph-arrows-left-right' },
    { label: 'height', value: 'height', icon: 'ph-arrows-down-up' },
    { label: 'gap', value: 'gap', icon: 'ph-squares-four' },
    { label: 'flex', value: 'flex', icon: 'ph-columns' },
    { label: 'grid', value: 'grid', icon: 'ph-grid-four' },
    { label: 'z-index', value: 'z-index', icon: 'ph-layers' },
    { label: 'overflow', value: 'overflow', icon: 'ph-intersect' },
    { label: 'cursor', value: 'cursor', icon: 'ph-hand-pointing' },
];

const GLOBAL_VALUES = [
    { label: 'inherit', value: 'inherit', icon: 'ph-arrow-bend-down-right' },
    { label: 'initial', value: 'initial', icon: 'ph-skip-back' },
    { label: 'unset', value: 'unset', icon: 'ph-x-circle' },
    { label: 'auto', value: 'auto', icon: 'ph-magic-wand' },
];

const PROPERTY_VALUE_MAP: Record<string, { label: string; value: string; icon: string }[]> = {
    'display': [
        { label: 'flex', value: 'flex', icon: 'ph-rows' },
        { label: 'block', value: 'block', icon: 'ph-square' },
        { label: 'inline-block', value: 'inline-block', icon: 'ph-rows' },
        { label: 'grid', value: 'grid', icon: 'ph-grid-four' },
        { label: 'none', value: 'none', icon: 'ph-prohibit' },
    ],
    'position': [
        { label: 'relative', value: 'relative', icon: 'ph-crosshair' },
        { label: 'absolute', value: 'absolute', icon: 'ph-navigation-arrow' },
        { label: 'fixed', value: 'fixed', icon: 'ph-push-pin' },
        { label: 'sticky', value: 'sticky', icon: 'ph-anchor' },
    ],
    'flex-direction': [
        { label: 'row', value: 'row', icon: 'ph-arrow-right' },
        { label: 'column', value: 'column', icon: 'ph-arrow-down' },
        { label: 'row-reverse', value: 'row-reverse', icon: 'ph-arrow-left' },
        { label: 'column-reverse', value: 'column-reverse', icon: 'ph-arrow-up' },
    ],
    'justify-content': [
        { label: 'center', value: 'center', icon: 'ph-text-align-center' },
        { label: 'flex-start', value: 'flex-start', icon: 'ph-text-align-left' },
        { label: 'flex-end', value: 'flex-end', icon: 'ph-text-align-right' },
        { label: 'space-between', value: 'space-between', icon: 'ph-arrows-left-right' },
        { label: 'space-around', value: 'space-around', icon: 'ph-columns' },
    ],
    'align-items': [
        { label: 'center', value: 'center', icon: 'ph-text-align-center' },
        { label: 'flex-start', value: 'flex-start', icon: 'ph-arrow-up' },
        { label: 'flex-end', value: 'flex-end', icon: 'ph-arrow-down' },
        { label: 'stretch', value: 'stretch', icon: 'ph-arrows-out' },
        { label: 'baseline', value: 'baseline', icon: 'ph-text-line-spacing' },
    ],
    'text-align': [
        { label: 'center', value: 'center', icon: 'ph-text-align-center' },
        { label: 'left', value: 'left', icon: 'ph-text-align-left' },
        { label: 'right', value: 'right', icon: 'ph-text-align-right' },
        { label: 'justify', value: 'justify', icon: 'ph-text-align-justify' },
    ],
    'font-weight': [
        { label: 'normal', value: 'normal', icon: 'ph-text-t' },
        { label: 'bold', value: 'bold', icon: 'ph-text-bolder' },
        { label: 'lighter', value: 'lighter', icon: 'ph-text-t' },
        { label: 'bolder', value: 'bolder', icon: 'ph-text-bolder' },
    ],
    'overflow': [
        { label: 'visible', value: 'visible', icon: 'ph-eye' },
        { label: 'hidden', value: 'hidden', icon: 'ph-eye-closed' },
        { label: 'scroll', value: 'scroll', icon: 'ph-arrows-down-up' },
        { label: 'auto', value: 'auto', icon: 'ph-magic-wand' },
    ],
    'cursor': [
        { label: 'pointer', value: 'pointer', icon: 'ph-hand-pointing' },
        { label: 'default', value: 'default', icon: 'ph-cursor' },
        { label: 'move', value: 'move', icon: 'ph-arrows-out-cardinal' },
        { label: 'not-allowed', value: 'not-allowed', icon: 'ph-prohibit' },
    ],
    'color': [
        { label: 'transparent', value: 'transparent', icon: 'ph-drop' },
        { label: 'currentColor', value: 'currentColor', icon: 'ph-palette' },
    ],
    'background': [
        { label: 'none', value: 'none', icon: 'ph-prohibit' },
        { label: 'transparent', value: 'transparent', icon: 'ph-drop' },
    ]
};

const ConfigBuilder: React.FC<ConfigBuilderProps> = ({ isOpen, position, onSelect, onClose }) => {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<ConfigEntry[]>([
    { id: '1', key: 'h1', value: '', depth: 0 },
    { id: '2', key: 'font-size', value: '16px', depth: 1 },
    { id: '3', key: 'color', value: '"#444"', depth: 1 },
  ]);

  // Command Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeField, setActiveField] = useState<'key' | 'value' | null>(null);
  const [command, setCommand] = useState('');
  const [commandStart, setCommandStart] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(KEY_COMMANDS);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setCommandStart(null);
    setCommand('');
    setActiveIdx(null);
    setActiveField(null);
  }, []);

  const generateConfig = () => {
    if (entries.length === 0) return '';
    let result = '---\n';
    entries.forEach(entry => {
      const indent = '    '.repeat(entry.depth);
      const val = entry.value ? `: ${entry.value}` : ':';
      result += `${indent}${entry.key}${val}\n`;
    });
    result += '---';
    return result;
  };

  const addEntry = (index: number | null) => {
    const newEntry: ConfigEntry = {
      id: Math.random().toString(36).substr(2, 9),
      key: 'property',
      value: '',
      depth: index !== null ? entries[index].depth : 0,
    };
    if (index === null) {
        setEntries([newEntry]);
        return;
    }
    const newEntries = [...entries];
    newEntries.splice(index + 1, 0, newEntry);
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, updates: Partial<ConfigEntry>) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], ...updates };
    setEntries(newEntries);
  };

  const handleInputChange = (idx: number, field: 'key' | 'value', e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    updateEntry(idx, { [field]: text });

    let currentCommandStart = null;
    for (let i = cursorPosition - 1; i >= 0; i--) {
        const char = text[i];
        if (char === ' ' || char === '\n') break;
        if (char === '/') {
            currentCommandStart = i;
            break;
        }
    }

    if (currentCommandStart !== null) {
        const currentCommand = text.substring(currentCommandStart + 1, cursorPosition);
        setCommand(currentCommand);
        setCommandStart(currentCommandStart);
        setActiveIdx(idx);
        setActiveField(field);
        setMenuOpen(true);
        setSelectedIndex(0);

        const coords = getCaretCoordinates(e.target, currentCommandStart);
        if (coords) {
            setMenuPosition({ top: coords.top + coords.height, left: coords.left });
        }
    } else {
        closeMenu();
    }
  };

  const handleCommandSelect = (value: string) => {
    if (activeIdx === null || commandStart === null || activeField === null) return;
    
    const current = entries[activeIdx];
    const text = current[activeField];
    const cleanedText = text.substring(0, commandStart) + value + text.substring(commandStart + command.length + 1);
    
    const updates: Partial<ConfigEntry> = { [activeField]: cleanedText };
    if (activeField === 'key' && current.depth === 0) {
      updates.depth = 1;
    }
    
    updateEntry(activeIdx, updates);
    closeMenu();
  };

  const indent = (index: number, dir: 1 | -1) => {
    const newEntries = [...entries];
    const newDepth = Math.max(0, newEntries[index].depth + dir);
    if (dir === 1 && index > 0 && newDepth > newEntries[index - 1].depth + 1) return;
    newEntries[index].depth = newDepth;
    setEntries(newEntries);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!menuOpen) return;
    switch (e.key) {
        case 'ArrowUp': e.preventDefault(); setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1)); break;
        case 'ArrowDown': e.preventDefault(); setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0)); break;
        case 'Enter':
        case 'Tab':
            e.preventDefault();
            if (filteredCommands[selectedIndex]) handleCommandSelect(filteredCommands[selectedIndex].value);
            break;
        case 'Escape': e.preventDefault(); closeMenu(); break;
    }
  };

  useEffect(() => {
    if (menuOpen) {
      let commands = KEY_COMMANDS;
      if (activeField === 'value' && activeIdx !== null) {
          const key = entries[activeIdx].key.trim().toLowerCase();
          const propertyValues = PROPERTY_VALUE_MAP[key] || [];
          commands = [...propertyValues, ...GLOBAL_VALUES];
      }
      setFilteredCommands(commands.filter(c => c.label.toLowerCase().startsWith(command.toLowerCase())));
    }
  }, [command, menuOpen, activeField, activeIdx, entries]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'absolute',
      top: position.top,
      left: position.left,
      width: '380px',
      maxHeight: '480px',
      backgroundColor: theme.Color.Base.Surface[2],
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      borderRadius: theme.radius['Radius.L'],
      boxShadow: theme.effects['Effect.Shadow.Drop.3'],
      padding: theme.spacing['Space.M'],
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing['Space.M'],
      overflow: 'visible',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: theme.spacing['Space.S'],
        borderBottom: `1px solid ${theme.Color.Base.Surface[3]}`,
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing['Space.XS'],
      overflowY: 'auto',
      paddingRight: '4px',
      minHeight: '100px',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing['Space.XS'],
    },
    input: {
      background: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${theme.Color.Base.Surface[3]}`,
      color: theme.Color.Base.Content[1],
      fontFamily: theme.Type.Expressive.Data.fontFamily,
      fontSize: '12px',
      padding: '4px',
      outline: 'none',
    },
    controlBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: theme.Color.Base.Content[2],
        padding: '2px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing['Space.M'],
        color: theme.Color.Base.Content[3],
        padding: theme.spacing['Space.L'],
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => { closeMenu(); onClose(); }} />
          <motion.div
            style={styles.container}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
          >
            <div style={styles.header}>
              <span style={{ ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[1], fontWeight: 700 }}>CONFIG BUILDER</span>
              <Button 
                label="Insert" 
                size="S" 
                disabled={entries.length === 0}
                onClick={() => onSelect(generateConfig())} 
              />
            </div>

            <div style={styles.list}>
              {entries.length > 0 ? (
                entries.map((entry, idx) => (
                    <div key={entry.id} style={{ ...styles.row, paddingLeft: `${entry.depth * 20}px` }}>
                       <button style={styles.controlBtn} onClick={() => indent(idx, -1)} title="Outdent"><i className="ph-bold ph-caret-left" /></button>
                       <button style={styles.controlBtn} onClick={() => indent(idx, 1)} title="Indent"><i className="ph-bold ph-caret-right" /></button>
                       
                       <input
                        style={{ ...styles.input, width: '100px' }}
                        value={entry.key}
                        onChange={(e) => handleInputChange(idx, 'key', e)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        placeholder="Key"
                        autoFocus={idx === entries.length - 1 && entry.key === 'property'}
                       />
                       <span style={{ color: theme.Color.Base.Content[3] }}>:</span>
                       <input
                        style={{ ...styles.input, flex: 1 }}
                        value={entry.value}
                        onChange={(e) => handleInputChange(idx, 'value', e)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        placeholder="Value"
                       />
    
                       <button style={styles.controlBtn} onClick={() => addEntry(idx)} title="Add Property"><i className="ph-bold ph-plus" /></button>
                       <button style={{ ...styles.controlBtn, color: theme.Color.Error.Content[1] }} onClick={() => removeEntry(idx)} title="Delete"><i className="ph-bold ph-trash" /></button>
                    </div>
                  ))
              ) : (
                <div style={styles.emptyState}>
                    <p style={{ ...theme.Type.Readable.Label.M, margin: 0 }}>No properties defined</p>
                    <Button label="Add Property" size="S" variant="outline" icon="ph-plus" onClick={() => addEntry(null)} />
                </div>
              )}
            </div>

            <CommandMenu 
                isOpen={menuOpen && filteredCommands.length > 0}
                position={menuPosition}
                items={filteredCommands}
                onSelect={handleCommandSelect}
                selectedIndex={selectedIndex}
            />

            <div style={{ ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[3], fontSize: '10px', textAlign: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                Use / in Key or Value to browse properties and common values.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfigBuilder;
