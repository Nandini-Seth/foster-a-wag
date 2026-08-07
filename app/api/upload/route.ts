import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed (jpg, png, webp, gif)' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    fs.mkdirSync(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
  } catch (err: any) {
    console.error('[/api/upload]', err);
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 });
  }
}
