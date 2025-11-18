// utils/types.ts
export type AccountStatus = "pending" | "active" | "suspended" | "terminated";
export type UserRole = "worker" | "admin";

// utils/types.ts

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;

  phone: string;
  skills: string[];
  experience: string;
  timezone: string;

  preferredWeeklyPayout: number;

  role: "worker" | "admin";
  accountStatus: "pending" | "active" | "suspended" | "terminated";

  knowledgeScore: number;
  demoTaskCompleted: boolean;

  /** 🔥 ADD THIS FIELD */
  demoTaskScore?: number;

  createdAt: string;
  balance: number;
}


export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  weeklyPayout: number;
  deadline: string;

  status: "available" | "in-progress" | "submitted" | "completed" | "rejected";
  assignedTo: string | null;
  submissionUrl?: string;
  feedback?: string;

  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface DailySubmission {
  id: string;
  userId: string;
  date: string;
  githubCommitUrl?: string;
  videoUrl?: string;
  description: string;
  workType: string;
  hoursWorked: number;
  createdAt: string;
  adminReviewed: boolean;
  adminFeedback?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: "task-payment" | "manual" | "bonus";
  status: "pending" | "completed" | "failed";
  taskId?: string;
  createdAt: string;
  completedAt?: string;
}