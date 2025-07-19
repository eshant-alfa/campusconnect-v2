import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// GET /api/surveys - List all published surveys (excluding closed ones)
export async function GET(req: NextRequest) {
  try {
    const surveys = await client.fetch(
      `*[_type == "survey" && status == "published" && status != "closed"]|order(_createdAt desc){
        _id,
        title,
        description,
        status,
        startDate,
        endDate,
        anonymous,
        questions,
        creator->{_id, username, clerkId},
        createdAt,
        updatedAt
      }`
    );
    return NextResponse.json({ surveys });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}

// POST /api/surveys - Create a new survey
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { title, description, status, startDate, endDate, anonymous, questions } = body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find user in Sanity
    const user = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id, username}`,
      { clerkId: userId }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Generate unique keys for each question
    const questionsWithKeys = questions.map((question: any, index: number) => ({
      ...question,
      _key: `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    const now = new Date().toISOString();
    const survey = await adminClient.create({
      _type: 'survey',
      title,
      description,
      status: status || 'draft',
      startDate,
      endDate,
      anonymous: !!anonymous,
      questions: questionsWithKeys,
      creator: { _type: 'reference', _ref: user._id },
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Survey creation error:', error);
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
} 