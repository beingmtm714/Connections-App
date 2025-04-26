import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLinkedIn } from "@/hooks/use-linkedin";

// Form schema for job preferences
const jobPreferencesSchema = z.object({
  jobTitles: z.string().min(1, "Job titles are required"),
  locations: z.string().min(1, "Locations are required"),
  industries: z.string().min(1, "Industries are required")
});

type JobPreferencesFormData = z.infer<typeof jobPreferencesSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { isConnected, connect, disconnect } = useLinkedIn();
  
  // Fetch job preferences
  const { data: jobPreferences, isLoading } = useQuery({
    queryKey: ['/api/job-preferences'],
    enabled: isConnected
  });
  
  // Job preferences form
  const form = useForm<JobPreferencesFormData>({
    resolver: zodResolver(jobPreferencesSchema),
    defaultValues: {
      jobTitles: jobPreferences?.jobTitles?.join(', ') || '',
      locations: jobPreferences?.locations?.join(', ') || '',
      industries: jobPreferences?.industries?.join(', ') || ''
    }
  });
  
  // Update form values when we get job preferences data
  React.useEffect(() => {
    if (jobPreferences) {
      form.setValue('jobTitles', jobPreferences.jobTitles.join(', '));
      form.setValue('locations', jobPreferences.locations.join(', '));
      form.setValue('industries', jobPreferences.industries.join(', '));
    }
  }, [jobPreferences, form]);
  
  // Update job preferences mutation
  const updateJobPreferences = useMutation({
    mutationFn: async (data: JobPreferencesFormData) => {
      // Convert comma-separated strings to arrays
      const formattedData = {
        jobTitles: data.jobTitles.split(',').map(item => item.trim()),
        locations: data.locations.split(',').map(item => item.trim()),
        industries: data.industries.split(',').map(item => item.trim())
      };
      
      const res = await apiRequest('POST', '/api/job-preferences', formattedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your job preferences have been saved."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-preferences'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: JobPreferencesFormData) => {
    updateJobPreferences.mutate(data);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
        Settings
      </h2>
      
      {/* LinkedIn Connection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>LinkedIn Connection</CardTitle>
          <CardDescription>
            Manage your LinkedIn account connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              {isConnected ? (
                <Badge className="mt-1 bg-green-100 text-green-800">Connected</Badge>
              ) : (
                <Badge className="mt-1 bg-yellow-100 text-yellow-800">Not Connected</Badge>
              )}
            </div>
            
            {isConnected ? (
              <Button variant="outline" onClick={disconnect}>
                Disconnect LinkedIn
              </Button>
            ) : (
              <Button onClick={connect}>
                <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.08-1.6 2.2v4.258H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.78 3.203 4.092v4.71zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                Connect LinkedIn
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Job Preferences */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
          <CardDescription>
            Set your job search criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="jobTitles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Titles</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer, Frontend Developer, UI Developer" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter job titles separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locations</FormLabel>
                    <FormControl>
                      <Input placeholder="Remote, San Francisco, New York" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter locations separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industries</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology, Finance, Healthcare" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter industries separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={updateJobPreferences.isPending || !isConnected}
              >
                {updateJobPreferences.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
              
              {!isConnected && (
                <FormDescription className="mt-2 text-amber-600">
                  You need to connect your LinkedIn account to save preferences
                </FormDescription>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* DM Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Outreach Settings</CardTitle>
          <CardDescription>
            Configure your automated outreach settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-medium">Daily DM Limit</h4>
                <p className="text-sm text-gray-500">Set the maximum number of DMs to send per day</p>
              </div>
              <span className="font-medium">15</span>
            </div>
            <Slider
              defaultValue={[15]}
              max={20}
              min={5}
              step={1}
              disabled={!isConnected}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>5</span>
              <span>20</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Pause Outreach</h4>
              <p className="text-sm text-gray-500">Temporarily stop sending automated DMs</p>
            </div>
            <Switch disabled={!isConnected} />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Job Match Notifications</h4>
              <p className="text-sm text-gray-500">Get notified when new matching jobs are found</p>
            </div>
            <Switch defaultChecked disabled={!isConnected} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
