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
import BlogList from "./pages/admin/BlogList";
import BlogEditor from "./pages/admin/BlogEditor";
import AdminDashboardNew from "./pages/admin/AdminDashboardNew";
import Financial from "./pages/admin/Financial";
import Auth from "./pages/Auth";
import TraderLayout from "./pages/trader/TraderLayout";
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
import DeployAmp from "./pages/trader/DeployAmp";
import BentoDashboard from "./pages/trader/BentoDashboard";
import TraderAmpDetail from "./pages/trader/AmpDetail";
import AdminAmpDetail from "./pages/admin/AmpDetail";
import BacktestPage from "./pages/trader/BacktestPage";
import { AmpCatalog } from "./pages/marketplace/AmpCatalog";
import CreatorLayout from "./pages/creator/CreatorLayout";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import { LayerBuilder } from "./components/layers/LayerBuilder";
import { LayerDashboard } from "./components/layers/LayerDashboard";
import { LayerAnalyticsDashboard } from "./components/layers/LayerAnalyticsDashboard";
import { TemplateGallery } from "./components/layers/TemplateGallery";
import { CommunityLayers } from "./components/layers/CommunityLayers";
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
                <Route path="amps/:ampId" element={<AdminAmpDetail />} />
                <Route path="financial" element={<Financial />} />
                <Route path="settings" element={<Settings />} />
                <Route path="content/blog" element={<BlogList />} />
                <Route path="content/blog/new" element={<BlogEditor />} />
                <Route path="content/blog/:id" element={<BlogEditor />} />
              </Route>
              
              {/* Hidden Trader Platform - Not linked from navigation */}
              <Route path="/trader-auth" element={<TraderAuth />} />
              <Route path="/trader" element={<TraderLayout />}>
                <Route index element={<BentoDashboard />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="amps" element={<MyAmps />} />
                <Route path="amps/deploy" element={<DeployAmp />} />
                <Route path="amps/:ampId" element={<TraderAmpDetail />} />
                <Route path="settings" element={<TraderSettings />} />
                <Route path="alerts" element={<TraderAlerts />} />
                <Route path="api-keys" element={<TraderApiKeys />} />
                <Route path="help" element={<TraderHelp />} />
                <Route path="performance" element={<TraderPerformance />} />
                <Route path="troubleshooting" element={<TraderTroubleshooting />} />
                <Route path="reporting" element={<TraderReporting />} />
                <Route path="newsletters" element={<TraderNewsletters />} />
                <Route path="diagnostics" element={<TraderDiagnostics />} />
                <Route path="system-maps/architecture" element={<SystemArchitecture />} />
                <Route path="system-maps/algorithms" element={<AlgorithmAnalysis />} />
                <Route path="watchlists" element={<Watchlists />} />
                <Route path="stock/:symbol" element={<StockAnalysis />} />
                <Route path="backtest" element={<BacktestPage />} />
                <Route path="marketplace" element={<AmpCatalog />} />
                <Route path="layers" element={<LayerDashboard />} />
                <Route path="layers/new" element={<LayerBuilder />} />
                <Route path="layers/:layerId/edit" element={<LayerBuilder />} />
                <Route path="layers/:layerId/analytics" element={<LayerAnalyticsDashboard />} />
                <Route path="layers/templates" element={<TemplateGallery />} />
                <Route path="layers/community" element={<CommunityLayers />} />
              </Route>
              
              {/* Creator Studio Routes */}
              <Route path="/creator" element={<CreatorLayout />}>
                <Route index element={<CreatorDashboard />} />
              </Route>
              
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