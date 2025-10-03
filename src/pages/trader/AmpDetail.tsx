import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useExecuteAmpTrade } from '@/hooks/useAmpTrading';
import { useUpdateAmpStatus } from '@/hooks/useAmps';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, StopCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function AmpDetail() {
  const { ampId } = useParams();
  const navigate = useNavigate();
  const executeTrade = useExecuteAmpTrade();
  const updateStatus = useUpdateAmpStatus();

  const [tradeForm, setTradeForm] = useState({
    symbol: '',
    side: 'buy' as 'buy' | 'sell',
    qty: 1,
    price: 0
  });

  const { data: amp, isLoading: ampLoading } = useQuery({
    queryKey: ['amp', ampId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_amps')
        .select('*')
        .eq('id', ampId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ['amp-trades', ampId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amp_trades')
        .select('*')
        .eq('amp_id', ampId)
        .order('executed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const handleTrade = async () => {
    if (!tradeForm.symbol || tradeForm.qty < 1 || tradeForm.price <= 0) {
      toast.error('Please fill in all trade details');
      return;
    }

    try {
      await executeTrade.mutateAsync({
        ampId: ampId!,
        ...tradeForm
      });
      
      setTradeForm({ symbol: '', side: 'buy', qty: 1, price: 0 });
    } catch (error) {
      // Error handling in mutation
    }
  };

  if (ampLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading amp...</p>
      </div>
    );
  }

  if (!amp) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] p-6">
        <p className="text-gray-400">Amp not found</p>
      </div>
    );
  }

  const isProfitable = parseFloat(amp.total_pnl?.toString() || '0') >= 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/trader')}
        className="text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Amp Header */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{amp.name}</h1>
              <p className="text-gray-400">{amp.description || 'No description'}</p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-[#9540FF]/20 text-[#9540FF]">
                  {amp.strategy_type}
                </Badge>
                <Badge className="bg-[#2A2A2A] text-gray-400">
                  {amp.risk_level}
                </Badge>
                <Badge className={
                  amp.status === 'active' ? 'bg-[#0AEF80]/20 text-[#0AEF80]' : 'bg-[#2A2A2A] text-gray-400'
                }>
                  {amp.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {amp.status === 'active' && (
                <Button
                  onClick={() => updateStatus.mutate({ ampId: amp.id, status: 'paused' })}
                  variant="outline"
                  className="border-[#2A2A2A]"
                  disabled={updateStatus.isPending}
                >
                  <Pause size={16} className="mr-2" />
                  Pause
                </Button>
              )}
              {amp.status === 'paused' && (
                <Button
                  onClick={() => updateStatus.mutate({ ampId: amp.id, status: 'active' })}
                  className="bg-[#0AEF80] text-black hover:bg-[#0AEF80]/90"
                  disabled={updateStatus.isPending}
                >
                  <Play size={16} className="mr-2" />
                  Resume
                </Button>
              )}
              <Button
                onClick={() => updateStatus.mutate({ ampId: amp.id, status: 'stopped' })}
                variant="destructive"
                disabled={updateStatus.isPending}
              >
                <StopCircle size={16} className="mr-2" />
                Stop
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-400">Allocated Capital</p>
              <p className="text-2xl font-bold text-white">
                ${parseFloat(amp.allocated_capital.toString()).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold ${isProfitable ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                {isProfitable ? '+' : ''}${Math.abs(parseFloat(amp.total_pnl?.toString() || '0')).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Trades</p>
              <p className="text-2xl font-bold text-white">{amp.trades_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-white">{parseFloat(amp.win_rate?.toString() || '0').toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* Manual Trading */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Manual Trade</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-white">Symbol</Label>
              <Input
                value={tradeForm.symbol}
                onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                placeholder="AAPL"
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Side</Label>
              <select
                value={tradeForm.side}
                onChange={(e) => setTradeForm({ ...tradeForm, side: e.target.value as 'buy' | 'sell' })}
                className="w-full h-10 rounded-md bg-[#0A0A0A] border border-[#2A2A2A] text-white px-3"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div>
              <Label className="text-white">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={tradeForm.qty}
                onChange={(e) => setTradeForm({ ...tradeForm, qty: parseInt(e.target.value) })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={tradeForm.price}
                onChange={(e) => setTradeForm({ ...tradeForm, price: parseFloat(e.target.value) })}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>
          </div>
          <Button
            onClick={handleTrade}
            disabled={executeTrade.isPending || !tradeForm.symbol}
            className="w-full mt-4 bg-gradient-to-r from-[#0AEF80] to-[#00C766] text-black font-semibold hover:from-[#0AEF80]/90 hover:to-[#00C766]/90"
          >
            {executeTrade.isPending ? 'Executing...' : 'Execute Trade'}
          </Button>
        </Card>

        {/* Trade History */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Trade History</h2>
          {tradesLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading trades...</p>
            </div>
          ) : !trades || trades.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No trades yet</p>
          ) : (
            <div className="space-y-2">
              {trades.map(trade => {
                const isProfitTrade = trade.pnl && parseFloat(trade.pnl.toString()) > 0;
                return (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg">
                    <div className="flex items-center gap-4">
                      {trade.side === 'buy' ? (
                        <TrendingUp className="text-[#0AEF80]" size={20} />
                      ) : (
                        <TrendingDown className="text-[#FF3B69]" size={20} />
                      )}
                      <div>
                        <p className="text-white font-semibold">{trade.symbol}</p>
                        <p className="text-sm text-gray-400">
                          {trade.side.toUpperCase()} {trade.quantity} @ ${parseFloat(trade.price.toString()).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {trade.pnl && (
                        <p className={`font-semibold ${isProfitTrade ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                          {isProfitTrade ? '+' : ''}${Math.abs(parseFloat(trade.pnl.toString())).toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(trade.executed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}