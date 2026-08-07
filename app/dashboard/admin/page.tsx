import { Suspense } from 'react';
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-20 text-center text-stone-400">Loading…</div>}>
      <AdminDashboardClient />
    </Suspense>
  );
}
