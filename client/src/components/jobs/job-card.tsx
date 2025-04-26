import { Job } from "@shared/schema";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  // Fetch mutual connections count for this job
  const { data: mutuals } = useQuery({
    queryKey: [`/api/mutuals?jobId=${job.id}`]
  });
  
  const mutualsCount = mutuals?.length || 0;
  
  // Calculate the time elapsed since posted
  const timeAgo = job.postedDate ? 
    formatDistance(new Date(job.postedDate), new Date(), { addSuffix: false }) : 
    'Recently';
  
  return (
    <li>
      <div className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {job.logoUrl ? (
                  <img src={job.logoUrl} alt={job.company} className="h-10 w-10" />
                ) : (
                  <span className="text-gray-500 font-medium">{job.company[0]}</span>
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-primary truncate">{job.title}</p>
                <p className="text-sm text-gray-500">{job.company}</p>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              {job.isNew ? (
                <Badge className="bg-green-100 text-green-800">New</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">{timeAgo} old</Badge>
              )}
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </p>
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted {timeAgo} ago
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <span className="font-medium text-primary mr-1">{mutualsCount}</span> mutual connections
              <Link href={`/connections/${job.id}`}>
                <Button size="sm" className="ml-4">
                  Find Connections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
