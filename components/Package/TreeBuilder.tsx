
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import Button from '../Core/Button.tsx';

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

const TreeBuilder: React.FC<TreeBuilderProps> = ({ isOpen, position, onSelect, onClose }) => {
  const { theme } = useTheme();
  const [nodes, setNodes] = useState<TreeNode[]>([
    { id: '1', label: 'Root', depth: 0 },
    { id: '2', label: 'Branch', depth: 1 },
    { id: '3', label: 'Leaf', depth: 2 },
  ]);

  const generateTree = () => {
    let result = '';
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.depth === 0 && i === 0) {
        result += node.label + '\n';
        continue;
      }

      let prefix = '';
      for (let d = 0; d < node.depth - 1; d++) {
        // Check if there are more siblings at depth d later in the list
        let hasMoreSiblingsAtD = false;
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[j].depth === d) {
            hasMoreSiblingsAtD = true;
            break;
          }
          if (nodes[j].depth < d) break;
        }
        prefix += hasMoreSiblingsAtD ? '│   ' : '    ';
      }

      // Check if current node is the last sibling at its own depth
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
    return result;
  };

  const addNode = (index: number) => {
    const newNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Node',
      depth: nodes[index].depth,
    };
    const newNodes = [...nodes];
    newNodes.splice(index + 1, 0, newNode);
    setNodes(newNodes);
  };

  const removeNode = (index: number) => {
    if (nodes.length <= 1) return;
    const newNodes = nodes.filter((_, i) => i !== index);
    setNodes(newNodes);
  };

  const updateLabel = (index: number, label: string) => {
    const newNodes = [...nodes];
    newNodes[index].label = label;
    setNodes(newNodes);
  };

  const indent = (index: number, dir: 1 | -1) => {
    const newNodes = [...nodes];
    const newDepth = Math.max(0, newNodes[index].depth + dir);
    
    // Constraint: Can't be more than 1 deeper than the previous node
    if (dir === 1 && index > 0 && newDepth > newNodes[index - 1].depth + 1) return;
    
    newNodes[index].depth = newDepth;
    setNodes(newNodes);
  };

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
      overflow: 'hidden',
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
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} 
            onClick={onClose} 
          />
          <motion.div
            style={styles.container}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
          >
            <div style={styles.header}>
              <span style={{ ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[1], fontWeight: 700 }}>TREE BUILDER</span>
              <Button label="Insert" size="S" onClick={() => onSelect(generateTree())} />
            </div>

            <div style={styles.list}>
              {nodes.map((node, idx) => (
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
                    onChange={(e) => updateLabel(idx, e.target.value)}
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
              ))}
            </div>
            
            <div style={{ ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[3], fontSize: '10px', textAlign: 'center' }}>
                TAB to indent in the editor after insertion.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TreeBuilder;
