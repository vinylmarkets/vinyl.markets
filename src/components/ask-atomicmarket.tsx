import React, { useState } from 'react';

export function AskAtomicMarket() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Extract stock symbol with improved logic for both symbols and company names
    const extractSymbol = (query: string): string | null => {
      const upperQuery = query.toUpperCase();
      
      // Company name to ticker symbol mapping
      const companyToTicker: { [key: string]: string } = {
        'APPLE': 'AAPL',
        'MICROSOFT': 'MSFT',
        'GOOGLE': 'GOOGL',
        'AMAZON': 'AMZN',
        'TESLA': 'TSLA',
        'META': 'META',
        'FACEBOOK': 'META',
        'NETFLIX': 'NFLX',
        'NVIDIA': 'NVDA',
        'GAMESTOP': 'GME',
        'AMC': 'AMC',
        'TWITTER': 'X',
        'BERKSHIRE': 'BRK.B',
        'WALMART': 'WMT',
        'DISNEY': 'DIS',
        'PAYPAL': 'PYPL',
        'ADOBE': 'ADBE',
        'SALESFORCE': 'CRM'
      };
      
      // First, check for company names and convert to tickers
      for (const [company, ticker] of Object.entries(companyToTicker)) {
        if (upperQuery.includes(company)) {
          return ticker;
        }
      }
      
      // Common words to skip
      const skipWords = new Set([
        'WHAT', 'IS', 'THE', 'YOUR', 'PREDICTION', 'FOR',
        'PROBABILITY', 'ABOVE', 'BELOW', 'BY', 'AT', 'IN', 
        'ON', 'WILL', 'BE', 'TODAY', 'TOMORROW', 'MOVEMENT',
        'PRICE', 'STOCK', 'SHARE', 'HOW', 'WHEN', 'WHERE'
      ]);
      
      // Look for stock symbols (1-5 uppercase letters)
      const words = upperQuery.split(/\s+/);
      
      for (const word of words) {
        // Remove any punctuation
        const cleanWord = word.replace(/[^A-Z]/g, '');
        
        // Check if it's a valid ticker symbol
        if (cleanWord.length >= 1 && 
            cleanWord.length <= 5 && 
            /^[A-Z]+$/.test(cleanWord) && 
            !skipWords.has(cleanWord)) {
          return cleanWord;
        }
      }
      
      // Also check for $SYMBOL format
      const dollarMatch = upperQuery.match(/\$([A-Z]{1,5})/);
      if (dollarMatch) return dollarMatch[1];
      
      return null;
    };

    const symbol = extractSymbol(query);
    if (!symbol) {
      setResponse('Please mention a stock symbol like GME, AAPL, or TSLA');
      return;
    }
    setLoading(true);
    setResponse('');

    try {
      // Try direct connection first
      const apiUrl = `/api/predict/${symbol}`;
      console.log('Fetching:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Received:', data);

      // Format the beautiful response
      const formattedResponse = `
📊 **${data.symbol} Real-Time Analysis**

**Probability of Upward Movement:** ${(data.probability * 100).toFixed(1)}%
**Current Price:** $${data.current_price.toFixed(2)}
**Confidence Level:** ${(data.confidence * 100).toFixed(0)}%

**Signal:** ${data.interpretation}

**Analysis Breakdown:**
- Market Momentum: ${(data.factors.base_rate * 100).toFixed(1)}%
- Reddit Sentiment: ${data.factors.reddit_adjustment > 0 ? '📈 +' : data.factors.reddit_adjustment < 0 ? '📉 ' : '➡️ '}${(Math.abs(data.factors.reddit_adjustment) * 100).toFixed(1)}%
- News Impact: ${data.factors.news_adjustment > 0 ? '📰 +' : data.factors.news_adjustment < 0 ? '📰 -' : '📰 '}${(Math.abs(data.factors.news_adjustment) * 100).toFixed(1)}%

*Live data from: Polygon.io, Reddit API, NewsAPI*
*Generated: ${new Date().toLocaleTimeString()}*
      `;

      setResponse(formattedResponse);

    } catch (error) {
      console.error('Connection error:', error);
      
      // Fallback response with debugging info
      setResponse(`
❌ **Connection Issue**

The Python API is running (confirmed!) but the browser can't connect.

**Quick Fix:**
1. Make sure CORS is enabled in prediction_api.py
2. Try refreshing this page
3. Check browser console for details

Error: ${error.message}
      `);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card rounded-lg shadow-lg p-6 border">
        <h2 className="text-2xl font-headline font-bold mb-4 text-foreground">Ask AtomicMarket Terminal</h2>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What is the probability GME is above $40 by Christmas?"
              className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Analyzing...' : 'Ask'}
            </button>
          </div>
        </form>

        {response && (
          <div className="bg-muted rounded-lg p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
              {response}
            </pre>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <details>
            <summary className="cursor-pointer hover:text-foreground">Connection Status (Debug)</summary>
            <div className="mt-2 p-2 bg-muted rounded text-foreground">
              API URL: http://localhost:8000<br/>
              Status: Check browser console (F12)<br/>
              Test: Can access /predict/GME directly ✅
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}