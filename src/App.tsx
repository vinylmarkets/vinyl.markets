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
import { AdminProtected } from "./components/AdminProtected";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
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
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
              
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