import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertJobPreferencesSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // User authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you would check the password hash here
      // For demo purposes, we'll just check if passwords match
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      
      // Create user with default job title and name from email
      const newUser = await storage.createUser({
        ...userData,
        name: userData.username.split('@')[0],
        jobTitle: 'Job Seeker',
        linkedInConnected: false
      });
      
      if (!newUser || !newUser.id) {
        throw new Error('Failed to create user account');
      }

      // Initialize job preferences
      await storage.createJobPreferences({
        userId: newUser.id,
        jobTitles: [],
        locations: [],
        industries: []
      });
      
      // Set user in session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Please check your input",
          errors: error.errors.map(e => e.message)
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Unable to create account. Please try again." });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    try {
      // Clear the session
      req.session.userId = undefined;
      
      if (req.session.destroy) {
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ message: "Failed to logout" });
          }
          res.json({ message: "Logged out successfully" });
        });
      } else {
        // Alternative approach if destroy is not available
        req.session = null as any;
        res.json({ message: "Logged out successfully" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });
  
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // LinkedIn integration routes
  app.post("/api/linkedin/connect", isAuthenticated, async (req, res) => {
    try {
      const { sessionCookie } = req.body;
      
      if (!sessionCookie) {
        return res.status(400).json({ message: "LinkedIn session cookie is required" });
      }
      
      const userId = req.session.userId;
      const updatedUser = await storage.updateUser(userId, {
        linkedInConnected: true,
        linkedInSessionCookie: sessionCookie
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("LinkedIn connect error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/linkedin/disconnect", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const updatedUser = await storage.updateUser(userId, {
        linkedInConnected: false,
        linkedInSessionCookie: null
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("LinkedIn disconnect error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Job preferences routes
  app.get("/api/job-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const preferences = await storage.getJobPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Job preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Get job preferences error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/job-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const preferencesData = insertJobPreferencesSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if preferences already exist
      const existingPreferences = await storage.getJobPreferences(userId);
      if (existingPreferences) {
        const updatedPreferences = await storage.updateJobPreferences(existingPreferences.id, preferencesData);
        return res.json(updatedPreferences);
      }
      
      const newPreferences = await storage.createJobPreferences(preferencesData);
      res.status(201).json(newPreferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create job preferences error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Jobs routes
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const jobs = await storage.getJobs({ userId, limit });
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Employees routes
  app.get("/api/jobs/:jobId/employees", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const employees = await storage.getEmployees(jobId);
      res.json(employees);
    } catch (error) {
      console.error("Get employees error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Mutuals routes
  app.get("/api/mutuals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      
      const mutuals = await storage.getMutuals({ userId, employeeId });
      res.json(mutuals);
    } catch (error) {
      console.error("Get mutuals error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/mutuals/:id", isAuthenticated, async (req, res) => {
    try {
      const mutualId = parseInt(req.params.id);
      const mutual = await storage.getMutual(mutualId);
      
      if (!mutual) {
        return res.status(404).json({ message: "Mutual connection not found" });
      }
      
      // Verify ownership
      if (mutual.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(mutual);
    } catch (error) {
      console.error("Get mutual error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/mutuals/:id", isAuthenticated, async (req, res) => {
    try {
      const mutualId = parseInt(req.params.id);
      const mutual = await storage.getMutual(mutualId);
      
      if (!mutual) {
        return res.status(404).json({ message: "Mutual connection not found" });
      }
      
      // Verify ownership
      if (mutual.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedMutual = await storage.updateMutual(mutualId, req.body);
      res.json(updatedMutual);
    } catch (error) {
      console.error("Update mutual error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Messages routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const mutualId = req.query.mutualId ? parseInt(req.query.mutualId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const messages = await storage.getMessages({ userId, mutualId, limit });
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        userId
      });
      
      // Verify mutual belongs to user
      const mutual = await storage.getMutual(messageData.mutualId);
      if (!mutual || mutual.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create message error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Verify ownership
      if (message.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedMessage = await storage.updateMessage(messageId, req.body);
      res.json(updatedMessage);
    } catch (error) {
      console.error("Update message error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Career enhancement tools
  app.post("/api/tools/resume", isAuthenticated, async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const user = await storage.getUser(req.session.userId);
      
      // Use OpenAI to generate SMART format resume
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a SMART (Specific, Measurable, Achievable, Relevant, Time-bound) format resume that will pass ATS systems."
          },
          {
            role: "user",
            content: `Job Description: ${jobDescription}\nUser Profile: ${JSON.stringify(user)}`
          }
        ]
      });
      
      res.json({ content: completion.choices[0].message.content });
    } catch (error) {
      console.error("Resume generation error:", error);
      res.status(500).json({ message: "Failed to generate resume" });
    }
  });

  app.post("/api/tools/cover-letter", isAuthenticated, async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const user = await storage.getUser(req.session.userId);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a personalized cover letter that will pass ATS systems."
          },
          {
            role: "user",
            content: `Job Description: ${jobDescription}\nUser Profile: ${JSON.stringify(user)}`
          }
        ]
      });
      
      res.json({ content: completion.choices[0].message.content });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.post("/api/tools/linkedin-profile", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Improve LinkedIn profile using SMART method to optimize visibility and pass screening algorithms."
          },
          {
            role: "user",
            content: `User Profile: ${JSON.stringify(user)}`
          }
        ]
      });
      
      res.json({ content: completion.choices[0].message.content });
    } catch (error) {
      console.error("LinkedIn profile improvement error:", error);
      res.status(500).json({ message: "Failed to improve LinkedIn profile" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
