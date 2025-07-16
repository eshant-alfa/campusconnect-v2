"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Image as ImageIcon, DollarSign, Tag, Package, X, Upload, Loader2, Plus, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { label: "Electronics", value: "electronics", icon: "💻" },
  { label: "Books", value: "books", icon: "📚" },
  { label: "Clothing", value: "clothing", icon: "👕" },
  { label: "Furniture", value: "furniture", icon: "🪑" },
  { label: "Sports", value: "sports", icon: "⚽" },
  { label: "Music", value: "music", icon: "🎵" },
  { label: "Art", value: "art", icon: "🎨" },
  { label: "Other", value: "other", icon: "📦" },
];

const conditions = [
  { label: "New", value: "new", color: "bg-green-100 text-green-800" },
  { label: "Like New", value: "like-new", color: "bg-emerald-100 text-emerald-800" },
  { label: "Good", value: "good", color: "bg-blue-100 text-blue-800" },
  { label: "Fair", value: "fair", color: "bg-yellow-100 text-yellow-800" },
  { label: "Poor", value: "poor", color: "bg-red-100 text-red-800" },
];

export default function EditMarketplacePage() {
  const { id } = useParams() as { id: string };
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [item, setItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
  });
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch item data
  useEffect(() => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    fetch(`/api/marketplace/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setItem(data.item);
        setForm({
          title: data.item.title,
          description: data.item.description,
          price: data.item.price.toString(),
          category: data.item.category,
          condition: data.item.condition,
        });
        setExistingImages(data.item.images || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load item");
        setLoading(false);
      });
  }, [id, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">Authentication Required</h2>
                  <p className="text-muted-foreground mb-6">You must be signed in to edit a listing.</p>
                  <Button asChild className="w-full">
                    <Link href="/marketplace">Back to Marketplace</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">Item Not Found</h2>
                  <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist or has been removed.</p>
                  <Button asChild className="w-full">
                    <Link href="/marketplace">Back to Marketplace</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Check ownership
  if (item.seller?.clerkId !== user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">Access Denied</h2>
                  <p className="text-muted-foreground mb-6">You are not authorized to edit this listing.</p>
                  <Button asChild className="w-full">
                    <Link href={`/marketplace/${id}`}>View Listing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleNewImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setNewImages(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleNewImages(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const uploadImagesToSanity = async (files: File[]) => {
    const uploadedImages = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      const res = await fetch('/api/sanity/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      uploadedImages.push(data.image);
    }
    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.category || !form.condition) {
      setError('Please fill in all required fields.');
      return;
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      setError('At least one image is required.');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      let allImages = [...existingImages];
      if (newImages.length > 0) {
        const uploadedImages = await uploadImagesToSanity(newImages);
        allImages = [...existingImages, ...uploadedImages];
      }
      
      const res = await fetch(`/api/marketplace/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          images: allImages,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update listing");
      }
      const data = await res.json();
      router.push(`/marketplace/${id}?message=Listing updated successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = form.title && form.description && form.price && form.category && form.condition && (existingImages.length > 0 || newImages.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 p-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20">
                  <Link href={`/marketplace/${id}`}>
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight">Edit Listing</h1>
                  <p className="text-orange-100 mt-2">Update your item details and images</p>
                </div>
              </div>
              
              {/* Current item info */}
              <div className="flex items-center gap-4 mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-orange-100 text-sm">Current price: ${item.price}</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {item.category}
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                    <CardDescription>Edit the details about your item</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Item Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleInput}
                    placeholder="e.g., MacBook Pro 2022, Calculus Textbook"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Describe your item, its condition, and any relevant details..."
                    rows={4}
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleInput}
                        placeholder="0.00"
                        className="h-12 pl-10 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                    <Select value={form.category} onValueChange={(value) => handleSelect('category', value)}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-sm font-medium">Condition *</Label>
                    <Select value={form.condition} onValueChange={(value) => handleSelect('condition', value)}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map(cond => (
                          <SelectItem key={cond.value} value={cond.value}>
                            <Badge variant="secondary" className={cond.color}>
                              {cond.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Images</CardTitle>
                    <CardDescription>Manage your images. Drag and drop or click to add more.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">Current Images ({existingImages.length})</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Existing
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                          {img.asset?.url ? (
                            <img src={img.asset.url} alt={`Image ${idx + 1}`} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); handleRemoveExistingImage(idx); }}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Images */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">Add New Images</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      New
                    </Badge>
                  </div>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload images"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Add More Images</h3>
                    <p className="text-gray-500 text-center mb-2">Drag and drop images here, or <span className="text-blue-600 underline font-medium">browse files</span></p>
                    <p className="text-xs text-gray-400">JPEG, PNG • Max 5MB each</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      className="hidden"
                      onChange={e => handleNewImages(e.target.files)}
                    />
                  </div>

                  {newImagePreviews.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">New Images ({newImagePreviews.length})</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Preview
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {newImagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                            <img src={src} alt={`New Image ${idx + 1}`} className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); handleRemoveNewImage(idx); }}
                              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                              aria-label="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-red-700">
                    <X className="h-5 w-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" asChild className="h-12 px-8">
                <Link href={`/marketplace/${id}`}>Cancel</Link>
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => router.push(`/marketplace/${id}/delete`)}
                className="h-12 px-8"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Listing
              </Button>
              <Button 
                type="submit" 
                disabled={saving || !isFormValid}
                className="h-12 px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 