import { Mutual } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import StarRating from "@/components/connections/star-rating";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConnectionCardProps {
  mutual: Mutual;
  onCreateDM: () => void;
}

export default function ConnectionCard({ mutual, onCreateDM }: ConnectionCardProps) {
  const { toast } = useToast();
  const [localRating, setLocalRating] = useState<number>(mutual.ratedStrength || 0);
  const [isUpdatingRating, setIsUpdatingRating] = useState<boolean>(false);
  
  // Fetch employee data for the mutual
  const { data: employee } = useQuery({
    queryKey: [`/api/employees/${mutual.employeeId}`],
    enabled: !!mutual.employeeId
  });
  
  // Mutation to update connection strength
  const updateConnectionStrength = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest('PATCH', `/api/mutuals/${mutual.id}`, { ratedStrength: rating });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection updated",
        description: "Connection strength has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mutuals'] });
      setIsUpdatingRating(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update connection",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
      setIsUpdatingRating(false);
      setLocalRating(mutual.ratedStrength || 0); // Reset to original value
    }
  });
  
  // Handle rating change
  const handleRatingChange = (newRating: number) => {
    setLocalRating(newRating);
    setIsUpdatingRating(true);
    updateConnectionStrength.mutate(newRating);
  };
  
  // Helper function to get strength badge
  const getStrengthBadge = (rating: number) => {
    if (rating >= 4) return <Badge className="bg-green-100 text-green-800">Strong</Badge>;
    if (rating >= 3) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    if (rating > 0) return <Badge className="bg-red-100 text-red-800">Weak</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Not Rated</Badge>;
  };
  
  // Format the date to month year
  const formattedDate = mutual.connectedSince ? 
    format(new Date(mutual.connectedSince), 'MMMM yyyy') : 
    'Unknown';
  
  // Determine message template type based on rating
  const getMessageTemplateType = (rating: number) => {
    if (rating >= 4) return "Strong connection template";
    if (rating >= 3) return "Medium connection template";
    if (rating > 0) return "Weak connection template";
    return "Rate connection to see template";
  };
  
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
          {getStrengthBadge(localRating)}
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Connection Strength</h4>
            {isUpdatingRating && <span className="text-xs text-blue-500">Updating...</span>}
          </div>
          <div className="flex items-center mt-1">
            <StarRating 
              rating={localRating} 
              interactive={true}
              onRatingChange={handleRatingChange}
            />
            <span className="ml-2 text-xs text-gray-500">(Click to rate)</span>
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
        
        <div className="mt-4 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500">
            Message template: <span className="font-medium">{getMessageTemplateType(localRating)}</span>
          </p>
        </div>
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
