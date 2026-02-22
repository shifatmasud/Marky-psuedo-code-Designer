
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

interface TreeNode {
  id: string;
  label: string;
  depth: number;
}

interface TreeBuilderProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onSelect: (treeMarkdown: string) => void;
  onClose: () => void;
}

const LABEL_COMMANDS = [
    { label: 'header', value: 'Header', icon: 'ph-arrow-fat-lines-up' },
    { label: 'nav', value: 'Nav', icon: 'ph-compass' },
    { label: 'main', value: 'Main', icon: 'ph-layout' },
    { label: 'section', value: 'Section', icon: 'ph-squares-four' },
    { label: 'article', value: 'Article', icon: 'ph-article' },
    { label: 'aside', value: 'Aside', icon: 'ph-sidebar-simple' },
    { label: 'footer', value: 'Footer', icon: 'ph-arrow-fat-lines-down' },
    { label: 'figure', value: 'Figure', icon: 'ph-image' },
    { label: 'figcaption', value: 'Figcaption', icon: 'ph-text-align-left' },
    { label: 'div', value: 'Div', icon: 'ph-code' },
    { label: 'p', value: 'Paragraph', icon: 'ph-paragraph' },
    { label: 'h1', value: 'H1', icon: 'ph-text-h-one' },
    { label: 'h2', value: 'H2', icon: 'ph-text-h-two' },
    { label: 'button', value: 'Button', icon: 'ph-cursor-click' },
];

const TreeBuilder: React.FC<TreeBuilderProps> = ({ isOpen, position, onSelect, onClose }) => {
  const { theme } = useTheme();
  const [nodes, setNodes] = useState<TreeNode[]>([
    { id: '1', label: 'Root', depth: 0 },
    { id: '2', label: 'Branch', depth: 1 },
    { id: '3', label: 'Leaf', depth: 2 },
  ]);

  // Command Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [command, setCommand] = useState('');
  const [commandStart, setCommandStart] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(LABEL_COMMANDS);

  const closeLabelMenu = useCallback(() => {
    setMenuOpen(false);
    setCommandStart(null);
    setCommand('');
    setActiveIdx(null);
  }, []);

  const generateTree = () => {
    if (nodes.length === 0) return '';
    let result = '';
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.depth === 0 && i === 0) {
        result += node.label + '\n';
        if (nodes.length > 1 && nodes[1].depth > 0) {
          result += '|\n';
        }
        continue;
      }

      let prefix = '';
      for (let d = 0; d < node.depth - 1; d++) {
        let hasMoreSiblingsAtD = false;
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[j].depth === d + 1) {
            hasMoreSiblingsAtD = true;
            break;
          }
          if (nodes[j].depth < d + 1) break;
        }
        prefix += hasMoreSiblingsAtD ? (d === 0 ? '|   ' : '│   ') : '    ';
      }

      let isLastSibling = true;
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[j].depth === node.depth) {
          isLastSibling = false;
          break;
        }
        if (nodes[j].depth < node.depth) break;
      }

      const connector = isLastSibling ? '└── ' : (node.depth === 1 ? '|── ' : '├── ');
      result += prefix + connector + node.label + '\n';
    }
    return result;
  };

  const addNode = (index: number | null) => {
    const newNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Node',
      depth: index !== null ? nodes[index].depth : 0,
    };
    if (index === null) {
        setNodes([newNode]);
        return;
    }
    const newNodes = [...nodes];
    newNodes.splice(index + 1, 0, newNode);
    setNodes(newNodes);
  };

  const removeNode = (index: number) => {
    const newNodes = nodes.filter((_, i) => i !== index);
    setNodes(newNodes);
  };

  const updateLabel = (index: number, label: string) => {
    const newNodes = [...nodes];
    newNodes[index].label = label;
    setNodes(newNodes);
  };

  const handleLabelChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    updateLabel(idx, text);

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
        setMenuOpen(true);
        setSelectedIndex(0);

        const coords = getCaretCoordinates(e.target, currentCommandStart);
        if (coords) {
            setMenuPosition({ top: coords.top + coords.height, left: coords.left });
        }
    } else {
        closeLabelMenu();
    }
  };

  const handleCommandSelect = (value: string) => {
    if (activeIdx === null || commandStart === null) return;
    
    const currentNode = nodes[activeIdx];
    const text = currentNode.label;
    const newLabel = text.substring(0, commandStart) + value + text.substring(commandStart + command.length + 1);
    updateLabel(activeIdx, newLabel);
    closeLabelMenu();
  };

  const indent = (index: number, dir: 1 | -1) => {
    const newNodes = [...nodes];
    const newDepth = Math.max(0, newNodes[index].depth + dir);
    if (dir === 1 && index > 0 && newDepth > newNodes[index - 1].depth + 1) return;
    newNodes[index].depth = newDepth;
    setNodes(newNodes);
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!menuOpen) return;

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
            break;
        case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
            break;
        case 'Enter':
        case 'Tab':
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                handleCommandSelect(filteredCommands[selectedIndex].value);
            }
            break;
        case 'Escape':
            e.preventDefault();
            closeLabelMenu();
            break;
        default:
            break;
    }
  };

  useEffect(() => {
    if (menuOpen) {
      setFilteredCommands(
        LABEL_COMMANDS.filter(c => c.label.toLowerCase().startsWith(command.toLowerCase()))
      );
    }
  }, [command, menuOpen]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: 'absolute',
      top: position.top,
      left: position.left,
      width: '320px',
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
    nodeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing['Space.XS'],
    },
    input: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${theme.Color.Base.Surface[3]}`,
      color: theme.Color.Base.Content[1],
      fontFamily: theme.Type.Readable.Body.M.fontFamily,
      fontSize: '13px',
      padding: '4px',
      outline: 'none',
    },
    controlBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: theme.Color.Base.Content[2],
        padding: '2px',
        fontSize: '16px',
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
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} 
            onClick={() => { closeLabelMenu(); onClose(); }} 
          />
          <motion.div
            style={styles.container}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
          >
            <div style={styles.header}>
              <span style={{ ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[1], fontWeight: 700 }}>TREE BUILDER</span>
              <Button 
                label="Insert" 
                size="S" 
                disabled={nodes.length === 0}
                onClick={() => onSelect(generateTree())} 
              />
            </div>

            <div style={styles.list}>
              {nodes.length > 0 ? (
                nodes.map((node, idx) => (
                    <div key={node.id} style={{ ...styles.nodeRow, paddingLeft: `${node.depth * 16}px` }}>
                      <button 
                        style={styles.controlBtn} 
                        onClick={() => indent(idx, -1)}
                        title="Outdent"
                      >
                        <i className="ph-bold ph-caret-left" />
                      </button>
                      <button 
                        style={styles.controlBtn} 
                        onClick={() => indent(idx, 1)}
                        title="Indent"
                      >
                        <i className="ph-bold ph-caret-right" />
                      </button>
                      <input
                        style={styles.input}
                        value={node.label}
                        onChange={(e) => handleLabelChange(idx, e)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onBlur={() => {
                            setTimeout(() => { if (!menuOpen) setActiveIdx(null); }, 200);
                        }}
                        placeholder="Node label..."
                        autoFocus={idx === nodes.length - 1 && node.label === 'New Node'}
                      />
                      <button 
                        style={styles.controlBtn} 
                        onClick={() => addNode(idx)}
                        title="Add Sibling"
                      >
                        <i className="ph-bold ph-plus" />
                      </button>
                      <button 
                        style={{ ...styles.controlBtn, color: theme.Color.Error.Content[1] }} 
                        onClick={() => removeNode(idx)}
                        title="Delete"
                      >
                        <i className="ph-bold ph-trash" />
                      </button>
                    </div>
                  ))
              ) : (
                <div style={styles.emptyState}>
                    <p style={{ ...theme.Type.Readable.Label.M, margin: 0 }}>No nodes defined</p>
                    <Button label="Add Node" size="S" variant="outline" icon="ph-plus" onClick={() => addNode(null)} />
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
                Use / to quickly label nodes (Header, Main, etc.)
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TreeBuilder;
