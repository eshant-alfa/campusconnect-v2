import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// GET /api/surveys/[id] - Get a single survey
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const survey = await client.fetch(
      `*[_type == "survey" && _id == $id][0]{
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
      }`,
      { id }
    );
    if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(survey);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

// PUT /api/surveys/[id] - Update a survey (creator only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    // Fetch survey and check ownership
    const survey = await client.fetch(`*[_type == "survey" && _id == $id][0]{_id, creator->{clerkId}}`, { id });
    if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (survey.creator?.clerkId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const now = new Date().toISOString();
    const updated = await adminClient.patch(id)
      .set({ ...body, updatedAt: now })
      .commit();
    return NextResponse.json({ survey: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
  }
}

// DELETE /api/surveys/[id] - Delete a survey (creator only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    // Fetch survey and check ownership
    const survey = await client.fetch(`*[_type == "survey" && _id == $id][0]{_id, creator->{clerkId}}`, { id });
    if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (survey.creator?.clerkId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await adminClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
  }
} 