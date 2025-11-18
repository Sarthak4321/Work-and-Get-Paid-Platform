import { useState, useEffect } from 'react';
import { Calendar, Github, Video, Clock, Send } from 'lucide-react';

import { storage } from '../utils/storage';
import type { DailySubmission, User } from '../utils/types';

import Button from './Button';

interface DailySubmissionFormProps {
  userId: string;
  onSubmit: () => void;
}

export default function DailySubmissionForm({ userId, onSubmit }: DailySubmissionFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    githubCommitUrl: '',
    videoUrl: '',
    description: '',
    workType: 'development' as 'development' | 'design' | 'video-editing' | 'content' | 'other',
    hoursWorked: 0,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ---------------------------------------
     Load Current User + Today Submission 
  ---------------------------------------- */
  useEffect(() => {
    async function load() {
      const userData = await storage.getUserById(userId);
      setUser(userData);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return <p className="text-center py-8">Loading...</p>;
  }

  if (!user) {
    return <p className="text-center py-8 text-red-500">User not found!</p>;
  }

  const isDevelopmentWorker = user.skills?.some(skill =>
    ['React', 'Node.js', 'Python', 'Java', 'PHP', 'Angular', 'Vue.js'].includes(skill)
  );

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const hasSubmittedToday = async () => {
    const submissions = await storage.getSubmissionsByUser(userId);
    const today = getTodayDate();
    return submissions.some(s => s.date === today);
  };

  /* ---------------------------------------
     Submit Handler
  ---------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const alreadySubmitted = await hasSubmittedToday();
    if (alreadySubmitted) {
      setError('You have already submitted your daily work for today!');
      return;
    }

    if (isDevelopmentWorker && !formData.githubCommitUrl) {
      setError('GitHub commit link is mandatory for development workers!');
      return;
    }

    if (!formData.description || formData.hoursWorked <= 0) {
      setError('Please provide work description and hours worked.');
      return;
    }

    const submission: Omit<DailySubmission, 'id'> = {
      userId,
      date: getTodayDate(),
      githubCommitUrl: formData.githubCommitUrl,
      videoUrl: formData.videoUrl,
      description: formData.description,
      workType: formData.workType,
      hoursWorked: formData.hoursWorked,
      createdAt: new Date().toISOString(),
      adminReviewed: false,
    };

    await storage.createSubmission(submission);

    setSuccess('Daily work submitted successfully! 🎉');
    setFormData({
      githubCommitUrl: '',
      videoUrl: '',
      description: '',
      workType: 'development',
      hoursWorked: 0,
    });

    setTimeout(() => onSubmit(), 1500);
  };

  return (
    <div className="glass-card rounded-3xl premium-shadow p-10 animate-fade-in">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Daily Work Submission</h2>

        {isDevelopmentWorker && (
          <p className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
            <Github size={16} /> GitHub commit link is mandatory
          </p>
        )}
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-5 py-4 rounded-xl font-medium">
            {success}
          </div>
        )}

        {/* Work Type */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" /> Work Type
          </label>

          <select
            value={formData.workType}
            onChange={(e) =>
              setFormData({ ...formData, workType: e.target.value as any })
            }
            className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
          >
            <option value="development">Software Development</option>
            <option value="design">UI/UX Design</option>
            <option value="video-editing">Video Editing</option>
            <option value="content">Content Writing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
            <Github size={18} className="text-indigo-600" />
            GitHub Commit URL {isDevelopmentWorker && <span className="text-red-600">*</span>}
          </label>

          <input
            type="url"
            value={formData.githubCommitUrl}
            onChange={(e) =>
              setFormData({ ...formData, githubCommitUrl: e.target.value })
            }
            className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
            placeholder="https://github.com/username/repo/commit/..."
            required={isDevelopmentWorker}
          />
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
            <Video size={18} className="text-indigo-600" /> Video URL (optional)
          </label>

          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) =>
              setFormData({ ...formData, videoUrl: e.target.value })
            }
            className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
            placeholder="https://youtube.com/..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-700">
            Work Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
            rows={4}
            required
          />
        </div>

        {/* Hours */}
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" /> Hours Worked
          </label>

          <input
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={formData.hoursWorked || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                hoursWorked: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
            required
          />
        </div>

        <Button type="submit" fullWidth>
          <Send size={20} />
          Submit Daily Work
        </Button>
      </form>
    </div>
  );
}