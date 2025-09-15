import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, TrendingDown, Plus, Crown } from "lucide-react";

const portfolioData = {
  totalValue: 45750.23,
  todayChange: 1250.45,
  todayChangePercent: 2.81,
  holdings: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 50,
      currentPrice: 175.43,
      value: 8771.50,
      change: 125.50,
      changePercent: 1.45
    },
    {
      symbol: "MSFT", 
      name: "Microsoft Corporation",
      shares: 30,
      currentPrice: 338.11,
      value: 10143.30,
      change: -45.20,
      changePercent: -0.44
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 25,
      currentPrice: 142.56,
      value: 3564.00,
      change: 89.75,
      changePercent: 2.58
    }
  ]
};

export default function Portfolio() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Premium Feature Notice */}
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50/50 to-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Crown className="w-5 h-5" />
              Premium Feature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              Portfolio tracking and management is available with Essential or Pro plans.
            </p>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Upgrade to Access Portfolio
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
            <p className="text-muted-foreground">Track and manage your investments</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${portfolioData.totalValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Today's Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioData.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioData.todayChange >= 0 ? '+' : ''}${portfolioData.todayChange.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Today's % Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center gap-1 ${portfolioData.todayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioData.todayChangePercent >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {portfolioData.todayChangePercent >= 0 ? '+' : ''}{portfolioData.todayChangePercent}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.holdings.map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold">{holding.symbol}</div>
                      <div className="text-sm text-muted-foreground">{holding.name}</div>
                    </div>
                    <Badge variant="outline">{holding.shares} shares</Badge>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${holding.value.toLocaleString()}</div>
                    <div className={`text-sm ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {holding.change >= 0 ? '+' : ''}${holding.change.toFixed(2)} ({holding.changePercent >= 0 ? '+' : ''}{holding.changePercent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}