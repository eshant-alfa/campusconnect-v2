import React from 'react';
import { getMarketplaceItems } from '@/sanity/lib/marketplace/getMarketplaceItems';
import MarketplaceGrid from '@/components/marketplace/MarketplaceGrid';

export default async function MarketplacePage() {
  const items = await getMarketplaceItems();
  return <MarketplaceGrid items={items} />;
} 