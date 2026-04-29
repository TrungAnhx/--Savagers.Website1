const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);

export function sanitizeHtml(input: string): string {
  if (!input) return '';

  const template = document.createElement('template');
  template.innerHTML = input;

  const elements = template.content.querySelectorAll('*');
  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tag)) {
      el.remove();
      return;
    }

    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
      if ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return template.innerHTML;
}
