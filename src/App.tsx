import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import KnowledgeGraph from "./pages/admin/KnowledgeGraph";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardTest from "./pages/DashboardTest";
import BasicTest from "./pages/BasicTest";
import IntegrationTest from "./components/IntegrationTest";
import MockDashboard from "./pages/MockDashboard";
import NotFound from "./pages/NotFound";
import Terminal from "./pages/dashboard/Terminal";
import PaperTrading from "./pages/dashboard/PaperTrading";
import OptionsValueTool from "./pages/dashboard/OptionsValueTool";
import KnowledgeExplorer from "./pages/trader/KnowledgeExplorer";
import InsightsDashboard from "./pages/trader/InsightsDashboard";
import BetaTesting from "./pages/trader/BetaTesting";
import ForensicsAnalysis from "./pages/trader/ForensicsAnalysis";
import WorkingTheory from "./pages/trader/forensics/WorkingTheory";
import DocumentAnalysis from "./pages/trader/forensics/DocumentAnalysis";
import KnowledgeGraphView from "./pages/trader/forensics/KnowledgeGraphView";
import TimelineAnalysis from "./pages/trader/forensics/TimelineAnalysis";
import SemanticSearch from "./pages/trader/forensics/SemanticSearch";
import IntelligenceSynthesis from "./pages/trader/forensics/IntelligenceSynthesis";
import ForensicAIAssistant from "./pages/trader/forensics/AIAssistant";
import Charts from "./pages/dashboard/Charts";
import LearningProgress from "./pages/dashboard/Progress";
import Portfolio from "./pages/dashboard/Portfolio";
import SettingsPage from "./pages/dashboard/Settings";
import Upgrade from "./pages/dashboard/Upgrade";
// Admin Dashboard Components
import { AdminProtected } from "./components/AdminProtected";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ExecutiveOverview from "./pages/admin/ExecutiveOverview";
import UserAnalytics from "./pages/admin/UserAnalytics";
import ProductIntelligence from "./pages/admin/ProductIntelligence";
import ContentPerformance from "./pages/admin/ContentPerformance";
import BusinessMetrics from "./pages/admin/BusinessMetrics";
import ComplianceMonitoring from "./pages/admin/ComplianceMonitoring";
import AlgorithmPerformance from "./pages/admin/AlgorithmPerformance";
import { ImageGenerator } from "./pages/admin/ImageGenerator";
import { ImageLibrary } from "./pages/admin/ImageLibrary";
import { ProductDevelopment } from "./pages/admin/ProductDevelopment";
import LaunchChecklist from "./pages/admin/LaunchChecklist";
import CronJobsManagement from "./pages/admin/CronJobsManagement";
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
              <Route path="/integration-test" element={<IntegrationTest />} />
              <Route path="/terminal" element={<Terminal />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/dashboard/terminal" element={<Terminal />} />
            <Route path="/dashboard/paper-trading" element={<PaperTrading />} />
            <Route path="/dashboard/options-value-tool" element={<OptionsValueTool />} />
              <Route path="/dashboard/charts" element={<Charts />} />
              <Route path="/dashboard/progress" element={<LearningProgress />} />
              <Route path="/dashboard/portfolio" element={<Portfolio />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/upgrade" element={<Upgrade />} />
              
              {/* Intelligence Routes */}
          <Route path="/trader/intelligence/explorer" element={<KnowledgeExplorer />} />
          <Route path="/trader/intelligence/insights" element={<InsightsDashboard />} />
          <Route path="/trader/testing" element={<BetaTesting />} />
          <Route path="/trader/forensics" element={<ForensicsAnalysis />} />
          <Route path="/trader/forensics/theory" element={<WorkingTheory />} />
          <Route path="/trader/forensics/documents" element={<DocumentAnalysis />} />
          <Route path="/trader/forensics/knowledge-graph" element={<KnowledgeGraphView />} />
          <Route path="/trader/forensics/timeline" element={<TimelineAnalysis />} />
          <Route path="/trader/forensics/search" element={<SemanticSearch />} />
          <Route path="/trader/forensics/synthesis" element={<IntelligenceSynthesis />} />
          <Route path="/trader/forensics/ai-assistant" element={<ForensicAIAssistant />} />
              
              <Route path="/admin/executive-overview" element={<AdminProtected><ExecutiveOverview /></AdminProtected>} />
              <Route path="/admin/user-analytics" element={<AdminProtected><UserAnalytics /></AdminProtected>} />
              <Route path="/admin/product-intelligence" element={<AdminProtected><ProductIntelligence /></AdminProtected>} />
              <Route path="/admin/content-performance" element={<AdminProtected><ContentPerformance /></AdminProtected>} />
              <Route path="/admin/business-metrics" element={<AdminProtected><BusinessMetrics /></AdminProtected>} />
              <Route path="/admin/compliance-monitoring" element={<AdminProtected><ComplianceMonitoring /></AdminProtected>} />
              <Route path="/admin/algorithm-performance" element={<AdminProtected><AlgorithmPerformance /></AdminProtected>} />
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
              <Route path="/admin/executive-overview" element={<AdminProtected><ExecutiveOverview /></AdminProtected>} />
              <Route path="/admin/user-analytics" element={<AdminProtected><UserAnalytics /></AdminProtected>} />
              <Route path="/admin/product-intelligence" element={<AdminProtected><ProductIntelligence /></AdminProtected>} />
              <Route path="/admin/content-performance" element={<AdminProtected><ContentPerformance /></AdminProtected>} />
              <Route path="/admin/business-metrics" element={<AdminProtected><BusinessMetrics /></AdminProtected>} />
              <Route path="/admin/compliance-monitoring" element={<AdminProtected><ComplianceMonitoring /></AdminProtected>} />
              <Route path="/admin/algorithm-performance" element={<AdminProtected><AlgorithmPerformance /></AdminProtected>} />
              <Route path="/admin/image-generator" element={<AdminProtected><ImageGenerator /></AdminProtected>} />
              <Route path="/admin/image-library" element={<AdminProtected><ImageLibrary /></AdminProtected>} />
              <Route path="/admin/product-development" element={<AdminProtected><ProductDevelopment /></AdminProtected>} />
              <Route path="/admin/launch-checklist" element={<AdminProtected><LaunchChecklist /></AdminProtected>} />
              <Route path="/admin/knowledge-graph" element={<AdminProtected><KnowledgeGraph /></AdminProtected>} />
              <Route path="/admin/cron-jobs" element={<AdminProtected><CronJobsManagement /></AdminProtected>} />
              
              <Route path="/dashboard-test" element={<DashboardTest />} />
              <Route path="/dashboard-old" element={<Dashboard />} />
              
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