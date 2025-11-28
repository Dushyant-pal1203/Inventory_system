import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Invoice from "@/pages/invoice";
import NotFound from "@/pages/not-found";
import Inventory from "./pages/inventory";
import GenerateInvoice from "./pages/generate_invoice";
import Bills from "./pages/bills";
// import Banner from "./components/banner";
import Footer from "./components/footer";
import contact_us from "./pages/contact_us";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/invoice" component={Invoice} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/generate-invoice" component={GenerateInvoice} />
      <Route path="/bills" component={Bills} />
      <Route path="/contact_us" component={contact_us} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
      <Footer />
    </>
  );
}

export default App;
