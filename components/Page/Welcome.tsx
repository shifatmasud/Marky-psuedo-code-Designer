/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { useTheme } from '../../Theme.tsx';
import ActionPanel from '../Section/Dock.tsx';
import SymbolTray from '../Section/SymbolTray.tsx';

const NoteEditor = () => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let cursorPosition = start + textToInsert.length;
    const closingTagIndex = textToInsert.indexOf('</');
    if (closingTagIndex !== -1) {
        cursorPosition = start + closingTagIndex;
    }

    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setContent(newText);

    requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorPosition;
    });
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '8vh',
      paddingBottom: '160px', // Increased space for both panels
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
    bottomPanelContainer: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none', // Pass clicks through container
    }
  };

  return (
    <main style={styles.container}>
      <textarea
        ref={textareaRef}
        style={styles.editor}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        spellCheck="false"
        autoFocus
      />
      <div style={styles.bottomPanelContainer}>
        <SymbolTray onInsert={handleInsert} />
        <ActionPanel onInsert={handleInsert} />
      </div>
    </main>
  );
};

export default NoteEditor;