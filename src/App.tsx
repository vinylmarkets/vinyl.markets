import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Methodology from "./pages/research/Methodology";
import DataSources from "./pages/research/DataSources";
import ResearchPapers from "./pages/research/ResearchPapers";
import KahnemanTversky1973 from "./pages/research/papers/KahnemanTversky1973";
import BollenMaoZeng2011 from "./pages/research/papers/BollenMaoZeng2011";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/research/methodology" element={<Methodology />} />
          <Route path="/research/data-sources" element={<DataSources />} />
          <Route path="/research/papers" element={<ResearchPapers />} />
          <Route path="/research/papers/kahneman-tversky-1973" element={<KahnemanTversky1973 />} />
          <Route path="/research/papers/bollen-mao-zeng-2011" element={<BollenMaoZeng2011 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
