import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';

import { storage } from '../../utils/storage';
import type { User } from '../../utils/types';

import { CheckCircle, X, Ban } from 'lucide-react';

export default function Workers() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  /* -----------------------------------------
   * AUTH + LOAD WORKERS
   * ----------------------------------------- */
  useEffect(() => {
    const currentUser = storage.getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    loadWorkers();
  }, []);

  /* -----------------------------------------
   * LOAD WORKERS FROM FIRESTORE
   * ----------------------------------------- */
  const loadWorkers = async () => {
    const allUsers = await storage.getUsers();
    setWorkers(allUsers.filter(u => u.role === 'worker'));
  };

  /* -----------------------------------------
   * APPROVE WORKER
   * ----------------------------------------- */
  const handleApprove = async (workerId: string) => {
    await storage.updateUser(workerId, { accountStatus: 'active' });
    await loadWorkers();
    alert('Worker approved!');
  };

  /* -----------------------------------------
   * SUSPEND WORKER
   * ----------------------------------------- */
  const handleSuspend = async (workerId: string) => {
    if (!confirm('Suspend this worker?')) return;

    await storage.updateUser(workerId, { accountStatus: 'suspended' });
    await loadWorkers();
    alert('Worker suspended!');
  };

  /* -----------------------------------------
   * TERMINATE WORKER
   * ----------------------------------------- */
  const handleTerminate = async (workerId: string) => {
    if (!confirm('Terminate this worker permanently?')) return;

    await storage.updateUser(workerId, { accountStatus: 'terminated' });
    await loadWorkers();
    alert('Worker terminated!');
  };

  /* -----------------------------------------
   * FILTER WORKERS
   * ----------------------------------------- */
  const filteredWorkers =
    filter === 'all' ? workers : workers.filter(w => w.accountStatus === filter);

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Manage Workers - Cehpoint</title>
      </Head>

      <div className="space-y-6">
        {/* Top Filters */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Workers</h1>

          <div className="flex space-x-2">
            {['all', 'active', 'pending', 'suspended'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-4 py-2 rounded-lg ${
                  filter === type ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} (
                {type === 'all'
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
            <p className="text-center text-gray-500 py-12">No workers found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{worker.fullName}</h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          worker.accountStatus === 'active'
                            ? 'bg-green-100 text-green-700'
                            : worker.accountStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : worker.accountStatus === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {worker.accountStatus}
                      </span>
                    </div>

                    {/* Worker Details */}
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span> {worker.email}
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span> {worker.phone}
                      </div>
                      <div>
                        <span className="text-gray-500">Experience:</span> {worker.experience}
                      </div>
                      <div>
                        <span className="text-gray-500">Timezone:</span> {worker.timezone}
                      </div>
                      <div>
                        <span className="text-gray-500">Knowledge:</span> {worker.knowledgeScore}%
                      </div>
                      <div>
                        <span className="text-gray-500">Balance:</span> $
                        {worker.balance.toFixed(2)}
                      </div>
                    </div>

                    {/* Skills */}
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

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    {worker.accountStatus === 'pending' && (
                      <Button onClick={() => handleApprove(worker.id)} variant="secondary">
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </Button>
                    )}

                    {worker.accountStatus === 'active' && (
                      <Button onClick={() => handleSuspend(worker.id)} variant="danger">
                        <Ban size={16} />
                        <span>Suspend</span>
                      </Button>
                    )}

                    {worker.accountStatus !== 'terminated' && (
                      <Button onClick={() => handleTerminate(worker.id)} variant="danger">
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
    </Layout>
  );
}