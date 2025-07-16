import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// POST /api/surveys/[id]/response - Submit a survey response
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const survey = await client.fetch(
      `*[_type == "survey" && _id == $id][0]{
        _id,
        anonymous,
        status,
        questions[]{ _key, required }
      }`,
      { id }
    );
    if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 });

    // Check if survey is closed
    if (survey.status === 'closed') {
      return NextResponse.json({ error: 'This survey is closed and no longer accepting responses' }, { status: 400 });
    }

    let userId: string | null = null;
    if (!survey.anonymous) {
      const authResult = await auth();
      userId = authResult.userId;
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // Prevent duplicate responses for authenticated users
      const existing = await client.fetch(
        `*[_type == "surveyResponse" && survey._ref == $id && user->clerkId == $userId][0]{_id}`,
        { id, userId }
      );
      if (existing) return NextResponse.json({ error: 'You have already responded' }, { status: 400 });
    }

    const body = await req.json();
    const { responses } = body;
    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: 'Missing responses' }, { status: 400 });
    }
    // Validate required questions
    const requiredKeys = survey.questions.filter((q: any) => q.required).map((q: any) => q._key);
    const answeredKeys = Object.keys(responses);
    for (const key of requiredKeys) {
      if (!answeredKeys.includes(key)) {
        return NextResponse.json({ error: 'All required questions must be answered' }, { status: 400 });
      }
    }
    const now = new Date().toISOString();
    // Convert responses object to array of { key, value } for Sanity
    const responseArray = Object.entries(responses).map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? JSON.stringify(value) : String(value),
    }));
    const responseDoc: any = {
      _type: 'surveyResponse',
      survey: { _type: 'reference', _ref: id },
      responses: responseArray,
      createdAt: now,
    };
    if (!survey.anonymous && userId) {
      // Find user doc
      const user = await adminClient.fetch(
        `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
        { clerkId: userId }
      );
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      responseDoc.user = { _type: 'reference', _ref: user._id };
    }
    const saved = await adminClient.create(responseDoc);
    return NextResponse.json({ response: saved });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
} 