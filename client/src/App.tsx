/** Blue Minbar Heritage: full bilingual public routes for the Darul Ifta website. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { LoaderCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const AskFatwa = lazy(() => import("./pages/AskFatwa"));
const Fatawa = lazy(() => import("./pages/Fatawa"));
const FatwaDetail = lazy(() => import("./pages/FatwaDetail"));
const Methodology = lazy(() => import("./pages/Methodology"));
const ScholarAdmin = lazy(() => import("./pages/ScholarAdmin"));
const ScholarProfile = lazy(() => import("./pages/ScholarProfile"));
const Scholars = lazy(() => import("./pages/Scholars"));

function RouteLoadingFallback() {
  return (
    <main className="flex min-h-[42vh] items-center justify-center bg-[#FBF9F3] px-5 text-center" role="status" aria-live="polite">
      <div>
        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#075A9B]" aria-hidden="true" />
        <p className="mt-3 font-urdu text-xl text-[#10223A]">صفحہ لوڈ ہو رہا ہے</p>
        <p className="mt-1 font-sans text-sm text-[#647188]">Loading the page…</p>
      </div>
    </main>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/fatawa"} component={Fatawa} />
        <Route path={"/fatawa/:slug"} component={FatwaDetail} />
        <Route path={"/scholars"} component={Scholars} />
        <Route path={"/scholars/admin"} component={ScholarAdmin} />
        <Route path={"/scholars/:slug"} component={ScholarProfile} />
        <Route path={"/admin/scholars"} component={ScholarAdmin} />
        <Route path={"/ask-fatwa"} component={AskFatwa} />
        <Route path={"/methodology"} component={Methodology} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
