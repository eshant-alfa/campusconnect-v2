import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Validate file type - only allow JPEG and PNG
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ 
      error: 'Invalid file type. Only JPEG and PNG files are allowed.',
      allowedTypes: ['JPEG', 'PNG']
    }, { status: 400 });
  }

  // Validate file extension
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return NextResponse.json({ 
      error: 'Invalid file extension. Only .jpg, .jpeg, and .png files are allowed.',
      allowedExtensions: ['.jpg', '.jpeg', '.png']
    }, { status: 400 });
  }

  // Validate file size (optional - 10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ 
      error: 'File too large. Maximum size is 10MB.',
      maxSize: '10MB'
    }, { status: 400 });
  }

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Sanity with proper metadata
    const asset = await adminClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Return the image reference in the correct format
    return NextResponse.json({ 
      image: { 
        _type: 'image', 
        asset: { 
          _type: 'reference', 
          _ref: asset._id 
        } 
      } 
    });
  } catch (err) {
    console.error('Image upload error:', err);
    
    // Handle specific Sanity errors
    if (err instanceof Error) {
      if (err.message.includes('cache key')) {
        return NextResponse.json({ 
          error: 'Image processing error. Please try uploading a different image or try again later.',
          details: 'Cache generation failed'
        }, { status: 500 });
      }
      
      if (err.message.includes('asset')) {
        return NextResponse.json({ 
          error: 'Failed to upload image to storage. Please try again.',
          details: 'Asset upload failed'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Image upload failed', 
      details: String(err) 
    }, { status: 500 });
  }
} 