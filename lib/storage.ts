import type { Storage } from '@google-cloud/storage';

/**
 * Photo storage.
 *
 * Cloud Run's filesystem is per-instance and in-memory, so anything written
 * locally disappears when the instance recycles and is invisible to every other
 * instance. In deployed environments uploads go to a Cloud Storage bucket; the
 * on-disk path is kept only as a local-development convenience.
 *
 * Uploads always return a stable app URL (/api/media/<folder>/<file>) rather
 * than a bucket URL, so what is stored in the database stays valid whether the
 * bucket is public or served through expiring signed links.
 */

/** Only these are accepted as upload targets — `folder` arrives from the client. */
export const UPLOAD_FOLDERS = ['pets', 'fosters'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

export function getBucketName(): string | undefined {
  return process.env.GCS_BUCKET || undefined;
}

export function isCloudStorageEnabled(): boolean {
  return !!getBucketName();
}

/** Public-read buckets can be linked directly; otherwise links are signed per request. */
export function isPublicBucket(): boolean {
  return process.env.GCS_PUBLIC_READ === 'true';
}

let storageClient: Storage | undefined;

async function getStorage(): Promise<Storage> {
  if (!storageClient) {
    // Imported lazily so local development never has to resolve the GCP SDK.
    const { Storage: StorageCtor } = await import('@google-cloud/storage');
    storageClient = new StorageCtor();
  }
  return storageClient;
}

/** Writes the object and returns the app-relative URL to store in the database. */
export async function saveUpload(
  folder: UploadFolder,
  filename: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const objectPath = `${folder}/${filename}`;

  if (isCloudStorageEnabled()) {
    const storage = await getStorage();
    await storage
      .bucket(getBucketName()!)
      .file(objectPath)
      .save(body, {
        contentType,
        // Photos are immutable once written — the filename carries a random suffix.
        metadata: { cacheControl: 'public, max-age=31536000, immutable' },
      });
  } else {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), body);
  }

  return `/api/media/${objectPath}`;
}

/**
 * Resolves an object path to a URL a browser can fetch, or null when it is missing.
 * Signed URLs are deliberately short-lived; the /api/media route re-signs per request.
 */
export async function resolveMediaUrl(objectPath: string): Promise<string | null> {
  if (!isCloudStorageEnabled()) {
    return `/uploads/${objectPath}`;
  }

  const bucket = getBucketName()!;

  if (isPublicBucket()) {
    return `https://storage.googleapis.com/${bucket}/${objectPath}`;
  }

  const storage = await getStorage();
  const file = storage.bucket(bucket).file(objectPath);

  const [exists] = await file.exists();
  if (!exists) return null;

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000,
  });

  return url;
}
