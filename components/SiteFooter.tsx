import Link from 'next/link';
import Image from 'next/image';

/**
 * Shared footer for the public-facing pages. Keeps the legal links in one place
 * so a change to the set does not have to be repeated per page.
 */
export default function SiteFooter() {
  return (
    <footer className="bg-stone-900 px-6 py-10 text-sm text-stone-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.jpeg"
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
          <p className="font-display text-lg italic text-white">Foster A Wag</p>
        </div>

        <p>Connecting rescues with loving foster homes across Canada.</p>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/about" className="transition-colors hover:text-amber-300">About Us</Link>
          <Link href="/contact" className="transition-colors hover:text-amber-300">Contact Us</Link>
          <Link href="/terms" className="transition-colors hover:text-amber-300">Terms of Service</Link>
          <Link href="/privacy" className="transition-colors hover:text-amber-300">Privacy Policy</Link>
        </nav>

        <p className="text-xs text-stone-500">Website made by Nandini Seth 2026.</p>
      </div>
    </footer>
  );
}
