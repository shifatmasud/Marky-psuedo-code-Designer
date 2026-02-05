/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../Theme.tsx';
import CommandMenu from '../Package/CommandMenu.tsx';
import SelectionToolbar from '../Package/SelectionToolbar.tsx';
import { getCaretCoordinates } from '../../utils/caretPosition.ts';

const COMMANDS = [
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

  // Command Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [command, setCommand] = useState('');
  const [commandStart, setCommandStart] = useState<number | null>(null);
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Selection Toolbar State
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const selectionRef = useRef({ start: 0, end: 0 });

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setCommandStart(null);
    setCommand('');
  }, []);

  const handleInsert = (value: string) => {
    const textarea = textareaRef.current;
    if (!textarea || commandStart === null) return;

    const start = commandStart;
    const end = textarea.selectionStart;
    const currentContent = textarea.value;
    
    const newText = currentContent.substring(0, start) + value + currentContent.substring(end);
    setContent(newText);
    closeMenu();

    requestAnimationFrame(() => {
        textarea.focus();
        const cursorPosition = start + value.length;
        textarea.selectionStart = textarea.selectionEnd = cursorPosition;
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setContent(text);

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
        setToolbarOpen(false); // Ensure toolbar is closed when typing a command
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
          closeMenu(); // Close command menu when making a selection
          selectionRef.current = { start: selectionStart, end: selectionEnd };
          const startCoords = getCaretCoordinates(textarea, selectionStart);
          
          if (startCoords) {
              // Position toolbar above the start of the selection
              const top = startCoords.top - 50; // Offset above the text line
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
    setContent(newContent);
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
    if (toolbarOpen && (e.key === 'Escape')) {
        setToolbarOpen(false);
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
      <SelectionToolbar 
        isOpen={toolbarOpen}
        position={toolbarPosition}
        onFormat={handleFormat}
      />
    </main>
  );
};

export default Welcome;