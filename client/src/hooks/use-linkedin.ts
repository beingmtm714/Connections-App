import { useState, useEffect } from 'react';
import { 
  getLinkedInSession, 
  connectLinkedIn as connectLinkedInAPI, 
  disconnectLinkedIn as disconnectLinkedInAPI,
  LinkedInSession
} from '@/lib/linkedin-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useLinkedIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<LinkedInSession | null>(null);
  
  // Get current user
  const { data: user, isLoading } = useQuery({ 
    queryKey: ['/api/auth/me']
  });
  
  // Initialize session
  useEffect(() => {
    if (!isLoading) {
      if (user?.linkedInConnected) {
        // User is logged in and has LinkedIn connected
        const storedSession = getLinkedInSession();
        setSession(storedSession);
      } else {
        // User is logged in but LinkedIn is not connected
        setSession({ sessionCookie: '', isConnected: false });
      }
    }
  }, [user, isLoading]);
  
  // Connect LinkedIn account
  const connect = async () => {
    try {
      const newSession = await connectLinkedInAPI();
      setSession(newSession);
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "LinkedIn Connected",
        description: "Your LinkedIn account has been connected successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect LinkedIn account. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Disconnect LinkedIn account
  const disconnect = async () => {
    try {
      await disconnectLinkedInAPI();
      setSession({ sessionCookie: '', isConnected: false });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "LinkedIn Disconnected",
        description: "Your LinkedIn account has been disconnected."
      });
      
      return true;
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect LinkedIn account. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  return {
    isConnected: !!user?.linkedInConnected,
    sessionCookie: session?.sessionCookie || '',
    connect,
    disconnect
  };
}
