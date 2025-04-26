import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertJobPreferencesSchema,
  insertJobSchema,
  insertCompanyEmployeeSchema,
  insertMutualConnectionSchema,
  insertMessageSchema
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    userId: number;
    isAuthenticated: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const sessionStore = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "network-bridge-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
      store: new sessionStore({
        checkPeriod: 86400000 // 24 hours
      })
    })
  );
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.isAuthenticated) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      return res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      return res.json({ id: user.id, username: user.username });
    } catch (error) {
      return res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/linkedin", async (req, res) => {
    try {
      const { linkedinId, linkedinToken, name, email, profileImage } = req.body;
      
      // Check if user exists with this LinkedIn ID
      let user = await storage.getUserByLinkedinId(linkedinId);
      
      if (user) {
        // Update the token
        user = await storage.updateUser(user.id, { linkedinToken }) as any;
      } else {
        // Create a new user
        const username = `linkedin_${linkedinId}`;
        user = await storage.createUser({
          username,
          password: "linkedin_auth", // Dummy password since auth is via LinkedIn
          linkedinId,
          linkedinToken,
          name,
          email,
          profileImage
        });
      }
      
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      });
    } catch (error) {
      console.error("LinkedIn auth error:", error);
      return res.status(500).json({ message: "Failed to authenticate with LinkedIn" });
    }
  });

  // User routes
  app.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password
      const { password, linkedinToken, ...userWithoutSensitiveInfo } = user;
      return res.json(userWithoutSensitiveInfo);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Job Preferences routes
  app.get("/api/job-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const preferences = await storage.getJobPreferences(userId);
      
      if (!preferences) {
        return res.json({ titles: [], locations: [], industries: [] });
      }
      
      return res.json(preferences);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch job preferences" });
    }
  });

  app.post("/api/job-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const existingPrefs = await storage.getJobPreferences(userId);
      
      if (existingPrefs) {
        const updatedPrefs = await storage.updateJobPreferences(existingPrefs.id, {
          ...req.body,
          userId
        });
        return res.json(updatedPrefs);
      } else {
        const preferencesData = insertJobPreferencesSchema.parse({
          ...req.body,
          userId
        });
        const preferences = await storage.createJobPreferences(preferencesData);
        return res.status(201).json(preferences);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to save job preferences" });
    }
  });

  // Jobs routes
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const jobs = await storage.getJobs(userId);
      return res.json(jobs);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to job" });
      }
      
      return res.json(job);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const jobData = insertJobSchema.parse({
        ...req.body,
        userId
      });
      const job = await storage.createJob(jobData);
      return res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.delete("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to delete job" });
      }
      
      await storage.deleteJob(jobId);
      return res.json({ message: "Job deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Company Employees routes
  app.get("/api/jobs/:id/employees", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to job employees" });
      }
      
      const employees = await storage.getEmployeesByJobId(jobId);
      return res.json(employees);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/jobs/:id/employees", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      if (job.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to add employees to job" });
      }
      
      const employeeData = insertCompanyEmployeeSchema.parse({
        ...req.body,
        jobId
      });
      const employee = await storage.createEmployee(employeeData);
      return res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to add employee" });
    }
  });

  // Mutual Connections routes
  app.get("/api/mutual-connections", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const connections = await storage.getMutualConnectionsByUserId(userId);
      return res.json(connections);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch mutual connections" });
    }
  });

  app.get("/api/employees/:id/mutual-connections", isAuthenticated, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const connections = await storage.getMutualConnectionsByEmployeeId(employeeId);
      return res.json(connections);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch mutual connections" });
    }
  });

  app.post("/api/mutual-connections", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const connectionData = insertMutualConnectionSchema.parse({
        ...req.body,
        userId
      });
      const connection = await storage.createMutualConnection(connectionData);
      return res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create mutual connection" });
    }
  });

  app.patch("/api/mutual-connections/:id", isAuthenticated, async (req, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getMutualConnection(connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      if (connection.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to update connection" });
      }
      
      const updatedConnection = await storage.updateMutualConnection(connectionId, req.body);
      return res.json(updatedConnection);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update connection" });
    }
  });

  // Messages routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const messages = await storage.getMessages(userId);
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      if (message.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized access to message" });
      }
      
      return res.json(message);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        userId
      });
      const message = await storage.createMessage(messageData);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.patch("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      if (message.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to update message" });
      }
      
      const updatedMessage = await storage.updateMessage(messageId, req.body);
      return res.json(updatedMessage);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const jobs = await storage.getJobs(userId);
      const messages = await storage.getMessages(userId);
      
      const stats = {
        jobsTracked: jobs.length,
        messagesSent: messages.filter(m => m.status === "Sent" || m.status === "ResponseReceived").length,
        responses: messages.filter(m => m.status === "ResponseReceived").length,
        introsMade: messages.filter(m => m.outcome === "IntroMade" || m.outcome === "Interview").length
      };
      
      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
