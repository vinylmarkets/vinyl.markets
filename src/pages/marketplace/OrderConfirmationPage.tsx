import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems } from '@/types/checkout';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError('Order ID not provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Fetch order items with amp details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            amp:amp_catalog(
              id,
              name,
              description,
              category,
              image_url
            )
          `)
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        setOrder({
          ...orderData,
          status: orderData.status as 'pending' | 'completed' | 'failed',
          items: (itemsData || []).map(item => ({
            ...item,
            pricing_model: item.pricing_model as 'monthly' | 'onetime'
          }))
        });
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || 'Order not found'}</p>
            <Button onClick={() => navigate('/marketplace')}>
              Return to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Your amps have been added to your account
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-mono text-xs mt-1">{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="mt-1">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <p className="font-semibold">Items Purchased</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
                    {item.amp?.image_url ? (
                      <img
                        src={item.amp.image_url}
                        alt={item.amp.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-primary/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.amp?.name || 'Unknown Amp'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.pricing_model === 'monthly' ? 'Monthly' : 'One-time'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">
                      Discount {order.promo_code && `(${order.promo_code})`}
                    </span>
                    <span className="text-green-600">
                      -${order.discount_amount.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Paid</span>
                <span>${order.final_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Access Your Amps</h4>
                <p className="text-sm text-muted-foreground">
                  Your newly purchased amps are now available in your My Amps dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Configure Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Allocate capital and adjust trading parameters for each amp
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Start Trading</h4>
                <p className="text-sm text-muted-foreground">
                  Activate your amps and let them generate trading signals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/trader/my-amps')}
          >
            View My Amps
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/marketplace')}
          >
            Browse More Amps
          </Button>
        </div>

        {/* Email Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          A confirmation email will be sent to your registered email address
        </p>
      </div>
    </div>
  );
}
