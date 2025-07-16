import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `*[_type == "survey" && status == "closed" && creator->clerkId == $userId] | order(createdAt desc) {
      _id,
      title,
      description,
      status,
      startDate,
      endDate,
      createdAt,
      questions[] {
        _key,
        question,
        options
      }
    }`;

    const surveys = await client.fetch(query, { userId });
    
    console.log(`Found ${surveys.length} closed surveys for user ${userId}`);
    
    return NextResponse.json({ surveys });
  } catch (error) {
    console.error('Error fetching closed surveys:', error);
    return NextResponse.json({ error: 'Failed to fetch closed surveys' }, { status: 500 });
  }
} 