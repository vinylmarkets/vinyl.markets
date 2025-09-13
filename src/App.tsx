import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
