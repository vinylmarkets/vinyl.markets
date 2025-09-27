import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Target, 
  Trophy, 
  BookOpen, 
  Settings,
  Plus,
  Import,
  BarChart3,
  Wallet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaperAccount {
  id: string;
  account_name: string;
  account_type: string;
  starting_capital: number;
  current_cash: number;
  total_equity: number;
  total_realized_pnl: number;
  total_unrealized_pnl: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate?: number;
  options_level: number;
  is_active: boolean;
  created_at: string;
}

interface Position {
  id: string;
  symbol: string;
  asset_type: string;
  quantity: number;
  side: string;
  average_cost: number;
  current_price?: number;
  market_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_percentage?: number;
  option_type?: string;
  strike_price?: number;
  expiration_date?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  earned_at?: string;
}

export default function PaperTrading() {
  console.log('PaperTrading component is rendering');
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      // Check if user has an account
      const { data: accountData, error: accountError } = await supabase
        .from('paper_accounts')
        .select('*')
        .single();

      if (accountError && accountError.code !== 'PGRST116') {
        throw accountError;
      }

      if (accountData) {
        setAccount(accountData);
        await loadPositions(accountData.id);
        await loadAchievements(accountData.id);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load account data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from('paper_positions')
        .select('*')
        .eq('account_id', accountId);

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const loadAchievements = async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from('paper_user_achievements')
        .select(`
          *,
          paper_achievements (
            name,
            description,
            category,
            points
          )
        `)
        .eq('account_id', accountId);

      if (error) throw error;
      
      const achievementsList = data?.map(item => ({
        id: item.id,
        name: item.paper_achievements.name,
        description: item.paper_achievements.description,
        category: item.paper_achievements.category,
        points: item.paper_achievements.points,
        earned_at: item.earned_at
      })) || [];

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const createAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('paper_accounts')
        .insert([{
          user_id: user.id,
          account_name: 'My Paper Account',
          account_type: 'margin',
          starting_capital: 100000,
          current_cash: 100000,
          total_equity: 100000,
          buying_power: 200000, // 2:1 margin for margin accounts
          options_level: 2 // Long options by default
        }])
        .select()
        .single();

      if (error) throw error;
      
      setAccount(data);
      toast({
        title: 'Account Created!',
        description: 'Your paper trading account has been set up with $100,000 virtual cash.',
      });
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to create paper trading account',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPnLColor = (value: number) => {
    return value >= 0 ? 'text-success' : 'text-destructive';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your paper trading account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/atomicmarket-logo-black.png" 
                alt="AtomicMarket"
                className="h-12"
              />
              <h1 className="text-4xl font-bold text-foreground">
                Paper Trading
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Practice trading with real market data and virtual money. Perfect your strategies risk-free.
            </p>
          </div>

          <Card className="border-2 border-dashed border-muted-foreground/25 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Get Started with Paper Trading
              </CardTitle>
              <CardDescription>
                Create your virtual trading account with $100,000 in paper money to practice trading stocks and options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="font-semibold">$100,000</p>
                  <p className="text-sm text-muted-foreground">Virtual Cash</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Real Data</p>
                  <p className="text-sm text-muted-foreground">Live Market Prices</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Target className="h-8 w-8 mx-auto mb-2 text-secondary" />
                  <p className="font-semibold">Risk-Free</p>
                  <p className="text-sm text-muted-foreground">Practice Trading</p>
                </div>
              </div>
              
              <Button onClick={createAccount} size="lg" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Paper Trading Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalReturn = account.total_equity - account.starting_capital;
  const totalReturnPercentage = (totalReturn / account.starting_capital) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <img 
              src="/atomicmarket-logo-black.png" 
              alt="AtomicMarket"
              className="h-10"
            />
            <h1 className="text-4xl font-bold text-foreground">
              Paper Trading
            </h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="secondary" className="bg-secondary/80">
              {account.account_type === 'margin' ? 'Margin Account' : 'Cash Account'}
            </Badge>
            <Badge variant="outline">
              Options Level {account.options_level}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="default" className="gap-2">
            <Import className="h-4 w-4" />
            Import from TOP 20
          </Button>
          <Button variant="outline" size="default" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-3 text-muted-foreground">
              <div className="p-2.5 rounded-lg bg-primary-light">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              Total Equity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1 text-foreground">{formatCurrency(account.total_equity)}</div>
            <div className={`text-sm ${getPnLColor(totalReturn)} flex items-center gap-1 font-medium`}>
              {totalReturn >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatCurrency(totalReturn)} ({formatPercentage(totalReturnPercentage)})
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-3 text-muted-foreground">
              <div className="p-2.5 rounded-lg bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1 text-foreground">{formatCurrency(account.current_cash)}</div>
            <div className="text-sm text-muted-foreground font-medium">
              Available to trade
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className={`p-2 rounded-md ${(account.total_unrealized_pnl || 0) >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <PieChart className={`h-4 w-4 ${(account.total_unrealized_pnl || 0) >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
              Unrealized P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-1 ${getPnLColor(account.total_unrealized_pnl || 0)}`}>
              {formatCurrency(account.total_unrealized_pnl || 0)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Open positions
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-modern">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-md bg-info/10">
                <Target className="h-4 w-4 text-info" />
              </div>
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {account.win_rate ? `${account.win_rate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {account.winning_trades}W / {account.losing_trades}L
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-secondary/50 h-12">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Import predictions and start trading
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Import className="mr-2 h-4 w-4" />
                  Import from TOP 20 Predictions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Import from Options Value Tool
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Place Manual Order
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Trade Journal
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  Your latest trading milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary">{achievement.points} pts</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Start trading to earn your first achievement!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <CardDescription>
                Your current stock and options positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length > 0 ? (
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-semibold">{position.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {position.asset_type === 'option' 
                              ? `${position.option_type?.toUpperCase()} $${position.strike_price} ${position.expiration_date}`
                              : 'Stock'
                            }
                          </div>
                        </div>
                        <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                          {position.side}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {position.quantity} @ {formatCurrency(position.average_cost)}
                        </div>
                        {position.unrealized_pnl && (
                          <div className={`text-sm ${getPnLColor(position.unrealized_pnl)}`}>
                            {formatCurrency(position.unrealized_pnl)} ({formatPercentage(position.unrealized_pnl_percentage || 0)})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No open positions</p>
                  <p className="text-sm">Start by importing predictions or placing manual orders</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your trading order history and pending orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No orders yet</p>
                <p className="text-sm">Your order history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track your trading performance and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{account.total_trades}</div>
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{account.winning_trades}</div>
                    <div className="text-sm text-muted-foreground">Winning Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{account.losing_trades}</div>
                    <div className="text-sm text-muted-foreground">Losing Trades</div>
                  </div>
                </div>
                
                {account.total_trades > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Win Rate</span>
                      <span>{account.win_rate?.toFixed(1)}%</span>
                    </div>
                    <Progress value={account.win_rate || 0} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Trophy className="h-5 w-5 text-primary" />
                    <Badge variant="secondary">{achievement.points} pts</Badge>
                  </div>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {achievement.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            
            {achievements.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start trading to unlock achievements and earn points!
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>
                    Start Trading
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}