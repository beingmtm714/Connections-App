import {
  users, type User, type InsertUser,
  jobPreferences, type JobPreference, type InsertJobPreference,
  jobs, type Job, type InsertJob,
  companyEmployees, type CompanyEmployee, type InsertCompanyEmployee,
  mutualConnections, type MutualConnection, type InsertMutualConnection,
  messages, type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByLinkedinId(linkedinId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Job Preferences methods
  getJobPreferences(userId: number): Promise<JobPreference | undefined>;
  createJobPreferences(preferences: InsertJobPreference): Promise<JobPreference>;
  updateJobPreferences(id: number, preferences: Partial<InsertJobPreference>): Promise<JobPreference | undefined>;

  // Jobs methods
  getJobs(userId: number): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  deleteJob(id: number): Promise<boolean>;

  // Company Employees methods
  getEmployeesByJobId(jobId: number): Promise<CompanyEmployee[]>;
  createEmployee(employee: InsertCompanyEmployee): Promise<CompanyEmployee>;

  // Mutual Connections methods
  getMutualConnectionsByEmployeeId(employeeId: number): Promise<MutualConnection[]>;
  getMutualConnectionsByUserId(userId: number): Promise<MutualConnection[]>;
  getMutualConnection(id: number): Promise<MutualConnection | undefined>;
  createMutualConnection(connection: InsertMutualConnection): Promise<MutualConnection>;
  updateMutualConnection(id: number, connection: Partial<InsertMutualConnection>): Promise<MutualConnection | undefined>;

  // Messages methods
  getMessages(userId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobPreferences: Map<number, JobPreference>;
  private jobs: Map<number, Job>;
  private companyEmployees: Map<number, CompanyEmployee>;
  private mutualConnections: Map<number, MutualConnection>;
  private messages: Map<number, Message>;
  
  currentUserId: number;
  currentJobPreferenceId: number;
  currentJobId: number;
  currentEmployeeId: number;
  currentMutualConnectionId: number;
  currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.jobPreferences = new Map();
    this.jobs = new Map();
    this.companyEmployees = new Map();
    this.mutualConnections = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentJobPreferenceId = 1;
    this.currentJobId = 1;
    this.currentEmployeeId = 1;
    this.currentMutualConnectionId = 1;
    this.currentMessageId = 1;
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

  async getUserByLinkedinId(linkedinId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.linkedinId === linkedinId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Job Preferences methods
  async getJobPreferences(userId: number): Promise<JobPreference | undefined> {
    return Array.from(this.jobPreferences.values()).find(
      (pref) => pref.userId === userId,
    );
  }

  async createJobPreferences(preferences: InsertJobPreference): Promise<JobPreference> {
    const id = this.currentJobPreferenceId++;
    const jobPreference: JobPreference = { ...preferences, id };
    this.jobPreferences.set(id, jobPreference);
    return jobPreference;
  }

  async updateJobPreferences(id: number, preferencesData: Partial<InsertJobPreference>): Promise<JobPreference | undefined> {
    const preferences = this.jobPreferences.get(id);
    if (!preferences) return undefined;
    
    const updatedPreferences = { ...preferences, ...preferencesData };
    this.jobPreferences.set(id, updatedPreferences);
    return updatedPreferences;
  }

  // Jobs methods
  async getJobs(userId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.userId === userId,
    );
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

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Company Employees methods
  async getEmployeesByJobId(jobId: number): Promise<CompanyEmployee[]> {
    return Array.from(this.companyEmployees.values()).filter(
      (employee) => employee.jobId === jobId,
    );
  }

  async createEmployee(employee: InsertCompanyEmployee): Promise<CompanyEmployee> {
    const id = this.currentEmployeeId++;
    const newEmployee: CompanyEmployee = { ...employee, id };
    this.companyEmployees.set(id, newEmployee);
    return newEmployee;
  }

  // Mutual Connections methods
  async getMutualConnectionsByEmployeeId(employeeId: number): Promise<MutualConnection[]> {
    return Array.from(this.mutualConnections.values()).filter(
      (connection) => connection.employeeId === employeeId,
    );
  }

  async getMutualConnectionsByUserId(userId: number): Promise<MutualConnection[]> {
    return Array.from(this.mutualConnections.values()).filter(
      (connection) => connection.userId === userId,
    );
  }

  async getMutualConnection(id: number): Promise<MutualConnection | undefined> {
    return this.mutualConnections.get(id);
  }

  async createMutualConnection(connection: InsertMutualConnection): Promise<MutualConnection> {
    const id = this.currentMutualConnectionId++;
    const newConnection: MutualConnection = { ...connection, id };
    this.mutualConnections.set(id, newConnection);
    return newConnection;
  }

  async updateMutualConnection(id: number, connectionData: Partial<InsertMutualConnection>): Promise<MutualConnection | undefined> {
    const connection = this.mutualConnections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...connectionData };
    this.mutualConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Messages methods
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId,
    );
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

  async updateMessage(id: number, messageData: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageData };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
