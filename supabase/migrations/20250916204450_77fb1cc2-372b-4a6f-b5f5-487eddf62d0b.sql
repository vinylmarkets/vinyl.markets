-- Trigger generation of a new briefing with updated styling
SELECT supabase.functions.invoke('generate-briefing-content', json_build_object(
  'category', 'market-structure',
  'stockSymbols', ARRAY['AAPL', 'MSFT', 'GOOGL'],
  'userPreferences', json_build_object(
    'explanation_mode', 'plain_speak',
    'risk_tolerance', 'conservative'
  )
));