import { NextRequest, NextResponse } from 'next/server';
import { resolveMediaUrl, isUploadFolder, isPublicBucket } from '@/lib/storage';

/**
 * Redirects a stable /api/media/<folder>/<file> URL to wherever the object
 * actually lives. Keeping the indirection means the URL saved in the database
 * stays valid whether the bucket is public-read or served through signed links,
 * and whether the app is running locally or on Cloud Run.
 */
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const segments = params.path ?? [];

  // Exactly <folder>/<filename>, with the folder on the allowlist and no traversal.
  if (segments.length !== 2) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const [folder, filename] = segments;
  if (!isUploadFolder(folder) || !/^[A-Za-z0-9._-]+$/.test(filename) || filename.includes('..')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const url = await resolveMediaUrl(`${folder}/${filename}`);
    if (!url) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // NextResponse.redirect needs an absolute URL. The local-disk fallback
    // returns a site-relative path, so resolve it against the incoming request.
    const target = url.startsWith('http') ? url : new URL(url, req.url);

    const response = NextResponse.redirect(target, 302);
    // Signed URLs expire, so only the public-bucket redirect is safe to cache.
    response.headers.set(
      'Cache-Control',
      isPublicBucket() ? 'public, max-age=3600' : 'private, no-store'
    );
    return response;
  } catch (err) {
    console.error('[/api/media]', err);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
