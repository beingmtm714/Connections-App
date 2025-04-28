
import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function LoginSuccess() {
  useEffect(() => {
    // Redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      window.location.replace('/');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Successful!</h1>
          <p className="text-gray-600">Redirecting you to the dashboard...</p>
        </CardContent>
      </Card>
    </div>
  );
}
