'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function Confirmation() {
  const params = useSearchParams();
  const role = params.get('role') === 'rescue' ? 'rescue' : 'foster';

  const nextStep =
    role === 'rescue'
      ? 'We will email you shortly to ask for proof that your organization is a legitimate rescue. Once you reply, we will verify your details and activate your account.'
      : 'We will email you shortly to verify your details. Once you reply, we will finish reviewing and activate your account.';

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-lg text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🐾</div>

        <h1 className="font-display text-3xl text-green-900">Thank you for signing up!</h1>

        <p className="text-stone-600 mt-3 leading-relaxed">
          We will reach out in the next 24-48 hours to approve your account.
        </p>

        <div className="bg-amber-50 rounded-xl p-4 mt-6 text-left">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
            What happens next
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">{nextStep}</p>
        </div>

        <p className="text-stone-500 text-sm mt-6">
          You will not be able to sign in until your account is approved. Keep an eye on your inbox —
          replying to our email is what moves things along.
        </p>

        <Link
          href="/"
          className="inline-block mt-7 bg-green-800 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function RegistrationReceivedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-amber-50" />}>
      <Confirmation />
    </Suspense>
  );
}
