import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    billing: "forever",
    description: "Get started with basic trading insights",
    features: [
      "Basic market data",
      "Limited briefings (3/month)",
      "Community access",
      "Basic learning modules"
    ],
    limitations: [
      "No portfolio tracking",
      "Limited AI interactions",
      "No advanced analytics"
    ],
    current: true,
    popular: false
  },
  {
    name: "Essential",
    price: 29,
    billing: "per month",
    description: "Perfect for active traders and learners",
    features: [
      "Real-time market data",
      "Unlimited briefings",
      "Portfolio tracking",
      "Advanced AI assistant",
      "All learning modules",
      "Email support"
    ],
    limitations: [],
    current: false,
    popular: true
  },
  {
    name: "Pro",
    price: 79,
    billing: "per month", 
    description: "For serious traders and professionals",
    features: [
      "Everything in Essential",
      "Advanced analytics",
      "Custom alerts",
      "API access", 
      "Priority support",
      "Advanced risk management",
      "Institutional data feeds"
    ],
    limitations: [],
    current: false,
    popular: false
  }
];

export default function Upgrade() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Upgrade Your Plan</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Unlock advanced features and take your trading to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-secondary shadow-lg scale-105' : ''} ${plan.current ? 'border-green-200 bg-green-50/30' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground">
                  Most Popular
                </Badge>
              )}
              
              {plan.current && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name === 'Pro' && <Crown className="w-5 h-5 text-yellow-500" />}
                  {plan.name === 'Essential' && <Zap className="w-5 h-5 text-purple-500" />}
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground"> {plan.billing}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation) => (
                    <div key={limitation} className="flex items-center gap-2 opacity-50">
                      <span className="w-4 h-4 flex-shrink-0 text-center">×</span>
                      <span className="text-sm line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All paid plans come with a 14-day free trial. No credit card required to start your trial.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for your convenience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get a refund?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}