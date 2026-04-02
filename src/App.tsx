import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupplyChainProvider } from "@/context/SupplyChainContext";
import Index from "./pages/Index";
import FarmerDashboard from "./pages/FarmerDashboard";
import RoleDashboard from "./pages/RoleDashboard";
import BatchDetail from "./pages/BatchDetail";
import ConsumerScan from "./pages/ConsumerScan";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isScan = location.pathname.startsWith('/scan/');

  if (isScan) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      {!isHome && (
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-display font-bold text-gradient-hero text-lg">AgriTrace</span>
            </button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </header>
      )}
      <main className={isHome ? '' : 'container max-w-6xl mx-auto px-4 py-6'}>
        {children}
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SupplyChainProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/farmer" element={<FarmerDashboard />} />
              <Route path="/dashboard/supplier" element={<RoleDashboard role="supplier" />} />
              <Route path="/dashboard/distributor" element={<RoleDashboard role="distributor" />} />
              <Route path="/dashboard/retailer" element={<RoleDashboard role="retailer" />} />
              <Route path="/dashboard/consumer" element={<RoleDashboard role="consumer" />} />
              <Route path="/batch/:batchId" element={<BatchDetail />} />
              <Route path="/scan/:batchId" element={<ConsumerScan />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </SupplyChainProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
