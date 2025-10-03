import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '@/lib/auditLog';

export function useAdminTeam() {
  return useQuery({
    queryKey: ['admin-team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role, permissions, created_at, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user details for each admin
      const teamWithUsers = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
          
          return {
            ...admin,
            users: {
              id: admin.user_id,
              email: userData.user?.email || 'Unknown',
              full_name: userData.user?.user_metadata?.full_name || null
            }
          };
        })
      );

      return teamWithUsers;
    },
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'support' }) => {
      // Check if user exists by email via auth admin
      const { data: listData, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) throw searchError;

      const existingUser = listData.users?.find((u: any) => u.email === email);

      if (!existingUser) {
        throw new Error('User must sign up first before being granted admin access');
      }

      // Check if already admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingAdmin) {
        throw new Error('User is already an admin');
      }

      // Add to admin_users
      const permissions = role === 'admin' 
        ? { users: true, financial: true, content: true, system: true }
        : { users: true, financial: false, content: true, system: false };

      const { data: newAdmin, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: existingUser.id,
          role,
          permissions
        })
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('admin.invite', 'admin_user', newAdmin.id, { email, role });

      return newAdmin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    },
  });
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adminId, role }: { adminId: string; role: 'admin' | 'support' }) => {
      const permissions = role === 'admin'
        ? { users: true, financial: true, content: true, system: true }
        : { users: true, financial: false, content: true, system: false };

      const { data, error } = await supabase
        .from('admin_users')
        .update({ role, permissions })
        .eq('id', adminId)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('admin.update_role', 'admin_user', adminId, { role });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      await logAdminAction('admin.remove', 'admin_user', adminId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    },
  });
}
