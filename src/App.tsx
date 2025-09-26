import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardTest from "./pages/DashboardTest";
import BasicTest from "./pages/BasicTest";
import IntegrationTest from "./components/IntegrationTest";
import MockDashboard from "./pages/MockDashboard";
import ResearchIndex from "./pages/research/ResearchIndex";
import Methodology from "./pages/research/Methodology";
import DataSources from "./pages/research/DataSources";
import ResearchPapers from "./pages/research/ResearchPapers";
import HoetingMadigan1999 from "./pages/research/papers/HoetingMadigan1999";
import DaEngelbergGao2011 from "./pages/research/papers/DaEngelbergGao2011";
import KahnemanTversky1973 from "./pages/research/papers/KahnemanTversky1973";
import BollenMaoZeng2011 from "./pages/research/papers/BollenMaoZeng2011";
import BoehmerJones2021 from "./pages/research/papers/BoehmerJones2021";
import BrownJennings1989 from "./pages/research/papers/BrownJennings1989";
import JegadeeshTitman1993 from "./pages/research/papers/JegadeeshTitman1993";
import Engle1982 from "./pages/research/papers/Engle1982";
import GlostenMilgrom1985 from "./pages/research/papers/GlostenMilgrom1985";
import PanPoteshman2006 from "./pages/research/papers/PanPoteshman2006";
import CremersWeinbaum2010 from "./pages/research/papers/CremersWeinbaum2010";
import OptionsPaperRouter from "./pages/research/papers/OptionsPaperRouter";
import NotFound from "./pages/NotFound";
import Briefings from "./pages/dashboard/Briefings";
import BriefingDetail from "./pages/dashboard/BriefingDetail";
import Terminal from "./pages/dashboard/Terminal";
import PaperTrading from "./pages/dashboard/PaperTrading";
import OptionsValueTool from "./pages/dashboard/OptionsValueTool";
import Charts from "./pages/dashboard/Charts";
import LearningProgress from "./pages/dashboard/Progress";
import Portfolio from "./pages/dashboard/Portfolio";
import SettingsPage from "./pages/dashboard/Settings";
import Upgrade from "./pages/dashboard/Upgrade";
import Top20Predictions from "./pages/dashboard/Top20Predictions";
import ForumCategory from "./pages/ForumCategory";
import ForumTopic from "./pages/ForumTopic";
import BlogArchive from "./pages/BlogArchive";
import BlogPost from "./pages/BlogPost";
import BlogEditor from "./pages/admin/BlogEditor";

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
import ForumPage from "./pages/forum/ForumPage";
import Auth from "./pages/Auth";

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
              
              {/* Blog Routes */}
              <Route path="/articles" element={<BlogArchive />} />
              <Route path="/articles/:slug" element={<BlogPost />} />
              <Route path="/dashboard/briefings" element={<Briefings />} />
              <Route path="/dashboard/briefings/:id" element={<BriefingDetail />} />
              <Route path="/dashboard/terminal" element={<Terminal />} />
            <Route path="/dashboard/paper-trading" element={<PaperTrading />} />
            <Route path="/dashboard/options-value-tool" element={<OptionsValueTool />} />
              <Route path="/dashboard/charts" element={<Charts />} />
              <Route path="/dashboard/progress" element={<LearningProgress />} />
              <Route path="/dashboard/portfolio" element={<Portfolio />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/upgrade" element={<Upgrade />} />
              <Route path="/dashboard/top20" element={<Top20Predictions />} />
              
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
              <Route path="/admin/blog" element={<AdminProtected><BlogEditor /></AdminProtected>} />
              <Route path="/admin/blog/:id" element={<AdminProtected><BlogEditor /></AdminProtected>} />
              
              <Route path="/dashboard-test" element={<DashboardTest />} />
              <Route path="/dashboard-old" element={<Dashboard />} />
              <Route path="/research" element={<ResearchPapers />} />
              <Route path="/research/data-sources" element={<DataSources />} />
              <Route path="/research/methodology" element={<Methodology />} />
              <Route path="/research/papers" element={<ResearchPapers />} />
              <Route path="/research/papers/hoeting-1999" element={<HoetingMadigan1999 />} />
              <Route path="/research/papers/da-engelberg-gao-2011" element={<DaEngelbergGao2011 />} />
              <Route path="/research/papers/kahneman-tversky-1973" element={<KahnemanTversky1973 />} />
              <Route path="/research/papers/bollen-mao-zeng-2011" element={<BollenMaoZeng2011 />} />
              <Route path="/research/papers/boehmer-2021" element={<BoehmerJones2021 />} />
              <Route path="/research/papers/brown-jennings-1989" element={<BrownJennings1989 />} />
              <Route path="/research/papers/jegadeesh-titman-1993" element={<JegadeeshTitman1993 />} />
              <Route path="/research/papers/engle-1982" element={<Engle1982 />} />
              <Route path="/research/papers/glosten-milgrom-1985" element={<GlostenMilgrom1985 />} />
              <Route path="/research/papers/pan-poteshman-2006" element={<PanPoteshman2006 />} />
              <Route path="/research/papers/cremers-weinbaum-2010" element={<CremersWeinbaum2010 />} />
              <Route path="/research/papers/:slug" element={<OptionsPaperRouter />} />
              
              {/* Forum Routes */}
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:categorySlug" element={<ForumCategory />} />
              <Route path="/forum/topic/:topicId" element={<ForumTopic />} />
              
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