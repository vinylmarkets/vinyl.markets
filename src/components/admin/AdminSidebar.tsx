import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, DollarSign, Settings, FileText, BarChart3, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NavItem {
  label: string;
  icon: any;
  path: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users', permission: 'users' },
  { label: 'Amps', icon: BarChart3, path: '/admin/amps' },
  { label: 'Content', icon: Newspaper, path: '/admin/content/blog', permission: 'content' },
  { label: 'Financial', icon: DollarSign, path: '/admin/financial', permission: 'financial' },
  { label: 'Audit Logs', icon: FileText, path: '/admin/audit-logs' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export function Sidebar({ adminUser }: { adminUser: any }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <aside className="w-60 bg-[#1A1A1A] border-r border-[#2A2A2A] fixed h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A2A2A]">
        <h1 className="text-2xl font-bold text-white">Vinyl</h1>
        <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          // Check permission
          if (item.permission && !adminUser.permissions?.[item.permission]) {
            return null;
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors relative",
                isActive 
                  ? "bg-[#0A0A0A] text-white" 
                  : "text-gray-400 hover:bg-[#0A0A0A] hover:text-gray-300"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
              )}
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-[#2A2A2A]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {adminUser.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{adminUser.email}</p>
            <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#0A0A0A] rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
