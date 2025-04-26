import { 
  users, 
  User, 
  InsertUser, 
  jobPreferences, 
  JobPreferences, 
  InsertJobPreferences,
  jobs,
  Job,
  InsertJob,
  employees,
  Employee,
  InsertEmployee,
  mutuals,
  Mutual,
  InsertMutual,
  messages,
  Message,
  InsertMessage
} from "@shared/schema";
import { eq, ne, and, count } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Job preferences methods
  getJobPreferences(userId: number): Promise<JobPreferences | undefined>;
  createJobPreferences(preferences: InsertJobPreferences): Promise<JobPreferences>;
  updateJobPreferences(id: number, data: Partial<InsertJobPreferences>): Promise<JobPreferences | undefined>;
  
  // Jobs methods
  getJobs(options?: { userId?: number, limit?: number }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  
  // Employees methods
  getEmployees(jobId: number): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
  // Mutuals methods
  getMutuals(options: { userId: number, employeeId?: number }): Promise<Mutual[]>;
  getMutual(id: number): Promise<Mutual | undefined>;
  createMutual(mutual: InsertMutual): Promise<Mutual>;
  updateMutual(id: number, data: Partial<InsertMutual>): Promise<Mutual | undefined>;
  
  // Messages methods
  getMessages(options?: { userId?: number, mutualId?: number, limit?: number }): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, data: Partial<InsertMessage>): Promise<Message | undefined>;
  
  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    jobsCount: number;
    mutualsCount: number;
    messagesSentCount: number;
    introductionsMadeCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobPreferences: Map<number, JobPreferences>;
  private jobs: Map<number, Job>;
  private employees: Map<number, Employee>;
  private mutuals: Map<number, Mutual>;
  private messages: Map<number, Message>;
  
  private currentUserId: number;
  private currentJobPreferencesId: number;
  private currentJobId: number;
  private currentEmployeeId: number;
  private currentMutualId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.jobPreferences = new Map();
    this.jobs = new Map();
    this.employees = new Map();
    this.mutuals = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentJobPreferencesId = 1;
    this.currentJobId = 1;
    this.currentEmployeeId = 1;
    this.currentMutualId = 1;
    this.currentMessageId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Job preferences methods
  async getJobPreferences(userId: number): Promise<JobPreferences | undefined> {
    return Array.from(this.jobPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
  }
  
  async createJobPreferences(preferences: InsertJobPreferences): Promise<JobPreferences> {
    const id = this.currentJobPreferencesId++;
    const newPreferences: JobPreferences = { ...preferences, id };
    this.jobPreferences.set(id, newPreferences);
    return newPreferences;
  }
  
  async updateJobPreferences(id: number, data: Partial<InsertJobPreferences>): Promise<JobPreferences | undefined> {
    const preferences = this.jobPreferences.get(id);
    if (!preferences) return undefined;
    
    const updatedPreferences = { ...preferences, ...data };
    this.jobPreferences.set(id, updatedPreferences);
    return updatedPreferences;
  }
  
  // Jobs methods
  async getJobs(options?: { userId?: number, limit?: number }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    // If we have job preferences, we could filter here
    
    if (options?.limit) {
      jobs = jobs.slice(0, options.limit);
    }
    
    return jobs;
  }
  
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async createJob(job: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const newJob: Job = { ...job, id };
    this.jobs.set(id, newJob);
    return newJob;
  }
  
  // Employees methods
  async getEmployees(jobId: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(
      (employee) => employee.jobId === jobId
    );
  }
  
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = { ...employee, id };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }
  
  // Mutuals methods
  async getMutuals(options: { userId: number, employeeId?: number }): Promise<Mutual[]> {
    let mutuals = Array.from(this.mutuals.values()).filter(
      (mutual) => mutual.userId === options.userId
    );
    
    if (options.employeeId) {
      mutuals = mutuals.filter((mutual) => mutual.employeeId === options.employeeId);
    }
    
    return mutuals;
  }
  
  async getMutual(id: number): Promise<Mutual | undefined> {
    return this.mutuals.get(id);
  }
  
  async createMutual(mutual: InsertMutual): Promise<Mutual> {
    const id = this.currentMutualId++;
    const newMutual: Mutual = { ...mutual, id };
    this.mutuals.set(id, newMutual);
    return newMutual;
  }
  
  async updateMutual(id: number, data: Partial<InsertMutual>): Promise<Mutual | undefined> {
    const mutual = this.mutuals.get(id);
    if (!mutual) return undefined;
    
    const updatedMutual = { ...mutual, ...data };
    this.mutuals.set(id, updatedMutual);
    return updatedMutual;
  }
  
  // Messages methods
  async getMessages(options?: { userId?: number, mutualId?: number, limit?: number }): Promise<Message[]> {
    let filteredMessages = Array.from(this.messages.values());
    
    if (options?.userId) {
      filteredMessages = filteredMessages.filter((message) => message.userId === options.userId);
    }
    
    if (options?.mutualId) {
      filteredMessages = filteredMessages.filter((message) => message.mutualId === options.mutualId);
    }
    
    if (options?.limit) {
      filteredMessages = filteredMessages.slice(0, options.limit);
    }
    
    return filteredMessages;
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async updateMessage(id: number, data: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...data };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    jobsCount: number;
    mutualsCount: number;
    messagesSentCount: number;
    introductionsMadeCount: number;
  }> {
    const jobs = await this.getJobs({ userId });
    const mutuals = await this.getMutuals({ userId });
    const allMessages = await this.getMessages({ userId });
    
    const messagesSent = allMessages.filter(m => m.status !== 'pending');
    const introductionsMade = allMessages.filter(m => m.status === 'intro_made');
    
    return {
      jobsCount: jobs.length,
      mutualsCount: mutuals.length,
      messagesSentCount: messagesSent.length,
      introductionsMadeCount: introductionsMade.length
    };
  }
  
  private initSampleData() {
    // Sample companies and logos for testing
    const companies = [
      { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com' },
      { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com' },
      { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com' }
    ];
    
    // Sample jobs
    const sampleJobs: InsertJob[] = [
      {
        title: 'Senior Frontend Engineer',
        company: companies[0].name,
        location: 'San Francisco, CA',
        jobUrl: 'https://careers.airbnb.com/positions/1234',
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        logoUrl: companies[0].logo,
        isNew: true
      },
      {
        title: 'Full Stack Developer',
        company: companies[1].name,
        location: 'Remote',
        jobUrl: 'https://stripe.com/jobs/1234',
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        logoUrl: companies[1].logo,
        isNew: true
      },
      {
        title: 'UX Designer',
        company: companies[2].name,
        location: 'Toronto, Canada',
        jobUrl: 'https://shopify.com/careers/1234',
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        logoUrl: companies[2].logo,
        isNew: false
      }
    ];
    
    // Create jobs
    const createdJobs = sampleJobs.map(job => {
      const id = this.currentJobId++;
      const newJob: Job = { ...job, id };
      this.jobs.set(id, newJob);
      return newJob;
    });
    
    // Sample employees
    const sampleEmployees: Array<InsertEmployee & { jobIndex: number }> = [
      {
        jobIndex: 0,
        jobId: createdJobs[0].id,
        name: 'Julia Chen',
        title: 'Engineering Manager',
        linkedInUrl: 'https://linkedin.com/in/julia-chen',
        department: 'Engineering'
      },
      {
        jobIndex: 1,
        jobId: createdJobs[1].id,
        name: 'David Kim',
        title: 'Senior Product Designer',
        linkedInUrl: 'https://linkedin.com/in/david-kim',
        department: 'Product'
      },
      {
        jobIndex: 2,
        jobId: createdJobs[2].id,
        name: 'Sarah Smith',
        title: 'Tech Lead',
        linkedInUrl: 'https://linkedin.com/in/sarah-smith',
        department: 'Engineering'
      }
    ];
    
    // Create employees
    const createdEmployees = sampleEmployees.map(employee => {
      const { jobIndex, ...employeeData } = employee;
      const id = this.currentEmployeeId++;
      const newEmployee: Employee = { ...employeeData, id };
      this.employees.set(id, newEmployee);
      return newEmployee;
    });
    
    // Create a sample user if not exists
    let user = Array.from(this.users.values()).find(u => u.username === 'user@example.com');
    if (!user) {
      user = {
        id: this.currentUserId++,
        username: 'user@example.com',
        password: '$2b$10$dIsZAPrGEf0Fzf5i/GJ9u.UkOUoY0N7B5JrvGVoYaF0rVqx7P9cMy', // hashed password for 'password'
        linkedInConnected: false,
        name: 'Sarah Johnson',
        jobTitle: 'Frontend Developer',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };
      this.users.set(user.id, user);
    }
    
    // Sample mutuals
    const sampleMutuals: Array<Omit<InsertMutual, 'userId' | 'employeeId'> & { employeeIndex: number }> = [
      {
        employeeIndex: 0,
        name: 'Michael Roberts',
        title: 'Product Manager at Figma',
        linkedInUrl: 'https://linkedin.com/in/michael-roberts',
        connectedSince: new Date(2018, 2), // March 2018
        ratedStrength: 5, // Strong
        connectionContext: 'You both worked at Adobe in 2017-2018.'
      },
      {
        employeeIndex: 1,
        name: 'Jessica Wilson',
        title: 'Design Lead at Webflow',
        linkedInUrl: 'https://linkedin.com/in/jessica-wilson',
        connectedSince: new Date(2020, 0), // January 2020
        ratedStrength: 3, // Medium
        connectionContext: 'Met at Design Systems Conference 2019.'
      },
      {
        employeeIndex: 2,
        name: 'Thomas Jackson',
        title: 'Software Engineer at Meta',
        linkedInUrl: 'https://linkedin.com/in/thomas-jackson',
        connectedSince: new Date(2022, 4), // May 2022
        ratedStrength: 2, // Weak
        connectionContext: 'You connected when you were at Twitter and they were at Google.'
      }
    ];
    
    // Create mutuals
    const createdMutuals = sampleMutuals.map((mutual, index) => {
      const { employeeIndex, ...mutualData } = mutual;
      const id = this.currentMutualId++;
      const newMutual: Mutual = { 
        ...mutualData, 
        id, 
        userId: user!.id, 
        employeeId: createdEmployees[employeeIndex].id 
      };
      this.mutuals.set(id, newMutual);
      return newMutual;
    });
    
    // Sample messages
    const sampleMessages: Array<Omit<InsertMessage, 'userId' | 'mutualId' | 'employeeId'> & { mutualIndex: number }> = [
      {
        mutualIndex: 0,
        messageText: 'Hi Michael, Hope you\'re doing well! I noticed you\'re connected with Julia Chen, who is an Engineering Manager at Airbnb. I recently applied for the Senior Frontend Engineer position there and I\'d love to learn more about the team and culture. Since we both worked at Adobe around the same time (2017-2018), I thought you might be willing to introduce us if you feel comfortable doing so. Thanks in advance for your consideration! Best, Sarah',
        status: 'sent',
        outcome: 'pending',
        sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        introDate: null
      },
      {
        mutualIndex: 1,
        messageText: 'Hi Jessica, I hope this message finds you well! I noticed you\'re connected with David Kim, who is a Senior Product Designer at Shopify. I recently applied for the UX Designer position there and I\'d love to learn more about the design culture. Since we met at the Design Systems Conference in 2019, I thought you might be willing to introduce us if you feel comfortable doing so. Thank you for considering this! Best, Sarah',
        status: 'intro_made',
        outcome: 'interview',
        sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        responseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        introDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        mutualIndex: 2,
        messageText: 'Hi Thomas, I hope you\'re doing well! I saw that you\'re connected with Sarah Smith, who is a Tech Lead at Stripe. I recently applied for the Full Stack Developer position there and I\'d love to learn more about the engineering culture. Even though we haven\'t interacted much since connecting when you were at Google, I thought you might be willing to introduce us if you feel comfortable doing so. Thank you for considering this! Best, Sarah',
        status: 'sent',
        outcome: 'pending',
        sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        responseDate: null,
        introDate: null
      }
    ];
    
    // Create messages
    sampleMessages.forEach((message) => {
      const { mutualIndex, ...messageData } = message;
      const mutual = createdMutuals[mutualIndex];
      const id = this.currentMessageId++;
      const newMessage: Message = { 
        ...messageData, 
        id, 
        userId: user!.id, 
        mutualId: mutual.id, 
        employeeId: mutual.employeeId 
      };
      this.messages.set(id, newMessage);
    });
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const { db } = await import("./db");
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUser:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { db } = await import("./db");
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUserByUsername:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { db } = await import("./db");
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Database error in createUser:", error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const { db } = await import("./db");
      const [updatedUser] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error("Database error in updateUser:", error);
      throw error;
    }
  }

  async getJobPreferences(userId: number): Promise<JobPreferences | undefined> {
    try {
      const { db } = await import("./db");
      const [preferences] = await db
        .select()
        .from(jobPreferences)
        .where(eq(jobPreferences.userId, userId));
      return preferences || undefined;
    } catch (error) {
      console.error("Database error in getJobPreferences:", error);
      throw error;
    }
  }

  async createJobPreferences(preferences: InsertJobPreferences): Promise<JobPreferences> {
    try {
      const { db } = await import("./db");
      const [newPreferences] = await db
        .insert(jobPreferences)
        .values(preferences)
        .returning();
      return newPreferences;
    } catch (error) {
      console.error("Database error in createJobPreferences:", error);
      throw error;
    }
  }

  async updateJobPreferences(id: number, data: Partial<InsertJobPreferences>): Promise<JobPreferences | undefined> {
    try {
      const { db } = await import("./db");
      const [updatedPreferences] = await db
        .update(jobPreferences)
        .set(data)
        .where(eq(jobPreferences.id, id))
        .returning();
      return updatedPreferences || undefined;
    } catch (error) {
      console.error("Database error in updateJobPreferences:", error);
      throw error;
    }
  }

  async getJobs(options?: { userId?: number; limit?: number }): Promise<Job[]> {
    try {
      const { db } = await import("./db");
      let query = db.select().from(jobs);

      if (options?.userId) {
        query = query.where(eq(jobs.userId, options.userId));
      }

      const result = await query;
      
      // Apply limit in memory if provided
      if (options?.limit && result.length > options.limit) {
        return result.slice(0, options.limit);
      }
      
      return result;
    } catch (error) {
      console.error("Database error in getJobs:", error);
      throw error;
    }
  }

  async getJob(id: number): Promise<Job | undefined> {
    try {
      const { db } = await import("./db");
      const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
      return job || undefined;
    } catch (error) {
      console.error("Database error in getJob:", error);
      throw error;
    }
  }

  async createJob(job: InsertJob): Promise<Job> {
    try {
      const { db } = await import("./db");
      const [newJob] = await db.insert(jobs).values(job).returning();
      return newJob;
    } catch (error) {
      console.error("Database error in createJob:", error);
      throw error;
    }
  }

  async getEmployees(jobId: number): Promise<Employee[]> {
    try {
      const { db } = await import("./db");
      return await db
        .select()
        .from(employees)
        .where(eq(employees.jobId, jobId));
    } catch (error) {
      console.error("Database error in getEmployees:", error);
      throw error;
    }
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    try {
      const { db } = await import("./db");
      const [newEmployee] = await db
        .insert(employees)
        .values(employee)
        .returning();
      return newEmployee;
    } catch (error) {
      console.error("Database error in createEmployee:", error);
      throw error;
    }
  }

  async getMutuals(options: { userId: number; employeeId?: number }): Promise<Mutual[]> {
    try {
      const { db } = await import("./db");
      let query = db
        .select()
        .from(mutuals)
        .where(eq(mutuals.userId, options.userId));

      if (options.employeeId) {
        query = query.where(eq(mutuals.employeeId, options.employeeId));
      }

      return await query;
    } catch (error) {
      console.error("Database error in getMutuals:", error);
      throw error;
    }
  }

  async getMutual(id: number): Promise<Mutual | undefined> {
    try {
      const { db } = await import("./db");
      const [mutual] = await db.select().from(mutuals).where(eq(mutuals.id, id));
      return mutual || undefined;
    } catch (error) {
      console.error("Database error in getMutual:", error);
      throw error;
    }
  }

  async createMutual(mutual: InsertMutual): Promise<Mutual> {
    try {
      const { db } = await import("./db");
      const [newMutual] = await db.insert(mutuals).values(mutual).returning();
      return newMutual;
    } catch (error) {
      console.error("Database error in createMutual:", error);
      throw error;
    }
  }

  async updateMutual(id: number, data: Partial<InsertMutual>): Promise<Mutual | undefined> {
    try {
      const { db } = await import("./db");
      const [updatedMutual] = await db
        .update(mutuals)
        .set(data)
        .where(eq(mutuals.id, id))
        .returning();
      return updatedMutual || undefined;
    } catch (error) {
      console.error("Database error in updateMutual:", error);
      throw error;
    }
  }

  async getMessages(options?: { userId?: number; mutualId?: number; limit?: number }): Promise<Message[]> {
    try {
      const { db } = await import("./db");
      let query = db.select().from(messages);

      if (options?.userId) {
        query = query.where(eq(messages.userId, options.userId));
      }

      if (options?.mutualId) {
        query = query.where(eq(messages.mutualId, options.mutualId));
      }

      const result = await query;
      
      // Apply limit in memory if provided
      if (options?.limit && result.length > options.limit) {
        return result.slice(0, options.limit);
      }
      
      return result;
    } catch (error) {
      console.error("Database error in getMessages:", error);
      throw error;
    }
  }

  async getMessage(id: number): Promise<Message | undefined> {
    try {
      const { db } = await import("./db");
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, id));
      return message || undefined;
    } catch (error) {
      console.error("Database error in getMessage:", error);
      throw error;
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const { db } = await import("./db");
      const [newMessage] = await db
        .insert(messages)
        .values(message)
        .returning();
      return newMessage;
    } catch (error) {
      console.error("Database error in createMessage:", error);
      throw error;
    }
  }

  async updateMessage(id: number, data: Partial<InsertMessage>): Promise<Message | undefined> {
    try {
      const { db } = await import("./db");
      const [updatedMessage] = await db
        .update(messages)
        .set(data)
        .where(eq(messages.id, id))
        .returning();
      return updatedMessage || undefined;
    } catch (error) {
      console.error("Database error in updateMessage:", error);
      throw error;
    }
  }

  async getDashboardStats(userId: number): Promise<{
    jobsCount: number;
    mutualsCount: number;
    messagesSentCount: number;
    introductionsMadeCount: number;
  }> {
    try {
      const { db } = await import("./db");
      
      // Get count of jobs for the user
      const jobsResult = await db
        .select({ count: count() })
        .from(jobs)
        .where(eq(jobs.userId, userId));
      const jobsCount = jobsResult[0]?.count || 0;
      
      // Get count of mutuals for the user
      const mutualsResult = await db
        .select({ count: count() })
        .from(mutuals)
        .where(eq(mutuals.userId, userId));
      const mutualsCount = mutualsResult[0]?.count || 0;
      
      // Get count of messages sent for the user (not pending)
      const messagesSentResult = await db
        .select({ count: count() })
        .from(messages)
        .where(and(eq(messages.userId, userId), ne(messages.status, 'pending')));
      const messagesSentCount = messagesSentResult[0]?.count || 0;
      
      // Get count of introductions made for the user
      const introsMadeResult = await db
        .select({ count: count() })
        .from(messages)
        .where(and(eq(messages.userId, userId), eq(messages.status, 'intro_made')));
      const introductionsMadeCount = introsMadeResult[0]?.count || 0;
      
      return {
        jobsCount,
        mutualsCount,
        messagesSentCount,
        introductionsMadeCount
      };
    } catch (error) {
      console.error("Database error in getDashboardStats:", error);
      throw error;
    }
  }

  // Add seed data function for initial application state
  async seedSampleData(): Promise<void> {
    try {
      const { db } = await import("./db");
      
      // Check if there's already data
      const userCount = await db.select({ count: count() }).from(users);
      if (userCount[0]?.count > 0) {
        console.log("Database already has data, skipping seeding.");
        return;
      }
      
      // Create sample user
      const [user] = await db.insert(users).values({
        username: "user@example.com",
        password: "password", // In a real app, this would be hashed
        firstName: "John",
        lastName: "Smith",
        linkedInConnected: true,
        linkedInSessionCookie: "sample_session_cookie"
      }).returning();
      
      // Create job preferences
      await db.insert(jobPreferences).values({
        userId: user.id,
        jobTitles: ["Software Engineer", "Full Stack Developer", "Frontend Engineer"],
        locations: ["San Francisco, CA", "New York, NY", "Remote"],
        industries: ["Technology", "Finance", "Healthcare"]
      });
      
      // Create jobs
      const [job1] = await db.insert(jobs).values({
        title: "Senior Software Engineer",
        company: "Airbnb",
        location: "San Francisco, CA",
        jobUrl: "https://airbnb.com/careers",
        postedDate: new Date(),
        logoUrl: "https://logo.clearbit.com/airbnb.com",
        isNew: true
      }).returning();
      
      const [job2] = await db.insert(jobs).values({
        title: "Full Stack Developer",
        company: "Shopify",
        location: "Remote",
        jobUrl: "https://shopify.com/careers",
        postedDate: new Date(),
        logoUrl: "https://logo.clearbit.com/shopify.com",
        isNew: true
      }).returning();
      
      const [job3] = await db.insert(jobs).values({
        title: "Engineering Manager",
        company: "Stripe",
        location: "New York, NY",
        jobUrl: "https://stripe.com/careers",
        postedDate: new Date(),
        logoUrl: "https://logo.clearbit.com/stripe.com",
        isNew: true
      }).returning();
      
      // Create employees
      const [employee1] = await db.insert(employees).values({
        jobId: job1.id,
        name: "Julia Chen",
        title: "Engineering Manager",
        linkedInUrl: "https://linkedin.com/in/juliachen",
        department: "Engineering"
      }).returning();
      
      const [employee2] = await db.insert(employees).values({
        jobId: job1.id,
        name: "Alex Rodriguez",
        title: "Senior Software Engineer",
        linkedInUrl: "https://linkedin.com/in/alexrodriguez",
        department: "Engineering"
      }).returning();
      
      const [employee3] = await db.insert(employees).values({
        jobId: job2.id,
        name: "David Kim",
        title: "Senior Product Designer",
        linkedInUrl: "https://linkedin.com/in/davidkim",
        department: "Design"
      }).returning();
      
      const [employee4] = await db.insert(employees).values({
        jobId: job3.id,
        name: "Sarah Smith",
        title: "Tech Lead",
        linkedInUrl: "https://linkedin.com/in/sarahsmith",
        department: "Engineering"
      }).returning();
      
      // Create mutuals
      const [mutual1] = await db.insert(mutuals).values({
        userId: user.id,
        employeeId: employee1.id,
        name: "Michael Roberts",
        title: "Product Manager",
        company: "Google",
        linkedInUrl: "https://linkedin.com/in/michaelroberts",
        relationshipStrength: 4,
        lastContactDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        notes: "Former coworker at Google, still in touch"
      }).returning();
      
      const [mutual2] = await db.insert(mutuals).values({
        userId: user.id,
        employeeId: employee2.id,
        name: "Jessica Wilson",
        title: "Design Lead",
        company: "Facebook",
        linkedInUrl: "https://linkedin.com/in/jessicawilson",
        relationshipStrength: 3,
        lastContactDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        notes: "Met at design conference last year"
      }).returning();
      
      const [mutual3] = await db.insert(mutuals).values({
        userId: user.id,
        employeeId: employee3.id,
        name: "Thomas Jackson",
        title: "Software Engineer",
        company: "Amazon",
        linkedInUrl: "https://linkedin.com/in/thomasjackson",
        relationshipStrength: 5,
        lastContactDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        notes: "College roommate, very close friend"
      }).returning();
      
      // Create messages
      await db.insert(messages).values({
        userId: user.id,
        mutualId: mutual1.id,
        employeeId: employee1.id,
        content: "Hey Michael, hope you're doing well! I noticed you're connected with Julia Chen at Airbnb. I'm interested in the Senior Software Engineer role there. Would you be comfortable introducing us?",
        status: "sent",
        sentDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        responseDate: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        outcome: "pending"
      });
      
      await db.insert(messages).values({
        userId: user.id,
        mutualId: mutual2.id,
        employeeId: employee2.id,
        content: "Hi Jessica, I hope everything is great with you! I saw you're connected with Alex at Airbnb. I'm applying for the Senior Software Engineer position there and would love an introduction if you're comfortable with that.",
        status: "responded",
        sentDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        responseDate: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString(),
        outcome: "interview"
      });
      
      await db.insert(messages).values({
        userId: user.id,
        mutualId: mutual3.id,
        employeeId: employee3.id,
        content: "Thomas! Long time no chat. I saw you're connected with David at Shopify. I'm really interested in their Full Stack Developer position. Would you mind introducing us?",
        status: "intro_made",
        sentDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        responseDate: new Date(new Date().setDate(new Date().getDate() - 28)).toISOString(),
        outcome: "interview"
      });
      
      console.log("Database seeded successfully with sample data.");
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  }
}

// Use the DatabaseStorage for persistence
export const storage = new DatabaseStorage();
