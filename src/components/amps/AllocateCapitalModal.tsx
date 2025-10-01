import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAmp } from '@/types/amps';
import { Loader2 } from 'lucide-react';

interface AllocateCapitalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amp: UserAmp | null;
  onAllocate: (ampId: string, capital: number) => Promise<void>;
  availableCapital: number;
}

export function AllocateCapitalModal({ 
  open, 
  onOpenChange, 
  amp, 
  onAllocate,
  availableCapital 
}: AllocateCapitalModalProps) {
  const [capital, setCapital] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && amp) {
      setCapital(amp.allocated_capital.toString());
    }
  }, [open, amp]);

  const handleSubmit = async () => {
    if (!amp) return;

    const capitalNum = parseFloat(capital);
    if (isNaN(capitalNum) || capitalNum < 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAllocate(amp.id, capitalNum);
      onOpenChange(false);
    } catch (err) {
      // Error already handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!amp) return null;

  const currentValue = amp.open_positions_value || 0;
  const maxAvailable = availableCapital + Number(amp.allocated_capital);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Allocate Capital</DialogTitle>
          <DialogDescription>
            Update capital allocation for {amp.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="capital">Capital Amount</Label>
            <Input
              id="capital"
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              min={currentValue}
              max={maxAvailable}
              step="100"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Allocation:</span>
              <span className="font-medium">${amp.allocated_capital.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Open Positions Value:</span>
              <span className="font-medium">${currentValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maximum Available:</span>
              <span className="font-medium">${maxAvailable.toFixed(2)}</span>
            </div>
          </div>

          {currentValue > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
              ⚠️ Cannot allocate less than current open positions (${currentValue.toFixed(2)})
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || parseFloat(capital) < currentValue}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Capital
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
