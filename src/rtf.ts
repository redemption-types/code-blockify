export function buildRTF(plain: string) {
  const lines = plain.split("\n");

  let rtf = "{\\rtf1\\ansi\\deff0";
  rtf += "{\\fonttbl{\\f0 Consolas;}}";
  rtf += "\\viewkind4\\uc1\\pard\\f0\\fs22 ";

  for (const line of lines) {
    const escaped = line
      .replace(/\\/g, "\\\\")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}");
    rtf += escaped + "\\par ";
  }

  rtf += "}";

  return rtf;
}
