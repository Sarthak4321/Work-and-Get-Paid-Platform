// utils/types.ts
export type AccountStatus = "pending" | "active" | "suspended" | "terminated";
export type UserRole = "worker" | "admin";

export interface User {
  id: string; // firestore doc id or uid
  email: string;
  password?: string; // only if you want to store (not recommended) — here kept for compatibility
  fullName: string;
  phone?: string;
  skills: string[];
  experience?: string;
  timezone?: string;
  preferredWeeklyPayout?: number;
  role: UserRole;
  accountStatus: AccountStatus;
  knowledgeScore?: number;
  demoTaskCompleted?: boolean;
  createdAt: string;
  balance?: number;
}

export type TaskStatus = "available" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  skills: string[];
  weeklyPayout: number;
  status: TaskStatus;
  assignedTo?: string; // userId
  createdAt: string;
}

export interface DailySubmission {
  id: string;
  userId: string;
  date: string;

  githubCommitUrl: string;   // <— ADD
  videoUrl: string;          // <— ADD

  description: string;
  workType: string;
  hoursWorked: number;

  createdAt: string;
  adminReviewed: boolean;
}
