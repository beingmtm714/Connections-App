import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LinkedInUser, loginWithLinkedIn } from "@/lib/auth";
import { LinkedInAPI } from "@/lib/linkedinApi";
import StatsCards from "@/components/dashboard/StatsCards";
import JobSearchSettings from "@/components/dashboard/JobSearchSettings";
import JobListings from "@/components/dashboard/JobListings";
import MutualConnections from "@/components/dashboard/MutualConnections";
import MessageTracker from "@/components/dashboard/MessageTracker";
import { Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: false // Placeholder - would be enabled in a real app with auth
  });
  
  const linkedInMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      try {
        const linkedInUser = await LinkedInAPI.connect();
        if (!linkedInUser) {
          throw new Error("Failed to connect with LinkedIn");
        }
        return await loginWithLinkedIn(linkedInUser);
      } finally {
        setIsConnecting(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "LinkedIn connected",
        description: `Successfully connected as ${data.name || data.username}`,
      });
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "LinkedIn connection failed",
        description: error instanceof Error ? error.message : "An error occurred connecting to LinkedIn",
        variant: "destructive"
      });
    }
  });
  
  const handleConnectLinkedIn = () => {
    linkedInMutation.mutate();
  };
  
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your job search connections at a glance</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            className="flex items-center"
            onClick={handleConnectLinkedIn}
            disabled={isConnecting}
          >
            <Linkedin className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect LinkedIn"}
          </Button>
        </div>
      </div>
      
      {/* Dashboard Components */}
      <StatsCards />
      <JobSearchSettings />
      <JobListings />
      <MutualConnections />
      <MessageTracker />
    </div>
  );
}
