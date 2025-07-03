import { client } from '../client';

export async function getMarketplaceItems() {
  const query = `*[_type == "marketplaceItem"]{
    _id,
    title,
    description,
    price,
    image{
      asset->{
        _id,
        url
      }
    },
    condition,
    status,
    seller->{_id, username},
    createdAt
  } | order(createdAt desc)`;
  return client.fetch(query);
} 