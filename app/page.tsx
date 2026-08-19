import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import PetCarousel from '@/components/PetCarousel';

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Hero */}
      <section className="bg-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="max-w-5xl mx-auto px-6 py-20 relative flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">Rescue · Foster · Match</div>
            <h1 className="font-display text-5xl md:text-6xl mb-6 leading-tight">
              Every Rescue<br /><span className="italic text-amber-300">Deserves a Wag.</span>
            </h1>
            <p className="text-green-100 text-lg mb-10 max-w-xl">Foster A Wag connects rescue organizations with caring foster families — giving animals a loving home while they wait for their forever family.</p>
            <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
              <Link href="/register/foster" className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors shadow-lg">
                🏡 I Want to Foster
              </Link>
              <Link href="/register/rescue" className="bg-white hover:bg-amber-50 text-green-900 font-semibold px-8 py-4 rounded-full text-lg transition-colors shadow-lg">
                🏥 I Run a Rescue
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <PetCarousel />
            <div className="mt-5 flex justify-center">
              <Link href="/pets"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-base font-bold text-white shadow-lg ring-2 ring-amber-300/50 transition-colors hover:bg-amber-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">
                🐾 Browse All Pets
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl text-green-900 text-center mb-4">How Foster A Wag Works</h2>
        <p className="text-stone-500 text-center mb-14 max-w-xl mx-auto">Two journeys, one platform. Whether you're a rescue or a foster, we make the connection easy.</p>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Foster journey */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 flex flex-col">
            <div className="text-4xl mb-4">🏡</div>
            <h3 className="font-display text-2xl text-green-900 mb-2">For Fosters</h3>
            <p className="text-stone-500 text-sm mb-6">Open your home to an animal who needs a little love.</p>
            <ol className="space-y-4 flex-1">
              {[
                ['Register your profile', 'Tell us about your home, availability, and what kinds of pets you can care for.'],
                ['Browse pets', 'Search available animals by species, size, location, and more.'],
                ['Apply to foster', 'Submit your application directly to the rescue organization.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <div>
                    <p className="font-semibold text-stone-800">{title}</p>
                    <p className="text-stone-500 text-sm">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/register/foster" className="mt-6 block text-center bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-full transition-colors">
              Register as a Foster →
            </Link>
          </div>

          {/* Rescue journey */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 flex flex-col">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="font-display text-2xl text-green-900 mb-2">For Rescue Organizations</h3>
            <p className="text-stone-500 text-sm mb-6">Find trusted, vetted fosters for your animals in need.</p>
            <ol className="space-y-4 flex-1">
              {[
                ['Create your org profile', 'Register your rescue organization and build your profile.'],
                ['Post animals needing fosters', 'Add photos, health info, and personality details for each pet.'],
                ['Review applications', 'Browse available fosters or review incoming applications and find the right match.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <div>
                    <p className="font-semibold text-stone-800">{title}</p>
                    <p className="text-stone-500 text-sm">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/register/rescue" className="mt-6 block text-center bg-green-700 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors">
              Register Your Rescue →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Foster A Wag */}
      <section className="bg-green-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl text-center mb-12 text-amber-300">Why Foster A Wag?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🤝', title: 'Direct Connections', body: 'Fosters and rescues connect directly — no middlemen, no delays. Every match is made with care.' },
              { icon: '🐾', title: 'All Animals Welcome', body: 'Dogs, cats, small animals, and birds. Whatever you can offer, there\'s a rescue that needs you.' },
              { icon: '🛡️', title: 'Vetted & Trusted', body: 'Rescue organizations are verified. Foster profiles are reviewed. Safety and trust, every step.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-lg text-amber-200 mb-2">{title}</h3>
                <p className="text-green-200 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg">
              Get Started for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-sm text-center py-8 px-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/logo.jpeg" alt="Foster A Wag" width={28} height={28} className="rounded-full object-cover" />
          <p className="font-display text-white text-lg italic">Foster A Wag</p>
        </div>
        <p>Connecting rescues with loving foster homes across Canada.</p>
      </footer>
    </>
  );
}
