import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';

export default function Preview() {
  // Select the active project directly to get a stable reference
  const activeProject = useStore((state) => state.activeProject);
  // Get the code from the project, with a fallback for when no project is active
  const generatedCode = activeProject?.generatedCode || { jsx: '', css: '' };

  const [iframeContent, setIframeContent] = useState('');

  useEffect(() => {
    const getIframeHtml = () => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Component Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { 
              margin: 0; 
              padding: 20px;
              font-family: sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
            }
            ${generatedCode.css}
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              ${generatedCode.jsx}
              
              // This assumes the main component is named 'Component'
              const App = () => {
                return typeof Component !== 'undefined' ? <Component /> : <div>Component not found. Name it 'Component'.</div>;
              };

              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            } catch (err) {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                <div style={{ color: 'red', fontFamily: 'monospace', padding: '1rem' }}>
                  <h3>Error Rendering Component:</h3>
                  <pre>{err.message}</pre>
                </div>
              );
            }
          </script>
        </body>
        </html>
      `;
    };
    setIframeContent(getIframeHtml());
    // Depend on the actual code strings, not the object, to prevent loops
  }, [generatedCode.jsx, generatedCode.css]);

  return (
    <iframe
      srcDoc={iframeContent}
      title="Component Preview"
      sandbox="allow-scripts"
      width="100%"
      height="100%"
      style={{ backgroundColor: 'white', border: 'none' }}
    />
  );
}