/**
 * Remark plugin to transform mermaid code blocks into raw HTML pre tags.
 * This prevents the syntax highlighter from styling them and allows client-side rendering.
 */
export function remarkMermaid() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (node.type === 'code' && node.lang === 'mermaid') {
        node.type = 'html';
        node.value = `<pre class="mermaid">${node.value}</pre>`;
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    };
    walk(tree);
  };
}
