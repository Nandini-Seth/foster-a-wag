'use client';
import { useRef, useState } from 'react';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const ACCEPTED_LABEL = 'JPG, PNG, WebP or GIF · up to 10 MB';

function describeSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Photo picker with its rules stated up front and its errors shown in place.
 *
 * The limits are printed next to the control before anything is chosen, and the
 * file is checked in the browser before any upload starts — so "too big" comes
 * back instantly and next to the widget, rather than after a long upload and
 * somewhere else on the page.
 */
export default function PhotoUpload({
  value,
  onChange,
  folder,
  label = 'Photo',
  disabled = false,
}: {
  value?: string | null;
  onChange: (url: string) => void;
  folder: 'pets' | 'fosters';
  label?: string;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<string>(value || '');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const kind = file.type || 'that file type';
      return `${kind} is not supported. Use ${ACCEPTED_LABEL.split(' · ')[0]}.`;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return `That image is ${describeSize(file.size)}. The limit is 10 MB — try a smaller or compressed version.`;
    }
    return null;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so picking the same file twice still fires onChange.
    e.target.value = '';
    if (!file) return;

    setError('');

    // Checked here, before the upload, so the message is immediate.
    const problem = pick(file);
    if (problem) {
      setError(problem);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed. Please try again.');
        setPreview(value || '');
        return;
      }
      onChange(data.url);
    } catch {
      setError('Upload failed. Check your connection and try again.');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const describedBy = error ? 'photo-error' : 'photo-rules';

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <label className="block text-sm font-medium text-stone-700">{label}</label>
        {/* Rules stated before a file is chosen, not after it is rejected. */}
        <span id="photo-rules" className="text-xs text-stone-400">
          {ACCEPTED_LABEL}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-describedby={describedBy}
        className={`w-full overflow-hidden rounded-xl border-2 border-dashed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-200 hover:border-green-400'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {preview ? (
          <div className="relative h-40 bg-white">
            {/* object-contain matches how the photo will actually appear on the
                post, so the preview is not a promise the listing breaks. */}
            <img src={preview} alt="Selected photo preview" className="h-full w-full object-contain" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
                Uploading…
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-stone-400">
            <span className="text-3xl" aria-hidden="true">📷</span>
            <span className="text-sm">Click to upload a photo</span>
            <span className="text-xs">{ACCEPTED_LABEL}</span>
          </div>
        )}
      </button>

      {/* Sits directly under the control it belongs to. */}
      {error && (
        <p id="photo-error" role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {preview && !uploading && !error && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-xs text-stone-400 hover:text-stone-600"
        >
          Change photo
        </button>
      )}
    </div>
  );
}
