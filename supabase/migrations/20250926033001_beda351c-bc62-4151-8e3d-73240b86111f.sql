-- Temporarily allow NULL user_id for demo data
ALTER TABLE paper_accounts ALTER COLUMN user_id DROP NOT NULL;

-- Create demo paper trading accounts
INSERT INTO paper_accounts (id, user_id, account_name, starting_capital, current_cash, total_equity, buying_power, total_trades, winning_trades, losing_trades, win_rate, total_realized_pnl, sharpe_ratio, max_drawdown, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', NULL, 'TradeKing92', 100000, 125430, 148250, 150000, 47, 32, 15, 68.1, 48250, 1.85, -8.2, NOW() - INTERVAL '3 months'),
('550e8400-e29b-41d4-a716-446655440002', NULL, 'WallStreetWolf', 100000, 110250, 142180, 140000, 62, 38, 24, 61.3, 42180, 1.72, -12.5, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440003', NULL, 'OptionsOracle', 50000, 45200, 68900, 70000, 28, 21, 7, 75.0, 18900, 2.15, -5.1, NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440004', NULL, 'DayTrader_Pro', 75000, 82100, 98750, 95000, 89, 54, 35, 60.7, 23750, 1.45, -15.3, NOW() - INTERVAL '4 months'),
('550e8400-e29b-41d4-a716-446655440005', NULL, 'BullishBetty', 100000, 118600, 131420, 135000, 35, 26, 9, 74.3, 31420, 1.98, -6.8, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440006', NULL, 'SwingMaster', 100000, 95800, 119850, 120000, 41, 23, 18, 56.1, 19850, 1.23, -18.7, NOW() - INTERVAL '5 months'),
('550e8400-e29b-41d4-a716-446655440007', NULL, 'TechAnalyst', 50000, 55900, 61250, 65000, 33, 22, 11, 66.7, 11250, 1.67, -9.2, NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440008', NULL, 'QuantTrader', 100000, 108750, 125680, 130000, 56, 34, 22, 60.7, 25680, 1.56, -11.4, NOW() - INTERVAL '3 months'),
('550e8400-e29b-41d4-a716-446655440009', NULL, 'RiskManager', 75000, 72400, 88900, 90000, 29, 19, 10, 65.5, 13900, 1.34, -7.6, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440010', NULL, 'MarketMaven', 100000, 112300, 121450, 125000, 44, 28, 16, 63.6, 21450, 1.41, -13.8, NOW() - INTERVAL '4 months');

-- Create corresponding leaderboard entries
INSERT INTO paper_leaderboards (account_id, return_percentage, sharpe_ratio, win_rate, total_trades, total_points) VALUES
('550e8400-e29b-41d4-a716-446655440001', 48.25, 1.85, 68.1, 47, 2850),
('550e8400-e29b-41d4-a716-446655440002', 42.18, 1.72, 61.3, 62, 2610),
('550e8400-e29b-41d4-a716-446655440003', 37.80, 2.15, 75.0, 28, 2840),
('550e8400-e29b-41d4-a716-446655440004', 31.67, 1.45, 60.7, 89, 2820),
('550e8400-e29b-41d4-a716-446655440005', 31.42, 1.98, 74.3, 35, 2980),
('550e8400-e29b-41d4-a716-446655440006', 19.85, 1.23, 56.1, 41, 2030),
('550e8400-e29b-41d4-a716-446655440007', 22.50, 1.67, 66.7, 33, 2250),
('550e8400-e29b-41d4-a716-446655440008', 25.68, 1.56, 60.7, 56, 2568),
('550e8400-e29b-41d4-a716-446655440009', 18.53, 1.34, 65.5, 29, 1950),
('550e8400-e29b-41d4-a716-446655440010', 21.45, 1.41, 63.6, 44, 2145);