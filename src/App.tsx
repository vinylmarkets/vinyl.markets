import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import BasicTest from "./pages/BasicTest";
import NotFound from "./pages/NotFound";
import KnowledgeExplorer from "./pages/trader/KnowledgeExplorer";
import InsightsDashboard from "./pages/trader/InsightsDashboard";
import BetaTesting from "./pages/trader/BetaTesting";
// Admin Dashboard Components
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import UserDetail from "./pages/admin/UserDetail";
import AuditLogs from "./pages/admin/AuditLogs";
import Amps from "./pages/admin/Amps";
import AmpDetail from "./pages/admin/AmpDetail";
import Settings from "./pages/admin/Settings";
import AdminDashboardNew from "./pages/admin/AdminDashboardNew";
import Auth from "./pages/Auth";
import TraderPage from "./pages/trader/TraderPage";
import TraderAuth from "./pages/trader/TraderAuth";
import Integrations from "./pages/trader/Integrations";
import TraderSettings from "./pages/trader/TraderSettings";
import TraderAlerts from "./pages/trader/TraderAlerts";
import TraderApiKeys from "./pages/trader/TraderApiKeys";
import TraderHelp from "./pages/trader/TraderHelp";
import TraderPerformance from "./pages/trader/TraderPerformance";
import TraderTroubleshooting from "./pages/trader/TraderTroubleshooting";
import TraderReporting from "./pages/trader/TraderReporting";
import TraderNewsletters from "./pages/trader/TraderNewsletters";
import TraderDiagnostics from "./pages/trader/TraderDiagnostics";
import SystemArchitecture from "./pages/trader/SystemArchitecture";
import AlgorithmAnalysis from "./pages/trader/AlgorithmAnalysis";
import MyAmps from "./pages/trader/MyAmps";
import Watchlists from "./pages/trader/Watchlists";
import StockAnalysis from "./pages/trader/StockAnalysis";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component is rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Intelligence Routes */}
              <Route path="/trader/intelligence/explorer" element={<KnowledgeExplorer />} />
              <Route path="/trader/intelligence/insights" element={<InsightsDashboard />} />
              <Route path="/trader/testing" element={<BetaTesting />} />
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="amps" element={<Amps />} />
                <Route path="amps/:ampId" element={<AmpDetail />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Hidden Trader Platform - Not linked from navigation */}
              <Route path="/trader-auth" element={<TraderAuth />} />
              <Route path="/trader" element={<TraderPage />} />
              <Route path="/trader/integrations" element={<Integrations />} />
              <Route path="/trader/settings" element={<TraderSettings />} />
              <Route path="/trader/alerts" element={<TraderAlerts />} />
              <Route path="/trader/api-keys" element={<TraderApiKeys />} />
              <Route path="/trader/help" element={<TraderHelp />} />
              <Route path="/trader/performance" element={<TraderPerformance />} />
              <Route path="/trader/troubleshooting" element={<TraderTroubleshooting />} />
              <Route path="/trader/reporting" element={<TraderReporting />} />
              <Route path="/trader/newsletters" element={<TraderNewsletters />} />
              <Route path="/trader/diagnostics" element={<TraderDiagnostics />} />
              <Route path="/trader/system-maps/architecture" element={<SystemArchitecture />} />
              <Route path="/trader/system-maps/algorithms" element={<AlgorithmAnalysis />} />
              <Route path="/trader/amps" element={<MyAmps />} />
              <Route path="/trader/watchlists" element={<Watchlists />} />
              <Route path="/trader/stock/:symbol" element={<StockAnalysis />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;