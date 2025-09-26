-- Add missing columns to prediction_results table
ALTER TABLE public.prediction_results 
ADD COLUMN IF NOT EXISTS symbol TEXT,
ADD COLUMN IF NOT EXISTS prediction_date DATE,
ADD COLUMN IF NOT EXISTS predicted_high NUMERIC,
ADD COLUMN IF NOT EXISTS predicted_low NUMERIC,
ADD COLUMN IF NOT EXISTS predicted_close NUMERIC,
ADD COLUMN IF NOT EXISTS rank INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score INTEGER;

-- Add unique constraint on prediction_id
ALTER TABLE public.prediction_results 
ADD CONSTRAINT unique_prediction_id UNIQUE (prediction_id);

-- Add sample prediction results for yesterday (2025-09-25)
INSERT INTO public.prediction_results (
    prediction_id, 
    symbol, 
    prediction_date,
    predicted_high,
    predicted_low,
    predicted_close,
    actual_high,
    actual_low, 
    actual_close,
    actual_volume,
    high_accuracy,
    low_accuracy,
    close_accuracy,
    direction_correct,
    rank,
    confidence_score,
    recorded_at
)
SELECT 
    p.id,
    p.symbol,
    p.prediction_date,
    p.predicted_high,
    p.predicted_low,
    p.predicted_close,
    p.predicted_high * (0.98 + RANDOM() * 0.04) as actual_high,
    p.predicted_low * (0.98 + RANDOM() * 0.04) as actual_low,
    p.predicted_close * (0.97 + RANDOM() * 0.06) as actual_close,
    (1000000 + (RANDOM() * 5000000))::bigint as actual_volume,
    (75 + (RANDOM() * 20))::numeric as high_accuracy,
    (70 + (RANDOM() * 25))::numeric as low_accuracy,
    (65 + (RANDOM() * 30))::numeric as close_accuracy,
    CASE WHEN RANDOM() > 0.3 THEN true ELSE false END as direction_correct,
    p.rank,
    p.overall_confidence,
    NOW() - INTERVAL '1 day'
FROM enhanced_daily_predictions p 
WHERE p.prediction_date = '2025-09-25'
LIMIT 20;

-- Add historical performance data for trend visualization
INSERT INTO public.algorithm_performance (
    date, algorithm_version, total_predictions, directional_accuracy,
    high_accuracy_avg, low_accuracy_avg, close_accuracy_avg,
    average_confidence, confidence_calibration, trending_market_accuracy,
    choppy_market_accuracy, high_volatility_accuracy, low_volatility_accuracy,
    confidence_accuracy_correlation, best_performing_signal, worst_performing_signal
) VALUES 
    ('2025-09-24', 'v1.0', 20, 0.68, 0.72, 0.70, 0.69, 0.75, 0.07, 0.74, 0.62, 0.59, 0.77, 0.42, 'options_flow', 'news_sentiment'),
    ('2025-09-23', 'v1.0', 20, 0.73, 0.79, 0.78, 0.75, 0.78, -0.05, 0.81, 0.65, 0.68, 0.88, 0.51, 'technical_analysis', 'macro_data'),
    ('2025-09-22', 'v1.0', 20, 0.65, 0.71, 0.73, 0.68, 0.72, 0.07, 0.72, 0.58, 0.52, 0.78, 0.38, 'microstructure', 'news_sentiment'),
    ('2025-09-21', 'v1.0', 20, 0.70, 0.76, 0.74, 0.71, 0.74, 0.04, 0.78, 0.62, 0.63, 0.81, 0.45, 'technical_analysis', 'macro_data'),
    ('2025-09-20', 'v1.0', 20, 0.75, 0.81, 0.79, 0.77, 0.76, 0.01, 0.83, 0.67, 0.71, 0.85, 0.53, 'options_flow', 'news_sentiment')
ON CONFLICT (date) DO NOTHING;