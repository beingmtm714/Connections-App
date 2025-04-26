import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  CalendarRange, 
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Analytics() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [timeframe, setTimeframe] = useState("7days");
  
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['/api/messages']
  });
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats']
  });
  
  // For demo purposes, we're generating analytics from the messages
  // In a real app, these would come from dedicated analytics endpoints
  
  // Prepare data for charts
  const prepareStatusData = () => {
    if (!messages) return [];
    
    const statusCounts: Record<string, number> = {
      "Draft": 0,
      "Sent": 0,
      "ResponseReceived": 0
    };
    
    messages.forEach((message: any) => {
      if (statusCounts[message.status] !== undefined) {
        statusCounts[message.status]++;
      }
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const prepareOutcomeData = () => {
    if (!messages) return [];
    
    const outcomeCounts: Record<string, number> = {
      "Pending": 0,
      "IntroMade": 0,
      "Declined": 0,
      "Ghosted": 0,
      "Interview": 0
    };
    
    messages.forEach((message: any) => {
      if (outcomeCounts[message.outcome] !== undefined) {
        outcomeCounts[message.outcome]++;
      }
    });
    
    return Object.entries(outcomeCounts).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const prepareDailyActivity = () => {
    if (!messages) return [];
    
    // Create a date range based on the timeframe
    const today = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case "7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    // Override with custom date range if set
    if (dateRange.from && dateRange.to) {
      startDate = dateRange.from;
      today.setTime(dateRange.to.getTime());
    }
    
    // Initialize data with all dates in the range
    const dateMap: Record<string, { sent: number, responses: number, intros: number }> = {};
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateKey = format(currentDate, 'MMM dd');
      dateMap[dateKey] = { sent: 0, responses: 0, intros: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Populate data from messages
    messages.forEach((message: any) => {
      if (message.sentDate) {
        const sentDate = new Date(message.sentDate);
        if (sentDate >= startDate && sentDate <= today) {
          const dateKey = format(sentDate, 'MMM dd');
          if (dateMap[dateKey]) {
            dateMap[dateKey].sent++;
          }
        }
      }
      
      if (message.responseDate) {
        const responseDate = new Date(message.responseDate);
        if (responseDate >= startDate && responseDate <= today) {
          const dateKey = format(responseDate, 'MMM dd');
          if (dateMap[dateKey]) {
            dateMap[dateKey].responses++;
          }
        }
      }
      
      if (message.outcome === "IntroMade" || message.outcome === "Interview") {
        // Since we don't have intro date, let's use response date or sent date
        let introDate = message.responseDate ? new Date(message.responseDate) : 
                        message.sentDate ? new Date(message.sentDate) : null;
        
        if (introDate && introDate >= startDate && introDate <= today) {
          const dateKey = format(introDate, 'MMM dd');
          if (dateMap[dateKey]) {
            dateMap[dateKey].intros++;
          }
        }
      }
    });
    
    // Convert to array format for the chart
    return Object.entries(dateMap).map(([date, counts]) => ({
      date,
      sent: counts.sent,
      responses: counts.responses,
      intros: counts.intros
    }));
  };
  
  // Calculate stats changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100; // Avoid division by zero
    return ((current - previous) / previous) * 100;
  };
  
  const statusData = prepareStatusData();
  const outcomeData = prepareOutcomeData();
  const activityData = prepareDailyActivity();
  
  // Colors for charts
  const COLORS = ['#2563eb', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your job search networking performance</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Jobs Tracked</p>
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-semibold">{stats?.jobsTracked || 0}</h3>
                    <span className="text-xs font-medium text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      10%
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-blue-100 p-2 rounded-md">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Messages Sent</p>
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-semibold">{stats?.messagesSent || 0}</h3>
                    <span className="text-xs font-medium text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      25%
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-indigo-100 p-2 rounded-md">
                <PieChartIcon className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Responses</p>
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-semibold">{stats?.responses || 0}</h3>
                    <span className="text-xs font-medium text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      15%
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-emerald-100 p-2 rounded-md">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Intros Made</p>
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-semibold">{stats?.introsMade || 0}</h3>
                    <span className="text-xs font-medium text-red-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      5%
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-amber-100 p-2 rounded-md">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Custom date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(value) => {
                setDateRange(value as any);
                if (value?.from && value?.to) {
                  setTimeframe("custom");
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Networking Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isMessagesLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" name="Messages Sent" fill="#2563eb" />
                  <Bar dataKey="responses" name="Responses" fill="#10b981" />
                  <Bar dataKey="intros" name="Intros Made" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Message Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isMessagesLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          {isMessagesLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={outcomeData}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" name="Count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
