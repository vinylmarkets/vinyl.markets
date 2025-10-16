import { Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  const amp = item.amp;

  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
            {amp?.image_url ? (
              <img
                src={amp.image_url}
                alt={amp.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <TrendingUp className="w-8 h-8 text-primary/40" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">
                {amp?.name || 'Unknown Amp'}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => onRemove(item.id)}
                aria-label="Remove from cart"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>

            {amp?.category && (
              <Badge variant="secondary" className="text-xs mb-2">
                {amp.category}
              </Badge>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.pricing_model === 'monthly' ? 'Monthly' : 'One-time'}
              </span>
              <span className="font-semibold">
                ${item.price.toFixed(2)}
                {item.pricing_model === 'monthly' && (
                  <span className="text-xs text-muted-foreground">/mo</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
