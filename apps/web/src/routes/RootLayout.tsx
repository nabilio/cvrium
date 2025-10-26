import { Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/Toaster';

export function RootLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <Suspense fallback={<p className="text-center text-sm text-slate-500">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Toaster />
    </div>
  );
}
