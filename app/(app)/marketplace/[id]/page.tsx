"use client";
import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User2 } from 'lucide-react';
import { client } from '@/sanity/lib/client';
import { useUser } from '@clerk/nextjs';
import { useChatModal } from '@/components/chat/ChatModalContext';

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

function Badge({ children, color, icon }: { children: React.ReactNode; color: string; icon?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{icon}{children}</span>
  );
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MarketplaceItemDetail({ params }: { params: any }) {
  const unwrappedParams = React.use(params) as { id: string };
  const id = unwrappedParams.id;
  const { user } = useUser();
  const { openChatWithUsernameAndMessage } = useChatModal();
  const [item, setItem] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getMarketplaceItem(id).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!item) return notFound();

  const isOwner = item.seller?._id === user.id;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl mb-4">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/marketplace')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium text-sm transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Marketplace
        </button>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex-shrink-0 w-full md:w-80 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
            {item.image && item.image.asset ? (
              <Image
                src={item.image.asset.url}
                alt={item.title || 'Marketplace item'}
                width={320}
                height={240}
                className="object-cover rounded-xl w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-300">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#f3f4f6"/><path d="M7 17l3.5-4.5 2.5 3 3.5-4.5L21 17H3z" fill="#d1d5db"/><circle cx="9" cy="9" r="2" fill="#d1d5db"/></svg>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-2xl font-bold text-gray-900 line-clamp-2">{item.title}</h1>
              <span className="text-xs text-gray-400 font-light">{timeAgo(item.createdAt)}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-1">
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
            <div className="text-xl font-extrabold text-green-600 mb-1">${item.price}</div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 text-base mb-2 whitespace-pre-line min-h-[48px]">{item.description}</div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <User2 className="w-4 h-4" />
              <span>{item.seller?.username || 'Unknown'}</span>
            </div>
            <div className="flex gap-2 mt-2">
              {isOwner ? (
                <Link
                  href={`/marketplace/edit/${item._id}`}
                  className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-yellow-600 transition text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                  Edit
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openChatWithUsernameAndMessage(item.seller?.username, 'Is this item still available?')}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /></svg>
                  Message Owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 