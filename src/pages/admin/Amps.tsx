import { useAmps, useAmpStats, useDeactivateAmpDeployments } from '@/hooks/useAdminAmps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Eye, 
  Plus,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function Amps() {
  const { data: amps, isLoading } = useAmps();
  const { data: stats, isLoading: statsLoading } = useAmpStats();
  const deactivateDeployments = useDeactivateAmpDeployments();
  const { toast } = useToast();

  const handleDeactivateAll = async (ampId: string, ampName: string) => {
    if (!confirm(`Deactivate all deployments for ${ampName}? All users will be stopped.`)) {
      return;
    }

    try {
      await deactivateDeployments.mutateAsync({ ampId });
      toast({ 
        title: 'Deployments deactivated',
        description: `All user deployments for ${ampName} have been stopped`
      });
    } catch (error: any) {
      toast({ 
        title: 'Failed to deactivate deployments',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Amp Management</h1>
          <p className="text-gray-400">Manage algorithmic trading strategies</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" disabled>
          <Plus size={16} className="mr-2" />
          Create Amp
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Total Amps</p>
          </div>
          {statsLoading ? (
            <Skeleton className="h-10 w-20 bg-[#0A0A0A]" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.totalAmps || 0}</p>
          )}
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Active Deployments</p>
          </div>
          {statsLoading ? (
            <Skeleton className="h-10 w-20 bg-[#0A0A0A]" />
          ) : (
            <p className="text-3xl font-bold text-white">{stats?.activeDeployments || 0}</p>
          )}
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400">Total Capital</p>
          </div>
          {statsLoading ? (
            <Skeleton className="h-10 w-32 bg-[#0A0A0A]" />
          ) : (
            <p className="text-3xl font-bold text-white">
              ${(stats?.totalCapital || 0).toLocaleString()}
            </p>
          )}
        </Card>
      </div>

      {/* Amps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-64 bg-[#1A1A1A] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {amps?.map((amp) => (
            <Card 
              key={amp.id} 
              className="bg-[#1A1A1A] border-[#2A2A2A] overflow-hidden hover:shadow-lg hover:shadow-black/20 transition-all hover:-translate-y-1"
            >
              {/* Cover Image */}
              {amp.image_url ? (
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                  <img 
                    src={amp.image_url} 
                    alt={amp.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-blue-600">
                      Active
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center relative">
                  <BarChart3 className="w-16 h-16 text-white/50" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-blue-600">
                      Active
                    </Badge>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{amp.name}</h3>
                  {amp.category && (
                    <Badge variant="outline" className="border-[#2A2A2A] text-xs">
                      {amp.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {amp.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-[#2A2A2A]">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deployments</p>
                    <p className="text-lg font-semibold text-white">
                      N/A
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Version</p>
                    <p className="text-lg font-semibold text-white">
                      {amp.version || 'v1.0'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeactivateAll(amp.id, amp.name)}
                    disabled={true}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                  >
                    <Activity size={14} className="mr-1" />
                    Stop All
                  </Button>

                  <Link to={`/admin/amps/${amp.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          {amps?.length === 0 && (
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-12 col-span-full">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No amps created yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first algorithmic trading strategy
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                  <Plus size={16} className="mr-2" />
                  Create Amp
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
