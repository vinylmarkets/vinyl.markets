import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function useAdminAuth(requireRole?: 'admin' | 'support') {
  const navigate = useNavigate();

  const { data: adminUser, isLoading, error } = useQuery({
    queryKey: ['admin-auth'],
    queryFn: async () => {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Check if user is admin
      const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role, permissions')
        .eq('user_id', user.id)
        .single();

      if (adminError || !admin) {
        throw new Error('Not authorized as admin');
      }

      // If specific role required, check it
      if (requireRole && admin.role !== requireRole && admin.role !== 'admin') {
        throw new Error(`Requires ${requireRole} role`);
      }

      return {
        id: admin.id,
        userId: user.id,
        email: user.email,
        role: admin.role,
        permissions: admin.permissions as Record<string, boolean>
      };
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Redirect to login if not authenticated or authorized
  useEffect(() => {
    if (error && !isLoading) {
      navigate('/admin/login');
    }
  }, [error, isLoading, navigate]);

  return {
    adminUser,
    isLoading,
    isAdmin: adminUser?.role === 'admin',
    isSupport: adminUser?.role === 'support',
    hasPermission: (permission: string) => adminUser?.permissions?.[permission] === true
  };
}
