"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function CreateMarketplaceItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/marketplace/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/marketplace'), 1200);
      } else {
        setError(data.error || 'Failed to create item.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong.');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <div className="flex items-center gap-4 mb-4">
            <ShoppingBag className="text-blue-700 w-14 h-14" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-sm">Create Marketplace Item</h1>
          </div>
          <p className="text-lg md:text-xl text-blue-700 max-w-xl">List an item for sale in the campus marketplace.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <Image
            src="/images/full_logo.png"
            alt="Campus Connect Logo"
            width={120}
            height={120}
            className="h-24 w-auto rounded-2xl shadow-xl border-4 border-white bg-white"
            priority
          />
        </div>
      </section>
      {/* Form Section */}
      <section className="max-w-2xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-blue-900">Title</label>
                <input type="text" name="title" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50" required />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-blue-900">Category</label>
                <input type="text" name="category" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50" required />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-blue-900">Price</label>
                <input type="number" name="price" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-blue-900">Condition</label>
                <select name="condition" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50" required>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 text-blue-900">Status</label>
                <select name="status" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50" required>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 text-blue-900">Image</label>
                <input type="file" name="image" className="w-full text-sm" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <Image src={imagePreview} alt="Preview" width={160} height={160} className="h-40 w-40 object-cover rounded-xl border border-gray-200 shadow-lg" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-blue-900">Description</label>
              <textarea name="description" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50" rows={4} required />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60 mt-2"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Item'}
            </button>
            {error && <div className="text-red-600 text-sm mt-4 text-center bg-red-50 rounded-xl p-3 border border-red-200 shadow">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-4 text-center bg-green-50 rounded-xl p-3 border border-green-200 shadow">Item created! Redirecting...</div>}
          </form>
        </div>
      </section>
    </div>
  );
} 