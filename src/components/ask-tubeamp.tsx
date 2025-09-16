// components/ask-tubeamp.tsx
import { useState } from 'react';
import { PredictionAPI, Prediction } from '@/lib/prediction-api';
import { Send } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AskTubeAmp() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Extract stock symbol from query (simple regex for now)
    const symbolMatch = query.toUpperCase().match(/\b[A-Z]{1,5}\b/);
    if (!symbolMatch) {
      alert('Please mention a stock symbol (e.g., AAPL, TSLA)');
      return;
    }

    setLoading(true);
    try {
      const prediction = await PredictionAPI.getPrediction(symbolMatch[0]);
      setResult(prediction);
    } catch (error) {
      console.error('Failed to get prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Ask TubeAmp Terminal</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about any stock... e.g., 'What's the outlook for AAPL?'"
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '...' : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {result && (
        <Card className="p-6 shadow-glow-amber transition-all duration-300">
          <h3 className="text-xl font-bold mb-2 text-foreground">{result.symbol} Analysis</h3>
          <div className="space-y-3">
            <p className="text-lg text-foreground">{result.interpretation}</p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="font-semibold text-foreground">{(result.probability * 100).toFixed(1)}% UP</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="font-semibold text-foreground">{(result.confidence * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="font-semibold text-foreground">${result.current_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}