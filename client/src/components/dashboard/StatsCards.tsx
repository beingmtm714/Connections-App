import { useQuery } from "@tanstack/react-query";
import { 
  Briefcase, 
  MessageSquare, 
  Reply, 
  Handshake 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/stats']
  });
  
  const stats = [
    { 
      label: "Jobs Tracked", 
      value: data?.jobsTracked || 0, 
      icon: Briefcase, 
      bgColor: "bg-blue-100", 
      textColor: "text-primary" 
    },
    { 
      label: "Messages Sent", 
      value: data?.messagesSent || 0, 
      icon: MessageSquare, 
      bgColor: "bg-indigo-100", 
      textColor: "text-secondary" 
    },
    { 
      label: "Responses", 
      value: data?.responses || 0, 
      icon: Reply, 
      bgColor: "bg-emerald-100", 
      textColor: "text-emerald-600" 
    },
    { 
      label: "Intros Made", 
      value: data?.introsMade || 0, 
      icon: Handshake, 
      bgColor: "bg-amber-100", 
      textColor: "text-amber-600" 
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start">
            <div className={`p-2 rounded-md ${stat.bgColor} ${stat.textColor}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-slate-800">{stat.value}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
