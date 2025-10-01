-- Create the Atomic Multi-Strategy Amp in the catalog
INSERT INTO amp_catalog (
  id,
  name,
  description,
  category,
  version,
  parameter_schema,
  default_settings
) VALUES (
  'atomic-multi-strategy-v1',
  'Atomic Multi-Strategy',
  'Combines momentum, mean reversion, and ML strategies with sector context analysis. Analyzes technical indicators (RSI, MACD, Bollinger Bands) and adjusts confidence based on sector strength and correlated stock movements.',
  'hybrid',
  '1.0.0',
  jsonb_build_object(
    'strategies', jsonb_build_object(
      'momentum_weight', jsonb_build_object('type', 'number', 'min', 0, 'max', 1, 'step', 0.05, 'default', 0.35, 'label', 'Momentum Strategy Weight', 'description', 'Weight given to momentum signals (RSI + MACD)'),
      'mean_reversion_weight', jsonb_build_object('type', 'number', 'min', 0, 'max', 1, 'step', 0.05, 'default', 0.35, 'label', 'Mean Reversion Weight', 'description', 'Weight given to mean reversion signals (Bollinger Bands)'),
      'ml_weight', jsonb_build_object('type', 'number', 'min', 0, 'max', 1, 'step', 0.05, 'default', 0.30, 'label', 'ML Strategy Weight', 'description', 'Weight given to machine learning predictions')
    ),
    'indicators', jsonb_build_object(
      'rsi_period', jsonb_build_object('type', 'number', 'min', 5, 'max', 30, 'step', 1, 'default', 14, 'label', 'RSI Period', 'description', 'Period for RSI calculation'),
      'rsi_oversold', jsonb_build_object('type', 'number', 'min', 20, 'max', 40, 'step', 5, 'default', 30, 'label', 'RSI Oversold Level', 'description', 'RSI level considered oversold'),
      'rsi_overbought', jsonb_build_object('type', 'number', 'min', 60, 'max', 80, 'step', 5, 'default', 70, 'label', 'RSI Overbought Level', 'description', 'RSI level considered overbought'),
      'bb_period', jsonb_build_object('type', 'number', 'min', 10, 'max', 30, 'step', 1, 'default', 20, 'label', 'Bollinger Bands Period', 'description', 'Period for BB calculation'),
      'bb_std_dev', jsonb_build_object('type', 'number', 'min', 1, 'max', 3, 'step', 0.5, 'default', 2, 'label', 'BB Standard Deviation', 'description', 'Standard deviations for band width')
    ),
    'context', jsonb_build_object(
      'use_sector_context', jsonb_build_object('type', 'toggle', 'default', true, 'label', 'Use Sector Context', 'description', 'Adjust confidence based on sector momentum'),
      'correlation_threshold', jsonb_build_object('type', 'number', 'min', 0.5, 'max', 0.9, 'step', 0.05, 'default', 0.7, 'label', 'Correlation Threshold', 'description', 'Minimum correlation to consider stocks related'),
      'min_strategy_confidence', jsonb_build_object('type', 'number', 'min', 60, 'max', 90, 'step', 5, 'default', 70, 'label', 'Minimum Strategy Confidence', 'description', 'Minimum confidence to generate signal')
    )
  ),
  jsonb_build_object(
    'momentum_weight', 0.35,
    'mean_reversion_weight', 0.35,
    'ml_weight', 0.30,
    'rsi_period', 14,
    'rsi_oversold', 30,
    'rsi_overbought', 70,
    'bb_period', 20,
    'bb_std_dev', 2,
    'use_sector_context', true,
    'correlation_threshold', 0.7,
    'min_strategy_confidence', 70
  )
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parameter_schema = EXCLUDED.parameter_schema,
  default_settings = EXCLUDED.default_settings;

-- Function to add default Amp to new users  
CREATE OR REPLACE FUNCTION add_default_amp_to_user()
RETURNS TRIGGER AS $$
DECLARE
  account_id UUID;
  new_amp_id UUID;
BEGIN
  -- Get the user's paper trading account
  SELECT id INTO account_id
  FROM paper_accounts
  WHERE user_id = NEW.id
  LIMIT 1;

  -- If no account exists yet, skip for now
  IF account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Add the Atomic Multi-Strategy Amp to the user's library (inactive by default)
  INSERT INTO user_amps (
    user_id,
    amp_id,
    name,
    is_active,
    allocated_capital,
    priority,
    display_order
  ) VALUES (
    NEW.id,
    'atomic-multi-strategy-v1',
    'Atomic Multi-Strategy',
    false,
    0,
    1,
    1
  )
  ON CONFLICT (user_id, amp_id) DO NOTHING
  RETURNING id INTO new_amp_id;

  -- Only create settings if the amp was just created
  IF new_amp_id IS NOT NULL THEN
    INSERT INTO user_amp_settings (
      user_amp_id,
      min_confidence_score,
      signal_generation_frequency,
      max_position_size,
      max_open_positions,
      position_sizing_method,
      stop_loss_percentage,
      take_profit_percentage,
      daily_loss_limit,
      total_portfolio_risk_pct,
      trailing_stop_enabled,
      trading_start_time,
      trading_end_time,
      trade_on_monday,
      trade_on_tuesday,
      trade_on_wednesday,
      trade_on_thursday,
      trade_on_friday,
      trade_on_saturday,
      trade_on_sunday,
      require_volume_confirmation,
      block_earnings_announcements,
      only_trade_with_trend,
      order_type,
      limit_order_offset_pct,
      time_in_force,
      custom_parameters
    ) VALUES (
      new_amp_id,
      0.75,
      '30min',
      5.0,
      3,
      'fixed',
      2.0,
      4.0,
      5.0,
      2.0,
      false,
      '09:30:00',
      '16:00:00',
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      true,
      true,
      true,
      'market',
      0,
      'gtc',
      (SELECT default_settings FROM amp_catalog WHERE id = 'atomic-multi-strategy-v1')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically add default Amp when user signs up
DROP TRIGGER IF EXISTS on_user_created_add_default_amp ON auth.users;
CREATE TRIGGER on_user_created_add_default_amp
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION add_default_amp_to_user();

-- Add the Amp to existing users who don't have it yet
DO $$
DECLARE
  user_record RECORD;
  account_id UUID;
  new_amp_id UUID;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Get user's paper account
    SELECT id INTO account_id
    FROM paper_accounts
    WHERE user_id = user_record.id
    LIMIT 1;

    -- Skip if no account
    CONTINUE WHEN account_id IS NULL;

    -- Add amp if user doesn't have it
    INSERT INTO user_amps (
      user_id,
      amp_id,
      name,
      is_active,
      allocated_capital,
      priority,
      display_order
    ) VALUES (
      user_record.id,
      'atomic-multi-strategy-v1',
      'Atomic Multi-Strategy',
      false,
      0,
      1,
      1
    )
    ON CONFLICT (user_id, amp_id) DO NOTHING
    RETURNING id INTO new_amp_id;

    -- Add default settings if amp was just created
    IF new_amp_id IS NOT NULL THEN
      INSERT INTO user_amp_settings (
        user_amp_id,
        min_confidence_score,
        signal_generation_frequency,
        max_position_size,
        max_open_positions,
        position_sizing_method,
        stop_loss_percentage,
        take_profit_percentage,
        daily_loss_limit,
        total_portfolio_risk_pct,
        trailing_stop_enabled,
        trading_start_time,
        trading_end_time,
        trade_on_monday,
        trade_on_tuesday,
        trade_on_wednesday,
        trade_on_thursday,
        trade_on_friday,
        trade_on_saturday,
        trade_on_sunday,
        require_volume_confirmation,
        block_earnings_announcements,
        only_trade_with_trend,
        order_type,
        limit_order_offset_pct,
        time_in_force,
        custom_parameters
      ) VALUES (
        new_amp_id,
        0.75,
        '30min',
        5.0,
        3,
        'fixed',
        2.0,
        4.0,
        5.0,
        2.0,
        false,
        '09:30:00',
        '16:00:00',
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        'market',
        0,
        'gtc',
        (SELECT default_settings FROM amp_catalog WHERE id = 'atomic-multi-strategy-v1')
      );
    END IF;
  END LOOP;
END $$;