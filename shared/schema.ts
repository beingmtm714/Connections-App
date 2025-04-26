import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  linkedInConnected: boolean("linked_in_connected").default(false),
  linkedInSessionCookie: text("linked_in_session_cookie"),
  name: text("name"),
  jobTitle: text("job_title"),
  photoUrl: text("photo_url")
});

export const jobPreferences = pgTable("job_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  jobTitles: text("job_titles").array().notNull(),
  locations: text("locations").array().notNull(),
  industries: text("industries").array().notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  jobUrl: text("job_url").notNull(),
  postedDate: timestamp("posted_date").notNull(),
  logoUrl: text("logo_url"),
  isNew: boolean("is_new").default(true)
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  name: text("name").notNull(),
  title: text("title").notNull(),
  linkedInUrl: text("linked_in_url").notNull(),
  department: text("department")
});

export const mutuals = pgTable("mutuals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  name: text("name").notNull(),
  title: text("title").notNull(),
  linkedInUrl: text("linked_in_url").notNull(),
  connectedSince: timestamp("connected_since"),
  ratedStrength: integer("rated_strength").default(0), // 1-5 rating
  connectionContext: text("connection_context")
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mutualId: integer("mutual_id").notNull().references(() => mutuals.id),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  messageText: text("message_text").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, responded, intro_made
  outcome: text("outcome").default("pending"), // pending, interview, declined, ghosted
  sentDate: timestamp("sent_date"),
  responseDate: timestamp("response_date"),
  introDate: timestamp("intro_date")
});

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  linkedInConnected: true,
  linkedInSessionCookie: true,
  name: true,
  jobTitle: true,
  photoUrl: true
});

export const insertJobPreferencesSchema = createInsertSchema(jobPreferences).pick({
  userId: true,
  jobTitles: true,
  locations: true,
  industries: true
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  location: true,
  jobUrl: true,
  postedDate: true,
  logoUrl: true,
  isNew: true
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  jobId: true,
  name: true,
  title: true,
  linkedInUrl: true,
  department: true
});

export const insertMutualSchema = createInsertSchema(mutuals).pick({
  userId: true,
  employeeId: true,
  name: true,
  title: true,
  linkedInUrl: true,
  connectedSince: true,
  ratedStrength: true,
  connectionContext: true
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  mutualId: true,
  employeeId: true,
  messageText: true,
  status: true,
  outcome: true,
  sentDate: true,
  responseDate: true,
  introDate: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJobPreferences = z.infer<typeof insertJobPreferencesSchema>;
export type JobPreferences = typeof jobPreferences.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertMutual = z.infer<typeof insertMutualSchema>;
export type Mutual = typeof mutuals.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
