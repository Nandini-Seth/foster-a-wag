import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="text-5xl mb-4">🐾</Link>
      <h1 className="font-display text-4xl text-green-900 mb-2 text-center">Join Foster A Wag</h1>
      <p className="text-stone-500 mb-10 text-center">Who are you? Choose your path below.</p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/register/foster"
          className="bg-white border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-8 text-center transition-all hover:shadow-lg group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">🏡</div>
          <h2 className="font-display text-2xl text-green-900 mb-2">I Want to Foster</h2>
          <p className="text-stone-500 text-sm mb-4">Open your home to an animal in need. Register as a foster family and start finding your temporary furry friend.</p>
          <span className="bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-full text-sm inline-block group-hover:bg-amber-400 transition-colors">
            Register as Foster →
          </span>
        </Link>

        <Link href="/register/rescue"
          className="bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl p-8 text-center transition-all hover:shadow-lg group">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">🏥</div>
          <h2 className="font-display text-2xl text-green-900 mb-2">I Run a Rescue</h2>
          <p className="text-stone-500 text-sm mb-4">Post animals in need of temporary homes and connect with a network of caring foster families.</p>
          <span className="bg-green-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm inline-block group-hover:bg-green-600 transition-colors">
            Register Your Rescue →
          </span>
        </Link>
      </div>

      <p className="text-sm text-stone-500 mt-8">
        Already have an account? <Link href="/login" className="text-amber-600 hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
