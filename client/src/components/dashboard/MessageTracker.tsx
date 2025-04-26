import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MessageTracker() {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/messages']
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Message Tracker</h2>
        <Link href="/messages">
          <a className="text-sm text-primary hover:text-blue-700 font-medium">
            View All Messages
          </a>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((item) => (
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
                {messages?.length > 0 ? (
                  messages.slice(0, 3).map((message: any) => (
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
                        {getStatusBadge(message.status)}
                      </TableCell>
                      <TableCell>
                        {getOutcomeBadge(message.outcome)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-blue-800"
                          asChild
                        >
                          <Link href={`/messages/${message.id}`}>
                            {message.status === "Draft" ? (
                              <>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </>
                            )}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      No messages found
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
