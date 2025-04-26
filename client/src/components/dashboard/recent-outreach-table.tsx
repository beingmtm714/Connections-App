import { Message } from "@shared/schema";
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
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface RecentOutreachTableProps {
  messages: Message[];
}

export default function RecentOutreachTable({ messages }: RecentOutreachTableProps) {
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

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 flex flex-col items-center justify-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">No outreach yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Start by finding connections and sending introduction requests
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                {messages.map((message) => {
                  // In a real app we'd fetch these relationships properly
                  const mutualName = message.mutualId === 1 ? "Michael Roberts" : 
                                     message.mutualId === 2 ? "Jessica Wilson" : 
                                     "Thomas Jackson";
                                     
                  const mutualTitle = message.mutualId === 1 ? "Product Manager" : 
                                      message.mutualId === 2 ? "Design Lead" : 
                                      "Software Engineer";
                  
                  const employeeName = message.employeeId === 1 ? "Julia Chen" : 
                                       message.employeeId === 2 ? "David Kim" : 
                                       "Sarah Smith";
                                       
                  const employeeTitle = message.employeeId === 1 ? "Engineering Manager" : 
                                        message.employeeId === 2 ? "Senior Product Designer" : 
                                        "Tech Lead";
                                        
                  const company = message.employeeId === 1 ? "Airbnb" : 
                                  message.employeeId === 2 ? "Shopify" : 
                                  "Stripe";
                  
                  return (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${mutualName.replace(' ', '+')}`} />
                            <AvatarFallback>{mutualName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{mutualName}</div>
                            <div className="text-sm text-gray-500">{mutualTitle}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{employeeName}</div>
                        <div className="text-sm text-gray-500">{employeeTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{company}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {getOutcomeText(message.outcome, message.status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
