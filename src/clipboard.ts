export async function copyOutlookSafe(html: string, rtf: string, plain: string) {
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/rtf": new Blob([rtf], { type: "text/rtf" }),
      "text/plain": new Blob([plain], { type: "text/plain" })
    })
  ]);
}
