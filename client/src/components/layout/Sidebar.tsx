import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageSquare, 
  BarChart2, 
  Settings,
  Network
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: user } = useQuery({ 
    queryKey: ['/api/user'],
    enabled: false // Placeholder - would be enabled in a real app with auth
  });
  
  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/connections", label: "Connections", icon: Users },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };
  
  return (
    <aside className="bg-slate-800 text-white w-64 flex-shrink-0 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-semibold flex items-center">
          <Network className="mr-3" />
          NetworkBridge
        </h1>
      </div>
      
      <nav className="mt-4 flex-1">
        <ul>
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            
            return (
              <li key={link.href}>
                <Link href={link.href}>
                  <a 
                    className={cn(
                      "flex items-center py-3 px-4 transition duration-150",
                      isActive 
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                    onClick={handleLinkClick}
                  >
                    <Icon className="w-6 h-6 mr-2" />
                    <span>{link.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center">
          <img 
            src={user?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
            alt="Profile" 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium">{user?.name || "Alex Johnson"}</p>
            <p className="text-xs text-slate-400">{user?.email || "alex@example.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
