import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';

// POST /api/events/[id]/cancel-rsvp — Cancel RSVP (auth required)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  // Fetch event and its attendees
  const event = await adminClient.fetch(
    `*[_type == "event" && _id == $id][0]{_id, attendees[]->{_id, clerkId}}`,
    { id }
  );

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Check if user is RSVPed
  const attendee = event.attendees?.find((a: any) => a.clerkId === userId);
  if (!attendee) {
    return NextResponse.json({ error: 'Not RSVPed' }, { status: 400 });
  }

  try {
    // Remove the user's reference
    await adminClient
      .patch(id)
      .unset([`attendees[_ref=="${userId}"]`])
      .commit();

    // Return updated attendee list
    const attendees = await adminClient.fetch(
      `*[_type == "event" && _id == $id][0].attendees[]->{_id, username, clerkId}`,
      { id }
    );

    return NextResponse.json({ attendees });
  } catch (err) {
    console.error('Error cancelling RSVP:', err);
    return NextResponse.json(
      { error: 'Failed to cancel RSVP', details: String(err) },
      { status: 500 }
    );
  }
}
