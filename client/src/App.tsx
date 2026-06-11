import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CoffeeBeansPage from "./pages/CoffeeBeansPage";
import CoffeeBeanDetail from "./pages/CoffeeBeanDetail";
import BrewingRecordsPage from "./pages/BrewingRecordsPage";
import BrewingSuggestionsPage from "./pages/BrewingSuggestionsPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/beans"} component={CoffeeBeansPage} />
      <Route path={"/beans/:id"} component={CoffeeBeanDetail} />
      <Route path={"/beans/:id/suggestions"} component={BrewingSuggestionsPage} />
      <Route path={"/records"} component={BrewingRecordsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
