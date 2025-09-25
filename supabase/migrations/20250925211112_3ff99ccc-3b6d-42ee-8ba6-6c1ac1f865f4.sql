-- Fix the percentage data to be stored as decimals (0-1 range) instead of whole numbers
UPDATE algorithm_performance 
SET 
    directional_accuracy = directional_accuracy / 100,
    high_accuracy_avg = high_accuracy_avg / 100,
    low_accuracy_avg = low_accuracy_avg / 100,
    close_accuracy_avg = close_accuracy_avg / 100,
    confidence_calibration = confidence_calibration / 100,
    average_confidence = average_confidence / 100,
    trending_market_accuracy = trending_market_accuracy / 100,
    choppy_market_accuracy = choppy_market_accuracy / 100,
    high_volatility_accuracy = high_volatility_accuracy / 100,
    low_volatility_accuracy = low_volatility_accuracy / 100,
    confidence_accuracy_correlation = CASE 
        WHEN confidence_accuracy_correlation > 1 THEN confidence_accuracy_correlation / 100 
        ELSE confidence_accuracy_correlation 
    END
WHERE date = '2025-09-25';