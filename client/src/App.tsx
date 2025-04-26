import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Jobs from "@/pages/jobs";
import Connections from "@/pages/connections";
import Outreach from "@/pages/outreach";
import Settings from "@/pages/settings";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const [location] = useLocation();
  const { data: user, isLoading, error } = useQuery({ 
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: true
  });
  
  // If we're loading, show nothing yet to avoid flashes
  if (isLoading) {
    return null;
  }

  // Check if we're on the login page or authenticated
  const isAuthenticated = !!user;
  const isLoginPage = location === '/login';
  
  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !isLoginPage) {
    window.location.href = '/login';
    return null;
  }
  
  // If authenticated and on login page, redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    window.location.href = '/';
    return null;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/">
        {isAuthenticated ? (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/jobs">
        {isAuthenticated ? (
          <AppLayout>
            <Jobs />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/connections/:jobId?">
        {(params) => isAuthenticated ? (
          <AppLayout>
            <Connections jobId={params.jobId} />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/outreach">
        {isAuthenticated ? (
          <AppLayout>
            <Outreach />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/settings">
        {isAuthenticated ? (
          <AppLayout>
            <Settings />
          </AppLayout>
        ) : <Login />}
      </Route>
      
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
