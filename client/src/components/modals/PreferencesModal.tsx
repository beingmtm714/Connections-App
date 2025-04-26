import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Plus, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    titles?: string[];
    locations?: string[];
    industries?: string[];
  };
}

export default function PreferencesModal({ isOpen, onClose, initialData }: PreferencesModalProps) {
  const [titles, setTitles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (initialData) {
      setTitles(initialData.titles || []);
      setLocations(initialData.locations || []);
      setIndustries(initialData.industries || []);
    }
  }, [initialData]);
  
  const savePreferencesMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        titles,
        locations,
        industries
      };
      
      const response = await apiRequest("POST", "/api/job-preferences", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your job search preferences have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-preferences'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to save preferences",
        description: "An error occurred while saving preferences. Please try again.",
        variant: "destructive"
      });
      console.error("Save preferences error:", error);
    }
  });
  
  const addItem = (type: 'title' | 'location' | 'industry', value: string) => {
    if (!value.trim()) return;
    
    switch (type) {
      case 'title':
        if (!titles.includes(value)) {
          setTitles([...titles, value]);
        }
        setNewTitle("");
        break;
      case 'location':
        if (!locations.includes(value)) {
          setLocations([...locations, value]);
        }
        setNewLocation("");
        break;
      case 'industry':
        if (!industries.includes(value)) {
          setIndustries([...industries, value]);
        }
        setNewIndustry("");
        break;
    }
  };
  
  const removeItem = (type: 'title' | 'location' | 'industry', index: number) => {
    switch (type) {
      case 'title':
        setTitles(titles.filter((_, i) => i !== index));
        break;
      case 'location':
        setLocations(locations.filter((_, i) => i !== index));
        break;
      case 'industry':
        setIndustries(industries.filter((_, i) => i !== index));
        break;
    }
  };
  
  const handleSave = () => {
    savePreferencesMutation.mutate();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Job Search Preferences</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Job Titles</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {titles.map((title, index) => (
                <div key={index} className="flex items-center bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                  {title}
                  <button 
                    className="ml-2 text-slate-500 hover:text-slate-700"
                    onClick={() => removeItem('title', index)}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add job title"
                onKeyPress={(e) => e.key === 'Enter' && addItem('title', newTitle)}
              />
              <Button 
                size="sm" 
                onClick={() => addItem('title', newTitle)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Locations</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                  {location}
                  <button 
                    className="ml-2 text-slate-500 hover:text-slate-700"
                    onClick={() => removeItem('location', index)}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location"
                onKeyPress={(e) => e.key === 'Enter' && addItem('location', newLocation)}
              />
              <Button 
                size="sm" 
                onClick={() => addItem('location', newLocation)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Industries</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {industries.map((industry, index) => (
                <div key={index} className="flex items-center bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                  {industry}
                  <button 
                    className="ml-2 text-slate-500 hover:text-slate-700"
                    onClick={() => removeItem('industry', index)}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                placeholder="Add industry"
                onKeyPress={(e) => e.key === 'Enter' && addItem('industry', newIndustry)}
              />
              <Button 
                size="sm" 
                onClick={() => addItem('industry', newIndustry)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={savePreferencesMutation.isPending}
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
