import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Button from "../../components/Button";

import { storage } from "../../utils/storage";
import type { User, Payment } from "../../utils/types";

import { CheckCircle, X, Ban, DollarSign } from "lucide-react";

export default function Workers() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Payment[]>([]);
  const [filter, setFilter] =
    useState<"all" | "active" | "pending" | "suspended">("all");

  /* -----------------------------------------
   * AUTH + LOAD WORKERS & WITHDRAWALS
   * ----------------------------------------- */
  useEffect(() => {
    const currentUser = storage.getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(currentUser);
    loadWorkers();
    loadWithdrawalRequests();
  }, []);

  /* -----------------------------------------
   * LOAD WORKERS
   * ----------------------------------------- */
  const loadWorkers = async () => {
    const allUsers = await storage.getUsers();
    setWorkers(allUsers.filter((u) => u.role === "worker"));
  };

  /* -----------------------------------------
   * LOAD ALL PENDING WITHDRAWALS
   * ----------------------------------------- */
  const loadWithdrawalRequests = async () => {
    const payments = await storage.getPayments(); // all payments
    const pending = payments.filter(
      (p) => p.type === "withdrawal" && p.status === "pending"
    );

    setPendingWithdrawals(pending);
  };

  /* -----------------------------------------
   * APPROVE WITHDRAWAL
   * ----------------------------------------- */
  const approveWithdrawal = async (payment: Payment) => {
    if (!confirm("Approve this withdrawal request?")) return;

    // Mark payment completed
    await storage.updatePayment(payment.id!, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    // No balance update — already deducted when worker requested

    loadWithdrawalRequests();
    alert("Withdrawal approved!");
  };

  /* -----------------------------------------
   * REJECT WITHDRAWAL
   * ----------------------------------------- */
  const rejectWithdrawal = async (payment: Payment) => {
    if (!confirm("Reject this withdrawal request?")) return;

    // Mark payment failed
    await storage.updatePayment(payment.id!, {
      status: "failed",
    });

    // Refund worker balance
    const worker = await storage.getUserById(payment.userId);
    if (worker) {
      await storage.updateUser(worker.id, {
        balance: worker.balance + payment.amount,
      });
    }

    loadWithdrawalRequests();
    alert("Withdrawal rejected & refunded!");
  };

  /* -----------------------------------------
   * APPROVE WORKER
   * ----------------------------------------- */
  const handleApprove = async (workerId: string) => {
    await storage.updateUser(workerId, { accountStatus: "active" });
    await loadWorkers();
    alert("Worker approved!");
  };

  /* -----------------------------------------
   * SUSPEND WORKER
   * ----------------------------------------- */
  const handleSuspend = async (workerId: string) => {
    if (!confirm("Suspend this worker?")) return;

    await storage.updateUser(workerId, { accountStatus: "suspended" });
    await loadWorkers();
    alert("Worker suspended!");
  };

  /* -----------------------------------------
   * TERMINATE WORKER
   * ----------------------------------------- */
  const handleTerminate = async (workerId: string) => {
    if (!confirm("Terminate this worker permanently?")) return;

    await storage.updateUser(workerId, { accountStatus: "terminated" });
    await loadWorkers();
    alert("Worker terminated!");
  };

  /* -----------------------------------------
   * FILTER WORKERS
   * ----------------------------------------- */
  const filteredWorkers =
    filter === "all"
      ? workers
      : workers.filter((w) => w.accountStatus === filter);

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Manage Workers - Cehpoint</title>
      </Head>

      <div className="space-y-10">
        {/* -----------------------------------------
            PENDING WITHDRAWAL REQUESTS BLOCK
        ------------------------------------------- */}
        <Card>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DollarSign size={22} className="text-green-600" />
            Pending Withdrawal Requests
          </h2>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No pending withdrawal requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((p) => {
                const w = workers.find((u) => u.id === p.userId);
                return (
                  <div
                    key={p.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{w?.fullName}</p>
                      <p className="text-sm text-gray-600">{w?.email}</p>
                      <p className="mt-1">
                        <span className="font-semibold text-green-600">
                          ${p.amount}
                        </span>{" "}
                        requested on{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveWithdrawal(p)}
                        className="bg-green-600 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectWithdrawal(p)}
                        variant="danger"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* -----------------------------------------
            WORKERS LIST
        ------------------------------------------- */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Manage Workers</h1>

            <div className="flex space-x-2">
              {["all", "active", "pending", "suspended"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-lg ${
                    filter === type
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} (
                  {type === "all"
                    ? workers.length
                    : workers.filter((w) => w.accountStatus === type).length}
                  )
                </button>
              ))}
            </div>
          </div>

          {/* Workers List */}
          {filteredWorkers.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-12">
                No workers found
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredWorkers.map((worker) => (
                <Card key={worker.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold">
                          {worker.fullName}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            worker.accountStatus === "active"
                              ? "bg-green-100 text-green-700"
                              : worker.accountStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : worker.accountStatus === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {worker.accountStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>{" "}
                          {worker.email}
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>{" "}
                          {worker.phone}
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>{" "}
                          {worker.experience}
                        </div>
                        <div>
                          <span className="text-gray-500">Timezone:</span>{" "}
                          {worker.timezone}
                        </div>
                        <div>
                          <span className="text-gray-500">Knowledge:</span>{" "}
                          {worker.knowledgeScore}%
                        </div>
                        <div>
                          <span className="text-gray-500">Balance:</span> $
                          {worker.balance.toFixed(2)}
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {worker.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {worker.accountStatus === "pending" && (
                        <Button
                          onClick={() => handleApprove(worker.id)}
                          variant="secondary"
                        >
                          <CheckCircle size={16} />
                          <span>Approve</span>
                        </Button>
                      )}

                      {worker.accountStatus === "active" && (
                        <Button
                          onClick={() => handleSuspend(worker.id)}
                          variant="danger"
                        >
                          <Ban size={16} />
                          <span>Suspend</span>
                        </Button>
                      )}

                      {worker.accountStatus !== "terminated" && (
                        <Button
                          onClick={() => handleTerminate(worker.id)}
                          variant="danger"
                        >
                          <X size={16} />
                          <span>Terminate</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
