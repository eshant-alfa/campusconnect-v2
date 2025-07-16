import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';

// GET /api/events — List events (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  const query = `*[_type == "event"] | order(startDate desc) [${offset}...${offset + limit}] {
    _id,
    title,
    description,
    category,
    eventType,
    startDate,
    endDate,
    location,
    image,
    capacity,
    status,
    organizer->{_id, username, clerkId},
    community->{_id, title},
    attendees[]->{_id, username, clerkId},
    requiresApproval,
    isPublic,
    tags,
    createdAt,
    updatedAt
  }`;
  
  const events = await adminClient.fetch(query);
  return NextResponse.json({ events });
}

// POST /api/events — Create event (auth required)
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await req.json();
  
  // Basic validation (expand as needed)
  if (!data.title || !data.startDate || !data.endDate || !data.category || !data.eventType || !data.image) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  try {
    // First, get the Sanity user ID for the current Clerk user
    const sanityUser = await adminClient.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );

    if (!sanityUser || !sanityUser._id) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Prepare the event data
    const eventData = {
      _type: 'event',
      title: data.title,
      description: data.description,
      category: data.category,
      eventType: data.eventType,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      image: data.image, // This should already be in the correct Sanity image format
      capacity: data.capacity ? Number(data.capacity) : undefined,
      status: data.status || 'draft',
      organizer: { _type: 'reference', _ref: sanityUser._id },
      attendees: data.attendees || [],
      requiresApproval: data.requiresApproval || false,
      isPublic: data.isPublic !== false, // Default to true
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(eventData).forEach(key => {
      if (eventData[key as keyof typeof eventData] === undefined) {
        delete eventData[key as keyof typeof eventData];
      }
    });

    const newEvent = await adminClient.create(eventData);
    
    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (err) {
    console.error('Create event error:', err);
    return NextResponse.json({ 
      error: 'Failed to create event', 
      details: String(err) 
    }, { status: 500 });
  }
}
