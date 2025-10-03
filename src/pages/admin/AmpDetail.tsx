import { useParams, useNavigate } from 'react-router-dom';
import { useAmpDetail, useUpdateAmp } from '@/hooks/useAdminAmps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AmpDetail() {
  const { ampId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: amp, isLoading } = useAmpDetail(ampId!);
  const updateAmp = useUpdateAmp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: ''
  });

  const handleEdit = () => {
    setFormData({
      name: amp?.name || '',
      description: amp?.description || '',
      version: amp?.version || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateAmp.mutateAsync({
        ampId: ampId!,
        updates: formData
      });
      toast({ title: 'Amp updated successfully' });
      setIsEditing(false);
    } catch (error: any) {
      toast({ 
        title: 'Failed to update amp',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <AmpDetailSkeleton />;
  }

  if (!amp) {
    return (
      <div className="p-6">
        <p className="text-white">Amp not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/admin/amps')}
        className="text-gray-400 hover:text-white"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Amps
      </Button>

      {/* Header Card */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Version</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">{amp.name}</h1>
                <p className="text-gray-400 mb-4">{amp.description || 'No description available'}</p>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-blue-600">
                    Active
                  </Badge>
                  <Badge variant="outline" className="border-[#2A2A2A]">
                    {amp.version || 'v1.0'}
                  </Badge>
                  {amp.category && (
                    <Badge variant="outline" className="border-[#2A2A2A]">
                      {amp.category}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave}
                  disabled={updateAmp.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save size={14} className="mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-[#2A2A2A]"
                >
                  <X size={14} className="mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                variant="outline"
                onClick={handleEdit}
                className="border-[#2A2A2A] text-white"
              >
                <Edit size={14} className="mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[#2A2A2A]">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Deployments</p>
            <p className="text-2xl font-bold text-white">
              N/A
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-white">
              N/A
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Capital</p>
            <p className="text-2xl font-bold text-white">
              N/A
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-semibold text-white">
              {new Date(amp.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* User Deployments */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Deployments</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">Deployment tracking not available in new schema</p>
        </div>
      </Card>
    </div>
  );
}

function AmpDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-32 bg-[#1A1A1A]" />
      <Skeleton className="h-64 bg-[#1A1A1A] rounded-2xl" />
      <Skeleton className="h-96 bg-[#1A1A1A] rounded-2xl" />
    </div>
  );
}
