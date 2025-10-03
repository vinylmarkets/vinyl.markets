import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetail, useUpdateUser, useSuspendUser } from '@/hooks/useAdminUsers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Ban, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: user, isLoading } = useUserDetail(userId!);
  const updateUser = useUpdateUser();
  const suspendUser = useSuspendUser();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fullName, setFullName] = useState('');

  const handleEditSave = async () => {
    try {
      await updateUser.mutateAsync({
        userId: userId!,
        updates: { full_name: fullName }
      });
      toast({ title: 'User updated successfully' });
      setEditDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Failed to update user', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Suspend this user? All active amps will be deactivated.')) return;

    try {
      await suspendUser.mutateAsync({ 
        userId: userId!,
        reason: 'Admin action' 
      });
      toast({ title: 'User suspended' });
    } catch (error: any) {
      toast({ 
        title: 'Failed to suspend user', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const handleImpersonate = () => {
    window.open(`/trader?impersonate=${userId}`, '_blank');
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="p-6 bg-[#0A0A0A] min-h-screen">
        <p className="text-white">User not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/admin/users')}
        className="text-gray-400 hover:text-white"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Users
      </Button>

      {/* User Header Card */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {user.full_name || 'No name set'}
              </h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                ID: {user.id}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFullName(user.full_name || '')}
                  className="border-[#2A2A2A] text-white hover:bg-[#0A0A0A]"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <DialogHeader>
                  <DialogTitle className="text-white">Edit User</DialogTitle>
                  <DialogDescription className="text-gray-400">Update user profile information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                    />
                  </div>
                  <Button 
                    onClick={handleEditSave}
                    disabled={updateUser.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              onClick={handleImpersonate}
              className="border-[#2A2A2A] text-white hover:bg-[#0A0A0A]"
            >
              <ExternalLink size={14} className="mr-2" />
              Impersonate
            </Button>

            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleSuspend}
              disabled={suspendUser.isPending}
            >
              <Ban size={14} className="mr-2" />
              {suspendUser.isPending ? 'Suspending...' : 'Suspend'}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#2A2A2A]">
          <div>
            <p className="text-xs text-gray-500 mb-1">Joined</p>
            <p className="text-sm font-semibold text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Active Amps</p>
            <p className="text-sm font-semibold text-white">
              {Array.isArray(user.user_amps) ? user.user_amps.filter((a: any) => a.is_active).length : 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Paper Balance</p>
            <p className="text-sm font-semibold text-white">
              ${Array.isArray(user.paper_accounts) && user.paper_accounts[0]?.balance ? user.paper_accounts[0].balance.toLocaleString() : 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Open Positions</p>
            <p className="text-sm font-semibold text-white">
              {Array.isArray(user.paper_positions) ? user.paper_positions.length : 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="amps" className="space-y-4">
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A]">
          <TabsTrigger value="amps" className="data-[state=active]:bg-[#0A0A0A]">Active Amps</TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-[#0A0A0A]">Positions</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#0A0A0A]">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="amps">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Active Amps</h3>
            {Array.isArray(user.user_amps) && user.user_amps.length > 0 ? (
              <div className="space-y-3">
                {user.user_amps.map((amp: any) => (
                  <div 
                    key={amp.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0A0A0A]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {amp.amp_catalog?.name || 'Unknown Amp'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {amp.amp_catalog?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={amp.is_active ? "default" : "secondary"}>
                        {amp.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        ${(amp.allocated_capital || 0).toLocaleString()} allocated
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No amps configured</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Open Positions</h3>
            {Array.isArray(user.paper_positions) && user.paper_positions.length > 0 ? (
              <div className="space-y-3">
                {user.paper_positions.map((position: any) => (
                  <div 
                    key={position.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0A0A0A]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{position.symbol}</p>
                      <p className="text-xs text-gray-500">
                        {position.quantity} shares @ ${position.average_cost}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        (position.unrealized_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${(position.unrealized_pnl || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">P&L</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No open positions</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <p className="text-center text-gray-500 py-8">
              Activity log coming soon
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen">
      <Skeleton className="h-10 w-32 bg-[#1A1A1A]" />
      <Skeleton className="h-48 bg-[#1A1A1A] rounded-2xl" />
      <Skeleton className="h-96 bg-[#1A1A1A] rounded-2xl" />
    </div>
  );
}
