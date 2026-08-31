import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';

/**
 * Shell for the policy pages: a narrow measure for long-form reading, with the
 * heading hierarchy and spacing set once rather than per document.
 */
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <section className="bg-green-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/" className="text-sm text-green-200 transition-colors hover:text-amber-300">
            ← Back to Foster A Wag
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-green-200">Last updated {updated}</p>
        </div>
      </section>

      <article
        className="mx-auto max-w-3xl px-6 py-14
          [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-green-900
          [&_h2:first-of-type]:mt-0
          [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-stone-800
          [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-stone-700
          [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-stone-700 [&_li]:list-disc
          [&_strong]:font-semibold [&_strong]:text-stone-900
          [&_a]:text-amber-700 [&_a]:underline [&_a]:underline-offset-2"
      >
        {intro && <p className="!mt-0 text-lg text-stone-600">{intro}</p>}
        {children}
      </article>

      <SiteFooter />
    </>
  );
}
