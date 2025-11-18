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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/invoice" component={Invoice} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/generate-invoice" component={GenerateInvoice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
