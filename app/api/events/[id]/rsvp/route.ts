import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 🧭 Step 1. Find this user in Sanity
  const sanityUser = await adminClient.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{ _id }`,
    { clerkId: userId }
  );

  if (!sanityUser?._id) {
    return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
  }

  // 🧭 Step 2. Fetch the event
  const event = await adminClient.fetch(
    `*[_type == "event" && _id == $id][0]{ _id, attendees[]->{ _id } }`,
    { id }
  );

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // 🧭 Step 3. Check if already RSVPed
  const alreadyRSVPed = event.attendees?.some(
    (a: any) => a._id === sanityUser._id
  );

  if (alreadyRSVPed) {
    return NextResponse.json({ error: 'Already RSVPed' }, { status: 400 });
  }

  try {
    // 🧭 Step 4. Append attendee
    await adminClient
      .patch(id)
      .append('attendees', [
        { _type: 'reference', _ref: sanityUser._id }
      ])
      .commit();

    // 🧭 Step 5. Fetch updated attendees
    const attendees = await adminClient.fetch(
      `*[_type == "event" && _id == $id][0].attendees[]->{_id, username, clerkId}`,
      { id }
    );

    return NextResponse.json({ attendees });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Failed to RSVP', details: String(err) }, { status: 500 });
  }
}
