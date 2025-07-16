"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Plus, Image as ImageIcon, DollarSign, Tag, Package, X, Upload, Loader2, Info, CheckCircle } from "lucide-react";

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

export default function CreateMarketplacePage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                  <p className="text-muted-foreground mb-6">You must be signed in to create a listing.</p>
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setImages(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== idx);
      return newPreviews;
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleImages(e.dataTransfer.files);
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
    if (!form.title || !form.description || !form.price || !form.category || !form.condition || images.length === 0) {
      setError('Please fill in all required fields and upload at least one image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const uploadedImages = await uploadImagesToSanity(images);
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          images: uploadedImages,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create listing");
      }
      const data = await res.json();
      router.push(`/marketplace/${data.item._id}?message=Listing created successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.title && form.description && form.price && form.category && form.condition && images.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20">
                  <Link href="/marketplace">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight">Create New Listing</h1>
                  <p className="text-blue-100 mt-2">Share your items with the campus community</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Basic Info</span>
                </div>
                <div className="flex-1 h-px bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Images</span>
                </div>
                <div className="flex-1 h-px bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Review</span>
                </div>
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
                    <CardDescription>Essential details about your item</CardDescription>
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
                    <CardDescription>Upload at least one image. Drag and drop or click to select.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
                  <p className="text-gray-500 text-center mb-2">Drag and drop images here, or <span className="text-blue-600 underline font-medium">browse files</span></p>
                  <p className="text-xs text-gray-400">JPEG, PNG • Max 5MB each • Up to 5 images</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    className="hidden"
                    onChange={e => handleImages(e.target.files)}
                  />
                </div>

                {imagePreviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">Preview ({imagePreviews.length}/5)</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                          {src ? (
                            <img src={src} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
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
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Tips for a great listing</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use clear, high-quality photos from multiple angles</li>
                      <li>• Be honest about the condition and any defects</li>
                      <li>• Include relevant details like brand, model, or specifications</li>
                      <li>• Set a fair price based on current market value</li>
                    </ul>
                  </div>
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
                <Link href="/marketplace">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !isFormValid}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
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