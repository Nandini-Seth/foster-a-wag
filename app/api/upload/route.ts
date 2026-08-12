import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/session';
import { saveUpload, isUploadFolder, UPLOAD_FOLDERS } from '@/lib/storage';
import { denyIfNotActive } from '@/lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

const EXTENSION_FOR_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const denied = await denyIfNotActive(session);
    if (denied) return denied;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // `folder` becomes part of the object path, so it is matched against a fixed
    // list rather than interpolated as sent.
    if (!isUploadFolder(folder)) {
      return NextResponse.json(
        { error: `folder must be one of: ${UPLOAD_FOLDERS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed (jpg, png, webp, gif)' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
    }

    // Extension comes from the validated content type, not the client's filename.
    const ext = EXTENSION_FOR_TYPE[file.type];
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUpload(folder, filename, buffer, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[/api/upload]', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
