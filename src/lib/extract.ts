import { parse } from 'node-html-parser';

export function extractTextFromHtml(html: string): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const root = parse(cleaned);
  const text = root.text.replace(/\s+/g, ' ').trim();
  return text.slice(0, 20000);
}
