'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { urlFor } from '@/sanity/lib/image';

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    category: string;
    eventType: string;
    startDate: string;
    status: string;
    image?: { asset?: { _ref: string } };
    description?: string;
  };
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
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event._id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
        {/* Event Image */}
        {event.image && event.image.asset ? (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <Image
              src={urlFor(event.image).url()}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-t-lg">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-blue-600 text-sm font-medium">No Image</p>
            </div>
          </div>
        )}

        <CardContent className="p-4">
          {/* Header with title and status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-blue-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
              {event.title}
            </h3>
            <StatusBadge status={event.status} />
          </div>

          {/* Event details */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{event.category}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{event.eventType}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* View details hint */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
              View Details →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 