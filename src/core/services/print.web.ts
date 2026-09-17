/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Web stub for expo-print.
 * expo-print uses native print APIs not available in browsers.
 * On web, we open a new tab with the HTML and trigger window.print().
 */

export async function printAsync({ html }: { html: string }): Promise<void> {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to print.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export async function printToFileAsync(_options: { html: string }): Promise<{ uri: string }> {
  // Not applicable on web — return a dummy URI
  console.warn('[expo-print web] printToFileAsync is not supported on web. Use printAsync instead.');
  return { uri: '' };
}
