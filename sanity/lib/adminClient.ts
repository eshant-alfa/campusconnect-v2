import { createClient } from "@sanity/client";

import { apiVersion, dataset, projectId } from "../env";

// Check if we have a write token
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

if (!token) {
  console.warn('Warning: No Sanity write token found. Deletion operations will fail.');
}

export const adminClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN for mutations
  token: token, // Use write token for mutations
  perspective: 'published', // Ensure we're working with published documents
});
