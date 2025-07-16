import { NextRequest, NextResponse } from 'next/server';
import { runAllModerationChecks } from '@/lib/openaiModeration';

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!type || (type !== 'post' && type !== 'comment')) {
      return NextResponse.json({ error: 'Type must be post or comment' }, { status: 400 });
    }

    // Run moderation checks without saving to database
    const moderationResult = await runAllModerationChecks(content.trim(), type);
    
    return NextResponse.json({
      flagged: moderationResult.flagged,
      reason: moderationResult.reason,
      method: moderationResult.method,
      aiAvailable: moderationResult.aiAvailable
    });

  } catch (error) {
    console.error('Content moderation error:', error);
    return NextResponse.json({ 
      error: 'Failed to moderate content',
      flagged: false,
      reason: ''
    }, { status: 500 });
  }
} 