import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Calculator, Shield, Clock, Target } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface OptionsOpportunity {
  id: string;
  analysis_date: string;
  category: 'spreads' | 'combinations' | 'directional' | 'income';
  strategy_type: string;
  rank: number;
  underlying_symbol: string;
  underlying_price: number;
  strategy_name: string;
  expiration_date: string;
  days_to_expiration: number;
  cost_basis: number;
  max_profit: number;
  max_loss: number;
  roi_percentage: number | null;
  probability_of_profit: number | null;
  risk_score: number | null;
  risk_category: string | null;
  primary_factors: any;
  educational_explanation: string;
  risk_discussion: string;
  strategy_mechanics: string;
  confidence_score: number | null;
  implied_volatility: number | null;
  option_legs: OptionLeg[];
}

interface OptionLeg {
  option_symbol: string;
  option_type: 'call' | 'put';
  strike_price: number;
  action: 'buy' | 'sell';
  quantity: number;
  mid_price: number;
}

const OptionsValueTool = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<{
    spreads: OptionsOpportunity[];
    combinations: OptionsOpportunity[];
    directional: OptionsOpportunity[];
    income: OptionsOpportunity[];
  }>({
    spreads: [],
    combinations: [],
    directional: [],
    income: []
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('spreads');
  const [loading, setLoading] = useState(true);
  const [showRiskDisclaimer, setShowRiskDisclaimer] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    checkUserTier();
    if (!riskAccepted) {
      setShowRiskDisclaimer(true);
    } else {
      loadOpportunities();
    }
  }, [riskAccepted]);

  const checkUserTier = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setUserTier(data.subscription_tier || 'free');
    }
  };

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('options_opportunities')
        .select(`
          *,
          option_legs (*)
        `)
        .eq('analysis_date', today)
        .order('rank', { ascending: true });

      if (error) {
        console.error('Error loading opportunities:', error);
        toast.error('Failed to load options opportunities');
        return;
      }

      if (data) {
        const grouped = {
          spreads: data.filter(d => d.category === 'spreads') as OptionsOpportunity[],
          combinations: data.filter(d => d.category === 'combinations') as OptionsOpportunity[],
          directional: data.filter(d => d.category === 'directional') as OptionsOpportunity[],
          income: data.filter(d => d.category === 'income') as OptionsOpportunity[]
        };
        setOpportunities(grouped);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAcceptance = async () => {
    if (!user) return;

    try {
      await supabase
        .from('options_user_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'risk_acceptance',
          risk_disclaimer_accepted: true
        });

      setRiskAccepted(true);
      setShowRiskDisclaimer(false);
      toast.success('Risk disclaimer accepted. Loading opportunities...');
    } catch (error) {
      console.error('Error recording risk acceptance:', error);
    }
  };

  const trackOpportunityView = async (opportunityId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('options_user_interactions')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          interaction_type: 'view'
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return "bg-emerald-100 text-emerald-800";
    if (riskScore <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isAccessible = (rank: number) => {
    return userTier !== 'free' || rank >= 11;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={showRiskDisclaimer} onOpenChange={setShowRiskDisclaimer}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-500" />
              Options Trading Risk Disclosure
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-4">
              <p className="font-semibold text-foreground">
                IMPORTANT: This tool is for educational purposes only and does not constitute financial advice.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Key Risks:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Options trading involves substantial risk and is not suitable for all investors</li>
                  <li>You can lose 100% of your investment in options</li>
                  <li>Complex strategies may involve multiple commissions</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>All probability calculations are estimates based on theoretical models</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                By proceeding, you acknowledge that you understand these risks and that this information 
                is provided for educational analysis only. Always consult with a qualified financial 
                advisor before making investment decisions.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRiskAcceptance}>
              I Understand the Risks - Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Options Value Tool</h1>
          <p className="text-muted-foreground">
            Daily analysis of the top 20 opportunities in each strategy category
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Analysis Date</p>
          <p className="font-semibold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {userTier === 'free' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Free Tier Access</p>
                <p className="text-sm text-amber-700">
                  You can view opportunities ranked 11-20 in each category. 
                  Upgrade to Essential or Pro to access the top 10 highest-value opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spreads">
            Spreads ({opportunities.spreads.length})
          </TabsTrigger>
          <TabsTrigger value="combinations">
            Combinations ({opportunities.combinations.length})
          </TabsTrigger>
          <TabsTrigger value="directional">
            Directional ({opportunities.directional.length})
          </TabsTrigger>
          <TabsTrigger value="income">
            Income ({opportunities.income.length})
          </TabsTrigger>
        </TabsList>

        {(['spreads', 'combinations', 'directional', 'income'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-4 mt-6">
            {opportunities[category].length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
                  <p className="text-muted-foreground">
                    No {category} opportunities were identified for today's analysis.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {opportunities[category].map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isAccessible={isAccessible(opportunity.rank)}
                    onView={() => trackOpportunityView(opportunity.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface OpportunityCardProps {
  opportunity: OptionsOpportunity;
  isAccessible: boolean;
  onView: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  opportunity, 
  isAccessible, 
  onView 
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return "bg-emerald-100 text-emerald-800";
    if (riskScore <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleExpand = () => {
    if (isAccessible) {
      setExpanded(!expanded);
      onView();
    }
  };

  return (
    <Card className={`${!isAccessible ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">
              #{opportunity.rank}
            </Badge>
            <div>
              <CardTitle className="text-lg">
                {opportunity.underlying_symbol} - {opportunity.strategy_name}
              </CardTitle>
              <CardDescription>
                {opportunity.strategy_type} • Expires {new Date(opportunity.expiration_date).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getRiskColor(opportunity.risk_score)}>
              Risk: {opportunity.risk_score}/10
            </Badge>
            {!isAccessible && (
              <Badge variant="secondary">Premium Only</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Max Profit</p>
            <p className="font-semibold text-emerald-600">
              {isAccessible ? formatCurrency(opportunity.max_profit) : '***'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Max Loss</p>
            <p className="font-semibold text-red-600">
              {isAccessible ? formatCurrency(Math.abs(opportunity.max_loss)) : '***'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">ROI Potential</p>
            <p className="font-semibold">
              {isAccessible ? `${opportunity.roi_percentage?.toFixed(1)}%` : '***'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Profit Probability</p>
            <p className="font-semibold">
              {isAccessible ? `${opportunity.probability_of_profit?.toFixed(1)}%` : '***'}
            </p>
          </div>
        </div>

        {isAccessible && expanded && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <h4 className="font-semibold mb-2">Strategy Details</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">{opportunity.strategy_mechanics}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Option Legs</h4>
              <div className="space-y-2">
                {opportunity.option_legs?.map((leg, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                    <span className={leg.action === 'buy' ? 'text-emerald-600' : 'text-red-600'}>
                      {leg.action.toUpperCase()} {leg.quantity} {leg.option_symbol}
                    </span>
                    <span>{leg.option_type} @ ${leg.strike_price}</span>
                    <span>{formatCurrency(leg.mid_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Why This Opportunity Exists</h4>
              <p className="text-sm text-muted-foreground">{opportunity.educational_explanation}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-red-600">Risk Considerations</h4>
              <p className="text-sm text-muted-foreground">{opportunity.risk_discussion}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {opportunity.days_to_expiration} days to expiration
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExpand}
            disabled={!isAccessible}
          >
            {expanded ? 'Less Details' : 'More Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsValueTool;