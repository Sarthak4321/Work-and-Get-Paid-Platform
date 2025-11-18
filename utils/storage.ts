// export interface User {
//   id: string;
//   email: string;
//   password: string;
//   fullName: string;
//   phone: string;
//   skills: string[];
//   experience: string;
//   timezone: string;
//   preferredWeeklyPayout: number;
//   accountStatus: 'pending' | 'active' | 'suspended' | 'terminated';
//   role: 'worker' | 'admin';
//   knowledgeScore: number;
//   demoTaskCompleted: boolean;
//   demoTaskScore?: number;
//   payoutAccount?: {
//     accountType: string;
//     accountNumber: string;
//     verified: boolean;
//   };
//   createdAt: string;
//   balance: number;
// }

// export interface Task {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   skills: string[];
//   weeklyPayout: number;
//   deadline: string;
//   status: 'available' | 'assigned' | 'in-progress' | 'submitted' | 'completed' | 'rejected';
//   assignedTo?: string;
//   createdBy: string;
//   createdAt: string;
//   submittedAt?: string;
//   completedAt?: string;
//   submissionUrl?: string;
//   feedback?: string;
// }

// export interface Payment {
//   id: string;
//   userId: string;
//   amount: number;
//   type: 'task-payment' | 'withdrawal';
//   status: 'pending' | 'completed' | 'failed';
//   taskId?: string;
//   createdAt: string;
//   completedAt?: string;
// }

// export interface DailySubmission {
//   id: string;
//   userId: string;
//   date: string;
//   githubCommitUrl?: string;
//   videoUrl?: string;
//   description: string;
//   workType: 'development' | 'design' | 'video-editing' | 'content' | 'other';
//   hoursWorked: number;
//   createdAt: string;
//   adminReviewed: boolean;
//   adminFeedback?: string;
// }

// export const storage = {
//   getUsers: (): User[] => {
//     if (typeof window === 'undefined') return [];
//     const users = localStorage.getItem('cehpoint_users');
//     return users ? JSON.parse(users) : [];
//   },

//   setUsers: (users: User[]) => {
//     if (typeof window === 'undefined') return;
//     localStorage.setItem('cehpoint_users', JSON.stringify(users));
//   },

//   getCurrentUser: (): User | null => {
//     if (typeof window === 'undefined') return null;
//     const user = sessionStorage.getItem('cehpoint_current_user');
//     return user ? JSON.parse(user) : null;
//   },

//   setCurrentUser: (user: User | null) => {
//     if (typeof window === 'undefined') return;
//     if (user) {
//       sessionStorage.setItem('cehpoint_current_user', JSON.stringify(user));
//     } else {
//       sessionStorage.removeItem('cehpoint_current_user');
//     }
//   },

//   getTasks: (): Task[] => {
//     if (typeof window === 'undefined') return [];
//     const tasks = localStorage.getItem('cehpoint_tasks');
//     return tasks ? JSON.parse(tasks) : [];
//   },

//   setTasks: (tasks: Task[]) => {
//     if (typeof window === 'undefined') return;
//     localStorage.setItem('cehpoint_tasks', JSON.stringify(tasks));
//   },

//   getPayments: (): Payment[] => {
//     if (typeof window === 'undefined') return [];
//     const payments = localStorage.getItem('cehpoint_payments');
//     return payments ? JSON.parse(payments) : [];
//   },

//   setPayments: (payments: Payment[]) => {
//     if (typeof window === 'undefined') return;
//     localStorage.setItem('cehpoint_payments', JSON.stringify(payments));
//   },

//   getDailySubmissions: (): DailySubmission[] => {
//     if (typeof window === 'undefined') return [];
//     const submissions = localStorage.getItem('cehpoint_daily_submissions');
//     return submissions ? JSON.parse(submissions) : [];
//   },

//   setDailySubmissions: (submissions: DailySubmission[]) => {
//     if (typeof window === 'undefined') return;
//     localStorage.setItem('cehpoint_daily_submissions', JSON.stringify(submissions));
//   },
// };












// utils/storage.ts

import {
  createUser,
  getUserByEmail as fsGetUserByEmail,
  getUserById as fsGetUserById,
  listUsers as fsListUsers,
  setUser as fsSetUser,

  createTask as fsCreateTask,
  listTasks as fsListTasks,
  updateTask as fsUpdateTask,

  createSubmission as fsCreateSubmission,
  listSubmissionsByUser as fsListSubmissionsByUser,
  listSubmissions as fsListSubmissions,
} from "./firestore";

import type { User, Task, export DailySubmission } from "./types";

/**
 * Firestore-backed storage module
 * Mirrors your old localStorage API but works async with Firestore.
 */
export const storage = {
  /* ---------------------------------------------------
   * USERS
   * --------------------------------------------------- */

  async getUsers(): Promise<User[]> {
    return await fsListUsers();
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return await fsGetUserByEmail(email);
  },

  async getUserById(id: string): Promise<User | null> {
    return await fsGetUserById(id);
  },

  async createUser(user: Omit<User, "id">): Promise<User> {
    return await createUser(user);
  },

  async updateUser(id: string, payload: Partial<User>) {
    return await fsSetUser(id, payload);
  },

  /* ---------------------------------------------------
   * CURRENT USER (local browser session only)
   * --------------------------------------------------- */

  setCurrentUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("ceh_current_user", JSON.stringify(user));
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("ceh_current_user");
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  removeCurrentUser() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ceh_current_user");
    }
  },

  /* ---------------------------------------------------
   * TASKS
   * --------------------------------------------------- */

  async getTasks(): Promise<Task[]> {
    return await fsListTasks();
  },

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    return await fsCreateTask(task);
  },

  async updateTask(id: string, payload: Partial<Task>) {
    return await fsUpdateTask(id, payload);
  },

  /* ---------------------------------------------------
   * DAILY SUBMISSIONS
   * --------------------------------------------------- */

  async createSubmission(sub: Omit<DailySubmission, "id">): Promise<DailySubmission> {
    return await fsCreateSubmission(sub);
  },

  async getSubmissionsByUser(userId: string): Promise<DailySubmission[]> {
    return await fsListSubmissionsByUser(userId);
  },

  async getAllSubmissions(): Promise<DailySubmission[]> {
    return await fsListSubmissions();
  },
};
