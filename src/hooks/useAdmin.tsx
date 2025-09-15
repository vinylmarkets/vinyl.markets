import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      console.log('useAdmin: Checking admin status for user:', user?.email);
      
      if (!user) {
        console.log('useAdmin: No user found, setting isAdmin to false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user exists in users table and has admin role
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('useAdmin: Database query result:', { data, error, userId: user.id });

        if (error) {
          console.error('useAdmin: Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          const adminStatus = data?.role === 'admin';
          console.log('useAdmin: Setting admin status:', adminStatus, 'for role:', data?.role);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('useAdmin: Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
}