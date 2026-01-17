import { Outlet } from 'react-router-dom';
import { Header } from '@/components/guest/Header';
import { Footer } from '@/components/guest/Footer';

export function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
