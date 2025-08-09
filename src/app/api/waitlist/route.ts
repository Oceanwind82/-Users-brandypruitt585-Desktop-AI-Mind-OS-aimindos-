import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // For now, we'll just log it and return success
    // Later you can integrate with Supabase, Airtable, or email service
    console.log('New waitlist signup:', email);
    
    // Optional: Send to a simple webhook or email service
    // You can integrate with Zapier, n8n, or direct email services here
    
    return NextResponse.json(
      { message: 'Successfully joined waitlist!' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
