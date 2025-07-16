import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';

// GET /api/events/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  const query = `*[_type == "event" && _id == $id][0] {
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
    attendees[]->{_id, username, clerkId},
    tags,
    createdAt,
    updatedAt
  }`;

  const event = await adminClient.fetch(query, { id });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  event.isPublic = true;
  return NextResponse.json({ event });
}

// PUT /api/events/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  const event = await adminClient.fetch(`*[_type == "event" && _id == $id][0]{_id, organizer->{clerkId}}`, { id });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (!event.organizer || event.organizer.clerkId !== userId) {
    return NextResponse.json({ error: 'Forbidden: Only the organizer can update this event' }, { status: 403 });
  }

  const data = await req.json();
  const allowedFields = [
    'title', 'description', 'category', 'eventType', 'startDate', 'endDate',
    'location', 'image', 'capacity', 'status', 'attendees', 'tags'
  ];

  const patch: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in data) patch[key] = data[key];
  }
  patch.updatedAt = new Date().toISOString();

  if (!patch.title || !patch.startDate || !patch.endDate || !patch.category || !patch.eventType || !patch.image) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const updated = await adminClient.patch(id).set(patch).commit();
    return NextResponse.json({ event: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update event', details: String(err) }, { status: 500 });
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  const event = await adminClient.fetch(`*[_type == "event" && _id == $id][0]{_id, organizer->{clerkId}}`, { id });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (!event.organizer || event.organizer.clerkId !== userId) {
    return NextResponse.json({ error: 'Forbidden: Only the organizer can delete this event' }, { status: 403 });
  }

  try {
    // First, delete all event comments that reference this event
    const comments = await adminClient.fetch(
      `*[_type == "eventComment" && event._ref == $id]._id`,
      { id }
    );
    
    // Also delete all event RSVPs that reference this event
    const rsvps = await adminClient.fetch(
      `*[_type == "eventRSVP" && event._ref == $id]._id`,
      { id }
    );
    
    if ((comments && comments.length > 0) || (rsvps && rsvps.length > 0)) {
      // Delete all related documents in a transaction
      const transaction = adminClient.transaction();
      
      if (comments && comments.length > 0) {
        comments.forEach((commentId: string) => {
          transaction.delete(commentId);
        });
      }
      
      if (rsvps && rsvps.length > 0) {
        rsvps.forEach((rsvpId: string) => {
          transaction.delete(rsvpId);
        });
      }
      
      await transaction.commit();
    }

    // Now delete the event itself
    await adminClient.delete(id);
    
    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    return NextResponse.json({ 
      error: 'Failed to delete event', 
      details: String(err) 
    }, { status: 500 });
  }
}
