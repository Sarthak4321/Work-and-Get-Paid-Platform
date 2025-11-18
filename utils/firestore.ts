// utils/firestore.ts
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { User, Task, DailySubmission } from "./types";

const usersCol = collection(db, "users");
const tasksCol = collection(db, "tasks");
const submissionsCol = collection(db, "submissions");

// ----------------- USERS -----------------
export async function createUser(user: Omit<User, "id">) {
  // add doc with auto-id
  const ref = await addDoc(usersCol, user as any);
  return { id: ref.id, ...user } as User;
}

export async function setUser(userId: string, user: Partial<User>) {
  const ref = doc(db, "users", userId);
  await setDoc(ref, user, { merge: true });
  const snap = await getDoc(ref);
  return { id: snap.id, ...(snap.data() as User) } as User;
}

export async function getUserById(userId: string) {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as User) } as User;
}

export async function getUserByEmail(email: string) {
  const q = query(usersCol, where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc0 = snap.docs[0];
  return { id: doc0.id, ...(doc0.data() as User) } as User;
}

export async function listUsers() {
  const snap = await getDocs(usersCol);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as User) })) as User[];
}

export async function updateUser(userId: string, payload: Partial<User>) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, payload as any);
  return getUserById(userId);
}

export async function deleteUser(userId: string) {
  await deleteDoc(doc(db, "users", userId));
}

// ----------------- TASKS -----------------
export async function createTask(task: Omit<Task, "id">) {
  const ref = await addDoc(tasksCol, task as any);
  return { id: ref.id, ...task } as Task;
}

export async function listTasks() {
  const snap = await getDocs(tasksCol);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Task) })) as Task[];
}

export async function getTaskById(taskId: string) {
  const snap = await getDoc(doc(db, "tasks", taskId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Task) } as Task;
}

export async function updateTask(taskId: string, payload: Partial<Task>) {
  const ref = doc(db, "tasks", taskId);
  await updateDoc(ref, payload as any);
  return getTaskById(taskId);
}

// ----------------- SUBMISSIONS -----------------
export async function createSubmission(data: Omit<DailySubmission, "id">) {
  const ref = await addDoc(collection(db, "submissions"), data);
  return { id: ref.id, ...data };
}

export async function listSubmissions() {
  const snap = await getDocs(submissionsCol);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as DailySubmission) })) as DailySubmission[];
}

export async function listSubmissionsByUser(userId: string) {
  const q = query(submissionsCol, where("userId", "==", userId), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as DailySubmission) })) as DailySubmission[];
}