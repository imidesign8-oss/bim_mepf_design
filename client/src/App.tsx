import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import FloatingBackToTop from "./components/FloatingBackToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";

import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Unsubscribe from "./pages/Unsubscribe";
import { MepCalculator } from "./pages/MepCalculator";
import { MepAdmin } from "./pages/MepAdmin";
import { AIChatWidget } from "./components/AIChatWidget";
import Analytics from "./components/Analytics";
import Header from "./components/Header";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
       <Route path={"services"} component={Services} />

      <Route path={"services/:slug"} component={ServiceDetail} />
      <Route path={"/unsubscribe"} component={Unsubscribe} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/:slug"} component={ProjectDetail} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogDetail} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/mep-calculator"} component={MepCalculator} />
      <Route path={"/mep-admin"} component={MepAdmin} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Scroll to top on route change
  useScrollToTop();
  
  // Enable smooth scrolling for anchor links
  useSmoothScroll();

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Analytics />
          <Toaster />
          <Header />
          <div style={{paddingTop: '64px'}}>
            <Router />
          </div>
          <FloatingBackToTop />
          <AIChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
