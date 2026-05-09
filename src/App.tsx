import React, { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { generateOutlookHTML, generateRTF } from './htmlConverter';

const sample = `function hello(name) {
  console.log('Hello, ' + name + '!');
}
hello('Vincent');`;

const App: React.FC = () => {
  const [input, setInput] = useState(sample);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedRtf, setCopiedRtf] = useState(false);

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

  const handleCopyHtml = async () => {
    try {
      const htmlOutput = generateOutlookHTML(highlighted, detectedLang);
      const rtfOutput = generateRTF(highlighted, detectedLang);
      const plainText = input;

      // Create blobs for each format
      const htmlBlob = new Blob([htmlOutput], { type: 'text/html' });
      const rtfBlob = new Blob([rtfOutput], { type: 'text/rtf' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });

      // Create ClipboardItem with all three formats
      const data = [
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/rtf': rtfBlob,
          'text/plain': textBlob,
        }),
      ];

      await navigator.clipboard.write(data);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyRtf = async () => {
    try {
      const rtfOutput = generateRTF(highlighted, detectedLang);
      
      // Create a blob with RTF MIME type
      const blob = new Blob([rtfOutput], { type: 'text/rtf' });
      const data = [new ClipboardItem({ 'text/rtf': blob })];
      
      await navigator.clipboard.write(data);
      setCopiedRtf(true);
      setTimeout(() => setCopiedRtf(false), 1200);
    } catch (e) {
      console.error('RTF copy failed:', e);
      // Fallback to plain text
      try {
        const rtfOutput = generateRTF(highlighted, detectedLang);
        await navigator.clipboard.writeText(rtfOutput);
        setCopiedRtf(true);
        setTimeout(() => setCopiedRtf(false), 1200);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    setCopied(false);
    setCopiedHtml(false);
    setCopiedRtf(false);
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
              <div className="button-group">
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? 'copied' : 'copy input'}
                </button>
                <button className="copy-btn" onClick={handleCopyHtml}>
                  {copiedHtml ? 'copied' : 'copy html'}
                </button>
                <button className="copy-btn" onClick={handleCopyRtf}>
                  {copiedRtf ? 'copied' : 'copy rtf'}
                </button>
              </div>
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
