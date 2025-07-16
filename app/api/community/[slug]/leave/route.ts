import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { addOrUpdateUser } from "@/sanity/lib/user/addUser";

export async function POST(req: NextRequest, context: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  let params: { slug: string };
  if (context.params instanceof Promise) {
    params = await context.params;
  } else {
    params = context.params;
  }
  const { slug } = params;

  console.log('Leave request for slug:', slug);

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log('Clerk user ID:', userId);

  // Fetch Sanity user by Clerk ID
  let sanityUser = await client.fetch(
    `*[_type == "user" && clerkId == $clerkId][0]{_id, username, email, imageUrl}`,
    { clerkId: userId }
  );
  console.log('Sanity user lookup result:', sanityUser);
  
  let sanityUserId: string;
  
  if (!sanityUser?._id) {
    console.log('User not found in Sanity, creating new user');
    // Create user in Sanity if they don't exist
    const newUser = await addOrUpdateUser({
      clerkId: userId,
      username: `user_${userId.slice(-6)}`,
      email: `user_${userId.slice(-6)}@example.com`,
      imageUrl: "",
    });
    sanityUserId = newUser._id;
    console.log('New user created with ID:', sanityUserId);
  } else {
    sanityUserId = sanityUser._id;
    console.log('Existing Sanity user ID:', sanityUserId);
  }

  const community = await adminClient.fetch(
    `*[_type == "subreddit" && (slug.current == $slug || title == $title)][0]{_id, members}`,
    { slug, title: slug }
  );
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  console.log('Community found:', community._id);
  console.log('Community members count:', community.members?.length || 0);
  console.log('Community members structure:', JSON.stringify(community.members, null, 2));

  const memberIdx = community.members?.findIndex((m: any) => {
    console.log('Checking member:', m, 'against sanityUserId:', sanityUserId);
    return m.user && m.user._ref === sanityUserId;
  });
  console.log('Member index found:', memberIdx);
  
  if (memberIdx === -1 || memberIdx === undefined)
    return NextResponse.json({ error: "Not a member" }, { status: 400 });

  console.log('Removing member at index:', memberIdx);

  await adminClient
    .patch(community._id)
    .unset([`members[${memberIdx}]`])
    .commit();

  console.log('Member removed successfully');

  return NextResponse.json({ success: true });
} 