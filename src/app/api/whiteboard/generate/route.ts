import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { parseNotesJson } from '@/lib/notes';

const schema = z.object({
  sourceText: z.string().min(1),
  goal: z.enum(['ideas', 'headline', 'hooks', 'outline']).default('ideas'),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { sourceText, goal } = schema.parse(json);

    const prompt = `You are a visual content strategist. Analyze the SOURCE and return a compact JSON array of sticky note texts for a whiteboard. Keep each item under 80 characters. Focus on ${goal}.

SOURCE:
${sourceText}

Return JSON: ["note text", "note text", ...]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '[]';
    const notes = parseNotesJson(content);
    return NextResponse.json({ notes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
