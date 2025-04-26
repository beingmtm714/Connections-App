import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, 
  MessageSquare, 
  ArrowLeft, 
  Users 
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { LinkedInAPI } from "@/lib/linkedinApi";
import MessageComposer from "@/components/modals/MessageComposer";

export default function Connections() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Extract jobId from URL query params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    if (jobId) {
      setSelectedJob(parseInt(jobId));
    }
  }, [location]);
  
  const { data: jobs } = useQuery({
    queryKey: ['/api/jobs']
  });
  
  const { data: connections, isLoading: isConnectionsLoading } = useQuery({
    queryKey: ['/api/mutual-connections']
  });
  
  const { data: job } = useQuery({
    queryKey: ['/api/jobs', selectedJob],
    enabled: !!selectedJob
  });
  
  const { data: employees } = useQuery({
    queryKey: ['/api/jobs', selectedJob, 'employees'],
    enabled: !!selectedJob
  });
  
  const findConnectionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedJob) {
        throw new Error("No job selected");
      }
      
      setIsLoading(true);
      try {
        const jobData = await queryClient.fetchQuery({
          queryKey: ['/api/jobs', selectedJob],
        });
        
        // Find company employees
        const employees = await LinkedInAPI.findCompanyEmployees(jobData.company);
        
        // Save employees
        for (const employee of employees) {
          const savedEmployee = await apiRequest("POST", `/api/jobs/${selectedJob}/employees`, {
            name: employee.name,
            title: employee.title,
            linkedinUrl: employee.linkedinUrl,
            department: employee.department
          });
          
          const employeeData = await savedEmployee.json();
          
          // Find mutual connections for this employee
          const mutuals = await LinkedInAPI.findMutualConnections(employee.linkedinUrl);
          
          // Save mutual connections
          for (const mutual of mutuals) {
            const connectionContext = await LinkedInAPI.generateConnectionContext(
              mutual.linkedinUrl, 
              mutual.connectedSince
            );
            
            await apiRequest("POST", "/api/mutual-connections", {
              employeeId: employeeData.id,
              name: mutual.name,
              title: mutual.title,
              company: mutual.company,
              linkedinUrl: mutual.linkedinUrl,
              connectedSince: mutual.connectedSince,
              strengthRating: mutual.strengthRating,
              connectionContext
            });
          }
        }
        
        return "success";
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Connections found",
        description: "Mutual connections have been discovered and added to your list."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mutual-connections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', selectedJob, 'employees'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to find connections",
        description: error instanceof Error ? error.message : "An error occurred while finding connections.",
        variant: "destructive"
      });
    }
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
      toast({
        title: "Update failed",
        description: "Failed to update connection strength rating.",
        variant: "destructive"
      });
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
  
  const filteredConnections = connections?.filter((connection: any) => {
    if (!searchTerm) return true;
    
    return (
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Connections</h1>
          <p className="text-slate-500 mt-1">Find and manage your mutual connections</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select a Job</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedJob?.toString()} 
              onValueChange={(value) => setSelectedJob(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs?.map((job: any) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title} at {job.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedJob && (
              <div className="mt-4">
                <Button 
                  className="w-full"
                  onClick={() => findConnectionsMutation.mutate()}
                  disabled={isLoading}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {isLoading ? "Finding..." : "Find Connections"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedJob && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              {job ? (
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-slate-600">{job.company}</p>
                  <p className="text-slate-500 text-sm mt-2">{job.location}</p>
                  
                  <div className="mt-4 flex items-center text-sm text-slate-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{employees?.length || 0} employees found</span>
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View job posting
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500">Select a job to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search connections by name, title, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isConnectionsLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
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
                {filteredConnections?.length > 0 ? (
                  filteredConnections.map((connection: any) => (
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
                      {searchTerm ? 
                        "No connections found matching your search criteria." : 
                        "No mutual connections found. Select a job and click 'Find Connections'."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {selectedConnection && (
        <MessageComposer
          isOpen={isMessageModalOpen}
          onClose={closeMessageModal}
          connection={selectedConnection}
          job={job}
        />
      )}
    </div>
  );
}
