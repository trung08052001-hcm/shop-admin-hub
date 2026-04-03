import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-[260px] flex-1 p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
