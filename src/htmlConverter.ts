// Atom One Dark color scheme mapping
const ATOM_ONE_DARK_COLORS: Record<string, string> = {
  'hljs-attr': '#E06C75',           // red
  'hljs-attribute': '#E06C75',
  'hljs-literal': '#56B6C2',        // cyan
  'hljs-meta': '#7D8590',           // gray
  'hljs-meta-keyword': '#7D8590',
  'hljs-meta-string': '#98C379',    // green
  'hljs-number': '#D19A66',         // orange
  'hljs-operator': '#56B6C2',       // cyan
  'hljs-params': '#E06C75',         // red
  'hljs-regexp': '#98C379',         // green
  'hljs-string': '#98C379',         // green
  'hljs-title': '#61AFEF',          // blue
  'hljs-title-class': '#E5C07B',    // yellow
  'hljs-title-class-inherited': '#E5C07B',
  'hljs-title-function': '#61AFEF', // blue
  'hljs-type': '#E5C07B',           // yellow
  'hljs-keyword': '#C678DD',        // purple
  'hljs-symbol': '#E06C75',         // red
  'hljs-bullet': '#E06C75',
  'hljs-link': '#E06C75',
  'hljs-builtin': '#E5C07B',        // yellow
  'hljs-section': '#61AFEF',        // blue
  'hljs-emphasis': '#C678DD',       // purple
  'hljs-strong': '#E06C75',         // red
  'hljs-addition': '#98C379',       // green
  'hljs-deletion': '#E06C75',       // red
  'hljs-quote': '#7D8590',          // gray
  'hljs-comment': '#5C6370',        // gray
  'hljs-variable': '#E06C75',       // red
};

export const convertToInlineStyles = (htmlString: string): string => {
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlString;

  // Recursively process all elements
  const processNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      
      // If it's a span with highlight.js class, convert to inline style
      if (element.tagName === 'SPAN' && element.className) {
        const classes = element.className.split(' ');
        
        for (const cls of classes) {
          if (ATOM_ONE_DARK_COLORS[cls]) {
            element.style.color = ATOM_ONE_DARK_COLORS[cls];
            // Add font-weight for keywords
            if (cls === 'hljs-keyword') {
              element.style.fontWeight = 'bold';
            }
            break; // Use the first matching color
          }
        }
        
        // Remove the class attribute for cleaner output
        element.removeAttribute('class');
      }
      
      // Process child nodes
      Array.from(node.childNodes).forEach(child => processNode(child));
    }
  };

  processNode(container);
  return container.innerHTML;
};

export const generateOutlookHTML = (code: string, language: string | null): string => {
  const styledCode = convertToInlineStyles(code);
  
  const htmlContent = `<html>
<body>
<pre style="font-family:Consolas; font-size:12pt; background:#ffffff; color:#000000;">
${styledCode}
</pre>
</body>
</html>`;

  // Calculate byte offsets for CF_HTML header
  const startHTML = 107; // Fixed header length
  const endHTML = startHTML + htmlContent.length;
  const startFragment = htmlContent.indexOf('<pre') + startHTML;
  const endFragment = htmlContent.indexOf('</pre>') + 6 + startHTML; // 6 for </pre>
  const startSelection = startFragment;
  const endSelection = endFragment;

  const cfHtmlHeader = `Version:0.9
StartHTML:${startHTML.toString().padStart(10, '0')}
EndHTML:${endHTML.toString().padStart(10, '0')}
StartFragment:${startFragment.toString().padStart(10, '0')}
EndFragment:${endFragment.toString().padStart(10, '0')}
StartSelection:${startSelection.toString().padStart(10, '0')}
EndSelection:${endSelection.toString().padStart(10, '0')}
`;

  return cfHtmlHeader + htmlContent;
};

// RTF color table mapping
const RTF_COLOR_MAP: Record<string, number> = {
  '#E06C75': 0,  // red
  '#56B6C2': 1,  // cyan
  '#7D8590': 2,  // gray
  '#98C379': 3,  // green
  '#D19A66': 4,  // orange
  '#61AFEF': 5,  // blue
  '#E5C07B': 6,  // yellow
  '#C678DD': 7,  // purple
  '#5C6370': 8,  // comment gray
  '#f5f5f5': 9,  // text
  '#050608': 10, // background
};

const extractRGBFromHex = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

export const generateRTF = (code: string, language: string | null): string => {
  const styledCode = convertToInlineStyles(code);
  const lines = styledCode.split('<br>').map(l => l.trim()).filter(l => l);

  // Build RTF color table - these are the colors from Atom One Dark
  const colorTable = [
    '\\red224\\green108\\blue117;',    // red (#E06C75)
    '\\red86\\green182\\blue194;',     // cyan (#56B6C2)
    '\\red125\\green133\\blue144;',    // gray (#7D8590)
    '\\red152\\green195\\blue121;',    // green (#98C379)
    '\\red209\\green154\\blue102;',    // orange (#D19A66)
    '\\red97\\green175\\blue239;',     // blue (#61AFEF)
    '\\red229\\green192\\blue123;',    // yellow (#E5C07B)
    '\\red198\\green120\\blue221;',    // purple (#C678DD)
    '\\red92\\green99\\blue112;',      // comment gray (#5C6370)
    '\\red245\\green245\\blue245;',    // text (#f5f5f5)
    '\\red5\\green6\\blue8;',          // background (#050608)
  ];

  // Parse HTML and convert to RTF content
  let rtfContent = '';
  for (const line of lines) {
    const spanRegex = /<span[^>]*style="color:([^"]+)"[^>]*>([^<]*)<\/span>/g;
    let match;
    let lastIndex = 0;
    let processedLine = '';

    while ((match = spanRegex.exec(line)) !== null) {
      const beforeSpan = line.substring(lastIndex, match.index);
      const color = match[1];
      const text = match[2];

      // Add text before span
      if (beforeSpan) {
        processedLine += escapeRtfText(beforeSpan);
      }

      // Map color to color table index
      let colorIndex = 9; // default to text color
      switch (color) {
        case 'rgb(224, 108, 117)': // red
        case '#E06C75':
          colorIndex = 0;
          break;
        case 'rgb(86, 182, 194)':
        case '#56B6C2':
          colorIndex = 1;
          break;
        case 'rgb(125, 133, 144)':
        case '#7D8590':
          colorIndex = 2;
          break;
        case 'rgb(152, 195, 121)':
        case '#98C379':
          colorIndex = 3;
          break;
        case 'rgb(209, 154, 102)':
        case '#D19A66':
          colorIndex = 4;
          break;
        case 'rgb(97, 175, 239)':
        case '#61AFEF':
          colorIndex = 5;
          break;
        case 'rgb(229, 192, 123)':
        case '#E5C07B':
          colorIndex = 6;
          break;
        case 'rgb(198, 120, 221)':
        case '#C678DD':
          colorIndex = 7;
          break;
        case 'rgb(92, 99, 112)':
        case '#5C6370':
          colorIndex = 8;
          break;
      }

      processedLine += `\\cf${colorIndex + 1} ${escapeRtfText(text)}`;

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      processedLine += escapeRtfText(line.substring(lastIndex));
    }

    rtfContent += processedLine + '\\par\n';
  }

  // Build complete RTF document with Word-compatible metadata
  const rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fmodern\\fcharset0 Consolas;}}{\\colortbl;${colorTable.join('')}}{\\*\\generator Microsoft Word 97;}\\viewkind4\\uc1\\pard\\f0\\fs22
${rtfContent}}`;

  return rtf;
};

const escapeRtfText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\n/g, '\\par\n');
};
