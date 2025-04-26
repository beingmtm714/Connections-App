// Type definitions for Express session
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}