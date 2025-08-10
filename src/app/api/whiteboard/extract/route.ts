import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromHtml } from '@/lib/extract';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    const res = await fetch(url, { cache: 'no-store' });
    const html = await res.text();
    const text = extractTextFromHtml(html);
    return NextResponse.json({ text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
