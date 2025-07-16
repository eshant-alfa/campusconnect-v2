"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { urlFor } from '@/sanity/lib/image';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Tag, 
  DollarSign, 
  User, 
  Calendar, 
  Package,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  MapPin,
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Star,
  Clock,
  Shield,
  Flag
} from "lucide-react";

const categories = {
  electronics: { label: "Electronics", icon: "💻", color: "bg-blue-100 text-blue-800" },
  books: { label: "Books", icon: "📚", color: "bg-green-100 text-green-800" },
  clothing: { label: "Clothing", icon: "👕", color: "bg-purple-100 text-purple-800" },
  furniture: { label: "Furniture", icon: "🪑", color: "bg-orange-100 text-orange-800" },
  sports: { label: "Sports", icon: "⚽", color: "bg-red-100 text-red-800" },
  music: { label: "Music", icon: "🎵", color: "bg-pink-100 text-pink-800" },
  art: { label: "Art", icon: "🎨", color: "bg-indigo-100 text-indigo-800" },
  other: { label: "Other", icon: "📦", color: "bg-gray-100 text-gray-800" }
};

const conditions = {
  new: { label: "New", color: "bg-green-100 text-green-800" },
  "like-new": { label: "Like New", color: "bg-emerald-100 text-emerald-800" },
  good: { label: "Good", color: "bg-blue-100 text-blue-800" },
  fair: { label: "Fair", color: "bg-yellow-100 text-yellow-800" },
  poor: { label: "Poor", color: "bg-red-100 text-red-800" }
};

export default function MarketplaceItemDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for success message in URL params
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/marketplace/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setItem(data.item);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load item");
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/marketplace/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/marketplace?message=Listing deleted successfully");
    } catch (err) {
      setError("Failed to delete listing");
    }
  };

  const isOwner = item?.seller?.clerkId === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
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
                    <X className="h-8 w-8 text-red-600" />
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

  const nextImage = () => {
    if (!item.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!item.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const categoryInfo = categories[item.category as keyof typeof categories] || categories.other;
  const conditionInfo = conditions[item.condition as keyof typeof conditions] || conditions.good;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Success Message */}
          {successMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-xl max-w-md backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
                  <h1 className="text-4xl font-bold tracking-tight">{item.title || 'Untitled Listing'}</h1>
                  <p className="text-blue-100 mt-2">Marketplace Listing</p>
                </div>
                {/* Remove heart and share icons from header */}
              </div>
              
              {/* Quick Info */}
              <div className="flex items-center gap-4 mt-6">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {categoryInfo.icon} {categoryInfo.label}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {conditionInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative group">
                    {item.images && item.images[currentImageIndex]?.asset?._ref ? (
                      <img
                        src={urlFor(item.images[currentImageIndex]).width(800).height(600).url()}
                        alt={item.title}
                        className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                        <Tag className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {item.images && item.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Image Thumbnails */}
              {item.images && item.images.length > 1 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-3 overflow-x-auto">
                      {item.images.map((image: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all duration-200 ${
                            idx === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {image.asset?._ref ? (
                            <img
                              src={urlFor(image).width(80).height(80).url()}
                              alt={`${item.title || 'Item'} ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                              <Tag className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              {/* Price and Key Info */}
              <Card className="border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-4xl font-bold text-blue-700 flex items-center gap-3">
                      <DollarSign className="w-10 h-10" />
                      ${item.price || '0'}
                    </div>
                    {/* Remove 'Views: 42' from price/info card */}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{categoryInfo.label}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Condition</p>
                        <p className="font-medium">{conditionInfo.label}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Listed</p>
                        <p className="font-medium">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Updated</p>
                        <p className="font-medium">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-blue-600" />
                    </div>
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {item.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>

              {/* Seller Information */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{item.seller?.username || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600 mb-2">Campus Connect Member</p>
                      {/* Remove reviews (star and review count) from seller info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>Verified Seller</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-4">
                {isOwner ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Link href={`/marketplace/${id}/edit`}>
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Listing
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      className="h-14"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Seller
                    </Button>
                    <Button variant="outline" asChild className="h-14">
                      <Link href={`/marketplace?seller=${item.seller?.username || ''}`}>
                        <User className="w-5 h-5 mr-2" />
                        View Other Listings
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Remove Save and Share buttons from actions */}
                {/* <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 