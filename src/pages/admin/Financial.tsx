import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download } from "lucide-react";

export default function Financial() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Financial Overview</h1>
          <p className="text-gray-400">Revenue, subscriptions, and financial metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="admin">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardDescription>Monthly Revenue</CardDescription>
            <CardTitle className="text-3xl text-white">$0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">0%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardDescription>Total Subscriptions</CardDescription>
            <CardTitle className="text-3xl text-white">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Active subscribers</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardDescription>Avg Revenue per User</CardDescription>
            <CardTitle className="text-3xl text-white">$0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Per month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardDescription>Churn Rate</CardDescription>
            <CardTitle className="text-3xl text-white">0%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white">Subscription Plans</CardTitle>
          <CardDescription>Breakdown by plan tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { plan: "Free", count: 0, revenue: "$0", color: "gray" },
              { plan: "Pro", count: 0, revenue: "$0", color: "blue" },
              { plan: "Enterprise", count: 0, revenue: "$0", color: "purple" },
            ].map((item) => (
              <div key={item.plan} className="flex items-center justify-between p-4 rounded-lg bg-[#0A0A0A]">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                  <div>
                    <p className="text-sm font-medium text-white">{item.plan}</p>
                    <p className="text-xs text-gray-500">{item.count} subscribers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{item.revenue}</p>
                  <p className="text-xs text-gray-500">Monthly</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription>Latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Transaction history will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
