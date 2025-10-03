import { Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Sidebar } from './AdminSidebar';

export function AdminLayout() {
  const { adminUser, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Hook will redirect to login
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <Sidebar adminUser={adminUser} />
      <main className="flex-1 ml-60">
        <Outlet />
      </main>
    </div>
  );
}
