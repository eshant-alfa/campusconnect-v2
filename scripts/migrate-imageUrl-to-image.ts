import { adminClient } from '../sanity/lib/adminClient';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function downloadImage(url: string, dest: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(dest, buffer);
  return dest;
}

async function uploadImageToSanity(filePath: string) {
  const file = await fs.readFile(filePath);
  const asset = await adminClient.assets.upload('image', file, {
    filename: path.basename(filePath),
  });
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  };
}

async function migrateDocuments(type: 'user' | 'event') {
  const docs = await adminClient.fetch(`*[_type == $type && defined(imageUrl)]{_id, imageUrl}`, { type });
  console.log(`Found ${docs.length} ${type} documents with imageUrl`);
  for (const doc of docs) {
    const { _id, imageUrl } = doc;
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn(`Skipping ${type} ${_id}: invalid imageUrl`);
      continue;
    }
    try {
      const ext = imageUrl.includes('base64') ? '.jpg' : path.extname(imageUrl) || '.jpg';
      const tmpFile = path.join(os.tmpdir(), `${_id}${ext}`);
      await downloadImage(imageUrl, tmpFile);
      const imageField = await uploadImageToSanity(tmpFile);
      await adminClient.patch(_id).set({ image: imageField }).unset(['imageUrl']).commit();
      await fs.unlink(tmpFile);
      console.log(`Migrated ${type} ${_id}`);
    } catch (err) {
      console.error(`Failed to migrate ${type} ${_id}:`, err);
    }
  }
}

(async () => {
  await migrateDocuments('user');
  await migrateDocuments('event');
  console.log('Migration complete.');
})(); 