import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Employee, Mutual, InsertMessage } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DMBuilderModalProps {
  mutual: Mutual;
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export default function DMBuilderModal({ mutual, employee, isOpen, onClose }: DMBuilderModalProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState(() => {
    // Generate default personalized message
    const connectedSinceText = mutual.connectedSince 
      ? format(new Date(mutual.connectedSince), 'MMMM yyyy')
      : 'we connected';
    
    const contextSnippet = mutual.connectionContext
      ? `\nSince ${mutual.connectionContext}, `
      : `\nSince we connected ${connectedSinceText}, `;

    return `Hi ${mutual.name},

Hope you're doing well! I noticed you're connected with ${employee.name}, who is a ${employee.title} at ${employee.jobId === 1 ? "Airbnb" : employee.jobId === 2 ? "Stripe" : "Shopify"}. I recently applied for a position there and I'd love to learn more about the team and culture.
${contextSnippet}I thought you might be willing to introduce us if you feel comfortable doing so.

Thanks in advance for your consideration!

Best,
${queryClient.getQueryData(['/api/auth/me'])?.name || 'Me'}`;
  });

  // Create message mutation
  const createMessage = useMutation({
    mutationFn: async (data: Partial<InsertMessage>) => {
      const res = await apiRequest('POST', '/api/messages', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message queued",
        description: "Your message has been added to the outreach queue."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to queue message",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please write a message before sending.",
        variant: "destructive"
      });
      return;
    }

    const messageData: Partial<InsertMessage> = {
      mutualId: mutual.id,
      employeeId: employee.id,
      messageText: message,
      status: "pending",
      outcome: "pending"
    };

    createMessage.mutate(messageData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center pt-2">Create DM Request</DialogTitle>
          <DialogDescription className="text-center">
            Craft a personalized message to ask {mutual.name} for an introduction to {employee.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="rounded-md bg-gray-50 p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-gray-700">
                  The message will be sent to <span className="font-medium">{mutual.name}</span> asking for an introduction to <span className="font-medium">{employee.name}</span> at <span className="font-medium">{employee.jobId === 1 ? "Airbnb" : employee.jobId === 2 ? "Stripe" : "Shopify"}</span>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <div className="mt-1">
              <Textarea 
                id="message" 
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>
          
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>LinkedIn-Safe Sending</AlertTitle>
            <AlertDescription>
              Your message will be queued with other outreach to stay within LinkedIn's daily limits (10-20 messages).
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter className="sm:grid sm:grid-cols-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={createMessage.isPending}
          >
            {createMessage.isPending ? 'Queuing...' : 'Queue Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
