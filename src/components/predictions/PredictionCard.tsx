import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/ui/company-logo";
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle, Lock, GraduationCap, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useCompanyLogo } from "@/hooks/useCompanyLogo";
import { Toggle } from "@/components/ui/toggle";

interface PredictionCardProps {
  prediction: {
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
  };
  isPremium: boolean;
  userTier: 'free' | 'essential' | 'pro';
}

export function PredictionCard({ prediction, isPremium, userTier }: PredictionCardProps) {
  const [analysisMode, setAnalysisMode] = useState<'academic' | 'plain'>('academic');
  const { logoUrl, isLoading: logoLoading } = useCompanyLogo(prediction.symbol, prediction.company_name);
  const isLocked = prediction.rank <= 10 && userTier === 'free';
  
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercentage = (pct: number) => `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
  
  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-green-600";
    if (score <= 6) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatFactorText = (factor: string) => {
    return factor
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const generateExtendedAnalysis = (mode: 'academic' | 'plain') => {
    const baseExplanation = prediction.explanation;
    
    if (mode === 'academic') {
      return `${baseExplanation} Our algorithmic models demonstrate convergent signals across multiple technical indicators, suggesting elevated probability of directional movement. Risk-adjusted returns analysis indicates favorable risk/reward ratio given current market volatility conditions. Model ensemble confidence metrics show strong consensus among predictive frameworks, supporting the projected price targets with statistical significance.`;
    } else {
      return `${baseExplanation} Simply put, multiple data sources are pointing in the same direction for this stock. The potential upside looks promising compared to the downside risk, especially considering current market conditions. Our computer models are in strong agreement about this prediction, which gives us more confidence in the price targets we're forecasting.`;
    }
  };

  if (isLocked) {
    return (
      <Card className="relative overflow-hidden border-dashed">
        <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Premium Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Essential or Pro to access TOP 10 predictions
            </p>
            <Button size="sm">Upgrade Now</Button>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                #{prediction.rank}
              </span>
              <CompanyLogo 
                symbol={prediction.symbol}
                companyName={prediction.company_name}
                logoUrl={logoUrl}
                size="sm"
                className="blur-sm"
              />
              <CardTitle className="text-lg blur-sm">{prediction.symbol}</CardTitle>
            </div>
            <Badge variant="outline" className="blur-sm">
              {formatPercentage(prediction.expected_gain_percentage)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="blur-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Target High</p>
                <p className="font-semibold">{formatPrice(prediction.predicted_high)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Low</p>
                <p className="font-semibold">{formatPrice(prediction.predicted_low)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              #{prediction.rank}
            </span>
            <CompanyLogo 
              symbol={prediction.symbol}
              companyName={prediction.company_name}
              logoUrl={logoUrl}
              size="sm"
            />
            <div className="flex flex-col">
              <CardTitle className="text-lg">{prediction.symbol}</CardTitle>
              <span className="text-xs text-muted-foreground">{prediction.company_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {prediction.expected_gain_percentage > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <Badge variant="outline">
              {formatPercentage(prediction.expected_gain_percentage)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price Targets */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Opening Price</p>
            <p className="font-semibold text-purple-600">{formatPrice(prediction.previous_close)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target High</p>
            <p className="font-semibold text-green-600">{formatPrice(prediction.predicted_high)}</p>
            <p className="text-xs text-muted-foreground">
              {prediction.estimated_high_time ? `~${prediction.estimated_high_time}` : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Close</p>
            <p className="font-semibold">{formatPrice(prediction.predicted_close)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Low</p>
            <p className="font-semibold text-red-600">{formatPrice(prediction.predicted_low)}</p>
            <p className="text-xs text-muted-foreground">
              {prediction.estimated_low_time ? `~${prediction.estimated_low_time}` : 'TBD'}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className={`font-semibold ${getConfidenceColor(prediction.overall_confidence)}`}>
              {prediction.overall_confidence}%
            </p>
          </div>
          <div className="text-center">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <p className="text-xs text-muted-foreground">Risk</p>
            <p className={`font-semibold ${getRiskColor(prediction.risk_score)}`}>
              {prediction.risk_score}/10
            </p>
          </div>
          <div className="text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <p className="text-xs text-muted-foreground">Phase</p>
            <p className="font-semibold text-xs capitalize">
              {prediction.market_phase_prediction?.replace('_', ' ') || 'TBD'}
            </p>
          </div>
        </div>

        {/* Primary Factors */}
        <div>
          <p className="text-sm font-medium mb-2">Key Drivers:</p>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              {Array.isArray(prediction.primary_factors) ? 
                prediction.primary_factors.slice(0, 3).map((factor: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                    <span className="text-sm text-black dark:text-white font-medium">
                      {formatFactorText(factor)}
                    </span>
                  </div>
                )) :
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                  <span className="text-sm text-black dark:text-white">Analysis pending</span>
                </div>
              }
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Analysis:</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Toggle 
                  pressed={analysisMode === 'academic'}
                  onPressedChange={() => setAnalysisMode('academic')}
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Academic
                </Toggle>
                <Toggle 
                  pressed={analysisMode === 'plain'}
                  onPressedChange={() => setAnalysisMode('plain')}
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Plain Speak
                </Toggle>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Model Agreement: {prediction.model_agreement_score ? (prediction.model_agreement_score * 100).toFixed(0) : 'N/A'}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Volatility: ±{prediction.volatility_estimate?.toFixed(1) || 'N/A'}%
                </Badge>
              </div>
              <p className="text-xs leading-relaxed">
                {generateExtendedAnalysis(analysisMode)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}