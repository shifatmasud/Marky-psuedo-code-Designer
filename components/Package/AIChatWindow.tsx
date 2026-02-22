/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { useTheme } from '../../Theme.tsx';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  editorContent: string;
  onUpdateContent: (newText: string) => void;
  onInsertAtCaret: (text: string) => void;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({ 
  isOpen, 
  onClose, 
  editorContent, 
  onUpdateContent, 
  onInsertAtCaret 
}) => {
  const { theme } = useTheme();
  
  // Persist API Key in localStorage
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('geminiApiKey') || '';
    } catch (e) {
      console.error("Could not access localStorage", e);
      return '';
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const hasKey = !!(localStorage.getItem('geminiApiKey') || '');
    return [{
      role: 'system',
      text: hasKey
        ? 'I am your writing assistant. How can I help you today?'
        : 'I am your writing assistant. Please provide your Gemini API Key below to begin.'
    }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Save API key to localStorage whenever it changes
  useEffect(() => {
    try {
      const wasKeyMissing = !(localStorage.getItem('geminiApiKey') || '');
      localStorage.setItem('geminiApiKey', apiKey);
      if (apiKey && wasKeyMissing) {
        setMessages([{ role: 'system', text: 'API Key saved. How can I help you today?' }]);
      }
    } catch (e) {
      console.error("Could not access localStorage", e);
    }
  }, [apiKey]);


  const handleSend = async () => {
    if (!apiKey.trim()) {
      setMessages(prev => [...prev, { role: 'system', text: 'Please provide a valid Gemini API key to use the assistant.' }]);
      return;
    }
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const tools = [{
        functionDeclarations: [
          {
            name: 'get_editor_content',
            description: 'Returns the current text content of the editor.',
            parameters: { type: Type.OBJECT, properties: {} }
          },
          {
            name: 'update_editor_content',
            description: 'Completely replaces the editor content with new text.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING, description: 'The new markdown text content.' }
              },
              required: ['content']
            }
          },
          {
            name: 'insert_text_at_cursor',
            description: 'Inserts text at the current cursor position in the editor.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: 'The text to insert.' }
              },
              required: ['text']
            }
          },
          {
            name: 'generate_table',
            description: 'Generates a markdown table and inserts it at the cursor.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                rows: { type: Type.NUMBER, description: 'Number of data rows.' },
                cols: { type: Type.NUMBER, description: 'Number of columns.' }
              },
              required: ['rows', 'cols']
            }
          },
          {
            name: 'generate_tree',
            description: 'Generates a visual tree structure and inserts it at the cursor.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      depth: { type: Type.NUMBER }
                    },
                    required: ['label', 'depth']
                  }
                }
              },
              required: ['nodes']
            }
          },
          {
            name: 'generate_config',
            description: 'Generates a YAML-style config block and inserts it at the cursor.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                entries: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      value: { type: Type.STRING },
                      depth: { type: Type.NUMBER }
                    },
                    required: ['key', 'value', 'depth']
                  }
                }
              },
              required: ['entries']
            }
          }
        ]
      }];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `CONTEXT: The user is writing a note. The current content of the editor is: \n\n${editorContent}\n\nUSER REQUEST: ${userMessage}` }] }
        ],
        config: {
          systemInstruction: 'You are a helpful writing assistant for the Marky text editor. You have tools to read and write to the editor. When asked to change text, use the appropriate tool. Always keep your responses concise and helpful.',
          tools: tools
        }
      });

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          let toolResult = "Done";
          if (call.name === 'get_editor_content') {
            toolResult = editorContent;
          } else if (call.name === 'update_editor_content') {
            onUpdateContent(call.args.content as string);
            toolResult = "Content updated successfully.";
          } else if (call.name === 'insert_text_at_cursor') {
            onInsertAtCaret(call.args.text as string);
            toolResult = "Text inserted successfully.";
          } else if (call.name === 'generate_table') {
            const rows = call.args.rows as number;
            const cols = call.args.cols as number;
            let table = '\n';
            table += '| ' + Array(cols).fill('Header').join(' | ') + ' |\n';
            table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
            for (let i = 0; i < rows; i++) {
                table += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
            }
            onInsertAtCaret(table + '\n');
            toolResult = "Table generated and inserted.";
          } else if (call.name === 'generate_tree') {
            const nodes = call.args.nodes as { label: string, depth: number }[];
            let result = '';
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.depth === 0 && i === 0) {
                result += node.label + '\n';
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
              const connector = isLastSibling ? '└── ' : '├── ';
              result += prefix + connector + node.label + '\n';
            }
            onInsertAtCaret('\n' + result + '\n');
            toolResult = "Tree generated and inserted.";
          } else if (call.name === 'generate_config') {
            const entries = call.args.entries as { key: string, value: string, depth: number }[];
            let result = '---\n';
            entries.forEach(entry => {
              const indent = '    '.repeat(entry.depth);
              const val = entry.value ? `: ${entry.value}` : ':';
              result += `${indent}${entry.key}${val}\n`;
            });
            result += '---';
            onInsertAtCaret('\n' + result + '\n');
            toolResult = "Config generated and inserted.";
          }

          // Follow up after tool call to give a textual response
          const followUp = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
              { role: 'user', parts: [{ text: userMessage }] },
              { role: 'model', parts: [{ functionCall: call }] },
              { role: 'user', parts: [{ functionResponse: { name: call.name, response: { result: toolResult } } }] }
            ],
            config: { tools }
          });
          setMessages(prev => [...prev, { role: 'model', text: followUp.text || 'Process completed.' }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || 'I processed your request.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', text: 'Sorry, I encountered an error. Please check your connection or API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    window: {
      position: 'absolute',
      top: '100px',
      right: theme.spacing['Space.L'],
      width: '360px',
      height: '500px',
      backgroundColor: `${theme.Color.Base.Surface[1]}f2`,
      backdropFilter: 'blur(20px)',
      borderRadius: theme.radius['Radius.L'],
      boxShadow: theme.effects['Effect.Shadow.Drop.3'],
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      zIndex: 1002,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    header: {
      padding: theme.spacing['Space.M'],
      borderBottom: `1px solid ${theme.Color.Base.Surface[3]}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'grab',
    },
    chatArea: {
      flex: 1,
      overflowY: 'auto',
      padding: theme.spacing['Space.M'],
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing['Space.S'],
    },
    message: {
      padding: theme.spacing['Space.S'],
      borderRadius: theme.radius['Radius.M'],
      maxWidth: '85%',
      fontSize: '13px',
      lineHeight: '1.5',
      fontFamily: theme.Type.Readable.Body.M.fontFamily,
      wordBreak: 'break-word',
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: theme.Color.Accent.Surface[1],
      color: theme.Color.Accent.Content[1],
    },
    modelMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme.Color.Base.Surface[2],
      color: theme.Color.Base.Content[1],
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
    },
    systemMessage: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
      color: theme.Color.Base.Content[3],
      fontSize: '11px',
      fontStyle: 'italic',
      textAlign: 'center',
    },
    inputArea: {
      padding: theme.spacing['Space.M'],
      borderTop: `1px solid ${theme.Color.Base.Surface[3]}`,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing['Space.M'],
    },
    messageInputWrapper: {
      display: 'flex',
      gap: theme.spacing['Space.S'],
    },
    input: {
      flex: 1,
      backgroundColor: theme.Color.Base.Surface[2],
      border: `1px solid ${theme.Color.Base.Surface[3]}`,
      borderRadius: theme.radius['Radius.M'],
      padding: `8px 12px`,
      color: theme.Color.Base.Content[1],
      fontSize: '13px',
      outline: 'none',
    },
    sendBtn: {
      backgroundColor: theme.Color.Accent.Surface[1],
      color: theme.Color.Accent.Content[1],
      border: 'none',
      borderRadius: theme.radius['Radius.M'],
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: 0,
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={styles.window}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: 20 }}
          drag
          dragMomentum={false}
        >
          <div style={styles.header}>
            <span style={{ ...theme.Type.Readable.Label.S, fontWeight: 700, letterSpacing: '0.05em' }}>AI ASSISTANT</span>
            <motion.button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.Color.Base.Content[3] }}
              whileHover={{ color: theme.Color.Error.Content[1] }}
            >
              <i className="ph-bold ph-x" />
            </motion.button>
          </div>

          <div style={styles.chatArea} ref={scrollRef}>
            {messages.map((m, i) => (
              <div 
                key={i} 
                style={{ 
                  ...styles.message, 
                  ...(m.role === 'user' ? styles.userMessage : m.role === 'model' ? styles.modelMessage : styles.systemMessage) 
                }}
              >
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div style={{ ...styles.message, ...styles.modelMessage, opacity: 0.6 }}>
                Thinking...
              </div>
            )}
          </div>

          <div style={styles.inputArea}>
            <input
                type="password"
                style={styles.input}
                placeholder="Enter your Gemini API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
            />
            <div style={styles.messageInputWrapper}>
              <input 
                style={styles.input} 
                placeholder="Ask me anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading || !apiKey.trim()}
              />
              <motion.button 
                style={{...styles.sendBtn, opacity: (!apiKey.trim() || isLoading) ? 0.5 : 1}} 
                onClick={handleSend}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading || !apiKey.trim()}
              >
                <i className="ph-bold ph-paper-plane-right" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChatWindow;