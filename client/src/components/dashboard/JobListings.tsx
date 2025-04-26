import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobListings() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs']
  });
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Recent Job Matches</h2>
        <Link href="/jobs">
          <a className="text-sm text-primary hover:text-blue-700 font-medium">
            View All Jobs
          </a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow p-6">
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
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs?.length > 0 ? (
            jobs.slice(0, 3).map((job: any) => (
              <div key={job.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-5">
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
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-500">No jobs found. Add your job preferences to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
