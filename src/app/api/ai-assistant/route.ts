import { NextRequest, NextResponse } from 'next/server';
import { aiLearningAssistant } from '@/lib/ai-learning-assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, message } = body;

    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'user_id and message are required' },
        { status: 400 }
      );
    }

    // Generate AI response
    const response = await aiLearningAssistant.generateResponse(user_id, message);

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Learning Assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id') || 'demo_user';
  const message = searchParams.get('message') || 'What should I learn next?';

  try {
    const response = await aiLearningAssistant.generateResponse(user_id, message);
    
    return NextResponse.json({
      success: true,
      response,
      demo: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Learning Assistant demo error:', error);
    return NextResponse.json(
      { error: 'Demo failed' },
      { status: 500 }
    );
  }
}
