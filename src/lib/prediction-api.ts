// lib/prediction-api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Prediction {
  symbol: string;
  probability: number;
  confidence: number;
  interpretation: string;
  current_price: number;
  factors: {
    base_rate: number;
    reddit_adjustment: number;
    news_adjustment: number;
  };
}

export interface Briefing {
  predictions: Prediction[];
  generated_at: string;
  total_count: number;
}

export class PredictionAPI {
  static async getPrediction(symbol: string): Promise<Prediction> {
    try {
      const response = await fetch(`${API_URL}/predict/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
      return await response.json();
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  }

  static async getDailyBriefing(): Promise<Briefing> {
    try {
      const response = await fetch(`${API_URL}/briefing`);
      if (!response.ok) throw new Error('Failed to fetch briefing');
      return await response.json();
    } catch (error) {
      console.error('Error fetching briefing:', error);
      throw error;
    }
  }

  static async getHistory(symbol: string, limit: number = 10): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/history/${symbol}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }
}