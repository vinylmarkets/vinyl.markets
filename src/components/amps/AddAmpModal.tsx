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
import { supabase } from '@/integrations/supabase/client';
import { CatalogAmp } from '@/types/amps';
import { Loader2 } from 'lucide-react';

interface AddAmpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (ampId: string, name: string, capital: number) => Promise<void>;
  availableCapital: number;
}

export function AddAmpModal({ open, onOpenChange, onAdd, availableCapital }: AddAmpModalProps) {
  const [catalog, setCatalog] = useState<CatalogAmp[]>([]);
  const [selectedAmpId, setSelectedAmpId] = useState('');
  const [name, setName] = useState('');
  const [capital, setCapital] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  useEffect(() => {
    if (open) {
      fetchCatalog();
      setName('');
      setCapital('');
      setSelectedAmpId('');
    }
  }, [open]);

  const fetchCatalog = async () => {
    try {
      setIsLoadingCatalog(true);
      const { data, error } = await supabase
        .from('amp_catalog')
        .select('*')
        .order('name');

      if (error) throw error;
      setCatalog(data || []);
      
      if (data && data.length > 0) {
        setSelectedAmpId(data[0].id);
        setName(data[0].name);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const handleAmpSelect = (ampId: string) => {
    setSelectedAmpId(ampId);
    const selectedAmp = catalog.find(a => a.id === ampId);
    if (selectedAmp) {
      setName(selectedAmp.name);
    }
  };

  const handleSubmit = async () => {
    const capitalNum = parseFloat(capital);
    if (!selectedAmpId || !name || isNaN(capitalNum) || capitalNum < 100) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(selectedAmpId, name, capitalNum);
      onOpenChange(false);
    } catch (err) {
      // Error already handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Trading Algorithm</DialogTitle>
          <DialogDescription>
            Select an algorithm and allocate capital to start trading
          </DialogDescription>
        </DialogHeader>

        {isLoadingCatalog ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={selectedAmpId}
                onChange={(e) => handleAmpSelect(e.target.value)}
              >
                {catalog.map((amp) => (
                  <option key={amp.id} value={amp.id}>
                    {amp.name} - {amp.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Custom Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Trading Algorithm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capital">Allocated Capital</Label>
              <Input
                id="capital"
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="5000"
                min="100"
                step="100"
              />
              <p className="text-xs text-muted-foreground">
                Available: ${availableCapital.toFixed(2)} | Minimum: $100
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoadingCatalog || !selectedAmpId || !name || parseFloat(capital) < 100}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Algorithm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
