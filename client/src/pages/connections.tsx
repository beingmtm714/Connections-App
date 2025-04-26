import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Job, Mutual, Employee } from "@shared/schema";
import ConnectionCard from "@/components/connections/connection-card";
import DMBuilderModal from "@/components/outreach/dm-builder-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ConnectionsProps {
  jobId?: string;
}

export default function Connections({ jobId }: ConnectionsProps) {
  const [location] = useLocation();
  const [isDMModalOpen, setIsDMModalOpen] = useState(false);
  const [selectedMutual, setSelectedMutual] = useState<Mutual | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Fetch job details if job ID is provided
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: [jobId ? `/api/jobs/${jobId}` : null],
    enabled: !!jobId
  });
  
  // Fetch employees for the job
  const { data: employees, isLoading: isEmployeesLoading } = useQuery({
    queryKey: [jobId ? `/api/jobs/${jobId}/employees` : null],
    enabled: !!jobId
  });
  
  // Fetch mutuals for the employee
  const { data: mutuals, isLoading: isMutualsLoading } = useQuery({
    queryKey: [jobId ? `/api/mutuals?employeeId=${jobId}` : '/api/mutuals'],
    enabled: true
  });
  
  const handleOpenDMModal = (mutual: Mutual) => {
    const employeeForMutual = employees?.find(emp => emp.id === mutual.employeeId);
    
    setSelectedMutual(mutual);
    setSelectedEmployee(employeeForMutual || null);
    setIsDMModalOpen(true);
  };
  
  const handleCloseDMModal = () => {
    setIsDMModalOpen(false);
    setSelectedMutual(null);
    setSelectedEmployee(null);
  };
  
  const isLoading = isJobLoading || isEmployeesLoading || isMutualsLoading;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Mutual Connections
          </h2>
          {job && (
            <p className="mt-1 text-sm text-gray-500">
              {job.company} - {job.title}
            </p>
          )}
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" className="inline-flex items-center mr-3">
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Connections
          </Button>
          <Button className="inline-flex items-center">
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export Connections
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-4 space-y-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <Skeleton className="h-9 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {mutuals && mutuals.length > 0 ? (
            mutuals.map((mutual: Mutual) => (
              <ConnectionCard 
                key={mutual.id} 
                mutual={mutual} 
                onCreateDM={() => handleOpenDMModal(mutual)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
              <p className="mt-1 text-sm text-gray-500">
                We couldn't find any mutual connections for this job.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* DM Builder Modal */}
      {isDMModalOpen && selectedMutual && selectedEmployee && (
        <DMBuilderModal 
          mutual={selectedMutual}
          employee={selectedEmployee}
          isOpen={isDMModalOpen}
          onClose={handleCloseDMModal}
        />
      )}
    </div>
  );
}
