import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  connection: any;
  job?: any;
}

export default function MessageComposer({ isOpen, onClose, connection, job }: MessageComposerProps) {
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    if (connection) {
      // Generate personalized message template
      const template = generateMessageTemplate(connection);
      setMessageText(template);
    }
  }, [connection]);
  
  const generateMessageTemplate = (connection: any) => {
    const mutualName = connection.name;
    const targetName = connection.targetName || "your colleague";
    const company = job?.company || connection.targetCompany || "the company";
    const jobTitle = job?.title || connection.targetTitle || "the position";
    const context = connection.connectionContext || `We connected on LinkedIn ${connection.connectedSince ? `around ${new Date(connection.connectedSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}`;
    
    return `Hi ${mutualName},

Hope you're doing well! ${context}.

I noticed you're connected with ${targetName} at ${company}. I'm exploring a ${jobTitle} role there and would love an introduction if you feel comfortable making one.

Would you be willing to connect us?

Thanks!
[Your Name]`;
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        mutualConnectionId: connection.id,
        targetEmployeeId: connection.targetEmployeeId || 0,
        jobId: job?.id || 0,
        messageText,
        status: "Sent",
        outcome: "Pending",
        sentDate: new Date().toISOString()
      };
      
      const response = await apiRequest("POST", "/api/messages", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been queued for sending.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: "An error occurred while sending the message. Please try again.",
        variant: "destructive"
      });
      console.error("Send message error:", error);
    }
  });
  
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        mutualConnectionId: connection.id,
        targetEmployeeId: connection.targetEmployeeId || 0,
        jobId: job?.id || 0,
        messageText,
        status: "Draft",
        outcome: "Pending"
      };
      
      const response = await apiRequest("POST", "/api/messages", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Draft saved",
        description: "Your message draft has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to save draft",
        description: "An error occurred while saving the draft. Please try again.",
        variant: "destructive"
      });
      console.error("Save draft error:", error);
    }
  });
  
  const handleSend = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message is empty",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }
    
    sendMessageMutation.mutate();
  };
  
  const handleSaveDraft = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message is empty",
        description: "Please enter a message before saving as draft.",
        variant: "destructive"
      });
      return;
    }
    
    saveDraftMutation.mutate();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Compose Introduction Request</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <img 
              className="h-12 w-12 rounded-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=random`}
              alt={connection.name}
            />
            <div className="ml-4">
              <div className="font-medium text-slate-800">{connection.name}</div>
              <div className="text-sm text-slate-500">{connection.title} at {connection.company}</div>
            </div>
          </div>
          
          {connection.connectionContext && (
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-slate-500 mb-2">Connection Context</p>
              <p className="text-sm text-slate-700">{connection.connectionContext}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Introduction Request For</label>
            <div className="flex items-center p-3 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-800">{connection.targetName || "Target Employee"}</div>
                <div className="text-sm text-slate-500">{connection.targetTitle || "Position"} at {connection.targetCompany || job?.company || "Company"}</div>
              </div>
            </div>
          </div>
          
          {job && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Job Position</label>
              <div className="flex items-center p-3 border border-slate-200 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800">{job.title}</div>
                  <div className="text-sm text-slate-500">{job.company}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
            <Textarea 
              value={messageText} 
              onChange={(e) => setMessageText(e.target.value)} 
              rows={6}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSaveDraft} 
            disabled={saveDraftMutation.isPending}
          >
            Save as Draft
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sendMessageMutation.isPending}
          >
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
