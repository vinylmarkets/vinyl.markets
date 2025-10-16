import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function CartButton({ itemCount, onClick }: CartButtonProps) {
  return (
    <Button variant="outline" size="icon" onClick={onClick} className="relative">
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </Badge>
      )}
    </Button>
  );
}
