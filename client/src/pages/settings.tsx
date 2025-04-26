import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, X, ExternalLink, Linkedin, KeyRound, LogOut, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { logout } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreferencesModal from "@/components/modals/PreferencesModal";

export default function Settings() {
  const [dailyDMLimit, setDailyDMLimit] = useState<number>(15);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [sendDelay, setSendDelay] = useState<string>("60");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const { toast } = useToast();
  
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // In a real app, this would save to an API endpoint
      console.log("Saving settings:", settings);
      return "success";
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to save settings",
        description: "An error occurred while saving your settings.",
        variant: "destructive"
      });
    }
  });
  
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would revoke LinkedIn access
      const response = await apiRequest("PATCH", "/api/user", {
        linkedinId: null,
        linkedinToken: null
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "LinkedIn disconnected",
        description: "Your LinkedIn account has been disconnected."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: () => {
      toast({
        title: "Failed to disconnect",
        description: "An error occurred while disconnecting your LinkedIn account.",
        variant: "destructive"
      });
    }
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await logout();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
      // In a real app, this would redirect to login page
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Failed to logout",
        description: "An error occurred while logging out.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({
      dailyDMLimit,
      notifications,
      sendDelay: parseInt(sendDelay)
    });
  };
  
  const handleDisconnectLinkedIn = () => {
    if (confirm("Are you sure you want to disconnect your LinkedIn account?")) {
      disconnectMutation.mutate();
    }
  };
  
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and application preferences</p>
      </div>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Alex Johnson" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="alex@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="alexjohnson" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>LinkedIn Connection</CardTitle>
                <CardDescription>Manage your LinkedIn integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <Linkedin className="h-6 w-6 mr-3 text-[#0A66C2]" />
                    <div>
                      <p className="text-sm font-medium">LinkedIn Account</p>
                      <p className="text-xs text-slate-500">Connected as Alex Johnson</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDisconnectLinkedIn}>
                    Disconnect
                  </Button>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Disconnecting your LinkedIn account will prevent NetworkBridge from fetching new jobs
                    and finding connections. You'll need to reconnect later to resume these functions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Search Preferences</CardTitle>
                <CardDescription>Manage your job search criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsPreferencesOpen(true)}
                >
                  Edit Job Search Preferences
                </Button>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="mb-2 block">Job Alert Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newJobsNotifications" checked={notifications} onCheckedChange={setNotifications} />
                    <Label htmlFor="newJobsNotifications">
                      Notify me when new matching jobs are found
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Manage your visual preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <Switch id="darkMode" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compactView">Compact View</Label>
                  <Switch id="compactView" />
                </div>
                
                <div>
                  <Label className="mb-2 block">Default Landing Page</Label>
                  <Select defaultValue="dashboard">
                    <SelectTrigger>
                      <SelectValue placeholder="Select landing page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="jobs">Jobs</SelectItem>
                      <SelectItem value="connections">Connections</SelectItem>
                      <SelectItem value="messages">Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="messaging">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Messaging Settings</CardTitle>
                <CardDescription>Configure how messages are sent and tracked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dailyDMLimit">Daily DM Limit: {dailyDMLimit}</Label>
                    <span className="text-sm text-slate-500">{dailyDMLimit} messages/day</span>
                  </div>
                  <Slider
                    id="dailyDMLimit"
                    defaultValue={[15]}
                    min={5}
                    max={25}
                    step={1}
                    onValueChange={(value) => setDailyDMLimit(value[0])}
                  />
                  <p className="text-xs text-slate-500">
                    We recommend keeping this under 20 to maintain LinkedIn account safety.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sendDelay">Delay Between Messages</Label>
                  <Select value={sendDelay} onValueChange={setSendDelay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoSend" defaultChecked />
                  <Label htmlFor="autoSend">
                    Automatically send messages from queue
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>Manage your message templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTemplate">Default Introduction Template</Label>
                  <textarea
                    id="defaultTemplate"
                    className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                    defaultValue={`Hi [Friend Name],

Hope you're doing well! [Connection Context].

I noticed you're connected with [Target Employee Name] at [Company]. I'm exploring a [Job Title] role there and would love an introduction if you feel comfortable making one.

Would you be willing to connect us?

Thanks!
[Your Name]`}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="personalize" defaultChecked />
                  <Label htmlFor="personalize">
                    Automatically add personalization to weak connections
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Update Password</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Management</Label>
                    <p className="text-xs text-slate-500">Manage active sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <PreferencesModal 
        isOpen={isPreferencesOpen} 
        onClose={() => setIsPreferencesOpen(false)} 
      />
    </div>
  );
}
