import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import StatCard from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Job, Message } from "@shared/schema";
import JobCard from "@/components/jobs/job-card";
import RecentOutreachTable from "@/components/dashboard/recent-outreach-table";
import { useLinkedIn } from "@/hooks/use-linkedin";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { isConnected, connect } = useLinkedIn();
  
  // Fetch stats for the dashboard
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: isConnected
  });
  
  // Fetch recent jobs
  const { data: jobs } = useQuery({
    queryKey: ['/api/jobs?limit=3'],
    enabled: isConnected
  });
  
  // Fetch recent outreach
  const { data: messages } = useQuery({
    queryKey: ['/api/messages?limit=3'],
    enabled: isConnected
  });
  
  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Welcome to NetworkBridge</h2>
            <p className="mt-1 text-sm text-gray-500">Connect your LinkedIn account to get started</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Connect your LinkedIn account</h3>
              <p className="mt-1 text-sm text-gray-500">Securely link your LinkedIn account to find job opportunities and connections</p>
              <div className="mt-6">
                <Button 
                  onClick={connect}
                  className="inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.08-1.6 2.2v4.258H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.78 3.203 4.092v4.71zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  Connect LinkedIn
                </Button>
              </div>
            </div>
            <div className="mt-10">
              <h4 className="text-sm font-medium text-gray-900">How it works:</h4>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Set your job preferences and get daily job alerts</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Discover 1st-degree mutual connections at target companies</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Send personalized DM requests for introductions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Track your outreach and interview progress</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
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
      
      {/* Stats Overview */}
      <div className="mt-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Jobs Matched" 
            value={stats?.jobsCount || 0} 
            link="/jobs"
            linkText="View all jobs"
          />
          <StatCard 
            title="Mutual Connections" 
            value={stats?.mutualsCount || 0} 
            link="/connections"
            linkText="View all connections"
          />
          <StatCard 
            title="DMs Sent" 
            value={stats?.messagesSentCount || 0} 
            link="/outreach"
            linkText="View outreach"
          />
          <StatCard 
            title="Introductions Made" 
            value={stats?.introductionsMadeCount || 0} 
            link="/outreach"
            linkText="View outcomes"
          />
        </dl>
      </div>
      
      {/* Recent Jobs */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Job Matches</h2>
          <Link href="/jobs" className="text-sm font-medium text-primary hover:text-indigo-700">View all</Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {jobs && jobs.length > 0 ? (
              jobs.map((job: Job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 flex justify-center items-center">
                  <p className="text-gray-500">No job matches found yet</p>
                </CardContent>
              </Card>
            )}
          </ul>
        </div>
      </div>
      
      {/* Recent Outreach */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Outreach</h2>
          <Link href="/outreach" className="text-sm font-medium text-primary hover:text-indigo-700">View all</Link>
        </div>
        
        <RecentOutreachTable messages={messages as Message[] || []} />
      </div>
    </div>
  );
}
