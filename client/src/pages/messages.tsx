import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const { toast } = useToast();
  
  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/messages']
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (messageId: number) => {
      // This would be implemented if we had a delete endpoint
      // For now we'll rely on updating status instead
      const response = await apiRequest("PATCH", `/api/messages/${messageId}`, {
        status: "Deleted"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "The message has been removed from your list."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: () => {
      toast({
        title: "Failed to delete message",
        description: "An error occurred while deleting the message.",
        variant: "destructive"
      });
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }: { messageId: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Message status has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: () => {
      toast({
        title: "Failed to update status",
        description: "An error occurred while updating the message status.",
        variant: "destructive"
      });
    }
  });
  
  const updateOutcomeMutation = useMutation({
    mutationFn: async ({ messageId, outcome }: { messageId: number, outcome: string }) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}`, { outcome });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Outcome updated",
        description: "Message outcome has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: () => {
      toast({
        title: "Failed to update outcome",
        description: "An error occurred while updating the message outcome.",
        variant: "destructive"
      });
    }
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Draft</Badge>;
      case "Sent":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Message Sent</Badge>;
      case "ResponseReceived":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Response Received</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>;
    }
  };
  
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "Pending":
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Pending</Badge>;
      case "IntroMade":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Introduction Made</Badge>;
      case "Declined":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Declined</Badge>;
      case "Ghosted":
        return <Badge variant="outline" className="bg-slate-200 text-slate-700 border-slate-300">Ghosted</Badge>;
      case "Interview":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Interview</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">{outcome}</Badge>;
    }
  };
  
  const handleDeleteMessage = (messageId: number) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate(messageId);
    }
  };
  
  const handleUpdateStatus = (messageId: number, status: string) => {
    updateStatusMutation.mutate({ messageId, status });
  };
  
  const handleUpdateOutcome = (messageId: number, outcome: string) => {
    updateOutcomeMutation.mutate({ messageId, outcome });
  };
  
  const filteredMessages = messages?.filter((message: any) => {
    const matchesSearch = 
      !searchTerm || 
      (message.mutualName && message.mutualName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.targetName && message.targetName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.messageText && message.messageText.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesOutcome = outcomeFilter === "all" || message.outcome === outcomeFilter;
    
    return matchesSearch && matchesStatus && matchesOutcome;
  });
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Messages</h1>
          <p className="text-slate-500 mt-1">Track and manage your introduction requests</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="ResponseReceived">Response Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="IntroMade">Intro Made</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
                <SelectItem value="Ghosted">Ghosted</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mutual</TableHead>
                  <TableHead>Target & Job</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages?.length > 0 ? (
                  filteredMessages.map((message: any) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-800">
                          {message.mutualName || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-800">
                          {message.targetName || "Unknown"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {message.jobTitle || "Unknown position"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {message.sentDate ? new Date(message.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not sent yet'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={message.status} 
                          onValueChange={(value) => handleUpdateStatus(message.id, value)}
                        >
                          <SelectTrigger className="w-40 h-8 px-2 py-0">
                            <SelectValue placeholder="Status">
                              {getStatusBadge(message.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Sent">Sent</SelectItem>
                            <SelectItem value="ResponseReceived">Response Received</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={message.outcome} 
                          onValueChange={(value) => handleUpdateOutcome(message.id, value)}
                        >
                          <SelectTrigger className="w-40 h-8 px-2 py-0">
                            <SelectValue placeholder="Outcome">
                              {getOutcomeBadge(message.outcome)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="IntroMade">Introduction Made</SelectItem>
                            <SelectItem value="Declined">Declined</SelectItem>
                            <SelectItem value="Ghosted">Ghosted</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            asChild
                          >
                            <Link href={`/messages/${message.id}`}>
                              {message.status === "Draft" ? (
                                <Edit className="h-4 w-4 text-slate-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-600" />
                              )}
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      {searchTerm || statusFilter !== "all" || outcomeFilter !== "all" ? 
                        "No messages found matching your filters." : 
                        "No messages found. Create message requests from the Connections page."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
