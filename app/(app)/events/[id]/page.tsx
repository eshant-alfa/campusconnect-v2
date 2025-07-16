'use client';

import React from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import EventComments from '@/components/events/EventComments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { urlFor } from '@/sanity/lib/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function AttendeesList({ attendees }: { attendees: any[] }) {
  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">No attendees yet.</div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {attendees.map((a) => (
        <Badge key={a._id} variant="secondary" className="text-xs">
          {a.username || a.clerkId}
        </Badge>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    approved: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
    draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Draft' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/events/${id}`, fetcher);
  const event = data?.event;

  // Determine if current user is the organizer
  const isOrganizer = isSignedIn && event?.organizer?.clerkId === user?.id;
  // Determine if current user is RSVPed
  const isRSVPed = isSignedIn && event?.attendees?.some((a: any) => a.clerkId === user?.id);

  async function handleRSVP() {
    await fetch(`/api/events/${id}/rsvp`, { method: 'POST' });
    mutate();
  }
  
  async function handleCancelRSVP() {
    await fetch(`/api/events/${id}/cancel-rsvp`, { method: 'POST' });
    mutate();
  }
  
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this event?')) {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      router.push('/events');
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Event Not Found</h3>
          <p className="text-red-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Event Header */}
      <section className="relative w-full border-b bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Event Image */}
            <div className="flex-shrink-0 w-full lg:w-1/3">
              {event.image && event.image.asset ? (
                <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg border border-blue-100">
                  <Image
                    src={urlFor(event.image).url()}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="h-64 lg:h-80 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg border border-blue-100">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-blue-600 font-medium">No Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <StatusBadge status={event.status} />
                  <span className="text-sm text-gray-600">
                    {event.category} • {event.eventType}
                  </span>
                </div>
                
                <h1 className="text-4xl font-extrabold text-blue-900 mb-4">{event.title}</h1>
                
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {event.description && (
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-line">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isSignedIn && !isRSVPed && (
                  <Button onClick={handleRSVP} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    RSVP to Event
                  </Button>
                )}
                {isSignedIn && isRSVPed && (
                  <Button onClick={handleCancelRSVP} variant="outline" size="lg">
                    Cancel RSVP
                  </Button>
                )}
                {isOrganizer && (
                  <>
                    <Link href={`/events/${event._id}/edit`}>
                      <Button variant="outline" size="lg">
                        Edit Event
                      </Button>
                    </Link>
                    <Button onClick={handleDelete} variant="destructive" size="lg">
                      Delete Event
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto mt-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Attendees Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-blue-900">Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendeesList attendees={event.attendees || []} />
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Comments & Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <EventComments eventId={event._id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900 text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Link href="/events">
                    <Button variant="outline" className="w-full justify-start">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Events
                    </Button>
                  </Link>
                  {isSignedIn && (
                    <Link href="/events/create">
                      <Button variant="outline" className="w-full justify-start">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Event
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900 text-lg">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{event.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{event.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendees:</span>
                    <span className="font-medium">{event.attendees?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 