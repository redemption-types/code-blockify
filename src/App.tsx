import React, { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const sample = `function hello(name) {
  console.log('Hello, ' + name + '!');
}
hello('Vincent');`;

const App: React.FC = () => {
  const [input, setInput] = useState(sample);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    if (!input.trim()) {
      setDetectedLang(null);
      return '';
    }
    const res = hljs.highlightAuto(input);
    setDetectedLang(res.language || null);
    return res.value;
  }, [input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setCopied(false);
  }, [input]);

  return (
    <div className="app-root">
      <header className="app-header">
        <span className="brand">tohtml-terminal</span>
        <span className="hint">paste → auto‑detect → highlight</span>
      </header>

      <div className="panes">
        {/* LEFT: INPUT */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="terminal-title">input.js</span>
          </div>
          <div className="terminal-body">
            <textarea
              className="terminal-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="// paste your code here"
            />
          </div>
        </div>

        {/* RIGHT: OUTPUT */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="terminal-title-row">
              <span className="terminal-title">
                {detectedLang ? `output (${detectedLang})` : 'output'}
              </span>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? 'copied' : 'copy input'}
              </button>
            </div>
          </div>
          <div className="terminal-body output-body">
            {input.trim() ? (
              <pre className="code-pre">
                <code
                  className="hljs"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
            ) : (
              <div className="placeholder">// waiting for input…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
