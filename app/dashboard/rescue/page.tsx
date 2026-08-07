import { Suspense } from 'react';
import RescueDashboardClient from './RescueDashboardClient';

export default function RescueDashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-400">Loading…</div>}>
      <RescueDashboardClient />
    </Suspense>
  );
}
