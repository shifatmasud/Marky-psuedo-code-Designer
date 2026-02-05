/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import ActionPanel from '../Section/Dock.tsx';
import SymbolTray from '../Section/SymbolTray.tsx';

const Welcome = () => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setContent(newText);

    // After state update, focus and set cursor position
    requestAnimationFrame(() => {
        textarea.focus();
        const cursorPosition = start + textToInsert.length;
        textarea.selectionStart = textarea.selectionEnd = cursorPosition;
    });
  };

  const fabIconVariants = {
    hidden: { rotate: -45, scale: 0.5, opacity: 0 },
    visible: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 45, scale: 0.5, opacity: 0 },
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
    fab: {
        position: 'fixed',
        bottom: theme.spacing['Space.L'],
        right: theme.spacing['Space.L'],
        width: '56px',
        height: '56px',
        borderRadius: theme.radius['Radius.Full'],
        backgroundColor: theme.Color.Accent.Surface[1],
        color: theme.Color.Accent.Content[1],
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: theme.effects['Effect.Shadow.Drop.2'],
        zIndex: 21,
        overflow: 'hidden',
        touchAction: 'manipulation'
    },
    fabIcon: {
        fontSize: '28px',
        lineHeight: 0,
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
      
      <SymbolTray onInsert={handleInsert} />

      <ActionPanel 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onInsert={handleInsert} 
      />

      <motion.button
        style={styles.fab}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        whileHover={{ scale: 1.1, boxShadow: theme.effects['Effect.Shadow.Drop.3'] }}
        whileTap={{ scale: 0.95 }}
        aria-label={isDrawerOpen ? 'Close actions' : 'Open actions'}
      >
          <AnimatePresence mode="wait" initial={false}>
              <motion.i
                  key={isDrawerOpen ? 'close' : 'add'}
                  className={`ph-bold ${isDrawerOpen ? 'ph-x' : 'ph-plus'}`}
                  style={styles.fabIcon}
                  variants={fabIconVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
              />
          </AnimatePresence>
      </motion.button>
    </main>
  );
};

export default Welcome;