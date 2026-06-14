/**
 * Remark plugin to transform blockquotes starting with `[!TYPE]` markers (e.g. `> [!NOTE]`)
 * into styled callouts with custom CSS classes and a header label.
 */
export function remarkAdmonitions() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (node.type === 'blockquote') {
        const firstChild = node.children?.[0];
        if (firstChild && firstChild.type === 'paragraph') {
          const firstTextNode = firstChild.children?.[0];
          if (firstTextNode && firstTextNode.type === 'text') {
            const match = firstTextNode.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:\r?\n)?/i);
            if (match) {
              const type = match[1].toUpperCase();
              
              // Strip the [!TYPE] marker from the text content
              firstTextNode.value = firstTextNode.value.slice(match[0].length);
              
              // Add HTML attributes and CSS classes to the blockquote
              node.data = node.data || {};
              node.data.hProperties = {
                class: `admonition admonition-${type.toLowerCase()}`,
                'data-admonition-type': type,
              };
              
              // Prepend a title header element inside the blockquote
              const titleNode = {
                type: 'paragraph',
                children: [{ type: 'text', value: type }],
                data: {
                  hProperties: {
                    class: 'admonition-title'
                  }
                }
              };
              
              node.children.unshift(titleNode);
            }
          }
        }
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    };
    walk(tree);
  };
}
