import { apiRequest } from "./queryClient";

export interface LinkedInUser {
  linkedinId: string;
  linkedinToken: string;
  name: string;
  email: string;
  profileImage: string;
}

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  profileImage?: string;
}

export async function loginWithLinkedIn(linkedInUser: LinkedInUser): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/linkedin", linkedInUser);
  return response.json();
}

export async function login(username: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  return response.json();
}

export async function register(username: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/register", { username, password });
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiRequest("GET", "/api/user");
  return response.json();
}
