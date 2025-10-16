import { describe, it, expect } from 'vitest';
import {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  calculateZScore,
  calculateADX,
  calculateATR,
  calculateVolumeProfile,
} from '../indicators';
import type { PriceBar } from '../indicators';

describe('calculateRSI', () => {
  it('should return a value between 0 and 100', () => {
    const prices = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28];
    const rsi = calculateRSI(prices, 14);
    expect(rsi).toBeGreaterThanOrEqual(0);
    expect(rsi).toBeLessThanOrEqual(100);
  });

  it('should return ~100 for consistently increasing prices', () => {
    const increasingPrices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    const rsi = calculateRSI(increasingPrices, 14);
    expect(rsi).toBeGreaterThan(95);
    expect(rsi).toBeLessThanOrEqual(100);
  });

  it('should return ~0 for consistently decreasing prices', () => {
    const decreasingPrices = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
    const rsi = calculateRSI(decreasingPrices, 14);
    expect(rsi).toBeLessThan(5);
    expect(rsi).toBeGreaterThanOrEqual(0);
  });

  it('should calculate correctly for known data', () => {
    const knownData = [
      44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89,
      46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64
    ];
    const rsi = calculateRSI(knownData, 14);
    expect(rsi).toBeGreaterThan(50);
    expect(rsi).toBeLessThan(65);
  });

  it('should throw error with insufficient data', () => {
    const insufficientData = [44, 45, 46];
    expect(() => calculateRSI(insufficientData, 14)).toThrow();
  });
});

describe('calculateSMA', () => {
  it('should calculate simple moving average correctly', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma = calculateSMA(prices, 5);
    expect(sma).toBe(30);
  });

  it('should use only last N prices', () => {
    const prices = [5, 10, 20, 30, 40, 50];
    const sma = calculateSMA(prices, 5);
    expect(sma).toBe(30); // (10 + 20 + 30 + 40 + 50) / 5
  });

  it('should throw error with insufficient data', () => {
    const insufficientData = [10, 20];
    expect(() => calculateSMA(insufficientData, 5)).toThrow();
  });
});

describe('calculateEMA', () => {
  it('should give more weight to recent prices than SMA', () => {
    const prices = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 30]; // Sharp increase at end
    const sma = calculateSMA(prices, 5);
    const ema = calculateEMA(prices, 5);
    
    // EMA should be higher than SMA due to recent price spike
    expect(ema).toBeGreaterThan(sma);
  });

  it('should calculate EMA correctly', () => {
    const prices = [22, 23, 24, 25, 26];
    const ema = calculateEMA(prices, 5);
    expect(ema).toBeGreaterThan(22);
    expect(ema).toBeLessThanOrEqual(26);
  });

  it('should throw error with insufficient data', () => {
    const insufficientData = [10, 20];
    expect(() => calculateEMA(insufficientData, 5)).toThrow();
  });
});

describe('calculateMACD', () => {
  it('should return object with macd, signal, and histogram', () => {
    const prices = Array.from({ length: 40 }, (_, i) => 100 + i);
    const result = calculateMACD(prices);
    
    expect(result).toHaveProperty('macd');
    expect(result).toHaveProperty('signal');
    expect(result).toHaveProperty('histogram');
    expect(typeof result.macd).toBe('number');
    expect(typeof result.signal).toBe('number');
    expect(typeof result.histogram).toBe('number');
  });

  it('should have positive MACD in uptrend', () => {
    const uptrend = Array.from({ length: 60 }, (_, i) => 100 + i * 2);
    const result = calculateMACD(uptrend);
    
    expect(result.macd).toBeGreaterThan(0);
  });

  it('should throw error with insufficient data', () => {
    const insufficientData = [100, 101, 102];
    expect(() => calculateMACD(insufficientData)).toThrow();
  });
});

describe('calculateBollingerBands', () => {
  it('should have upper > middle > lower', () => {
    const prices = [100, 102, 101, 103, 102, 104, 103, 105, 104, 106, 105, 107, 106, 108, 107, 109, 108, 110, 109, 111];
    const bands = calculateBollingerBands(prices, 20, 2);
    
    expect(bands.upper).toBeGreaterThan(bands.middle);
    expect(bands.middle).toBeGreaterThan(bands.lower);
  });

  it('should have middle equal to SMA', () => {
    const prices = [100, 102, 101, 103, 102, 104, 103, 105, 104, 106, 105, 107, 106, 108, 107, 109, 108, 110, 109, 111];
    const bands = calculateBollingerBands(prices, 20, 2);
    const sma = calculateSMA(prices, 20);
    
    expect(bands.middle).toBeCloseTo(sma, 5);
  });

  it('should calculate bandwidth', () => {
    const prices = [100, 102, 101, 103, 102, 104, 103, 105, 104, 106, 105, 107, 106, 108, 107, 109, 108, 110, 109, 111];
    const bands = calculateBollingerBands(prices, 20, 2);
    
    expect(bands.bandwidth).toBeGreaterThan(0);
    expect(bands.bandwidth).toBeLessThan(100);
  });
});

describe('calculateZScore', () => {
  it('should return positive for price above average', () => {
    const prices = [98, 99, 100, 101, 102, 99, 100, 101, 98, 99, 100, 101, 102, 99, 100, 101, 98, 99, 100, 101];
    const currentPrice = 110;
    const zScore = calculateZScore(currentPrice, prices, 20);
    
    expect(zScore).toBeGreaterThan(0);
  });

  it('should return negative for price below average', () => {
    const prices = [98, 99, 100, 101, 102, 99, 100, 101, 98, 99, 100, 101, 102, 99, 100, 101, 98, 99, 100, 101];
    const currentPrice = 90;
    const zScore = calculateZScore(currentPrice, prices, 20);
    
    expect(zScore).toBeLessThan(0);
  });

  it('should handle zero volatility', () => {
    const prices = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
    const currentPrice = 100;
    const zScore = calculateZScore(currentPrice, prices, 20);
    
    expect(zScore).toBe(0);
  });
});

describe('calculateADX', () => {
  const createBars = (count: number, trend: 'up' | 'down' | 'sideways'): PriceBar[] => {
    return Array.from({ length: count }, (_, i) => {
      let base = 100;
      if (trend === 'up') base += i;
      if (trend === 'down') base -= i;
      
      return {
        open: base,
        high: base + 1,
        low: base - 1,
        close: base + 0.5,
        volume: 1000000,
        timestamp: new Date(Date.now() + i * 86400000),
      };
    });
  };

  it('should return object with adx, plusDI, and minusDI', () => {
    const bars = createBars(30, 'up');
    const result = calculateADX(bars, 14);
    
    expect(result).toHaveProperty('adx');
    expect(result).toHaveProperty('plusDI');
    expect(result).toHaveProperty('minusDI');
  });

  it('should have ADX between 0 and 100', () => {
    const bars = createBars(30, 'up');
    const result = calculateADX(bars, 14);
    
    expect(result.adx).toBeGreaterThanOrEqual(0);
    expect(result.adx).toBeLessThanOrEqual(100);
  });

  it('should have +DI > -DI in uptrend', () => {
    const bars = createBars(30, 'up');
    const result = calculateADX(bars, 14);
    
    expect(result.plusDI).toBeGreaterThan(result.minusDI);
  });
});

describe('calculateATR', () => {
  const createBars = (count: number): PriceBar[] => {
    return Array.from({ length: count }, (_, i) => ({
      open: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 102 + i,
      volume: 1000000,
      timestamp: new Date(Date.now() + i * 86400000),
    }));
  };

  it('should return a positive number', () => {
    const bars = createBars(20);
    const atr = calculateATR(bars, 14);
    
    expect(atr).toBeGreaterThan(0);
  });

  it('should throw error with insufficient data', () => {
    const bars = createBars(5);
    expect(() => calculateATR(bars, 14)).toThrow();
  });
});

describe('calculateVolumeProfile', () => {
  const createBars = (count: number, highVolumeAtEnd: boolean = false): PriceBar[] => {
    return Array.from({ length: count }, (_, i) => ({
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: highVolumeAtEnd && i === count - 1 ? 5000000 : 1000000,
      timestamp: new Date(Date.now() + i * 86400000),
    }));
  };

  it('should return avgVolume, volumeRatio, and isAboveAverage', () => {
    const bars = createBars(20);
    const result = calculateVolumeProfile(bars, 20);
    
    expect(result).toHaveProperty('avgVolume');
    expect(result).toHaveProperty('volumeRatio');
    expect(result).toHaveProperty('isAboveAverage');
  });

  it('should detect high volume at end', () => {
    const bars = createBars(20, true);
    const result = calculateVolumeProfile(bars, 20);
    
    expect(result.isAboveAverage).toBe(true);
    expect(result.volumeRatio).toBeGreaterThan(1);
  });
});
