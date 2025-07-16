'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Tag, 
  Image as ImageIcon, 
  Save, 
  X, 
  AlertCircle,
  Edit3,
  Clock,
  Building,
  Globe,
  Settings,
  CheckCircle
} from 'lucide-react';

const categoryOptions = [
  'academic', 'social', 'sports', 'career', 'cultural', 'technology', 'arts', 'other'
];
const eventTypeOptions = ['in-person', 'virtual', 'hybrid'];
const statusOptions = ['draft', 'pending', 'approved', 'cancelled'];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/events/${id}`, fetcher);
  const event = data?.event;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        eventType: event.eventType || '',
        startDate: event.startDate ? event.startDate.slice(0, 16) : '',
        endDate: event.endDate ? event.endDate.slice(0, 16) : '',
        location: event.location || { address: '', room: '', building: '', virtualLink: '' },
        image: null,
        capacity: event.capacity || '',
        status: event.status || 'draft',
        tags: event.tags ? event.tags.join(', ') : '',
      });
    }
  }, [event]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-3/4" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <X className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
              <p className="mb-4">The event you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/events">Back to Events</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="mb-4">You must be signed in to edit an event.</p>
              <Button asChild>
                <Link href="/events">Back to Events</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (event.organizer?.clerkId !== user?.id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <X className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="mb-4">You are not authorized to edit this event.</p>
              <Button asChild>
                <Link href={`/events/${event._id}`}>View Event</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!form) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      setForm((f: any) => ({ ...f, location: { ...f.location, [name.split('.')[1]]: value } }));
    } else {
      setForm((f: any) => ({ ...f, [name]: value }));
    }
  }

  function handleSelectChange(name: string, value: string) {
    setForm((f: any) => ({ ...f, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setForm((f: any) => ({ ...f, image: e.target.files![0] }));
      setImageChanged(true);
    }
  }

  async function uploadImageToSanity(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    const res = await fetch('/api/sanity/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.image;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg('');
    setLoading(true);
    try {
      let imageField = event.image;
      if (imageChanged && form.image) {
        imageField = await uploadImageToSanity(form.image);
      }
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image: imageField,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update event');
      }
      const data = await res.json();
      router.push(`/events/${data.event._id}`);
    } catch (err: any) {
      setErrMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800">
              <Link href={`/events/${event._id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
          <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
                <Edit3 className="w-8 h-8" />
                Edit Event
              </h1>
              <p className="text-lg text-blue-800">Update your event details and settings</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 bg-white/80">
              <Settings className="w-4 h-4 mr-1" />
              {form.status}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>Essential details about your event</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter event title..."
                  required
                  className="h-12 text-base border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                  <Select value={form.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-sm font-semibold text-gray-700">Event Type</Label>
                  <Select value={form.eventType} onValueChange={(value) => handleSelectChange('eventType', value)}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypeOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5 text-green-600" />
                Date & Time
              </CardTitle>
              <CardDescription>When your event will take place</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Start Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    End Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-5 h-5 text-purple-600" />
                Location
              </CardTitle>
              <CardDescription>Where your event will be held</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="location.address"
                    value={form.location.address}
                    onChange={handleChange}
                    placeholder="Enter address..."
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
          </div>
                <div className="space-y-2">
                  <Label htmlFor="room" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Room
                  </Label>
                  <Input
                    id="room"
                    name="location.room"
                    value={form.location.room}
                    onChange={handleChange}
                    placeholder="Room number..."
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
          </div>
                <div className="space-y-2">
                  <Label htmlFor="building" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Building
                  </Label>
                  <Input
                    id="building"
                    name="location.building"
                    value={form.location.building}
                    onChange={handleChange}
                    placeholder="Building name..."
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
          </div>
                <div className="space-y-2">
                  <Label htmlFor="virtualLink" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Virtual Link
                  </Label>
                  <Input
                    id="virtualLink"
                    name="location.virtualLink"
                    value={form.location.virtualLink}
                    onChange={handleChange}
                    placeholder="Meeting URL (for virtual events)..."
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
          </div>
        </div>
            </CardContent>
          </Card>

          {/* Media & Settings */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                Media & Settings
              </CardTitle>
              <CardDescription>Event image and additional settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Event Image
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer border-gray-200 focus:border-blue-500"
                />
          {!imageChanged && event.image && event.image.asset && (
                  <div className="mt-3">
                    <img 
                      src={urlFor(event.image).url()} 
                      alt={event.title} 
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  </div>
          )}
        </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="Maximum attendees..."
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select value={form.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
        </div>
        </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Enter tags separated by commas..."
                  className="h-12 text-base border-gray-200 focus:border-blue-500"
                />
        </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {errMsg && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{errMsg}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
            <Button variant="outline" asChild size="lg">
              <Link href={`/events/${event._id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold px-8"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
        </div>
      </form>
      </section>
    </>
  );
} 