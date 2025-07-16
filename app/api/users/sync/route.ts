import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addOrUpdateUser } from '@/sanity/lib/user/addUser';

export async function POST(request: NextRequest) {
  try {
    console.log('UserSync API: Starting sync process');
    
    const { userId } = await auth();
    if (!userId) {
      console.log('UserSync API: No userId from auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('UserSync API: User authenticated:', userId);
    
    // Get the current Clerk user
    const user = await currentUser();
    if (!user) {
      console.log('UserSync API: No user found from currentUser');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('UserSync API: Current user found:', user.id);
    
    // Extract user info
    const clerkId = user.id;
    const username = user.username || user.id;
    const email = user.emailAddresses?.[0]?.emailAddress || '';
    const imageUrl = user.imageUrl || '';

    console.log('UserSync API: User data extracted:', { clerkId, username, email: email ? '***' : 'none' });

    // Sync to Sanity
    const sanityUser = await addOrUpdateUser({
      clerkId,
      username,
      email,
      imageUrl,
    });
    
    console.log('UserSync API: Successfully synced to Sanity:', sanityUser._id);
    return NextResponse.json({ user: sanityUser });
  } catch (error) {
    console.error('UserSync API: Error during sync:', error);
    return NextResponse.json({ 
      error: 'Failed to sync user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 