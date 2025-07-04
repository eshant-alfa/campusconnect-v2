"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { useUser } from '@clerk/nextjs';

type MarketplaceItem = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: {
    asset?: {
      _id: string;
      url: string;
    };
  };
  category: string;
  condition: string;
  status: string;
  seller?: {
    _id: string;
    username?: string;
  };
  createdAt?: string;
};

async function getMarketplaceItem(id: string) {
  return client.fetch(
    `*[_type == "marketplaceItem" && _id == $id][0]{
      _id,
      title,
      description,
      price,
      image{
        asset->{_id, url}
      },
      category,
      condition,
      status,
      seller->{_id, username},
      createdAt
    }`,
    { id }
  );
}

export default async function EditMarketplaceItemPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { user } = useUser();
  const router = useRouter();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    status: 'available',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getMarketplaceItem(id).then((data) => {
      setItem(data);
      setLoading(false);
      if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          category: data.category || '',
          condition: data.condition || 'new',
          status: data.status || 'available',
        });
      }
    });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Item not found.</div>;
  if (!user || item.seller?._id !== user.id) return <div className="min-h-screen flex items-center justify-center">You are not authorized to edit this item.</div>;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/marketplace/edit/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
          condition: form.condition,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push(`/marketplace/${id}`), 1200);
      } else {
        setError(data.error || 'Failed to update item.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong.');
      } else {
        setError('Something went wrong.');
      }
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/marketplace/edit/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        router.push('/marketplace');
      } else {
        setDeleteError(data.error || 'Failed to delete item.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message || 'Something went wrong.');
      } else {
        setDeleteError('Something went wrong.');
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-center">Edit Marketplace Item</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm" rows={4} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm" min="0" step="0.01" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <input type="text" name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Condition</label>
            <select name="condition" value={form.condition} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm" required>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm" required>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 text-lg mt-2 shadow"
          >
            Save Changes
          </button>
          {error && <div className="text-red-600 text-sm mt-2 text-center bg-red-50 rounded p-2 border border-red-200">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2 text-center bg-green-50 rounded p-2 border border-green-200">Item updated! Redirecting...</div>}
        </form>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition mt-6 shadow disabled:opacity-60 text-lg"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Item'}
        </button>
        {deleteError && <div className="text-red-600 text-sm mt-2 text-center bg-red-50 rounded p-2 border border-red-200">{deleteError}</div>}
      </div>
    </div>
  );
} 