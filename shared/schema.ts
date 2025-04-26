import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  linkedinId: text("linkedin_id"),
  linkedinToken: text("linkedin_token"),
  name: text("name"),
  email: text("email"),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  linkedinId: true,
  linkedinToken: true,
  name: true,
  email: true,
  profileImage: true,
});

export const jobPreferences = pgTable("job_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  titles: text("titles").array().notNull(),
  locations: text("locations").array().notNull(),
  industries: text("industries").array().notNull(),
});

export const insertJobPreferencesSchema = createInsertSchema(jobPreferences).pick({
  userId: true,
  titles: true,
  locations: true,
  industries: true,
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  url: text("url").notNull(),
  logoUrl: text("logo_url"),
  postedDate: timestamp("posted_date").notNull(),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  userId: true,
  title: true,
  company: true,
  location: true,
  url: true,
  logoUrl: true,
  postedDate: true,
});

export const companyEmployees = pgTable("company_employees", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  department: text("department"),
});

export const insertCompanyEmployeeSchema = createInsertSchema(companyEmployees).pick({
  jobId: true,
  name: true,
  title: true,
  linkedinUrl: true,
  department: true,
});

export const mutualConnections = pgTable("mutual_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  connectedSince: timestamp("connected_since"),
  strengthRating: integer("strength_rating").notNull(),
  connectionContext: text("connection_context"),
});

export const insertMutualConnectionSchema = createInsertSchema(mutualConnections).pick({
  userId: true,
  employeeId: true,
  name: true,
  title: true,
  company: true,
  linkedinUrl: true,
  connectedSince: true,
  strengthRating: true,
  connectionContext: true,
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mutualConnectionId: integer("mutual_connection_id").notNull(),
  targetEmployeeId: integer("target_employee_id").notNull(),
  jobId: integer("job_id").notNull(),
  messageText: text("message_text").notNull(),
  status: text("status").notNull(), // Draft, Sent, ResponseReceived
  outcome: text("outcome").notNull(), // Pending, IntroMade, Declined, Ghosted, Interview
  sentDate: timestamp("sent_date"),
  responseDate: timestamp("response_date"),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  mutualConnectionId: true,
  targetEmployeeId: true,
  jobId: true,
  messageText: true,
  status: true,
  outcome: true,
  sentDate: true,
  responseDate: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JobPreference = typeof jobPreferences.$inferSelect;
export type InsertJobPreference = z.infer<typeof insertJobPreferencesSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type CompanyEmployee = typeof companyEmployees.$inferSelect;
export type InsertCompanyEmployee = z.infer<typeof insertCompanyEmployeeSchema>;

export type MutualConnection = typeof mutualConnections.$inferSelect;
export type InsertMutualConnection = z.infer<typeof insertMutualConnectionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
