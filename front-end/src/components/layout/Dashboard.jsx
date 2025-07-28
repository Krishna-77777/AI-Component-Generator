import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import CodeEditor from '../editor/CodeEditor';
import Preview from '../editor/Preview';
import PromptInput from '../editor/PromptInput'; // <-- ADD THIS LINE
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State to manage the height of the top (preview) pane
  const [topPaneHeight, setTopPaneHeight] = useState(50);
  
  const isResizing = useRef(false);
  const dashboardRef = useRef(null);

  const handleMouseDown = (e) => {
    isResizing.current = true;
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current || !dashboardRef.current) return;
    
    const containerRect = dashboardRef.current.getBoundingClientRect();
    let newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;

    if (newHeight < 10) newHeight = 10;
    if (newHeight > 90) newHeight = 90;
    
    setTopPaneHeight(newHeight);
  };
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);


  return (
    <div className={styles.dashboard}>
      <div className={isSidebarOpen ? styles.sidebar : styles.sidebarClosed}>
        <Sidebar />
      </div>

      <main className={styles.mainContent} ref={dashboardRef}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className={styles.toggleButton}
        >
          {isSidebarOpen ? '←' : '→'}
        </button>

        <div className={styles.editorContainer}>
          <div className={styles.previewPane} style={{ height: `${topPaneHeight}%` }}>
            <Preview />
          </div>

          <div className={styles.resizerY} onMouseDown={handleMouseDown}></div>

          <div className={styles.editorPane} style={{ height: `calc(100% - ${topPaneHeight}%)` }}>
            <CodeEditor />
          </div>
        </div>
        
        <div className={styles.promptSection}>
          <PromptInput />
        </div>
      </main>
    </div>
  );
}