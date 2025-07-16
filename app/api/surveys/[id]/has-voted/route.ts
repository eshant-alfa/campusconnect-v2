import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

// GET /api/surveys/[id]/has-voted - Check if user has already voted
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ hasVoted: false });
    }

    // Check if user has already submitted a response for this survey
    const existingResponse = await client.fetch(
      `*[_type == "surveyResponse" && survey._ref == $id && user->clerkId == $userId][0]{_id}`,
      { id, userId }
    );

    return NextResponse.json({ hasVoted: !!existingResponse });
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    return NextResponse.json({ hasVoted: false });
  }
} 