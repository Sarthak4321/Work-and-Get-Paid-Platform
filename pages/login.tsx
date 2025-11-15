import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { storage, User } from '../utils/storage';
import { initializeTestData, resetToTestData } from '../utils/testData';
import Button from '../components/Button';

// Firebase auth imports
import { googleAuth, githubAuth } from "../utils/authProviders";
import { firebaseLogin } from "../utils/authEmailPassword";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initializeTestData();
  }, []);

  // =============================================================
  // EMAIL + PASSWORD LOGIN
  // =============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await firebaseLogin(email, password);

      if (!result.user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      // Store user with ALL required fields
      const loggedInUser: User = {
        id: result.user.uid,
        email: result.user.email || "",
        password: password,
        fullName: result.user.displayName || "",
        phone: "",
        skills: [],
        experience: "",
        timezone: "",
        preferredWeeklyPayout: 0,

        role: "worker",
        accountStatus: "active",
        knowledgeScore: 0,
        demoTaskCompleted: false,

        createdAt: new Date().toISOString(),
        balance: 0,
      };

      storage.setCurrentUser(loggedInUser);
      router.push("/dashboard");

    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password");
    }
  };


  // =============================================================
  // GOOGLE LOGIN
  // =============================================================
  const handleGoogleLogin = async () => {
    try {
      const result = await googleAuth();
      const user = result.user;

      const users = storage.getUsers();
      const existing = users.find(u => u.email === user.email);

      if (existing) {
        storage.setCurrentUser(existing);
        return router.push("/dashboard");
      }

      const newUser: User = {
        id: user.uid,
        email: user.email || "",
        password: "",
        fullName: user.displayName || "",
        phone: "",
        skills: [],
        experience: "",
        timezone: "",
        preferredWeeklyPayout: 0,

        role: "worker",
        accountStatus: "active",
        knowledgeScore: 0,
        demoTaskCompleted: false,

        createdAt: new Date().toISOString(),
        balance: 0,
      };

      storage.setUsers([...users, newUser]);
      storage.setCurrentUser(newUser);
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };


  // =============================================================
  // GITHUB LOGIN
  // =============================================================
  const handleGithubLogin = async () => {
    try {
      const result = await githubAuth();
      const user = result.user;

      const users = storage.getUsers();
      const existing = users.find(u => u.email === user.email);

      if (existing) {
        storage.setCurrentUser(existing);
        return router.push("/dashboard");
      }

      const newUser: User = {
        id: user.uid,
        email: user.email || "",
        password: "",
        fullName: user.displayName || "",
        phone: "",
        skills: [],
        experience: "",
        timezone: "",
        preferredWeeklyPayout: 0,

        role: "worker",
        accountStatus: "active",
        knowledgeScore: 0,
        demoTaskCompleted: false,

        createdAt: new Date().toISOString(),
        balance: 0,
      };

      storage.setUsers([...users, newUser]);
      storage.setCurrentUser(newUser);
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("GitHub login failed");
    }
  };


  // =============================================================
  // DEMO ADMIN (unchanged)
  // =============================================================
  const createDemoAdmin = () => {
    const users = storage.getUsers();
    const existingAdmin = users.find(u => u.email === 'sarthakroy902@gmail.com');

    if (!existingAdmin) {
      const adminUser: User = {
        id: 'admin-1',
        email: 'sarthakroy902@gmail.com',
        password: 'admin123',
        fullName: 'Admin User',
        phone: '+1234567890',
        skills: [],
        experience: 'expert',
        timezone: 'UTC',
        preferredWeeklyPayout: 0,
        accountStatus: 'active',
        role: 'admin',
        knowledgeScore: 100,
        demoTaskCompleted: true,
        createdAt: new Date().toISOString(),
        balance: 0,
      };

      storage.setUsers([...users, adminUser]);
      alert('Demo admin created!\nEmail: sarthakroy902@gmail.com\nPassword: admin123');
    } else {
      alert('Admin already exists!\nEmail: admin@cehpoint.com\nPassword: admin123');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex items-center justify-center py-12 px-4">
      <Head>
        <title>Login - Cehpoint</title>
      </Head>

      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:scale-110 inline-block transition-transform">
              Cehpoint
            </span>
          </Link>
          <h1 className="text-4xl font-black mt-6 text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-3 text-lg">Login to continue your journey</p>
        </div>

        <div className="glass-card rounded-3xl premium-shadow p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl font-medium animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-5 py-3 rounded-xl shadow-sm hover:bg-gray-50 transition"
              >
                <img src="/google.png" alt="google" className="w-5 h-5" />
                <span className="font-medium">Sign in with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="w-full flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl shadow hover:bg-gray-800 transition"
              >
                <img src="/github.png" alt="github" className="w-5 h-5 invert" />
                <span className="font-medium">Sign in with GitHub</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" fullWidth>
              Login to Continue
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all">
                Sign Up Free
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <div className="space-y-3">
              <button
                onClick={createDemoAdmin}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Create Demo Admin Account
              </button>
              <button
                onClick={resetToTestData}
                className="w-full px-5 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none rounded-xl text-sm font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🚀 Load Test Accounts & Data
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}