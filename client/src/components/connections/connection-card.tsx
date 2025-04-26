import { Mutual } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import StarRating from "@/components/connections/star-rating";
import { useQuery } from "@tanstack/react-query";

interface ConnectionCardProps {
  mutual: Mutual;
  onCreateDM: () => void;
}

export default function ConnectionCard({ mutual, onCreateDM }: ConnectionCardProps) {
  // Fetch employee data for the mutual
  const { data: employee } = useQuery({
    queryKey: [`/api/employees/${mutual.employeeId}`],
    enabled: !!mutual.employeeId
  });
  
  // Helper function to get strength badge
  const getStrengthBadge = (rating: number) => {
    if (rating >= 4) return <Badge className="bg-green-100 text-green-800">Strong</Badge>;
    if (rating >= 3) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Weak</Badge>;
  };
  
  // Format the date to month year
  const formattedDate = mutual.connectedSince ? 
    format(new Date(mutual.connectedSince), 'MMMM yyyy') : 
    'Unknown';
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6 flex justify-between">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${mutual.name.replace(' ', '+')}`} />
            <AvatarFallback>{mutual.name[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {mutual.name}
            </h3>
            <p className="text-sm text-gray-500">
              {mutual.title}
            </p>
          </div>
        </div>
        <div>
          {getStrengthBadge(mutual.ratedStrength)}
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700">Connection Strength</h4>
          <div className="flex items-center mt-1">
            <StarRating rating={mutual.ratedStrength} />
          </div>
        </div>
        
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700">Connected Since</h4>
          <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
        </div>
        
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700">Connection Context</h4>
          <p className="mt-1 text-sm text-gray-500">{mutual.connectionContext || 'No context available'}</p>
        </div>
        
        {employee && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700">Target Contact</h4>
            <div className="mt-1 flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${employee.name.replace(' ', '+')}`} />
                <AvatarFallback>{employee.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3 text-sm">
                <p className="font-medium text-gray-700">{employee.name}</p>
                <p className="text-gray-500">{employee.title}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="px-4 py-4 sm:px-6">
        <Button 
          onClick={onCreateDM}
          className="w-full"
        >
          Create DM Request
        </Button>
      </div>
    </div>
  );
}
