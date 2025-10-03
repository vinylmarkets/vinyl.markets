import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminTeam, useInviteAdmin, useUpdateAdminRole, useRemoveAdmin } from '@/hooks/useAdminSettings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Shield, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const { adminUser } = useAdminAuth();
  const { data: team, isLoading } = useAdminTeam();
  const inviteAdmin = useInviteAdmin();
  const updateRole = useUpdateAdminRole();
  const removeAdmin = useRemoveAdmin();
  const { toast } = useToast();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'support'>('support');

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }

    try {
      await inviteAdmin.mutateAsync({ email: inviteEmail, role: inviteRole });
      toast({ title: 'Admin access granted' });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('support');
    } catch (error: any) {
      toast({ 
        title: 'Failed to grant admin access',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRole = async (adminId: string, newRole: 'admin' | 'support') => {
    try {
      await updateRole.mutateAsync({ adminId, role: newRole });
      toast({ title: 'Role updated successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleRemove = async (adminId: string) => {
    try {
      await removeAdmin.mutateAsync(adminId);
      toast({ title: 'Admin removed successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Failed to remove admin',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const isOnlyAdmin = team?.filter(t => t.role === 'admin').length === 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage platform configuration and team access</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A]">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-4">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Admin Team</h2>
                <p className="text-sm text-gray-400">Manage who has access to the admin dashboard</p>
              </div>

              {adminUser?.role === 'admin' && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus size={16} className="mr-2" />
                      Grant Access
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Grant Admin Access</DialogTitle>
                      <DialogDescription>
                        User must already have an account. Enter their email and select role.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Email</Label>
                        <Input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Role</Label>
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-2">
                          {inviteRole === 'admin' 
                            ? 'Full access to all settings and features'
                            : 'Can view users and manage content, limited access to financial and system settings'
                          }
                        </p>
                      </div>
                      <Button 
                        onClick={handleInvite}
                        disabled={inviteAdmin.isPending}
                        className="w-full"
                      >
                        {inviteAdmin.isPending ? 'Granting Access...' : 'Grant Access'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-20 bg-[#0A0A0A]" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {team?.map((member) => {
                  const isCurrentUser = member.users.id === adminUser?.userId;
                  const canModify = adminUser?.role === 'admin' && !isCurrentUser;

                  return (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[#0A0A0A]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {member.users.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {member.users.full_name || member.users.email}
                            {isCurrentUser && (
                              <span className="text-xs text-gray-500 ml-2">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{member.users.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {canModify ? (
                          <Select 
                            value={member.role}
                            onValueChange={(v) => handleUpdateRole(member.id, v as any)}
                          >
                            <SelectTrigger className="w-[130px] bg-[#1A1A1A] border-[#2A2A2A] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        )}

                        {canModify && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={isOnlyAdmin && member.role === 'admin'}
                                className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Remove Admin Access</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will revoke {member.users.email}'s admin access. They will no longer be able to access the admin dashboard.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-[#2A2A2A]">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemove(member.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Role Permissions Reference */}
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Role Permissions</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Full access to all features including user management, financial data, system configuration, and team management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Support</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Can view and edit users, manage content, and access audit logs. Cannot modify financial settings, system configuration, or manage team.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-4">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Platform Configuration</h2>
            <p className="text-sm text-gray-400 mb-6">
              Advanced platform settings - coming soon
            </p>
            <div className="text-center py-12">
              <SettingsIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Platform settings will be available here</p>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">External Integrations</h2>
            <p className="text-sm text-gray-400 mb-6">
              Manage API keys and external service connections
            </p>

            <div className="space-y-4">
              <IntegrationCard 
                name="Polygon.io"
                description="Market data provider"
                status="connected"
                apiKey="pk_***************"
              />
              <IntegrationCard 
                name="Alpaca Trading"
                description="Broker API for trade execution"
                status="connected"
                apiKey="AK***************"
              />
              <IntegrationCard 
                name="Stripe"
                description="Payment processing"
                status="not_configured"
              />
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
            <p className="text-sm text-gray-400 mb-6">
              Security and compliance configuration
            </p>

            <div className="space-y-6">
              <div>
                <Label className="text-white mb-2 block">Audit Log Retention</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Logs are retained for 7 years (required for financial compliance)
                </p>
                <Badge variant="outline" className="border-green-500/20 text-green-400">
                  Compliant
                </Badge>
              </div>

              <div>
                <Label className="text-white mb-2 block">Two-Factor Authentication</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Require 2FA for all admin accounts
                </p>
                <Badge variant="outline" className="border-yellow-500/20 text-yellow-400">
                  Coming Soon
                </Badge>
              </div>

              <div>
                <Label className="text-white mb-2 block">Session Timeout</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Auto-logout after 8 hours of inactivity
                </p>
                <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                  Active
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrationCard({ 
  name, 
  description, 
  status, 
  apiKey 
}: { 
  name: string; 
  description: string; 
  status: 'connected' | 'not_configured';
  apiKey?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0A0A0A]">
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-gray-500">{description}</p>
        {apiKey && (
          <p className="text-xs text-gray-600 font-mono mt-1">{apiKey}</p>
        )}
      </div>
      <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
        {status === 'connected' ? 'Connected' : 'Not Configured'}
      </Badge>
    </div>
  );
}
