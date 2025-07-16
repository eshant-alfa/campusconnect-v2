'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ShoppingBag, Tag, DollarSign, User, Filter, Search, Calendar } from "lucide-react";
import { urlFor } from '@/sanity/lib/image';

const categories = [
  { label: "All", value: "" },
  { label: "Electronics", value: "electronics" },
  { label: "Books", value: "books" },
  { label: "Clothing", value: "clothing" },
  { label: "Furniture", value: "furniture" },
  { label: "Other", value: "other" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (search) params.append("q", search);
    fetch(`/api/marketplace?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load items");
        setLoading(false);
      });
  }, [search, category]);

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-2 flex items-center gap-3">
                <ShoppingBag className="w-10 h-10" />
                Marketplace
              </h1>
              <p className="text-lg text-blue-800 max-w-2xl">
                Buy, sell, and discover items within your campus community.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="bg-white/80 hover:bg-white">
                <Link href="/marketplace/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  My Listings
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

      {/* Search & Filter Section */}
      <section className="w-full max-w-7xl mx-auto mt-8 px-4">
        <Card className="shadow-lg border-blue-100">
          <CardContent className="p-6">
            <form className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for textbooks, electronics, furniture..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 h-12 text-base border-gray-200 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Label htmlFor="marketplace-category" className="font-medium flex items-center gap-1 text-gray-700">
                  <Filter className="w-4 h-4" />
                  Category
                </Label>
                <select
                  id="marketplace-category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="h-12 rounded-md border border-gray-200 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto mt-10 px-4">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-full hover:shadow-lg transition-all duration-200">
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Items</h3>
            <p className="text-red-600">There was an error loading the marketplace items. Please try again later.</p>
          </div>
        )}
        
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-600 mb-4">There are no marketplace items available at the moment.</p>
            <Button asChild>
              <Link href="/marketplace/create">
                <Plus className="w-4 h-4 mr-2" />
                Create the First Listing
              </Link>
            </Button>
          </div>
        )}
        
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <Link key={item._id} href={`/marketplace/${item._id}`} className="block">
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-blue-300 group">
                  {/* Item Image */}
                  {(() => {
                    const validImage = Array.isArray(item.images)
                      ? item.images.find((img: any) => img && img.asset && img.asset._ref)
                      : null;
                    return validImage ? (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={urlFor(validImage).width(400).height(300).url()}
                          alt={item.title}
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
                      {item.price}
                    </div>

                    {/* Item details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span>{item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : "Uncategorized"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{item.condition ? item.condition.charAt(0).toUpperCase() + item.condition.slice(1) : "Unknown"}</span>
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

                    {/* Description */}
                    {item.description && (
                      <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    )}

                    {/* View details hint */}
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
} 