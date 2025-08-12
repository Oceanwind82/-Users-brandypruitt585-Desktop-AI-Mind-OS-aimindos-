import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Simulate AI brainstorming (replace with actual AI API call)
    const ideas = await generateIdeas(prompt);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Brainstorm API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}

async function generateIdeas(prompt: string): Promise<string[]> {
  // In production, replace this with OpenAI API call
  // For now, using predefined responses based on common patterns
  
  const ideaTemplates = [
    `How to improve ${prompt}`,
    `${prompt} alternatives`,
    `Why ${prompt} matters`,
    `${prompt} in the future`,
    `Common ${prompt} mistakes`,
    `${prompt} best practices`,
    `${prompt} case studies`,
    `${prompt} tools and resources`
  ];

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return ideaTemplates.slice(0, 6).map(template => 
    template.includes('${prompt}') ? template : `${template}: ${prompt}`
  );
}
