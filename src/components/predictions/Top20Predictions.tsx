import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PredictionCard } from "./PredictionCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Trophy, Target, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Prediction {
  id: string;
  rank: number;
  symbol: string;
  company_name: string;
  previous_close: number;
  predicted_high: number;
  predicted_low: number;
  predicted_close: number;
  overall_confidence: number;
  expected_gain_percentage: number;
  volatility_estimate: number | null;
  risk_score: number;
  estimated_high_time: string | null;
  estimated_low_time: string | null;
  market_phase_prediction: string | null;
  explanation: string;
  primary_factors: any;
  model_agreement_score: number | null;
  created_at: string;
}

interface PerformanceMetrics {
  directional_accuracy: number;
  close_accuracy_avg: number;
  confidence_calibration: number;
  total_predictions: number;
}

export function Top20Predictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<'free' | 'essential' | 'pro'>('free');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      fetchUserTier();
    }
    fetchPredictions();
    fetchPerformance();
  }, [user, selectedDate]);

  const fetchUserTier = async () => {
    // Temporarily set to pro tier for testing
    setUserTier('pro');
    
    /* Original code for when payments are ready:
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user?.id)
        .single();
      
      if (data && data.subscription_tier) {
        const tier = data.subscription_tier as 'free' | 'essential' | 'pro';
        setUserTier(tier);
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
    }
    */
  };

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('enhanced_daily_predictions')
        .select('*')
        .eq('prediction_date', selectedDate)
        .order('rank', { ascending: true });

      if (error) throw error;
      
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('algorithm_performance')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPerformance(data[0]);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const trackPredictionView = async (predictionIds: number[]) => {
    if (!user) return;
    
    try {
      await supabase
        .from('prediction_views')
        .insert({
          user_id: user.id,
          prediction_date: selectedDate,
          interaction_type: 'view',
          predictions_viewed: predictionIds
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  useEffect(() => {
    if (predictions.length > 0 && user) {
      const visiblePredictions = userTier === 'free' 
        ? predictions.filter(p => p.rank >= 11).map(p => p.rank)
        : predictions.map(p => p.rank);
      
      trackPredictionView(visiblePredictions);
    }
  }, [predictions, user, userTier]);

  const freePredictions = predictions.filter(p => p.rank >= 11);
  const premiumPredictions = predictions.filter(p => p.rank <= 10);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading TOP 20 predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Daily Stock Analytics</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          The top 20 stock briefings on the top stocks our algorithm projects moving during trading today. 
          These are not predictions, but a statistical analysis with an explanation of the signals our model factors in. 
          Each day we choose 20 stocks to highlight. All users receive the same analysis.
        </p>
        
        {/* Performance Metrics */}
        {performance && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card className="p-3 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-muted-foreground">Direction Accuracy</p>
                <p className="font-bold text-lg">{performance.directional_accuracy}%</p>
              </div>
            </Card>
            <Card className="p-3 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-muted-foreground">Price Accuracy</p>
                <p className="font-bold text-lg">{performance.close_accuracy_avg.toFixed(1)}%</p>
              </div>
            </Card>
            <Card className="p-3 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-bold text-lg">{performance.confidence_calibration}%</p>
              </div>
            </Card>
            <Card className="p-3 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <AlertCircle className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-xs text-muted-foreground">Predictions</p>
                <p className="font-bold text-lg">{performance.total_predictions}</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Date Selector */}
      <div className="flex justify-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {predictions.length === 0 ? (
        <Card className="text-center p-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Predictions Available</h3>
          <p className="text-muted-foreground">
            Predictions for {selectedDate} are not yet available. Check back during market hours.
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Predictions</TabsTrigger>
            <TabsTrigger value="free">Free (11-20)</TabsTrigger>
            <TabsTrigger value="premium">
              Premium (1-10)
              {userTier === 'free' && <Badge variant="secondary" className="ml-1">🔒</Badge>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="grid gap-4">
              {predictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  isPremium={prediction.rank <= 10}
                  userTier={userTier}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="free" className="space-y-4">
            <div className="grid gap-4">
              {freePredictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  isPremium={false}
                  userTier={userTier}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="premium" className="space-y-4">
            {userTier === 'free' && (
              <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-primary/20">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Unlock TOP 10 Predictions</h3>
                <p className="text-muted-foreground mb-4">
                  Get access to our highest-confidence stock predictions with detailed analysis
                </p>
                <Button size="lg">Upgrade to Essential</Button>
              </Card>
            )}
            
            <div className="grid gap-4">
              {premiumPredictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  isPremium={true}
                  userTier={userTier}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Educational Disclaimer */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">Educational Content Only</p>
            <p className="text-yellow-700">
              These predictions are for educational purposes and demonstrate algorithmic analysis techniques. 
              Not financial advice. Past performance does not guarantee future results. Always do your own research.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}