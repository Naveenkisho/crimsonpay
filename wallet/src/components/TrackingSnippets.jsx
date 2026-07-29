import { useEffect } from 'react';

export default function TrackingSnippets({ tracking }) {
  useEffect(() => {
    if (!tracking?.enabled) return undefined;
    const mounted = [];
    [tracking.metaPixelCode, tracking.googleTagCode].filter(Boolean).forEach((code) => {
      const parsed = new DOMParser().parseFromString(code, 'text/html');
      parsed.querySelectorAll('script').forEach((source) => {
        const script = document.createElement('script');
        [...source.attributes].forEach(({ name, value }) => script.setAttribute(name, value));
        script.textContent = source.textContent;
        document.head.appendChild(script);
        mounted.push(script);
      });
      parsed.querySelectorAll('noscript').forEach((source) => {
        const holder = document.createElement('div');
        holder.style.display = 'none';
        holder.innerHTML = source.textContent || source.innerHTML;
        document.body.appendChild(holder);
        mounted.push(holder);
      });
    });
    return () => mounted.forEach((node) => node.remove());
  }, [tracking]);
  return null;
}
