import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import styles from './CodeEditor.module.css';

export default function CodeEditor() {
  const generatedCode = useStore((state) => state.activeProject?.generatedCode) || { jsx: '', css: '' };
 const [activeTab, setActiveTab] = useState('jsx');

  const handleCopy = () => {
    const codeToCopy = activeTab === 'jsx' ? generatedCode.jsx : generatedCode.css;
    navigator.clipboard.writeText(codeToCopy).then(() => {
      alert(`${activeTab.toUpperCase()} code copied to clipboard!`);
    });
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    zip.file('Component.jsx', generatedCode.jsx);
    zip.file('styles.css', generatedCode.css);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'component.zip');
  };

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.header}>
        <div>
          <button
            onClick={() => setActiveTab('jsx')}
            className={`${styles.tab} ${activeTab === 'jsx' ? styles.activeTab : ''}`}
          >
            JSX
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`${styles.tab} ${activeTab === 'css' ? styles.activeTab : ''}`}
          >
            CSS
          </button>
        </div>
        <div className={styles.actions}>
          <button onClick={handleCopy} className={styles.button}>Copy</button>
          <button onClick={handleDownload} className={`${styles.button} ${styles.downloadButton}`}>Download .zip</button>
        </div>
      </div>
      <div className={styles.codeDisplay}>
        <SyntaxHighlighter language={activeTab === 'jsx' ? 'jsx' : 'css'} style={atomDark} showLineNumbers>
          {activeTab === 'jsx' ? generatedCode.jsx : generatedCode.css}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}