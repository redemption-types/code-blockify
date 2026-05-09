import React, { useMemo, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

function toInlineStyles(html: string): string {
  // Map common highlight.js classes to inline styles (Outlook-safe)
  const map: Record<string, string> = {
    "hljs-keyword": "color:#800000;font-weight:bold;",
    "hljs-built_in": "color:#800000;font-weight:bold;",
    "hljs-literal": "color:#800000;font-weight:bold;",
    "hljs-string": "color:#0000e6;",
    "hljs-number": "color:#0000e6;",
    "hljs-comment": "color:#008000;font-style:italic;",
    "hljs-function": "color:#800000;font-weight:bold;",
    "hljs-title": "color:#800000;font-weight:bold;",
    "hljs-params": "color:#808030;",
    "hljs-operator": "color:#808030;",
    "hljs-punctuation": "color:#808030;"
  };

  let result = html;

  for (const cls of Object.keys(map)) {
    const regex = new RegExp(
      `class=["']([^"']*\\b${cls}\\b[^"']*)["']`,
      "g"
    );
    result = result.replace(regex, (_m, _classes) => {
      return `style="${map[cls]}"`;
    });
  }

  // Remove any remaining class attributes to avoid Outlook ignoring them
  result = result.replace(/\sclass=["'][^"']*["']/g, "");

  return result;
}

export default function App() {
  const [input, setInput] = useState(
    `function hello(name) {
  console.log("Hello, " + name + "!");
}
hello("Vincent");`
  );

  const highlightedInline = useMemo(() => {
    if (!input.trim()) return "";
    const raw = hljs.highlightAuto(input, ["javascript", "typescript", "csharp"]).value;
    return toInlineStyles(raw);
  }, [input]);

  return (
    <div className="app">
      <div className="pane">
        <h2>Input</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="pane">
        <h2>Output for Outlook</h2>
        <div className="hint">
          Select inside the box and press <strong>Ctrl+C</strong>, then paste into Outlook
          with “Keep Source Formatting”.
        </div>
        <pre
          className="outlook-code"
          // This is what the user will select and copy
          dangerouslySetInnerHTML={{ __html: highlightedInline }}
        />
      </div>
    </div>
  );
}
