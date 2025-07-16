import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Test endpoint - Request body:', body);

    // Find user in Sanity
    const user = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, name, username}`,
      { clerkId: userId }
    );

    console.log('Test endpoint - User lookup result:', { userId, user });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found', 
        userId,
        suggestion: 'Try syncing your user account first'
      }, { status: 404 });
    }

    // Test creating a simple event
    const testEvent = await adminClient.create({
      _type: 'event',
      title: 'Test Event',
      description: 'This is a test event',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      location: {},
      category: 'other',
      eventType: 'in-person',
      organizer: { _type: 'reference', _ref: user._id },
      createdAt: new Date().toISOString(),
      isActive: true,
      isPublic: true,
      requiresApproval: false,
      tags: [],
    });

    console.log('Test endpoint - Event created:', testEvent);

    return NextResponse.json({ 
      success: true, 
      event: testEvent,
      user: user
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 