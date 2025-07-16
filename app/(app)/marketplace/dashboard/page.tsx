'use client';

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { urlFor } from '@/sanity/lib/image';
import { 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  DollarSign, 
  Calendar,
  Package,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  User,
  ArrowRight,
  TrendingUp,
  Eye
} from "lucide-react";

export default function MarketplaceDashboardPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    
    setLoading(true);
    setError(null);
    fetch(`/api/marketplace/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load your listings");
        setLoading(false);
      });
  }, [isSignedIn, user]);

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/marketplace/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err) {
      setError("Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper function to safely format text
  const formatText = (text: string | null | undefined, fallback: string = 'Unknown') => {
    if (!text) return fallback;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <X className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">You must be signed in to view your dashboard.</p>
              <Button asChild>
                <Link href="/marketplace">Back to Marketplace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Remove the status summary cards from the dashboard page.

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-2 flex items-center gap-3">
                <User className="w-10 h-10" />
                My Listings
              </h1>
              <p className="text-lg text-blue-800 max-w-2xl">
                Manage your marketplace listings and track their performance.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="bg-white/80 hover:bg-white">
                <Link href="/marketplace">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button asChild className="bg-blue-700 hover:bg-blue-800">
                <Link href="/marketplace/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-7xl mx-auto mt-8 px-4">
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{items.length}</p>
                    <p className="text-sm text-gray-600 font-medium">Total Listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Removed status summary cards */}
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto mt-10 px-4">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full hover:shadow-lg transition-all duration-200">
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="text-red-400 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Listings</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Yet</h3>
            <p className="text-gray-600 mb-4">Start selling by creating your first listing</p>
            <Button asChild>
              <Link href="/marketplace/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Link>
            </Button>
          </div>
        )}
        
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <Card key={item._id} className="h-full hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
                {/* Item Image */}
                <Link href={`/marketplace/${item._id}`} className="block">
                  {(() => {
                    const validImage = Array.isArray(item.images)
                      ? item.images.find((img: any) => img && img.asset && img.asset._ref)
                      : null;
                    return validImage ? (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={urlFor(validImage).width(400).height(300).url()}
                          alt={item.title || 'Item image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
                        <div className="text-center">
                          <Tag className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500 text-sm font-medium">No Image</p>
                        </div>
                      </div>
                    );
                  })()}
                </Link>

                <CardContent className="p-4">
                  {/* Header with title */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span className="capitalize">{item.condition}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-blue-700 font-bold text-xl flex items-center gap-1 mb-3">
                    <DollarSign className="w-5 h-5" />
                    {item.price || '0'}
                  </div>

                  {/* Item details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>{formatText(item.category, 'Other')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{formatText(item.condition, 'Unknown')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/marketplace/${item._id}/edit`}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                    >
                      {deletingId === item._id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
} 