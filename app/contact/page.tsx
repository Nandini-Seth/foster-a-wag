import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Contact Us · Foster A Wag',
  description: 'Get in touch with Foster A Wag at fosterawag@gmail.com.',
};

const REASONS = [
  {
    icon: '⏳',
    title: 'Waiting on account approval',
    body: 'Every account is reviewed by a person before it is activated, normally within 24–48 hours. If it has been longer than that, send us a note.',
  },
  {
    icon: '🏥',
    title: 'Questions from rescue organizations',
    body: 'Getting set up, listing animals, or asking what we need in order to verify your organization.',
  },
  {
    icon: '🏡',
    title: 'Questions from foster families',
    body: 'Trouble with your profile, an application you have sent, or a listing that does not look right.',
  },
  {
    icon: '🔒',
    title: 'Privacy requests',
    body: 'Ask for a copy of what we hold about you, have it corrected, or have your account closed. We reply within 30 days.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <section className="relative overflow-hidden bg-green-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mb-5 inline-block rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            Contact Us
          </div>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            We&rsquo;d love to
            <br />
            <span className="italic text-amber-300">hear from you.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-green-100">
            Foster A Wag is run by one family, so your message reaches a person rather than a
            helpdesk. We answer everything.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-6 py-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Email us at</p>
          <a
            href="mailto:fosterawag@gmail.com"
            className="mt-3 inline-block break-all font-display text-3xl text-green-900 underline decoration-amber-400 decoration-2 underline-offset-4 transition-colors hover:text-amber-700 md:text-4xl"
          >
            fosterawag@gmail.com
          </a>
          <p className="mt-4 text-sm text-amber-800">
            We usually reply within a day or two. It is the same address our approval emails come
            from, so replying to one of those reaches us too.
          </p>
        </div>

        <h2 className="mt-14 font-display text-2xl text-green-900">What people write to us about</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
              <div className="text-3xl" aria-hidden="true">{r.icon}</div>
              <h3 className="mt-3 font-semibold text-stone-800">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="!mt-0 font-display text-xl text-red-900">
            If an animal is in immediate danger
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-red-800">
            Please do not email us. Contact your local humane society, animal services, or emergency
            services. We are a small team and cannot monitor this inbox around the clock, so a
            message here may not be seen for hours.
          </p>
        </div>

        <p className="mt-10 text-center text-sm text-stone-500">
          Curious who is behind all this? Read{' '}
          <Link href="/about" className="text-amber-700 underline underline-offset-2">
            our story
          </Link>
          .
        </p>
      </section>

      <SiteFooter />
    </>
  );
}
