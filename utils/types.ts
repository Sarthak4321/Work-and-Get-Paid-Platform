// utils/types.ts
export type AccountStatus = "pending" | "active" | "suspended" | "terminated";
export type UserRole = "worker" | "admin";

export interface PayoutAccount {
  accountType: string;
  accountNumber: string;
  verified: boolean;
}

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
  demoTaskScore?: number;

  payoutAccount?: {
    accountType: string;
    accountNumber: string;
    verified: boolean;
  };

  /** ✅ REQUIRED for login.tsx */
  emailVerified: boolean;

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
  deadline: string; // ISO date or '' if not provided

  status: "available" | "assigned" | "in-progress" | "submitted" | "completed" | "rejected";

  createdBy: string; // admin id who created task
  createdAt: string;

  assignedTo: string | null; // worker id or null
  assignedAt?: string;

  submittedAt?: string;
  submissionUrl?: string;

  completedAt?: string;
  feedback?: string;
}

export interface DailySubmission {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  githubCommitUrl?: string;
  videoUrl?: string;
  description: string;
  workType: "development" | "design" | "video-editing" | "content" | "other";
  hoursWorked: number;
  createdAt: string;
  adminReviewed: boolean;
  adminFeedback?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: "task-payment" | "manual" | "bonus" | "withdrawal";
  status: "pending" | "completed" | "failed";
  taskId?: string;
  createdAt: string;
  completedAt?: string;
}