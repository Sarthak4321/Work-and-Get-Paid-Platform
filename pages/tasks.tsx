// pages/admin/tasks.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";

import { storage } from "../../utils/storage";
import type { User, Task, Payment } from "../../utils/types";

import { Plus, Check, X } from "lucide-react";

type NewTaskForm = {
  title: string;
  description: string;
  category: string;
  skills: string[];
  weeklyPayout: number;
  deadline: string;
  assignedTo?: string | null;
};

export default function AdminTasks() {
  const router = useRouter();

  // auth + state
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // lists
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  // UI
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: "",
    description: "",
    category: "",
    skills: [],
    weeklyPayout: 500,
    deadline: "",
    assignedTo: undefined,
  });

  // possible skill options (you can expand)
  const skillOptions = [
    "React",
    "Node.js",
    "Python",
    "Java",
    "PHP",
    "Angular",
    "Vue.js",
    "Video Editing",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "SEO",
  ];

  // =======================================================
  // AUTH + INITIAL LOAD
  // =======================================================
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const cur = storage.getCurrentUser?.();
        if (!cur || cur.role !== "admin") {
          router.push("/login");
          return;
        }
        setCurrentAdmin(cur);

        await Promise.all([loadWorkers(), loadTasks()]);
      } catch (err: any) {
        console.error("Failed to initialize admin tasks page:", err);
        setPageError("Failed to load admin data. Check console for details.");
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // Loaders
  // =======================================================
  const loadWorkers = async () => {
    try {
      const list = await storage.getUsers();
      const activeWorkers = list.filter((u) => u.role === "worker");
      setWorkers(activeWorkers);
    } catch (err) {
      console.error("loadWorkers error", err);
      setPageError("Unable to fetch workers.");
    }
  };

  const loadTasks = async () => {
    try {
      const list = await storage.getTasks();
      // sort newest first for admin view
      setTasks(list.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
    } catch (err) {
      console.error("loadTasks error", err);
      setPageError("Unable to fetch tasks.");
    }
  };

  // =======================================================
  // CREATE TASK (with optional assignment)
  // =======================================================
  const handleCreateTask = async () => {
    // basic validation
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("Please enter title and description.");
      return;
    }
    if (!newTask.deadline) {
      alert("Please set a deadline.");
      return;
    }

    if (!currentAdmin) {
      alert("Admin session missing.");
      return;
    }

    setCreating(true);
    try {
      const payload: Omit<Task, "id"> = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        category: newTask.category || "General",
        skills: newTask.skills || [],
        weeklyPayout: Number(newTask.weeklyPayout) || 0,
        deadline: newTask.deadline,
        status: newTask.assignedTo ? "assigned" : "available",
        assignedTo: newTask.assignedTo || null,
        submissionUrl: "",
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin.id,
      };

      await storage.createTask(payload);
      await loadTasks();

      // reset form
      setNewTask({
        title: "",
        description: "",
        category: "",
        skills: [],
        weeklyPayout: 500,
        deadline: "",
        assignedTo: undefined,
      });
      setShowCreate(false);
      alert("Task created successfully.");
    } catch (err) {
      console.error("createTask error", err);
      alert("Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  // =======================================================
  // APPROVE (mark completed) -> create payment if assigned worker
  // =======================================================
  const handleApproveTask = async (taskId: string) => {
    const job = tasks.find((t) => t.id === taskId);
    if (!job) return alert("Task not found.");
    if (!job.assignedTo) return alert("Task not assigned to a worker.");

    setActionLoadingId(taskId);
    try {
      // 1) update task status
      await storage.updateTask(taskId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      // 2) create payment object and persist
      const payment: Omit<Payment, "id"> = {
        userId: job.assignedTo,
        amount: job.weeklyPayout,
        type: "task-payment",
        status: "completed",
        taskId: job.id!,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      // createPayment may be named createPayment/createPaymentInFirestore in your storage.
      if (typeof (storage as any).createPayment === "function") {
        await (storage as any).createPayment(payment);
      } else if (typeof (storage as any).createPayment === "undefined" && typeof (storage as any).createPayment === "undefined") {
        // If no storage.createPayment available, try create a generic payment method name createPaymentInDB (fallback)
        if (typeof (storage as any).createPayment === "function") {
          await (storage as any).createPayment(payment);
        } else {
          console.warn("storage.createPayment not implemented; skipping payment creation. Implement createPayment in utils/storage to create payments.");
        }
      }

      // 3) refresh list
      await loadTasks();
      alert("Task approved and marked completed.");
    } catch (err) {
      console.error("approveTask error", err);
      alert("Failed to approve task.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // =======================================================
  // REJECT TASK (mark rejected with feedback)
  // =======================================================
  const handleRejectTask = async (taskId: string) => {
    const reason = prompt("Enter rejection reason (optional):") || "";
    setActionLoadingId(taskId);
    try {
      await storage.updateTask(taskId, {
        status: "rejected",
        feedback: reason || undefined,
      });
      await loadTasks();
      alert("Task rejected.");
    } catch (err) {
      console.error("rejectTask error", err);
      alert("Failed to reject task.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // =======================================================
  // Helper: toggle skill
  // =======================================================
  const toggleSkill = (skill: string) => {
    setNewTask((prev) => {
      const has = prev.skills.includes(skill);
      return { ...prev, skills: has ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill] };
    });
  };

  // =======================================================
  // Render
  // =======================================================
  if (!currentAdmin) {
    return null; // redirect in useEffect while loading
  }

  return (
    <Layout>
      <Head>
        <title>Admin — Manage Tasks</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Tasks</h1>
            <p className="text-gray-600 mt-1">Create, assign, approve and review tasks</p>
          </div>
          <div>
            <Button onClick={() => setShowCreate((s) => !s)}>
              <Plus size={16} />
              <span>{showCreate ? "Close" : "Create Task"}</span>
            </Button>
          </div>
        </div>

        {pageError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-700 font-medium">{pageError}</p>
          </div>
        )}

        {/* Create Task Form */}
        {showCreate && (
          <Card>
            <h3 className="text-xl font-semibold mb-4">Create New Task</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Describe the task in detail"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select category</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Writing">Writing</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Weekly Payout ($)</label>
                  <input
                    type="number"
                    value={newTask.weeklyPayout}
                    onChange={(e) => setNewTask({ ...newTask, weeklyPayout: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Assign to Worker (optional)</label>
                  <select
                    value={newTask.assignedTo || ""}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value || undefined })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Leave unassigned</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName} — {w.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Required Skills</label>
                <div className="grid grid-cols-3 gap-2">
                  {skillOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`px-3 py-2 rounded-lg text-sm border transition ${
                        newTask.skills.includes(s) ? "bg-indigo-50 border-indigo-400 text-indigo-700" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleCreateTask} disabled={creating}>
                  {creating ? "Creating…" : "Create Task"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tasks list */}
        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-6">No tasks yet</p>
            </Card>
          ) : (
            tasks.map((task) => {
              return (
                <Card key={task.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold truncate">{task.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "submitted"
                              ? "bg-blue-100 text-blue-700"
                              : task.status === "assigned"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{task.description}</p>

                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm text-gray-700">
                        <div>
                          <span className="text-gray-500">Category:</span> {task.category}
                        </div>
                        <div>
                          <span className="text-gray-500">Payout:</span> ${task.weeklyPayout}
                        </div>
                        <div>
                          <span className="text-gray-500">Deadline:</span>{" "}
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                        </div>
                      </div>

                      {task.assignedTo && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="text-gray-500">Assigned to:</span>{" "}
                          {workers.find((w) => w.id === task.assignedTo)?.fullName ||
                            task.assignedTo}
                        </div>
                      )}

                      {task.submissionUrl && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="text-sm font-medium">Submission</p>
                          <p className="text-sm text-gray-600 break-all mt-1">{task.submissionUrl}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {/* Only show Approve/Reject when submitted or assigned (admin review) */}
                      {(task.status === "submitted" || task.status === "assigned") && (
                        <>
                          <Button
                            onClick={() => handleApproveTask(task.id!)}
                            disabled={actionLoadingId === task.id}
                          >
                            <Check size={14} />
                            <span>Approve</span>
                          </Button>

                          <Button
                            onClick={() => handleRejectTask(task.id!)}
                            variant="danger"
                            disabled={actionLoadingId === task.id}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}

                      {/* If task is available (not assigned) — provide quick assign menu */}
                      {task.status === "available" && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Quick assign</label>
                          <select
                            className="w-full px-3 py-2 border rounded"
                            defaultValue=""
                            onChange={async (e) => {
                              const uid = e.target.value;
                              if (!uid) return;

                              setActionLoadingId(task.id!);
                              try {
                                await storage.updateTask(task.id!, { assignedTo: uid, status: "assigned" });
                                await loadTasks();
                                alert("Task assigned.");
                              } catch (err) {
                                console.error("quick assign error", err);
                                alert("Failed to assign.");
                              } finally {
                                setActionLoadingId(null);
                              }
                            }}
                          >
                            <option value="">Assign to...</option>
                            {workers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.fullName} — {w.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}