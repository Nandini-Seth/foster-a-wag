# About Us photos

The carousel reads `app/about/photos.ts`. To add, remove, or reorder photos,
edit that list — filenames here must match it exactly, **including extension
case**: macOS treats `.JPG` and `.jpg` as the same file, but the Linux
filesystem on Cloud Run does not, so a mismatch works locally and 404s in
production.

Any entry whose file is missing is skipped at runtime, so the carousel keeps
working while photos are swapped — no broken images appear.

## Size

These are served directly, not through an image optimizer, so whatever is here
is what visitors download. Resize to roughly 1600px on the long edge before
adding; a phone photo straight off the camera is several megabytes.

    # from the repo root, in place — keep originals elsewhere first
    sips -Z 1600 public/about/*.jpg public/about/*.jpeg public/about/*.JPG
