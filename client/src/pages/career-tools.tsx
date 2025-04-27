
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CareerTools() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState('resume');
  
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
      setGeneratedContent(data.content);
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
      setGeneratedContent(data.content);
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
      setGeneratedContent(data.content);
      toast({ title: "LinkedIn profile improvements generated" });
    }
  });

  const handleGenerate = () => {
    switch(activeTab) {
      case 'resume':
        generateResume.mutate();
        break;
      case 'cover-letter':
        generateCoverLetter.mutate();
        break;
      case 'linkedin':
        improveLinkedIn.mutate();
        break;
    }
  };

  const handleExport = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-content.txt`;
    a.click();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Career Enhancement Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Generate Content</CardTitle>
              <CardDescription>Select the type of content to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="resume">SMART Resume</TabsTrigger>
                  <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                  <TabsTrigger value="linkedin">LinkedIn Profile</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                onClick={handleGenerate}
                disabled={(!jobDescription && activeTab !== 'linkedin') || 
                  generateResume.isPending || 
                  generateCoverLetter.isPending || 
                  improveLinkedIn.isPending}
                className="w-full"
              >
                Generate Content
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Preview your generated content</CardDescription>
          </CardHeader>
          <CardContent className="h-full space-y-4">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              {generatedContent ? (
                <div className="whitespace-pre-wrap">{generatedContent}</div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  Generated content will appear here
                </div>
              )}
            </ScrollArea>
            
            {generatedContent && (
              <Button onClick={handleExport} className="w-full">
                Export Content
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
