import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Job } from "@shared/schema";
import JobCard from "@/components/jobs/job-card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Jobs() {
  // Fetch all jobs
  const { data: jobs, isLoading } = useQuery({ 
    queryKey: ['/api/jobs'] 
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Job Matches
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" className="mr-3">
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Jobs
          </Button>
          <Button>
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Job Preferences
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {isLoading ? (
              // Loading state
              [1, 2, 3].map((i) => (
                <li key={i} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4 space-y-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <Skeleton className="h-4 w-32 mt-2 sm:mt-0" />
                      <Skeleton className="h-4 w-36 mt-2 sm:mt-0 sm:ml-6" />
                    </div>
                    <Skeleton className="h-8 w-36 mt-2 sm:mt-0" />
                  </div>
                </li>
              ))
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job: Job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by setting up your job preferences.
                </p>
                <div className="mt-6">
                  <Link href="/settings">
                    <Button>
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Job Preferences
                    </Button>
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
