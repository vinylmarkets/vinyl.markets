import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Lightbulb, BookOpen } from "lucide-react";

interface TeachingAssistantProps {
  knowledgeMode: 'simple' | 'academic';
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
}

const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  simple: [
    {
      id: 'candle-basics',
      title: 'Reading Candles',
      content: 'Green candles mean price went up, red means it went down. The thicker part shows opening and closing prices!'
    },
    {
      id: 'volume-basics', 
      title: 'Understanding Volume',
      content: 'Volume bars show how many shares traded. High volume with price moves usually means the move is strong!'
    },
    {
      id: 'signals-basics',
      title: 'Trading Signals',
      content: 'When multiple strategies agree, you\'ll see arrows. Green = buy opportunity, red = sell opportunity!'
    }
  ],
  academic: [
    {
      id: 'technical-analysis',
      title: 'Technical Indicators',
      content: 'Moving averages smooth price action to identify trends. RSI measures momentum and overbought/oversold conditions.'
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      content: 'Position sizing and stop losses are crucial. Never risk more than 2% of your account on a single trade.'
    }
  ]
};

const CONTEXTUAL_TIPS = {
  simple: {
    greenCandle: 'Price went up during this period! 📈 More buyers than sellers pushed the price higher.',
    redCandle: 'Price went down during this period. 📉 More sellers than buyers.',
    volume: 'This shows how many shares traded. High volume = high interest from traders!',
    sma20: 'The orange line is the 20-day average price. When current price is above it, that\'s often bullish!',
    sma50: 'The purple line is the 50-day average. It shows the longer-term trend.',
    rsi: 'RSI below 30 means oversold (maybe time to buy?), above 70 means overbought (maybe time to sell?)'
  },
  academic: {
    greenCandle: 'Bullish price action. Volume confirmation recommended for signal validation.',
    redCandle: 'Bearish price action. Monitor for support levels and volume.',
    volume: 'Volume confirms price movements. Above-average volume validates breakouts.',
    sma20: '20 SMA crossover detected. Historical win rate varies by market conditions.',
    sma50: '50 SMA represents intermediate trend. Price above suggests bullish momentum.',
    rsi: 'RSI divergence patterns can signal trend reversals before price confirms.'
  }
};

export const TeachingAssistant: React.FC<TeachingAssistantProps> = ({ knowledgeMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<string | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const tutorials = TUTORIAL_STEPS[knowledgeMode];

  const showContextualTip = (tipKey: keyof typeof CONTEXTUAL_TIPS.simple) => {
    setCurrentTip(CONTEXTUAL_TIPS[knowledgeMode][tipKey]);
    setIsOpen(true);
  };

  const nextTutorial = () => {
    if (currentTutorial < tutorials.length - 1) {
      setCurrentTutorial(currentTutorial + 1);
    } else {
      setShowTutorial(false);
      setCurrentTutorial(0);
    }
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setCurrentTutorial(0);
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Assistant Button */}
      <div className="absolute bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90"
          size="sm"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-4 z-50 w-80">
          <Card className="shadow-xl border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">AI Trading Coach</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {showTutorial ? (
                /* Tutorial Mode */
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">
                      Tutorial {currentTutorial + 1}/{tutorials.length}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {tutorials[currentTutorial].title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tutorials[currentTutorial].content}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTutorial(false)}
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      onClick={nextTutorial}
                    >
                      {currentTutorial === tutorials.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              ) : currentTip ? (
                /* Contextual Tip */
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed">{currentTip}</p>
                  <Button
                    size="sm"
                    onClick={() => setCurrentTip(null)}
                    className="w-full"
                  >
                    Got it!
                  </Button>
                </div>
              ) : (
                /* Main Menu */
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {knowledgeMode === 'simple' 
                      ? "I'm here to help you learn trading basics! 📚"
                      : "Advanced trading insights and analysis available. 📈"
                    }
                  </p>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startTutorial}
                      className="w-full justify-start"
                    >
                      <BookOpen className="h-3 w-3 mr-2" />
                      Start Tutorial
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showContextualTip('greenCandle')}
                      className="w-full justify-start"
                    >
                      <Lightbulb className="h-3 w-3 mr-2" />
                      Explain Charts
                    </Button>
                  </div>

                  {/* Quick Tips */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium mb-2">Quick Tips:</p>
                    <div className="space-y-1">
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer text-xs"
                        onClick={() => showContextualTip('volume')}
                      >
                        📊 Volume Analysis
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer text-xs ml-1"
                        onClick={() => showContextualTip('sma20')}
                      >
                        📈 Moving Averages
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};