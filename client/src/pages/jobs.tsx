import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, MapPin, Users, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkedInAPI } from "@/lib/linkedinApi";

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['/api/jobs']
  });
  
  const { data: preferences } = useQuery({
    queryKey: ['/api/job-preferences']
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest("DELETE", `/api/jobs/${jobId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job deleted",
        description: "The job has been removed from your list."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: () => {
      toast({
        title: "Failed to delete job",
        description: "An error occurred while deleting the job.",
        variant: "destructive"
      });
    }
  });
  
  const fetchNewJobsMutation = useMutation({
    mutationFn: async () => {
      if (!preferences?.titles?.length) {
        throw new Error("Please set job titles in your preferences first");
      }
      
      setIsLoading(true);
      try {
        // Fetch jobs from LinkedIn API
        const newJobs = await LinkedInAPI.fetchJobs(preferences);
        
        // Save each job to our API
        for (const job of newJobs) {
          await apiRequest("POST", "/api/jobs", job);
        }
        
        return newJobs.length;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (count) => {
      toast({
        title: "Jobs fetched",
        description: `${count} new jobs have been added to your list.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to fetch jobs",
        description: error instanceof Error ? error.message : "An error occurred while fetching jobs.",
        variant: "destructive"
      });
    }
  });
  
  const filteredJobs = jobs?.filter(
    (job: any) => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                job.company.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleFetchJobs = () => {
    fetchNewJobsMutation.mutate();
  };
  
  const handleDelete = (jobId: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(jobId);
    }
  };
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Jobs</h1>
          <p className="text-slate-500 mt-1">Explore jobs matching your preferences</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            className="flex items-center"
            onClick={handleFetchJobs}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? "Fetching..." : "Fetch New Jobs"}
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search jobs by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isJobsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item}>
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
                <Skeleton className="h-4 w-40 mt-4" />
                <div className="flex space-x-2 mt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job: any) => (
                <Card key={job.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">{job.title}</h3>
                        <p className="text-slate-600 mt-1">{job.company}</p>
                        <div className="flex items-center mt-2 text-sm text-slate-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      {job.logoUrl && (
                        <img src={job.logoUrl} alt={`${job.company} logo`} className="w-10 h-10 rounded-md" />
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm text-slate-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{job.mutualCount || 0} mutual connections</span>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => window.location.href = `/connections?jobId=${job.id}`}
                      >
                        Find Connections
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        asChild
                      >
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              {searchTerm ? (
                <p className="text-slate-500">No jobs found matching your search criteria.</p>
              ) : (
                <>
                  <p className="text-slate-500">No jobs found. Fetch new jobs or update your preferences.</p>
                  <Button className="mt-4" onClick={handleFetchJobs} disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isLoading ? "Fetching..." : "Fetch Jobs"}
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
