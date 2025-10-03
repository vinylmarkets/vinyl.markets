import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAmp } from '@/hooks/useAmps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Zap } from 'lucide-react';

export default function DeployAmp() {
  const navigate = useNavigate();
  const createAmp = useCreateAmp();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'momentum',
    risk_level: 'moderate',
    allocated_capital: 1000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAmp.mutateAsync(formData);
      navigate('/trader');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/trader')}
        className="text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Button>

      <Card className="max-w-2xl mx-auto bg-[#1A1A1A] border-[#2A2A2A] p-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-[#9540FF]" />
          <h1 className="text-3xl font-bold text-white">Deploy New Amp</h1>
        </div>
        <p className="text-gray-400 mb-6">Configure and launch your algorithmic trading strategy</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-white">Amp Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., TubeAmp Pro"
              required
              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this amp do?"
              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-3 block">Strategy Type</Label>
            <RadioGroup
              value={formData.strategy_type}
              onValueChange={(value) => setFormData({ ...formData, strategy_type: value })}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { value: 'momentum', label: 'Momentum', desc: 'Follow strong trends' },
                { value: 'mean_reversion', label: 'Mean Reversion', desc: 'Buy dips, sell peaks' },
                { value: 'breakout', label: 'Breakout', desc: 'Catch explosive moves' },
                { value: 'custom', label: 'Custom', desc: 'Your own strategy' }
              ].map(strategy => (
                <Label
                  key={strategy.value}
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.strategy_type === strategy.value
                      ? 'border-[#9540FF] bg-[#9540FF]/10'
                      : 'border-[#2A2A2A] hover:border-[#4A4A4A]'
                  }`}
                >
                  <RadioGroupItem value={strategy.value} />
                  <div>
                    <p className="text-white font-medium">{strategy.label}</p>
                    <p className="text-xs text-gray-500">{strategy.desc}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-white mb-3 block">Risk Level</Label>
            <RadioGroup
              value={formData.risk_level}
              onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: 'conservative', label: 'Conservative', color: 'green' },
                { value: 'moderate', label: 'Moderate', color: 'yellow' },
                { value: 'aggressive', label: 'Aggressive', color: 'red' }
              ].map(risk => (
                <Label
                  key={risk.value}
                  className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                    formData.risk_level === risk.value
                      ? 'border-[#9540FF] bg-[#9540FF]/10'
                      : 'border-[#2A2A2A] hover:border-[#4A4A4A]'
                  }`}
                >
                  <RadioGroupItem value={risk.value} className="sr-only" />
                  <span className="text-white font-medium">{risk.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="capital" className="text-white">Allocated Capital</Label>
            <Input
              id="capital"
              type="number"
              min="100"
              step="100"
              value={formData.allocated_capital}
              onChange={(e) => setFormData({ ...formData, allocated_capital: parseFloat(e.target.value) })}
              required
              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
            />
            <p className="text-xs text-gray-500 mt-2">Minimum: $100</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/trader')}
              className="flex-1 border-[#2A2A2A] text-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAmp.isPending}
              className="flex-1 bg-gradient-to-r from-[#0AEF80] to-[#00C766] text-black font-semibold hover:from-[#0AEF80]/90 hover:to-[#00C766]/90"
            >
              {createAmp.isPending ? 'Deploying...' : 'Deploy Amp'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}