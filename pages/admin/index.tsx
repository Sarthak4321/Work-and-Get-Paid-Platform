import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { storage, User, Task } from '../../utils/storage';
import { Users, Briefcase, DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    const allUsers = storage.getUsers();
    setWorkers(allUsers.filter(u => u.role === 'worker'));
    setTasks(storage.getTasks());
  }, [router]);

  if (!user) return null;

  const activeWorkers = workers.filter(w => w.accountStatus === 'active').length;
  const pendingWorkers = workers.filter(w => w.accountStatus === 'pending').length;
  const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
  const totalPayout = tasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.weeklyPayout, 0);
  
  const submissions = storage.getDailySubmissions();
  const todaySubmissions = submissions.filter(s => s.date === new Date().toISOString().split('T')[0]).length;

  const stats = [
    {
      label: 'Total Workers',
      value: workers.length,
      subValue: `${activeWorkers} active`,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Pending Approval',
      value: pendingWorkers,
      subValue: `${workers.length - pendingWorkers} approved`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
    },
    {
      label: 'Active Tasks',
      value: activeTasks,
      subValue: `${tasks.length} total tasks`,
      icon: Briefcase,
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Today\'s Submissions',
      value: todaySubmissions,
      subValue: `${submissions.length} total`,
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <Layout>
      <Head>
        <title>Admin Dashboard - Cehpoint</title>
      </Head>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage workers, tasks, and platform operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl premium-shadow p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="text-white" size={28} />
              </div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-900 mt-2 font-bold">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">{stat.subValue}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl premium-shadow p-8">
            <h2 className="text-2xl font-black mb-6 text-gray-900">Recent Workers</h2>
            {workers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No workers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workers.slice(0, 5).map(worker => (
                  <div key={worker.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{worker.fullName}</p>
                      <p className="text-sm text-gray-600">{worker.email}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      worker.accountStatus === 'active' ? 'bg-green-100 text-green-700' :
                      worker.accountStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {worker.accountStatus.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl premium-shadow p-8">
            <h2 className="text-2xl font-black mb-6 text-gray-900">Recent Tasks</h2>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.category}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-xs font-bold ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
