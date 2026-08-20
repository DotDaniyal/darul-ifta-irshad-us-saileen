/** Blue Minbar Heritage: full bilingual public routes for the Darul Ifta website. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AskFatwa from "./pages/AskFatwa";
import Fatawa from "./pages/Fatawa";
import FatwaDetail from "./pages/FatwaDetail";
import ScholarWorkspace from "./pages/ScholarWorkspace";
import { RoleWorkspace } from "./pages/RoleWorkspace";
import Methodology from "./pages/Methodology";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/fatawa"} component={Fatawa} />
      <Route path={"/fatawa/:slug"} component={FatwaDetail} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/ask-fatwa" component={AskFatwa} />
      <Route path="/workspace" component={ScholarWorkspace} />
      <Route path="/workspace/scholar"><RoleWorkspace kind="scholar" /></Route>
      <Route path="/workspace/review"><RoleWorkspace kind="reviewer" /></Route>
      <Route path="/workspace/admin"><RoleWorkspace kind="admin" /></Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
