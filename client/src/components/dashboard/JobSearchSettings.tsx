import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PreferencesModal from "@/components/modals/PreferencesModal";

export default function JobSearchSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/job-preferences']
  });
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <>
      <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Job Search Settings</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-primary hover:text-blue-700 font-medium"
            onClick={openModal}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Job Titles</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data?.titles?.length > 0 ? (
                    data.titles.map((title: string, index: number) => (
                      <span key={index} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                        {title}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No job titles set</span>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Locations</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data?.locations?.length > 0 ? (
                    data.locations.map((location: string, index: number) => (
                      <span key={index} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                        {location}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No locations set</span>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Industries</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data?.industries?.length > 0 ? (
                    data.industries.map((industry: string, index: number) => (
                      <span key={index} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                        {industry}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No industries set</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <PreferencesModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        initialData={data}
      />
    </>
  );
}
