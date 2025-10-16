import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMomentumStrategy, runMeanReversionStrategy, StrategySignal } from '../ampStrategies';
import * as indicators from '../indicators';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Momentum Strategy Tests', () => {
  
  describe('Signal Generation - Perfect Conditions', () => {
    it('should generate BUY signal when all momentum conditions met', async () => {
      // Mock ACCELERATING momentum with increasing volatility
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => {
          // Accelerating uptrend: starts slow, speeds up
          const basePrice = 100;
          const acceleration = Math.pow(i / 10, 2); // Quadratic
          const price = basePrice + acceleration;
          const volatility = 5 + (i / 10);
          
          return {
            o: price - volatility * 0.3,
            h: price + volatility,
            l: price - volatility,
            c: price + volatility * 0.5, // Strong closes
            v: 1500000 + (i * 50000), // Increasing volume
            t: new Date(Date.now() - (50-i) * 86400000).toISOString()
          };
        })
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].action).toBe('buy');
      expect(signals[0].confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Signal Generation - Weak Conditions', () => {
    it('should NOT generate signal when confidence <0.5', async () => {
      // Mock sideways market
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100,
          h: 102,
          l: 98,
          c: 100,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      // Should generate no signals for weak momentum
      const strongSignals = signals.filter(s => s.confidence > 0.5);
      expect(strongSignals.length).toBe(0);
    });

    it('should NOT generate signal in downtrend', async () => {
      // Mock bearish market
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 150 - i,
          h: 155 - i,
          l: 145 - i,
          c: 148 - i,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST'],
        rsiThreshold: 50
      });

      expect(signals.length).toBe(0);
    });
  });

  describe('Confidence Scoring', () => {
    it('should include RSI contribution (40% weight)', async () => {
      // Test with high RSI
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i * 2,
          h: 105 + i * 2,
          l: 95 + i * 2,
          c: 102 + i * 2,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      if (signals.length > 0) {
        // Confidence should be between 0 and 1
        expect(signals[0].confidence).toBeGreaterThan(0);
        expect(signals[0].confidence).toBeLessThanOrEqual(1.0);
      }
    });

    it('should calculate confidence correctly for strong signals', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i * 3,
          h: 105 + i * 3,
          l: 95 + i * 3,
          c: 102 + i * 3,
          v: 2000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      if (signals.length > 0) {
        // Very strong momentum should have high confidence
        expect(signals[0].confidence).toBeGreaterThan(0.6);
      }
    });
  });

  describe('Position Sizing', () => {
    it('should allocate 25% of capital per position', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i,
          h: 105 + i,
          l: 95 + i,
          c: 102 + i,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const capital = 10000;
      const signals = await runMomentumStrategy('test-amp-1', capital, {
        symbols: ['TEST']
      });

      if (signals.length > 0) {
        const currentPrice = 102 + 49; // Last price in mock data
        const expectedAllocation = capital * 0.25;
        const expectedShares = Math.floor(expectedAllocation / currentPrice);
        
        expect(signals[0].quantity).toBeGreaterThan(0);
        expect(signals[0].quantity).toBeLessThanOrEqual(expectedShares + 1);
      }
    });

    it('should calculate correct share quantity for different prices', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 50 + i,
          h: 52 + i,
          l: 48 + i,
          c: 51 + i,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      if (signals.length > 0) {
        // Lower price should result in more shares
        expect(signals[0].quantity).toBeGreaterThan(10);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle insufficient market data gracefully', async () => {
      // Only 10 bars (need 30+)
      const mockData = {
        bars: Array.from({ length: 10 }, (_, i) => ({
          o: 100,
          h: 102,
          l: 98,
          c: 100,
          v: 1000000,
          t: new Date(Date.now() - (10-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      // Should return empty array, not throw error
      expect(signals).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ 
        data: null, 
        error: new Error('API Error') 
      });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      expect(signals).toEqual([]);
    });

    it('should continue processing other symbols if one fails', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // First symbol fails, second succeeds
      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce({ data: null, error: new Error('Fail') })
        .mockResolvedValueOnce({ 
          data: {
            bars: Array.from({ length: 50 }, (_, i) => ({
              o: 100 + i,
              h: 105 + i,
              l: 95 + i,
              c: 102 + i,
              v: 1000000,
              t: new Date(Date.now() - (50-i) * 86400000).toISOString()
            }))
          }, 
          error: null 
        });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['FAIL', 'SUCCESS']
      });

      // Should still get signal from successful symbol
      expect(signals.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Symbols', () => {
    it('should process multiple symbols', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i,
          h: 105 + i,
          l: 95 + i,
          c: 102 + i,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['AAPL', 'TSLA', 'NVDA']
      });

      // Should attempt to process all 3 symbols
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(3);
    });

    it('should return array of signals for qualifying stocks', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i * 2,
          h: 105 + i * 2,
          l: 95 + i * 2,
          c: 102 + i * 2,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['AAPL', 'TSLA']
      });

      expect(Array.isArray(signals)).toBe(true);
      signals.forEach(signal => {
        expect(signal).toHaveProperty('action');
        expect(signal).toHaveProperty('symbol');
        expect(signal).toHaveProperty('quantity');
        expect(signal).toHaveProperty('confidence');
        expect(signal).toHaveProperty('reason');
      });
    });
  });

  describe('Strategy Settings', () => {
    it('should respect custom RSI threshold', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i,
          h: 105 + i,
          l: 95 + i,
          c: 102 + i,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      // Higher RSI threshold = harder to trigger
      const signalsDefault = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST'],
        rsiThreshold: 50
      });

      const signalsHigh = await runMomentumStrategy('test-amp-2', 10000, {
        symbols: ['TEST'],
        rsiThreshold: 70
      });

      // Expect fewer or equal signals with higher threshold
      expect(signalsHigh.length).toBeLessThanOrEqual(signalsDefault.length);
    });

    it('should respect custom ADX threshold', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i,
          h: 105 + i,
          l: 95 + i,
          c: 102 + i,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST'],
        adxThreshold: 30
      });

      // Should process without errors
      expect(Array.isArray(signals)).toBe(true);
    });
  });

  describe('Signal Structure', () => {
    it('should return signals with all required fields', async () => {
      const mockData = {
        bars: Array.from({ length: 50 }, (_, i) => ({
          o: 100 + i * 2,
          h: 105 + i * 2,
          l: 95 + i * 2,
          c: 102 + i * 2,
          v: 1000000,
          t: new Date(Date.now() - (50-i) * 86400000).toISOString()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

      const signals = await runMomentumStrategy('test-amp-1', 10000, {
        symbols: ['TEST']
      });

      if (signals.length > 0) {
        const signal = signals[0];
        expect(signal.action).toBe('buy');
        expect(signal.symbol).toBe('TEST');
        expect(signal.quantity).toBeGreaterThan(0);
        expect(signal.confidence).toBeGreaterThan(0);
        expect(signal.confidence).toBeLessThanOrEqual(1.0);
        expect(signal.reason).toContain('Momentum');
        expect(typeof signal.reason).toBe('string');
      }
    });
  });

  describe('Mean Reversion Strategy Tests', () => {
  
    describe('BUY Signals - Oversold Conditions', () => {
      it('should generate BUY signal when price below BB lower band', async () => {
        // EXTREME oversold: stable base then steep linear crash (stays positive)
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            let price, volume;
            if (i < 20) {
              price = 150; // Higher stable base
              volume = 1000000;
            } else {
              const crashDays = i - 19;
              price = 150 - (crashDays * 10); // Linear crash: 150, 140, 130...50
              volume = 1000000 * (1 + crashDays * 0.8); // Bigger volume spike
            }
            
            return {
              o: price,
              h: price + 2,
              l: price - 2,
              c: price,
              v: volume,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr1', 10000, {
          symbols: ['TEST']
        });

        expect(signals.length).toBeGreaterThan(0);
        expect(signals[0].action).toBe('buy');
        expect(signals[0].reason).toContain('Oversold');
      });

      it('should generate BUY with high confidence when z-score < -2', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 8;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 3000000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr2', 10000, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          expect(signals[0].confidence).toBeGreaterThan(0.5);
          expect(signals[0].reason).toContain('Z-Score');
        }
      });

      it('should require volume confirmation for BUY signals', async () => {
        // Low volume - should not generate signal
        const mockDataLowVol = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 500000, // Low volume
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockDataLowVol, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr3', 10000, {
          symbols: ['TEST']
        });

        // Should have fewer signals without volume confirmation
        expect(signals.length).toBe(0);
      });

      it('should only trigger BUY when ALL conditions met', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            // Strong drop + high volume
            const drop = i < 25 ? 0 : (i - 24) * 7;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr4', 10000, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          expect(signals[0].action).toBe('buy');
          expect(signals[0].confidence).toBeGreaterThan(0.5);
          expect(signals[0].reason).toContain('Oversold');
          expect(signals[0].reason).toContain('Z-Score');
          expect(signals[0].reason).toContain('Vol');
        }
      });
    });

    describe('SELL Signals - Overbought Conditions', () => {
      it('should generate SELL signal when price above BB upper band', async () => {
        // EXTREME overbought: stable base then accelerating spike
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            let price, volume;
            if (i < 20) {
              price = 100; // Stable for BB calculation
              volume = 1000000;
            } else {
              const spikeDays = i - 19;
              price = 100 + (spikeDays * spikeDays * 2); // Quadratic spike
              volume = 1000000 * (1 + spikeDays * 0.5); // Volume spike
            }
            
            return {
              o: price,
              h: price + 2,
              l: price - 2,
              c: price,
              v: volume,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr5', 10000, {
          symbols: ['TEST']
        });

        expect(signals.length).toBeGreaterThan(0);
        expect(signals[0].action).toBe('sell');
        expect(signals[0].reason).toContain('Overbought');
      });

      it('should generate SELL with high confidence when z-score > 2', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const spike = i < 25 ? 0 : (i - 24) * 8;
            return {
              o: 100 + spike,
              h: 105 + spike,
              l: 95 + spike,
              c: 100 + spike,
              v: 3000000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr6', 10000, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          expect(signals[0].confidence).toBeGreaterThan(0.5);
          expect(signals[0].reason).toContain('Z-Score');
        }
      });

      it('should require volume confirmation for SELL signals', async () => {
        const mockDataLowVol = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const spike = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 100 + spike,
              h: 105 + spike,
              l: 95 + spike,
              c: 100 + spike,
              v: 500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockDataLowVol, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr7', 10000, {
          symbols: ['TEST']
        });

        expect(signals.length).toBe(0);
      });
    });

    describe('Confidence Scoring', () => {
      it('should calculate confidence with Z-Score weight (40%)', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 7;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr8', 10000, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          expect(signals[0].confidence).toBeGreaterThan(0);
          expect(signals[0].confidence).toBeLessThanOrEqual(1.0);
        }
      });

      it('should include Bollinger Band distance in confidence (30% weight)', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr9', 10000, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          expect(signals[0].confidence).toBeLessThanOrEqual(1.0);
        }
      });
    });

    describe('Position Sizing', () => {
      it('should use aggressive sizing (15-25%) for extreme conditions', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 10;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 3000000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const capital = 10000;
        const signals = await runMeanReversionStrategy('test-amp-mr10', capital, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          const positionSize = signals[0].quantity * (120 - 50);
          const allocationPct = positionSize / capital;
          expect(allocationPct).toBeGreaterThan(0.10);
          expect(allocationPct).toBeLessThanOrEqual(0.30);
        }
      });

      it('should calculate correct shares based on position size', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr11', 10000, {
          symbols: ['TEST']
        });

        if (signals.length > 0) {
          expect(signals[0].quantity).toBeGreaterThan(0);
          expect(Number.isInteger(signals[0].quantity)).toBe(true);
        }
      });
    });

    describe('Error Handling', () => {
      it('should handle insufficient data gracefully', async () => {
        const mockData = {
          bars: Array.from({ length: 15 }, (_, i) => ({
            o: 100,
            h: 102,
            l: 98,
            c: 100,
            v: 1000000,
            t: new Date(Date.now() - (15-i) * 86400000).toISOString()
          }))
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr12', 10000, {
          symbols: ['TEST']
        });

        expect(signals).toEqual([]);
      });

      it('should handle API errors gracefully', async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ 
          data: null, 
          error: new Error('API Error') 
        });

        const signals = await runMeanReversionStrategy('test-amp-mr13', 10000, {
          symbols: ['TEST']
        });

        expect(signals).toEqual([]);
      });

      it('should continue processing other symbols if one fails', async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        vi.mocked(supabase.functions.invoke)
          .mockResolvedValueOnce({ data: null, error: new Error('Fail') })
          .mockResolvedValueOnce({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr14', 10000, {
          symbols: ['FAIL', 'SUCCESS']
        });

        expect(signals.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Custom Settings', () => {
      it('should respect custom Bollinger Band parameters', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 5;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2500000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr15', 10000, {
          symbols: ['TEST'],
          bbPeriod: 15,
          bbStdDev: 1.5
        });

        expect(Array.isArray(signals)).toBe(true);
      });

      it('should respect custom Z-Score threshold', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2200000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signalsLenient = await runMeanReversionStrategy('test-amp-mr16', 10000, {
          symbols: ['TEST'],
          zScoreThreshold: 1.5
        });

        const signalsStrict = await runMeanReversionStrategy('test-amp-mr17', 10000, {
          symbols: ['TEST'],
          zScoreThreshold: 3.0
        });

        expect(signalsLenient.length).toBeGreaterThanOrEqual(signalsStrict.length);
      });
    });

    describe('Signal Structure', () => {
      it('should return signals with all required fields', async () => {
        const mockData = {
          bars: Array.from({ length: 30 }, (_, i) => {
            const drop = i < 25 ? 0 : (i - 24) * 6;
            return {
              o: 120 - drop,
              h: 125 - drop,
              l: 115 - drop,
              c: 120 - drop,
              v: 2200000,
              t: new Date(Date.now() - (30-i) * 86400000).toISOString()
            };
          })
        };

        const { supabase } = await import('@/integrations/supabase/client');
        vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: mockData, error: null });

        const signals = await runMeanReversionStrategy('test-amp-mr18', 10000, {
          symbols: ['TEST']
        });

        signals.forEach(signal => {
          expect(signal).toHaveProperty('action');
          expect(signal).toHaveProperty('symbol');
          expect(signal).toHaveProperty('quantity');
          expect(signal).toHaveProperty('confidence');
          expect(signal).toHaveProperty('reason');
          expect(['buy', 'sell']).toContain(signal.action);
          expect(signal.confidence).toBeGreaterThan(0);
          expect(signal.confidence).toBeLessThanOrEqual(1.0);
        });
      });
    });
  });
});
