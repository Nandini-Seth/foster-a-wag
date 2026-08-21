import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import PhotoCarousel from '@/components/PhotoCarousel';
import { ABOUT_PHOTOS } from './photos';

export const metadata = {
  title: 'About Us · Foster A Wag',
  description:
    'Why we built Foster A Wag — one place for rescues and foster families to find each other.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <section className="bg-green-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mb-5 inline-block rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
            About Us
          </div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Built by a family who&rsquo;s
            <br />
            <span className="italic text-amber-300">been through it.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-lg leading-relaxed text-stone-700">
          We know firsthand how transformative it is to open your heart and home to a rescue
          animal—our own lively family of four, along with our sweet six-year-old Labrador and
          spirited Great Pyrenees/Border Collie mix, is living proof! When we first set out to
          foster and adopt, we quickly realized how overwhelming it was to search through scattered
          listings across different sites and try to connect with busy rescue organizations. Driven
          by a deep, lifelong passion for animal welfare, we created this site to bring everyone
          together onto a single, easy-to-use platform. Our mission is simple yet heartfelt: to
          seamlessly unite compassionate families and rescue groups nationwide, making it effortless
          for rescues to list animals and for foster families to find their ideal match. Every animal
          deserves a loving place to land, and we are dedicated to helping them find forever homes,
          one perfect connection at a time.
        </p>

        <div className="mt-14">
          <PhotoCarousel photos={ABOUT_PHOTOS} caption="Our silly girls Iris and Lily" />
        </div>
      </section>

      <section className="bg-green-900 py-14 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl text-amber-300">Ready to find your match?</h2>
          <p className="mx-auto mt-3 max-w-xl text-green-100">
            Browse the animals waiting for a foster home right now, or list one of your own.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/pets"
              className="rounded-full bg-amber-500 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-colors hover:bg-amber-400"
            >
              🐾 Browse All Pets
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-green-900 shadow-lg transition-colors hover:bg-amber-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-stone-900 px-6 py-8 text-center text-sm text-stone-400">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Image src="/logo.jpeg" alt="Foster A Wag" width={28} height={28} className="rounded-full object-cover" />
          <p className="font-display text-lg italic text-white">Foster A Wag</p>
        </div>
        <p>Connecting rescues with loving foster homes across Canada.</p>
      </footer>
    </>
  );
}
