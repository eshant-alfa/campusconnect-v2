import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// POST /api/surveys/[id]/close - Close a survey (creator only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch survey and check ownership
    const survey = await client.fetch(
      `*[_type == "survey" && _id == $id][0]{
        _id,
        title,
        status,
        creator->{clerkId}
      }`,
      { id }
    );

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    if (survey.creator?.clerkId !== userId) {
      return NextResponse.json({ error: 'Only the survey creator can close this survey' }, { status: 403 });
    }

    if (survey.status === 'closed') {
      return NextResponse.json({ error: 'Survey is already closed' }, { status: 400 });
    }

    // Close the survey
    const now = new Date().toISOString();
    const updated = await adminClient.patch(id)
      .set({ 
        status: 'closed',
        updatedAt: now 
      })
      .commit();

    return NextResponse.json({ 
      success: true, 
      survey: updated 
    });

  } catch (error) {
    console.error('Error closing survey:', error);
    return NextResponse.json({ error: 'Failed to close survey' }, { status: 500 });
  }
} 