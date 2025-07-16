'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function UserSync() {
  const { user, isSignedIn } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || hasSynced.current) return;
    
    console.log('UserSync: Starting sync for user:', user.id);
    hasSynced.current = true;

    // POST to /api/users/sync to sync user to Sanity
    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('UserSync: Successfully synced user:', data);
    })
    .catch(error => {
      console.error('UserSync: Failed to sync user:', error);
      // Reset the flag so it can try again
      hasSynced.current = false;
    });
  }, [isSignedIn, user?.id]);

  return null;
} 