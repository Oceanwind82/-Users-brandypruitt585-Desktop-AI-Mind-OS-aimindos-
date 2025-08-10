import { NextRequest, NextResponse } from 'next/server';
import { retry } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const failCount = parseInt(searchParams.get('fail') || '0');
  const shouldSucceed = searchParams.get('succeed') === 'true';

  console.log(`Test retry endpoint called with fail=${failCount}, succeed=${shouldSucceed}`);

  try {
    // Simulate an operation that might fail
    let attemptCount = 0;
    
    const result = await retry(async () => {
      attemptCount++;
      console.log(`Attempt ${attemptCount}`);
      
      if (!shouldSucceed && attemptCount <= failCount) {
        throw new Error(`Simulated failure on attempt ${attemptCount}`);
      }
      
      if (shouldSucceed && attemptCount <= failCount) {
        throw new Error(`Simulated failure on attempt ${attemptCount}`);
      }
      
      return {
        success: true,
        finalAttempt: attemptCount,
        message: `Operation succeeded on attempt ${attemptCount}`
      };
    }, 3, 500); // 3 retries with 500ms, 1s, 1.5s delays

    return NextResponse.json({
      ...result,
      totalAttempts: attemptCount,
      retriesUsed: attemptCount - 1
    });

  } catch (error) {
    console.error('Retry test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'All retry attempts exhausted'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, timeoutMs = 5000 } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Test HTTP request with retry
    const result = await retry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          method: 'GET'
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    }, 3, 1000); // 3 retries with 1s, 2s, 3s delays

    return NextResponse.json({
      ...result,
      url,
      retryPolicy: {
        maxRetries: 3,
        baseDelay: 1000,
        strategy: 'exponential'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      url: request.url
    }, { status: 500 });
  }
}
