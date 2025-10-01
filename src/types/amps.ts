export interface UserAmp {
  id: string;
  user_id: string;
  amp_id: string;
  name: string;
  is_active: boolean;
  allocated_capital: number;
  priority: number;
  display_order: number;
  created_at: string;
  updated_at: string;
  settings?: AmpSettings;
  catalog?: CatalogAmp;
  open_positions_count?: number;
  open_positions_value?: number;
  today_pnl?: number;
  today_trades?: number;
  available_capital?: number;
  utilization_pct?: number;
}

export interface AmpSettings {
  id: string;
  user_amp_id: string;
  min_confidence_score: number;
  signal_generation_frequency: string;
  max_position_size: number;
  max_open_positions: number;
  position_sizing_method: string;
  stop_loss_percentage: number;
  take_profit_percentage: number;
  daily_loss_limit: number;
  total_portfolio_risk_pct: number;
  trailing_stop_enabled: boolean;
  trading_start_time: string;
  trading_end_time: string;
  trade_on_monday: boolean;
  trade_on_tuesday: boolean;
  trade_on_wednesday: boolean;
  trade_on_thursday: boolean;
  trade_on_friday: boolean;
  trade_on_saturday: boolean;
  trade_on_sunday: boolean;
  require_volume_confirmation: boolean;
  block_earnings_announcements: boolean;
  only_trade_with_trend: boolean;
  order_type: string;
  limit_order_offset_pct: number;
  time_in_force: string;
  custom_parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CatalogAmp {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  version: string;
  parameter_schema: any;
  default_settings: any;
  created_at: string;
}

export interface AmpParameter {
  key: string;
  label: string;
  type: 'number' | 'toggle' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: any;
  description: string;
  options?: string[];
}

export interface AmpsSummary {
  total_allocated: number;
  available_capital: number;
  total_amps: number;
  active_amps: number;
}

export interface AmpEvent {
  id: string;
  user_id: string;
  user_amp_id: string | null;
  event_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AmpPerformance {
  id: string;
  user_amp_id: string;
  date: string;
  trades_executed: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  cumulative_pnl: number;
  cumulative_trades: number;
  cumulative_wins: number;
  cumulative_losses: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  largest_win: number;
  largest_loss: number;
  max_drawdown: number;
  current_drawdown: number;
  created_at: string;
}
