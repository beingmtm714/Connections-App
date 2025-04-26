import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Employee, Mutual, InsertMessage } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getTemplateByStrength } from "@/lib/message-templates";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/connections/star-rating";
import { Input } from "@/components/ui/input";

interface DMBuilderModalProps {
  mutual: Mutual;
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export default function DMBuilderModal({ mutual, employee, isOpen, onClose }: DMBuilderModalProps) {
  const { toast } = useToast();
  
  // Get current user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: isOpen
  });
  
  // Get job data for the employee
  const { data: jobData } = useQuery({
    queryKey: [`/api/jobs/${employee.jobId}`],
    enabled: isOpen && !!employee.jobId
  });

  // Connection strength state
  const [connectionStrength, setConnectionStrength] = useState<number>(mutual.ratedStrength || 0);
  
  // Store LinkedIn URL and calendar URL
  const [userLinkedInUrl, setUserLinkedInUrl] = useState("https://linkedin.com/in/yourprofile");
  const [calendarUrl, setCalendarUrl] = useState("https://calendly.com/yourusername");

  // Message state
  const [message, setMessage] = useState("");
  
  // Update message when connection strength changes
  useEffect(() => {
    if (!userData || !jobData) return;
    
    const templateOptions = {
      friendName: mutual.name,
      jobTitle: jobData.title,
      jobUrl: jobData.jobUrl,
      targetCompany: jobData.company,
      employeeName: employee.name,
      userName: userData.name || "Your Name",
      userLinkedInUrl: userLinkedInUrl,
      calendarUrl: calendarUrl
    };
    
    setMessage(getTemplateByStrength(connectionStrength, templateOptions));
  }, [connectionStrength, mutual, employee, userData, jobData, userLinkedInUrl, calendarUrl]);

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
      
      // Update mutual's connection strength if it has changed
      if (connectionStrength !== mutual.ratedStrength) {
        updateMutualStrength.mutate({
          id: mutual.id,
          ratedStrength: connectionStrength
        });
      } else {
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to queue message",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  // Update mutual strength mutation
  const updateMutualStrength = useMutation({
    mutationFn: async (data: { id: number, ratedStrength: number }) => {
      const res = await apiRequest('PATCH', `/api/mutuals/${data.id}`, { ratedStrength: data.ratedStrength });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mutuals'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update connection strength",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
      onClose();
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
  
  // Helper function to get strength badge
  const getStrengthBadge = (rating: number) => {
    if (rating >= 4) return <Badge className="bg-green-100 text-green-800">Strong</Badge>;
    if (rating >= 3) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    if (rating > 0) return <Badge className="bg-red-100 text-red-800">Weak</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Not Rated</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center pt-2">Create Templated Introduction Request</DialogTitle>
          <DialogDescription className="text-center">
            Customize your introduction request to {mutual.name} for {employee.name} at {jobData?.company || "the company"}.
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
                  The message will be sent to <span className="font-medium">{mutual.name}</span> asking for an introduction to <span className="font-medium">{employee.name}</span> at <span className="font-medium">{jobData?.company || "the company"}</span>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700">How strong is your connection with {mutual.name}?</label>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={connectionStrength} maxRating={5} />
                <span className="ml-2">{getStrengthBadge(connectionStrength)}</span>
              </div>
              
              <RadioGroup 
                value={connectionStrength.toString()} 
                onValueChange={(value) => setConnectionStrength(parseInt(value))}
                className="grid grid-cols-3 gap-4 mt-2"
              >
                <div>
                  <RadioGroupItem value="5" id="strong" className="peer sr-only" />
                  <Label
                    htmlFor="strong"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-green-50 p-4 hover:bg-green-100 hover:text-accent-foreground peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-100 [&:has([data-state=checked])]:border-green-600"
                  >
                    <span>Strong (5)</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="3" id="medium" className="peer sr-only" />
                  <Label
                    htmlFor="medium"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-yellow-50 p-4 hover:bg-yellow-100 hover:text-accent-foreground peer-data-[state=checked]:border-yellow-600 peer-data-[state=checked]:bg-yellow-100 [&:has([data-state=checked])]:border-yellow-600"
                  >
                    <span>Medium (3)</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="1" id="weak" className="peer sr-only" />
                  <Label
                    htmlFor="weak"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-red-50 p-4 hover:bg-red-100 hover:text-accent-foreground peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-100 [&:has([data-state=checked])]:border-red-600"
                  >
                    <span>Weak (1)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">Your LinkedIn URL</label>
                <Input
                  id="linkedinUrl"
                  value={userLinkedInUrl}
                  onChange={(e) => setUserLinkedInUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="calendarUrl" className="block text-sm font-medium text-gray-700">Your Calendar URL</label>
                <Input
                  id="calendarUrl"
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                  placeholder="https://calendly.com/yourusername"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <span className="text-sm text-gray-500">
                Template: {connectionStrength >= 4 ? "Strong" : connectionStrength >= 3 ? "Medium" : "Weak"} Connection
              </span>
            </div>
            <div className="mt-1">
              <Textarea 
                id="message" 
                rows={12}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[280px]"
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
            disabled={createMessage.isPending || updateMutualStrength.isPending}
          >
            {createMessage.isPending ? 'Queuing...' : 'Queue Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
