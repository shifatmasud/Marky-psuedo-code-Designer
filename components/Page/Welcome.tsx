/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../Theme.tsx';
import CommandMenu from '../Package/CommandMenu.tsx';
import SelectionToolbar from '../Package/SelectionToolbar.tsx';
import TablePicker from '../Package/TablePicker.tsx';
import TreeBuilder from '../Package/TreeBuilder.tsx';
import ConfigBuilder from '../Package/ConfigBuilder.tsx';
import UndoRedo from '../Package/UndoRedo.tsx';
import AIChatWindow from '../Package/AIChatWindow.tsx';
import AIToggleButton from '../Core/AIToggleButton.tsx';
import { getCaretCoordinates } from '../../utils/caretPosition.ts';

const COMMANDS = [
    { label: 'Table', value: 'TABLE_CMD', icon: 'ph-table' },
    { label: 'Tree', value: 'TREE_CMD', icon: 'ph-tree-structure' },
    { label: 'Config', value: 'CONFIG_CMD', icon: 'ph-gear-six' },
    { label: 'Corner', value: '└─ ', icon: 'ph-arrow-elbow-down-right' },
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

const Welcome = () => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);

  // Command Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [command, setCommand] = useState('');
  const [commandStart, setCommandStart] = useState<number | null>(null);
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // AI State
  const [aiOpen, setAiOpen] = useState(false);

  // Builders State
  const [isPickingTable, setIsPickingTable] = useState(false);
  const [isBuildingTree, setIsBuildingTree] = useState(false);
  const [isBuildingConfig, setIsBuildingConfig] = useState(false);

  // Selection Toolbar State
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const selectionRef = useRef({ start: 0, end: 0 });

  const updateContent = useCallback((newText: string, saveToHistory: boolean = true) => {
    if (saveToHistory) {
      setHistory(prev => [...prev, content].slice(-50)); // Keep last 50 states
      setFuture([]);
    }
    setContent(newText);
  }, [content]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [content, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    setContent(previous);
  }, [history, content]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, content]);
    setFuture(prev => prev.slice(1));
    setContent(next);
  }, [future, content]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setCommandStart(null);
    setCommand('');
  }, []);

  const handleInsert = (value: string) => {
    if (value === 'TABLE_CMD') {
      setIsPickingTable(true);
      setMenuOpen(false);
      return;
    }
    if (value === 'TREE_CMD') {
        setIsBuildingTree(true);
        setMenuOpen(false);
        return;
    }
    if (value === 'CONFIG_CMD') {
        setIsBuildingConfig(true);
        setMenuOpen(false);
        return;
    }

    const textarea = textareaRef.current;
    if (!textarea || commandStart === null) return;

    const start = commandStart;
    const end = textarea.selectionStart;
    const currentContent = textarea.value;
    
    const newText = currentContent.substring(0, start) + value + currentContent.substring(end);
    updateContent(newText);
    closeMenu();

    requestAnimationFrame(() => {
        textarea.focus();
        const cursorPosition = start + value.length;
        textarea.selectionStart = textarea.selectionEnd = cursorPosition;
    });
  };

  const generateMarkdownTable = (rows: number, cols: number) => {
    let table = '\n';
    table += '| ' + Array(cols).fill('Header').join(' | ') + ' |\n';
    table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    for (let i = 0; i < rows; i++) {
        table += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
    }
    return table + '\n';
  };

  const handleTableSelect = (rows: number, cols: number) => {
    const tableMarkdown = generateMarkdownTable(rows, cols);
    insertAtCaret(tableMarkdown);
    setIsPickingTable(false);
  };

  const handleTreeSelect = (treeMarkdown: string) => {
    insertAtCaret('\n' + treeMarkdown + '\n');
    setIsBuildingTree(false);
  };

  const handleConfigSelect = (configMarkdown: string) => {
    insertAtCaret('\n' + configMarkdown + '\n');
    setIsBuildingConfig(false);
  };

  const insertAtCaret = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = textarea.value;
    
    const newText = currentContent.substring(0, start) + text + currentContent.substring(end);
    updateContent(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = start + text.length;
      textarea.selectionStart = textarea.selectionEnd = cursorPosition;
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    updateContent(text);

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
        setToolbarOpen(false); 
        setIsPickingTable(false);
        setIsBuildingTree(false);
        setIsBuildingConfig(false);
        const currentCommand = text.substring(currentCommandStart + 1, cursorPosition);
        setCommand(currentCommand);
        setCommandStart(currentCommandStart);
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

  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    requestAnimationFrame(() => {
      const { selectionStart, selectionEnd } = textarea;
  
      if (selectionStart !== selectionEnd) {
          closeMenu();
          setIsPickingTable(false);
          setIsBuildingTree(false);
          setIsBuildingConfig(false);
          selectionRef.current = { start: selectionStart, end: selectionEnd };
          const startCoords = getCaretCoordinates(textarea, selectionStart);
          
          if (startCoords) {
              const top = startCoords.top - 50; 
              const left = startCoords.left;
              setToolbarPosition({ top, left });
              setToolbarOpen(true);
          }
      } else {
          setToolbarOpen(false);
      }
    });
  };

  const handleFormat = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = selectionRef.current;
    if (start === end) return;

    const selectedText = content.substring(start, end);
    const wrappers = {
        bold: '**',
        italic: '*',
        underline: '__'
    };
    const wrapper = wrappers[format];
    const formattedText = `${wrapper}${selectedText}${wrapper}`;

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    updateContent(newContent);
    setToolbarOpen(false);

    requestAnimationFrame(() => {
        textarea.focus();
        const newCursorPos = start + formattedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  useEffect(() => {
    if (menuOpen) {
      setFilteredCommands(
        COMMANDS.filter(c => c.label.toLowerCase().startsWith(command.toLowerCase()))
      );
    }
  }, [command, menuOpen]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (toolbarOpen && (e.key === 'Escape')) { setToolbarOpen(false); return; }
    if (isPickingTable && (e.key === 'Escape')) { setIsPickingTable(false); return; }
    if (isBuildingTree && (e.key === 'Escape')) { setIsBuildingTree(false); return; }
    if (isBuildingConfig && (e.key === 'Escape')) { setIsBuildingConfig(false); return; }
    
    // Global Undo/Redo Shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
    }

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
                handleInsert(filteredCommands[selectedIndex].value);
            }
            break;
        case 'Escape':
            e.preventDefault();
            closeMenu();
            break;
        default:
            break;
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '8vh',
      paddingBottom: '8vh',
      boxSizing: 'border-box',
    },
    editor: {
      flex: 1,
      width: '100%',
      maxWidth: '800px',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      color: theme.Color.Base.Content[1],
      fontFamily: theme.Type.Expressive.Data.fontFamily,
      fontSize: theme.Type.Readable.Body.L.fontSize,
      lineHeight: '1.7',
      padding: `${theme.spacing['Space.M']} ${theme.spacing['Space.L']}`,
      resize: 'none',
      caretColor: theme.Color.Signal.Content[1],
    },
  };

  return (
    <main style={styles.container}>
      <AIToggleButton onClick={() => setAiOpen(!aiOpen)} isOpen={aiOpen} />
      
      <textarea
        ref={textareaRef}
        style={styles.editor}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={() => { if (menuOpen) closeMenu(); }}
        onSelect={handleSelect}
        placeholder="Start writing... type '/' for commands"
        spellCheck="false"
        autoFocus
      />
      <CommandMenu 
        isOpen={menuOpen && filteredCommands.length > 0}
        position={menuPosition}
        items={filteredCommands}
        onSelect={handleInsert}
        selectedIndex={selectedIndex}
      />
      <TablePicker 
        isOpen={isPickingTable}
        position={menuPosition}
        onSelect={handleTableSelect}
        onClose={() => setIsPickingTable(false)}
      />
      <TreeBuilder 
        isOpen={isBuildingTree}
        position={menuPosition}
        onSelect={handleTreeSelect}
        onClose={() => setIsBuildingTree(false)}
      />
      <ConfigBuilder 
        isOpen={isBuildingConfig}
        position={menuPosition}
        onSelect={handleConfigSelect}
        onClose={() => setIsBuildingConfig(false)}
      />
      <SelectionToolbar 
        isOpen={toolbarOpen}
        position={toolbarPosition}
        onFormat={handleFormat}
      />
      <AIChatWindow 
        isOpen={aiOpen} 
        onClose={() => setAiOpen(false)}
        editorContent={content}
        onUpdateContent={updateContent}
        onInsertAtCaret={insertAtCaret}
      />
      <UndoRedo 
        onUndo={handleUndo} 
        onRedo={handleRedo} 
        canUndo={history.length > 0} 
        canRedo={future.length > 0} 
      />
    </main>
  );
};

export default Welcome;