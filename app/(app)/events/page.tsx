'use client';

import React from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import EventCard from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EventsPage() {
  const { user, isSignedIn } = useUser();
  const { data, error, isLoading } = useSWR('/api/events', fetcher);

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Events</h1>
              <p className="text-lg text-blue-800 max-w-2xl">
                Discover and join exciting campus events, workshops, and activities happening around you.
              </p>
            </div>
            {isSignedIn && (
              <Link href="/events/create">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto mt-10 px-4">
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Events</h3>
            <p className="text-red-600">There was an error loading the events. Please try again later.</p>
          </div>
        )}
        
        {data && data.events && data.events.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">There are no events scheduled at the moment.</p>
            {isSignedIn && (
              <Link href="/events/create">
                <Button>Create the First Event</Button>
              </Link>
            )}
          </div>
        )}
        
        {data && data.events && data.events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  );
} 