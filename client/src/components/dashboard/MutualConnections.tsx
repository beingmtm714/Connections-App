import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
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
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import MessageComposer from "@/components/modals/MessageComposer";

export default function MutualConnections() {
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  
  const { data: connections, isLoading } = useQuery({
    queryKey: ['/api/mutual-connections']
  });
  
  const handleStrengthChange = async (connectionId: number, value: string) => {
    try {
      await apiRequest("PATCH", `/api/mutual-connections/${connectionId}`, {
        strengthRating: parseInt(value)
      });
      
      // Invalidate cache to refetch connections
      queryClient.invalidateQueries({ queryKey: ['/api/mutual-connections'] });
    } catch (error) {
      console.error("Failed to update connection strength:", error);
    }
  };
  
  const handleMessageClick = (connection: any) => {
    setSelectedConnection(connection);
    setIsMessageModalOpen(true);
  };
  
  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedConnection(null);
  };
  
  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Mutual Connections</h2>
          <Link href="/connections">
            <a className="text-sm text-primary hover:text-blue-700 font-medium">
              View All Connections
            </a>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mutual Connection</TableHead>
                    <TableHead>Title & Company</TableHead>
                    <TableHead>Connection Strength</TableHead>
                    <TableHead>Target Employee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections?.length > 0 ? (
                    connections.slice(0, 3).map((connection: any) => (
                      <TableRow key={connection.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <img 
                              className="h-10 w-10 rounded-full object-cover"
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=random`}
                              alt={connection.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-800">{connection.name}</div>
                              <div className="text-sm text-slate-500">
                                {connection.connectedSince ? 
                                  `Connected since ${new Date(connection.connectedSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 
                                  'Connection date unknown'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-800">{connection.title}</div>
                          <div className="text-sm text-slate-500">{connection.company}</div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={connection.strengthRating.toString()} 
                            onValueChange={(value) => handleStrengthChange(connection.id, value)}
                          >
                            <SelectTrigger className="bg-slate-100 border-0 text-slate-800 text-sm rounded py-1 w-40">
                              <SelectValue placeholder="Select strength" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">⭐⭐⭐⭐⭐ (Strong)</SelectItem>
                              <SelectItem value="4">⭐⭐⭐⭐ (Medium)</SelectItem>
                              <SelectItem value="2">⭐⭐ (Weak)</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-800">{connection.targetName || "Not specified"}</div>
                          <div className="text-sm text-slate-500">{connection.targetTitle || "Unknown position"}</div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            className="text-primary hover:text-blue-800"
                            onClick={() => handleMessageClick(connection)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                        No mutual connections found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
      
      {selectedConnection && (
        <MessageComposer
          isOpen={isMessageModalOpen}
          onClose={closeMessageModal}
          connection={selectedConnection}
        />
      )}
    </>
  );
}
