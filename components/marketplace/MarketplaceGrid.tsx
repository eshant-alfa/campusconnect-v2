"use client";
import React from 'react';
import { User2, ShoppingBag } from 'lucide-react';
import { useChatModal } from "@/components/chat/ChatModalContext";
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

function Badge({ children, color, icon }: { children: React.ReactNode; color: string; icon?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{icon}{children}</span>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex items-center justify-center w-full h-full text-gray-300">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#f3f4f6"/><path d="M7 17l3.5-4.5 2.5 3 3.5-4.5L21 17H3z" fill="#d1d5db"/><circle cx="9" cy="9" r="2" fill="#d1d5db"/></svg>
    </div>
  );
}

export default function MarketplaceGrid({ items }: { items: any[] }) {
  const { openChatWithUsernameAndMessage } = useChatModal();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <div className="flex items-center gap-4 mb-4">
            <ShoppingBag className="text-blue-700 w-14 h-14" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-sm">Marketplace</h1>
          </div>
          <p className="text-lg md:text-xl text-blue-700 max-w-xl">Buy, sell, and discover items from your campus community.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <Link
            href="/marketplace/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-lg"
          >
            + Create Item
          </Link>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="border-b border-gray-200 mb-8" />
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-20 text-lg">
            <div className="text-6xl mb-4">🛒</div>
            No items yet. Be the first to{' '}
            <Link href="/marketplace/create" className="text-blue-600 underline">list something</Link>!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {items.map((item: any) => (
              <div
                key={item._id}
                className="group bg-white rounded-2xl shadow-md p-5 flex flex-col hover:shadow-xl hover:border-blue-400 hover:scale-[1.03] transition-all duration-200 min-h-[320px] mb-2"
              >
                <div className="relative w-full h-36 mb-3 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
                  {item.image && item.image.asset ? (
                    <img
                      src={item.image.asset.url}
                      alt={item.title || 'Marketplace item'}
                      className="object-cover rounded-xl w-full h-full shadow-md"
                      width={200}
                      height={144}
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>
                <h2 className="text-lg font-bold mb-1 line-clamp-1 text-gray-900">{item.title}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2 text-sm">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.category && (
                    <Badge color="bg-blue-100 text-blue-700" icon={<span className="text-blue-400">🏷️</span>}>{item.category}</Badge>
                  )}
                  {item.condition && (
                    <Badge color={item.condition === 'new' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} icon={item.condition === 'new' ? <span>✅</span> : <span>♻️</span>}>
                      {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </Badge>
                  )}
                  {item.status && (
                    <Badge color={item.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-gray-200 text-gray-600'} icon={item.status === 'available' ? <span>🟢</span> : <span>⏳</span>}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex-1" />
                <div className="border-t border-gray-100 my-2" />
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-xl font-extrabold text-green-600">${item.price}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-light"><User2 className="w-4 h-4" />{item.seller?.username || 'Unknown'}</span>
                  <div className="flex gap-1 mt-1">
                    <Link
                      href={`/marketplace/${item._id}`}
                      className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-lg font-semibold hover:bg-gray-300 transition text-xs"
                    >
                      <span>View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                    {!user || item.seller?._id !== user.id ? (
                      <button
                        onClick={() => openChatWithUsernameAndMessage(item.seller?.username, 'Is this item still available?')}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-700 transition text-xs"
                      >
                        <span>Message Owner</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /></svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 