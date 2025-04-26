import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64">
            <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            <button 
              className="absolute top-4 right-4 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-800 text-white p-4 w-full fixed top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">NetworkBridge</h1>
          <button 
            className="p-2"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        {children}
      </main>
    </div>
  );
}
