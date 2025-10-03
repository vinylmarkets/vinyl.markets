import { supabase } from '@/integrations/supabase/client';

export async function logAdminAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  changes?: Record<string, any>
) {
  try {
    // Get current admin user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get admin_users record
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminUser) return;

    // Log the action
    await supabase.from('audit_logs').insert({
      admin_user_id: adminUser.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      changes: changes || null,
      ip_address: null, // Client-side can't reliably get this
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}
