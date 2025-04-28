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
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;
  const isLoginPage = location === '/login';

  // Handle redirects without using window.location
  if (!isAuthenticated && !isLoginPage) {
    window.location.replace('/login');
    return null;
  }

  if (isAuthenticated && isLoginPage) {
    window.location.replace('/');
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
