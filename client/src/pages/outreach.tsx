import { useQuery } from "@tanstack/react-query";
import { Message, Mutual, Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'sent':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">DM Sent</Badge>;
    case 'responded':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Response Received</Badge>;
    case 'intro_made':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Intro Made</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pending</Badge>;
  }
};

// Helper function to get outcome text
const getOutcomeText = (outcome: string, status: string) => {
  if (status === 'pending') return 'Pending Send';
  if (status === 'sent') return 'Pending Response';
  
  switch (outcome) {
    case 'interview':
      return 'Interview Scheduled';
    case 'declined':
      return 'Declined';
    case 'ghosted':
      return 'No Response';
    default:
      return 'Pending Introduction';
  }
};

export default function Outreach() {
  // Fetch all messages
  const { data: messages, isLoading: messagesLoading } = useQuery({ 
    queryKey: ['/api/messages'] 
  });
  
  // Fetch all mutuals (needed to display names)
  const { data: mutuals, isLoading: mutualsLoading } = useQuery({ 
    queryKey: ['/api/mutuals'] 
  });
  
  const isLoading = messagesLoading || mutualsLoading;
  
  // Find mutual for a message
  const findMutual = (mutualId: number) => {
    return mutuals?.find((m: Mutual) => m.id === mutualId);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Outreach
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track all your connection requests and introductions
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" className="mr-3">
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Outreach
          </Button>
          <Button>
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mutual Connection</TableHead>
                      <TableHead>Target Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading state
                      [1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="ml-4 space-y-1">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-28 mt-1" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-28 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-32" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : messages && messages.length > 0 ? (
                      messages.map((message: Message) => {
                        const mutual = findMutual(message.mutualId);
                        
                        return (
                          <TableRow key={message.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={`https://ui-avatars.com/api/?name=${mutual?.name.replace(' ', '+')}`} />
                                  <AvatarFallback>{mutual?.name[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {mutual?.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {mutual?.title}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                {/* In a real app, we'd look up the employee name */}
                                {message.employeeId === 1 ? "Julia Chen" : 
                                 message.employeeId === 2 ? "David Kim" : 
                                 message.employeeId === 3 ? "Sarah Smith" : "Unknown Employee"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {message.employeeId === 1 ? "Engineering Manager" : 
                                 message.employeeId === 2 ? "Senior Product Designer" : 
                                 message.employeeId === 3 ? "Tech Lead" : "Unknown"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                {message.employeeId === 1 ? "Airbnb" : 
                                 message.employeeId === 2 ? "Shopify" : 
                                 message.employeeId === 3 ? "Stripe" : "Unknown"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(message.status)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-500">
                              {getOutcomeText(message.outcome, message.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages sent yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Start by finding connections and sending introduction requests.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
