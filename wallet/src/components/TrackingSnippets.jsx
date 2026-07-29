import { useEffect } from 'react';

function mountCode(code, mounted) {
  const parsed = new DOMParser().parseFromString(code, 'text/html');
  const scripts = [...parsed.querySelectorAll('script')];
  if (!scripts.length) {
    const raw = code.replace(/<!--[\s\S]*?-->/g, '').split(/<noscript|<img/i)[0].trim();
    if (raw) scripts.push({ attributes: [], textContent: raw });
  }
  scripts.forEach((source) => {
    const script = document.createElement('script');
    [...source.attributes].forEach(({ name, value }) => script.setAttribute(name, value));
    script.textContent = source.textContent;
    document.head.appendChild(script);
    mounted.push(script);
  });
}

export default function TrackingSnippets({ tracking }) {
  useEffect(() => {
    if (!tracking?.enabled) return undefined;
    const mounted = [];
    [tracking.metaPixelCode, tracking.googleTagCode].filter(Boolean).forEach((code) => mountCode(code, mounted));
    return () => mounted.forEach((node) => node.remove());
  }, [tracking]);
  return null;
}
