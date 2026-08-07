import { Suspense } from 'react';
import FosterDashboardClient from './FosterDashboardClient';

export default function FosterDashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Loading…</div>}>
      <FosterDashboardClient />
    </Suspense>
  );
}
