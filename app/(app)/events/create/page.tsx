'use client';

import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Tag, 
  Image as ImageIcon, 
  Plus, 
  X, 
  Upload,
  Clock,
  Globe,
  Building,
  Home,
  Video,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const categoryOptions = [
  { value: 'academic', label: 'Academic', icon: '📚' },
  { value: 'social', label: 'Social', icon: '🎉' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'cultural', label: 'Cultural', icon: '🎭' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'arts', label: 'Arts', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '📌' }
];

const eventTypeOptions = [
  { value: 'in-person', label: 'In-Person', icon: '👥' },
  { value: 'virtual', label: 'Virtual', icon: '💻' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
];

const statusOptions = ['draft', 'pending', 'approved', 'cancelled'];

export default function CreateEventPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    eventType: '',
    startDate: '',
    endDate: '',
    location: { address: '', room: '', building: '', virtualLink: '' },
    image: null as File | null,
    capacity: '',
    status: 'draft',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <X className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">You must be signed in to create an event.</p>
              <Button asChild>
                <Link href="/events">Back to Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      setForm(f => ({ ...f, location: { ...f.location, [name.split('.')[1]]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleSelectChange(name: string, value: string) {
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm(f => ({ ...f, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    setForm(f => ({ ...f, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function triggerImageUpload() {
    fileInputRef.current?.click();
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
    setError('');
    setLoading(true);
    try {
      let imageField = null;
      if (form.image) {
        imageField = await uploadImageToSanity(form.image);
      }
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image: imageField,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create event');
      }
      const data = await res.json();
      router.push(`/events/${data.event._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              i + 1 < currentStep 
                ? 'bg-green-500 border-green-500 text-white' 
                : i + 1 === currentStep 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-gray-100 border-gray-300 text-gray-500'
            }`}>
              {i + 1 < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{i + 1}</span>
              )}
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Basic Info</span>
        <span>Date & Time</span>
        <span>Location</span>
        <span>Media & Settings</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild className="hover:bg-white/80">
              <Link href="/events">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Event
              </h1>
              <p className="text-muted-foreground text-lg">Set up a new event for your community</p>
            </div>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    Basic Information
                  </CardTitle>
                  <CardDescription className="text-base">Tell us about your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Event Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="What's your event called?"
                      className="h-12 text-lg border-2 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe what attendees can expect..."
                      rows={5}
                      className="border-2 focus:border-blue-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category *</Label>
                      <Select value={form.category} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="flex items-center gap-2">
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Event Type *</Label>
                      <Select value={form.eventType} onValueChange={(value) => handleSelectChange('eventType', value)}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypeOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="flex items-center gap-2">
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    Date & Time
                  </CardTitle>
                  <CardDescription className="text-base">When will your event take place?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Start Date & Time *
                      </Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={handleChange}
                        className="h-12 border-2 focus:border-green-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        End Date & Time *
                      </Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="datetime-local"
                        value={form.endDate}
                        onChange={handleChange}
                        className="h-12 border-2 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Pro Tip</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Set your end time at least 30 minutes after your start time to give attendees time to arrive and settle in.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    Location
                  </CardTitle>
                  <CardDescription className="text-base">Where will your event be held?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        name="location.address"
                        value={form.location.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        className="h-12 border-2 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room" className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Room
                      </Label>
                      <Input
                        id="room"
                        name="location.room"
                        value={form.location.room}
                        onChange={handleChange}
                        placeholder="Room number or name"
                        className="h-12 border-2 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="building" className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Building
                      </Label>
                      <Input
                        id="building"
                        name="location.building"
                        value={form.location.building}
                        onChange={handleChange}
                        placeholder="Building name"
                        className="h-12 border-2 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="virtualLink" className="text-sm font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Virtual Link
                      </Label>
                      <Input
                        id="virtualLink"
                        name="location.virtualLink"
                        value={form.location.virtualLink}
                        onChange={handleChange}
                        placeholder="Meeting URL (for virtual events)"
                        className="h-12 border-2 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Media & Settings */}
            {currentStep === 4 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    Media & Settings
                  </CardTitle>
                  <CardDescription className="text-base">Add an image and configure event settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Event Image *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-lg shadow-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 w-6 h-6"
                              onClick={removeImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">Image uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">Upload an image</p>
                            <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={triggerImageUpload}
                            className="mt-4"
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Capacity
                      </Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={form.capacity}
                        onChange={handleChange}
                        placeholder="Maximum attendees"
                        className="h-12 border-2 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Status</Label>
                      <Select value={form.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger className="h-12 border-2 focus:border-orange-500">
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
                    <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="Enter tags separated by commas (e.g., networking, workshop, free)"
                      className="h-12 border-2 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500">Tags help people discover your event</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/events">Cancel</Link>
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 