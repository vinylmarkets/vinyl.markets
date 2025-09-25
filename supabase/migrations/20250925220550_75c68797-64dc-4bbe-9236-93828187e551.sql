-- Insert sample options opportunities for testing
INSERT INTO options_opportunities (
    analysis_date, category, strategy_type, rank, underlying_symbol, underlying_price,
    strategy_name, expiration_date, days_to_expiration, cost_basis, max_profit, max_loss,
    roi_percentage, probability_of_profit, risk_score, risk_category,
    implied_volatility, primary_factors, educational_explanation, risk_discussion, strategy_mechanics,
    confidence_score, legs
) VALUES
-- Spreads Category
(CURRENT_DATE, 'spreads', 'Iron Condor', 1, 'AAPL', 185.50, 'AAPL Iron Condor', CURRENT_DATE + INTERVAL '21 days', 21, -250.00, 250.00, -250.00, 100.0, 75.5, 4, 'moderate', 28.5, '["High IV environment", "Range-bound price action", "Time decay advantage"]'::jsonb, 'This iron condor benefits from AAPL trading in a tight range with elevated IV providing premium collection opportunities.', 'Maximum loss occurs if AAPL moves beyond the short strikes. Time decay works in favor if price stays between strikes.', 'Sell call spread and put spread simultaneously, collecting premium from both sides while price stays neutral.', 85, '[{"strike": 180, "type": "put", "action": "buy"}, {"strike": 185, "type": "put", "action": "sell"}, {"strike": 190, "type": "call", "action": "sell"}, {"strike": 195, "type": "call", "action": "buy"}]'::jsonb),

(CURRENT_DATE, 'spreads', 'Call Spread', 2, 'MSFT', 415.75, 'MSFT Bull Call Spread', CURRENT_DATE + INTERVAL '14 days', 14, -180.00, 320.00, -180.00, 177.8, 68.2, 5, 'moderate', 24.8, '["Bullish technicals", "Earnings momentum", "Support level hold"]'::jsonb, 'MSFT showing strong support at current levels with bullish momentum into earnings, making this spread attractive.', 'Risk limited to premium paid. Profit capped at spread width minus premium. Best if MSFT rises above short strike by expiration.', 'Buy lower strike call, sell higher strike call to reduce cost while maintaining upside exposure.', 78, '[{"strike": 410, "type": "call", "action": "buy"}, {"strike": 420, "type": "call", "action": "sell"}]'::jsonb),

-- Combinations Category  
(CURRENT_DATE, 'combinations', 'Long Straddle', 1, 'TSLA', 248.30, 'TSLA Earnings Straddle', CURRENT_DATE + INTERVAL '7 days', 7, -890.00, 2110.00, -890.00, 237.1, 45.8, 7, 'aggressive', 85.2, '["Earnings volatility", "IV crush setup", "Binary event catalyst"]'::jsonb, 'TSLA earnings expected to create significant price movement. High IV provides opportunity for volatility play.', 'Requires large price movement to overcome premium cost. IV crush after earnings is primary risk factor.', 'Buy both call and put at same strike to profit from large price movement in either direction.', 72, '[{"strike": 250, "type": "call", "action": "buy"}, {"strike": 250, "type": "put", "action": "buy"}]'::jsonb),

(CURRENT_DATE, 'combinations', 'Iron Butterfly', 2, 'NVDA', 126.80, 'NVDA Iron Butterfly', CURRENT_DATE + INTERVAL '28 days', 28, -125.00, 375.00, -125.00, 300.0, 62.4, 6, 'moderate', 42.1, '["Pin risk management", "High IV rank", "Neutral price action"]'::jsonb, 'NVDA showing consolidation pattern with high IV providing excellent butterfly setup for premium collection.', 'Maximum risk if price moves significantly away from center strike. Pin risk exists at expiration.', 'Sell straddle at center strike, buy protective wings to limit risk while collecting premium.', 68, '[{"strike": 120, "type": "call", "action": "buy"}, {"strike": 125, "type": "call", "action": "sell"}, {"strike": 125, "type": "put", "action": "sell"}, {"strike": 130, "type": "call", "action": "buy"}]'::jsonb),

-- Directional Category
(CURRENT_DATE, 'directional', 'Cash Secured Put', 1, 'AMD', 142.45, 'AMD Cash Secured Put', CURRENT_DATE + INTERVAL '35 days', 35, -485.00, 485.00, -14015.00, 3.5, 72.1, 3, 'conservative', 31.7, '["Strong support level", "High premium collection", "Assignment acceptable"]'::jsonb, 'AMD at strong technical support with high IV providing excellent premium for cash-secured put strategy.', 'Risk is owning AMD shares at strike price if assigned. Requires cash collateral equal to 100 shares.', 'Sell put at desired entry price, collect premium. Either keep premium if expires worthless or own stock at discount.', 88, '[{"strike": 140, "type": "put", "action": "sell"}]'::jsonb),

(CURRENT_DATE, 'directional', 'Covered Call', 2, 'SPY', 582.15, 'SPY Covered Call', CURRENT_DATE + INTERVAL '14 days', 14, 145.00, 145.00, -58070.00, 0.2, 81.3, 2, 'conservative', 18.9, '["Income generation", "Sideways market", "Reduce cost basis"]'::jsonb, 'SPY showing sideways action, making covered calls attractive for income generation on existing position.', 'Upside limited to strike price plus premium. Risk is opportunity cost if SPY rallies above strike.', 'Own 100 shares of SPY, sell call against position to generate income while holding shares.', 92, '[{"strike": 585, "type": "call", "action": "sell"}]'::jsonb),

-- Income Category
(CURRENT_DATE, 'income', 'Wheel Strategy', 1, 'QQQ', 512.80, 'QQQ Wheel Strategy', CURRENT_DATE + INTERVAL '21 days', 21, -780.00, 780.00, -51200.00, 1.5, 78.9, 3, 'conservative', 22.4, '["Systematic income", "IV advantage", "Long-term bullish"]'::jsonb, 'QQQ wheel strategy capitalizes on elevated IV while maintaining long-term bullish exposure through systematic approach.', 'Risk is owning QQQ shares during market downturns. Requires patience and conviction in long-term direction.', 'Sell puts to collect premium, if assigned sell calls against shares. Repeat cycle for consistent income.', 85, '[{"strike": 510, "type": "put", "action": "sell"}]'::jsonb),

(CURRENT_DATE, 'income', 'Jade Lizard', 2, 'IWM', 228.95, 'IWM Jade Lizard', CURRENT_DATE + INTERVAL '28 days', 28, 95.00, 405.00, -595.00, 42.8, 71.6, 5, 'moderate', 26.8, '["Bullish bias", "Credit collection", "Skew advantage"]'::jsonb, 'IWM jade lizard takes advantage of put/call skew while maintaining bullish bias and credit collection.', 'Undefined upside risk offset by credit received. Downside risk limited to short put strike minus credit.', 'Sell put, sell call spread above current price. Collect net credit while maintaining bullish exposure.', 74, '[{"strike": 225, "type": "put", "action": "sell"}, {"strike": 235, "type": "call", "action": "sell"}, {"strike": 240, "type": "call", "action": "buy"}]'::jsonb);

-- Add option legs data
INSERT INTO option_legs (
    opportunity_id, leg_number, option_symbol, option_type, strike_price, 
    expiration_date, action, quantity, mid_price
)
SELECT 
    oo.id,
    ROW_NUMBER() OVER (PARTITION BY oo.id ORDER BY leg->>'strike') as leg_number,
    oo.underlying_symbol || '_' || TO_CHAR(oo.expiration_date, 'MMDDYY') || '_' || (leg->>'strike') || (leg->>'type') as option_symbol,
    leg->>'type' as option_type,
    (leg->>'strike')::numeric as strike_price,
    oo.expiration_date,
    leg->>'action' as action,
    1 as quantity,
    (RANDOM() * 5 + 1)::numeric(10,2) as mid_price
FROM options_opportunities oo
CROSS JOIN LATERAL jsonb_array_elements(oo.legs) as leg
WHERE oo.analysis_date = CURRENT_DATE;