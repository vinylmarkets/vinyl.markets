import { useEffect, useState } from 'react';
import { usePromoCodes } from '@/hooks/usePromoCodes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Plus, Tag, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PromoCodes() {
  const { promoCodes, isLoading, fetchPromoCodes, createPromoCode, togglePromoCode, generateCode } = usePromoCodes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    max_uses: 100,
    expires_at: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createPromoCode(formData);
    if (success) {
      setIsDialogOpen(false);
      setFormData({
        code: '',
        discount_percent: 10,
        max_uses: 100,
        expires_at: '',
      });
    }
  };

  const handleGenerateCode = () => {
    setFormData(prev => ({ ...prev, code: generateCode() }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied',
      description: 'Promo code copied to clipboard',
    });
  };

  const getStatusBadge = (promo: typeof promoCodes[0]) => {
    const now = new Date();
    const expiresAt = new Date(promo.expires_at);
    
    if (!promo.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (expiresAt < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (promo.uses_count >= promo.max_uses) {
      return <Badge variant="outline">Limit Reached</Badge>;
    }
    return <Badge className="bg-green-600">Active</Badge>;
  };

  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter(p => p.is_active && new Date(p.expires_at) > new Date() && p.uses_count < p.max_uses).length;
  const totalUses = promoCodes.reduce((sum, p) => sum + p.uses_count, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Promo Codes</h1>
        <p className="text-muted-foreground">Manage promotional codes for the marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Codes</p>
              <p className="text-2xl font-bold text-foreground">{totalCodes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Codes</p>
              <p className="text-2xl font-bold text-foreground">{activeCodes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Uses</p>
              <p className="text-2xl font-bold text-foreground">{totalUses}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-between items-center mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Promo Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-foreground">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="PROMO2024"
                    required
                    className="bg-background border-border text-foreground"
                  />
                  <Button type="button" onClick={handleGenerateCode} variant="outline">
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="discount" className="text-foreground">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseInt(e.target.value) }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="maxUses" className="text-foreground">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: parseInt(e.target.value) }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="expires" className="text-foreground">Expires At</Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                Create Promo Code
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promo Codes Table */}
      <Card className="bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Code</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Discount</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Usage</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Expires</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo.code} className="border-b border-border hover:bg-muted/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="text-foreground font-mono font-semibold">{promo.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(promo.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{promo.discount_percent}%</td>
                  <td className="p-4 text-foreground">
                    {promo.uses_count} / {promo.max_uses}
                  </td>
                  <td className="p-4 text-foreground">
                    {new Date(promo.expires_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">{getStatusBadge(promo)}</td>
                  <td className="p-4">
                    <Button
                      variant={promo.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => togglePromoCode(promo.code, !promo.is_active)}
                      disabled={isLoading}
                    >
                      {promo.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
