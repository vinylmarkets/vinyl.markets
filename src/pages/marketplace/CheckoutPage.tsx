import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useCheckout } from '@/hooks/use-checkout';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { processing, validatingPromo, validatePromoCode, processCheckout } = useCheckout();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_percent: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discount_percent) / 100 : 0;
  const total = subtotal - discountAmount;

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartLoading && cart.length === 0) {
      navigate('/marketplace');
    }
  }, [cart, cartLoading, navigate]);

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCode.trim()) return;

    const result = await validatePromoCode(promoCode.trim().toUpperCase());
    
    if (result.valid) {
      setAppliedPromo({
        code: promoCode.trim().toUpperCase(),
        discount_percent: result.discount_percent
      });
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError(result.error_message || 'Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleCheckout = async () => {
    const result = await processCheckout(cart, {
      promo_code: appliedPromo?.code
    });

    if (result.success && result.order_id) {
      navigate(`/checkout/confirmation/${result.order_id}`);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Review your order and complete your purchase
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary ({cart.length} items)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
                      {item.amp?.image_url ? (
                        <img
                          src={item.amp.image_url}
                          alt={item.amp.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <TrendingUp className="w-8 h-8 text-primary/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.amp?.name || 'Unknown Amp'}</h3>
                      {item.amp?.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {item.amp.category}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.pricing_model === 'monthly' ? 'Monthly Subscription' : 'One-time Purchase'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${item.price.toFixed(2)}
                        {item.pricing_model === 'monthly' && (
                          <span className="text-xs text-muted-foreground">/mo</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-500">
                          {appliedPromo.code} Applied
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appliedPromo.discount_percent}% discount
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromo}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        disabled={validatingPromo}
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim() || validatingPromo}
                      >
                        {validatingPromo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-destructive">{promoError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Beta testers: Try code <span className="font-mono font-semibold">BETA2025</span> for free access
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedPromo && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">
                        Discount ({appliedPromo.discount_percent}%)
                      </span>
                      <span className="font-medium text-green-600">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processing || cart.length === 0}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </Button>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    Instant activation of amps
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    Access to My Amps dashboard
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                    Beta testing access
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
