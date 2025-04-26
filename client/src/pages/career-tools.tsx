
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function CareerTools() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  
  const generateResume = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tools/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });
      if (!response.ok) throw new Error('Failed to generate resume');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Resume generated successfully" });
    }
  });

  const generateCoverLetter = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tools/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });
      if (!response.ok) throw new Error('Failed to generate cover letter');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Cover letter generated successfully" });
    }
  });

  const improveLinkedIn = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tools/linkedin-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to improve LinkedIn profile');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "LinkedIn profile improvements generated" });
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Career Enhancement Tools</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Paste the job description to generate optimized content</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SMART Resume Generator</CardTitle>
            <CardDescription>Generate an ATS-optimized resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => generateResume.mutate()}
              disabled={!jobDescription || generateResume.isPending}
            >
              Generate Resume
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover Letter Generator</CardTitle>
            <CardDescription>Create a personalized cover letter</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => generateCoverLetter.mutate()}
              disabled={!jobDescription || generateCoverLetter.isPending}
            >
              Generate Cover Letter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Profile Optimizer</CardTitle>
            <CardDescription>Improve your profile with SMART method</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => improveLinkedIn.mutate()}
              disabled={improveLinkedIn.isPending}
            >
              Improve Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
