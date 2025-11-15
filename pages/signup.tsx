// import { useState, useEffect } from 'react';
// import Head from 'next/head';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { CheckCircle, X } from 'lucide-react';
// import { storage, User } from '../utils/storage';
// import { initGemini, generateKnowledgeQuestions } from '../utils/gemini';
// import Button from '../components/Button';

// export default function Signup() {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [geminiKey, setGeminiKey] = useState('');
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     fullName: '',
//     phone: '',
//     skills: [] as string[],
//     experience: '',
//     timezone: '',
//     preferredWeeklyPayout: 500,
//   });
//   const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
//   const [knowledgeQuestions, setKnowledgeQuestions] = useState<any[]>([]);
//   const [answers, setAnswers] = useState<number[]>([]);
//   const [score, setScore] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const skillOptions = [
//     'React', 'Node.js', 'Python', 'Java', 'PHP', 'Angular', 'Vue.js',
//     'Video Editing', 'Adobe Premiere', 'After Effects', 'UI/UX Design',
//     'Graphic Design', 'Content Writing', 'Digital Marketing', 'SEO'
//   ];

//   const handleSkillToggle = (skill: string) => {
//     if (selectedSkills.includes(skill)) {
//       setSelectedSkills(selectedSkills.filter(s => s !== skill));
//     } else {
//       setSelectedSkills([...selectedSkills, skill]);
//     }
//   };

//   const handleNext = async () => {
//     if (step === 1) {
//       if (!formData.email || !formData.password || !formData.fullName || !formData.phone) {
//         alert('Please fill all fields');
//         return;
//       }
//       setStep(2);
//     } else if (step === 2) {
//       if (selectedSkills.length === 0 || !formData.experience || !formData.timezone) {
//         alert('Please complete all fields');
//         return;
//       }
//       setFormData({ ...formData, skills: selectedSkills });

//       if (!geminiKey) {
//         alert('For demo purposes, please enter a Gemini API key or skip with test mode');
//         setStep(3);
//         setKnowledgeQuestions([
//           {
//             question: 'Sample Question: What is React?',
//             options: ['A Library', 'A Framework', 'A Language', 'A Database'],
//             correctAnswer: 0
//           }
//         ]);
//         return;
//       }

//       setLoading(true);
//       try {
//         initGemini(geminiKey);
//         const questions = await generateKnowledgeQuestions(selectedSkills);
//         setKnowledgeQuestions(questions);
//         setAnswers(new Array(questions.length).fill(-1));
//         setStep(3);
//       } catch (error) {
//         console.error('Error generating questions:', error);
//         alert('Using sample questions for demo');
//         setKnowledgeQuestions([
//           {
//             question: 'Sample Question: What is React?',
//             options: ['A Library', 'A Framework', 'A Language', 'A Database'],
//             correctAnswer: 0
//           }
//         ]);
//         setAnswers([0]);
//         setStep(3);
//       }
//       setLoading(false);
//     } else if (step === 3) {
//       const correctCount = answers.filter((ans, idx) => ans === knowledgeQuestions[idx].correctAnswer).length;
//       const finalScore = (correctCount / knowledgeQuestions.length) * 100;
//       setScore(finalScore);

//       if (finalScore < 60) {
//         alert('Knowledge check score too low. Please try again or improve your skills.');
//         return;
//       }

//       const newUser: User = {
//         id: `worker-${Date.now()}`,
//         ...formData,
//         skills: selectedSkills,
//         accountStatus: 'pending',
//         role: 'worker',
//         knowledgeScore: finalScore,
//         demoTaskCompleted: false,
//         createdAt: new Date().toISOString(),
//         balance: 0,
//       };

//       const users = storage.getUsers();
//       storage.setUsers([...users, newUser]);
//       storage.setCurrentUser(newUser);

//       router.push('/dashboard');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-12">
//       <Head>
//         <title>Sign Up - Cehpoint</title>
//       </Head>

//       <div className="max-w-2xl mx-auto px-4 animate-fade-in">
//         <div className="text-center mb-10">
//           <Link href="/">
//             <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:scale-110 inline-block transition-transform">
//               Cehpoint
//             </span>
//           </Link>
//           <h1 className="text-4xl font-black mt-6 text-gray-900">Join Our Platform</h1>
//           <p className="text-gray-600 mt-3 text-lg">Start your project-based work journey today</p>
//         </div>

//         <div className="glass-card rounded-3xl premium-shadow p-10">
//           <div className="flex justify-between mb-10">
//             <div className={`flex-1 text-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
//               <div className={`w-12 h-12 rounded-full ${step >= 1 ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gray-300'} text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-lg`}>
//                 {step > 1 ? <CheckCircle size={22} /> : '1'}
//               </div>
//               <p className="text-sm font-bold">Basic Info</p>
//             </div>
//             <div className={`flex-1 text-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
//               <div className={`w-12 h-12 rounded-full ${step >= 2 ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gray-300'} text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-lg`}>
//                 {step > 2 ? <CheckCircle size={22} /> : '2'}
//               </div>
//               <p className="text-sm font-bold">Skills</p>
//             </div>
//             <div className={`flex-1 text-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
//               <div className={`w-12 h-12 rounded-full ${step >= 3 ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gray-300'} text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-lg`}>
//                 3
//               </div>
//               <p className="text-sm font-bold">Verification</p>
//             </div>
//           </div>



//           {step === 1 && (
//             <div className="space-y-6">

//               {/* OAuth Buttons */}
//               <div className="space-y-3">
//                 <button

//                   className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-5 py-3 rounded-xl shadow-sm hover:bg-gray-50 transition"
//                 >

//                   <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
//                     <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
//                   </svg>
//                   <span className="font-medium">Sign up with Google</span>
//                 </button>

//                 <button

//                   className="w-full flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl shadow hover:bg-gray-800 transition"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 640 640">
//                     <path fill="#ffffff" d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z" /></svg>
//                   <span className="font-medium">Sign up with GitHub</span>
//                 </button>
//               </div>

//               {/* Divider */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-px bg-gray-300" />
//                 <span className="text-sm text-gray-500">or</span>
//                 <div className="flex-1 h-px bg-gray-300" />
//               </div>



//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Full Name</label>
//                 <input
//                   type="text"
//                   value={formData.fullName}
//                   onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                   className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
//                   placeholder="john@example.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Password</label>
//                 <input
//                   type="password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
//                   placeholder="••••••••"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Phone</label>
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                   className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
//                   placeholder="+1 234 567 8900"
//                 />
//               </div>
//             </div>
//           )}

//           {step === 2 && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Select Your Skills</label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {skillOptions.map(skill => (
//                     <button
//                       key={skill}
//                       onClick={() => handleSkillToggle(skill)}
//                       className={`px-4 py-2 rounded-lg border-2 transition ${selectedSkills.includes(skill)
//                         ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
//                         : 'border-gray-300 hover:border-gray-400'
//                         }`}
//                     >
//                       {skill}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Experience Level</label>
//                 <select
//                   value={formData.experience}
//                   onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
//                 >
//                   <option value="">Select experience</option>
//                   <option value="beginner">Beginner (0-1 years)</option>
//                   <option value="intermediate">Intermediate (1-3 years)</option>
//                   <option value="advanced">Advanced (3-5 years)</option>
//                   <option value="expert">Expert (5+ years)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Timezone</label>
//                 <input
//                   type="text"
//                   value={formData.timezone}
//                   onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
//                   placeholder="e.g., IST, PST, EST"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Preferred Weekly Payout ($)</label>
//                 <input
//                   type="number"
//                   value={formData.preferredWeeklyPayout}
//                   onChange={(e) => setFormData({ ...formData, preferredWeeklyPayout: Number(e.target.value) })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
//                   placeholder="500"
//                 />
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <label className="block text-sm font-bold mb-3 text-gray-700">Gemini API Key (Optional - for AI features)</label>
//                 <input
//                   type="password"
//                   value={geminiKey}
//                   onChange={(e) => setGeminiKey(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
//                   placeholder="Enter your Gemini API key or leave blank for demo"
//                 />
//                 <p className="text-xs text-gray-600 mt-2">
//                   Get your free API key from <a href="https://ai.google.dev" target="_blank" className="text-indigo-600 underline">Google AI Studio</a>
//                 </p>
//               </div>
//             </div>
//           )}

//           {step === 3 && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Knowledge Check</h3>
//               <p className="text-sm text-gray-600">Answer these questions to verify your skills</p>

//               {knowledgeQuestions.map((q, idx) => (
//                 <div key={idx} className="border border-gray-200 rounded-lg p-4">
//                   <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
//                   <div className="space-y-2">
//                     {q.options.map((option: string, optIdx: number) => (
//                       <button
//                         key={optIdx}
//                         onClick={() => {
//                           const newAnswers = [...answers];
//                           newAnswers[idx] = optIdx;
//                           setAnswers(newAnswers);
//                         }}
//                         className={`w-full text-left px-4 py-2 rounded-lg border-2 transition ${answers[idx] === optIdx
//                           ? 'border-indigo-600 bg-indigo-50'
//                           : 'border-gray-300 hover:border-gray-400'
//                           }`}
//                       >
//                         {option}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mt-6 flex justify-between">
//             {step > 1 && (
//               <Button variant="outline" onClick={() => setStep(step - 1)}>
//                 Back
//               </Button>
//             )}
//             <Button
//               onClick={handleNext}
//               disabled={loading}
//               className={step === 1 ? 'ml-auto' : ''}
//               fullWidth={step === 1}
//             >
//               {loading ? 'Loading...' : step === 3 ? 'Complete Signup' : 'Next'}
//             </Button>
//           </div>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link href="/login" className="text-indigo-600 font-medium">
//                 Login
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











"use client";


import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';
import { googleAuth, githubAuth } from "../utils/authProviders";
import { firebaseSignup } from "../utils/authEmailPassword";


import { storage, User } from '../utils/storage';
import { initGemini, generateKnowledgeQuestions } from '../utils/gemini';
import Button from '../components/Button';

import { auth } from "../utils/firebase";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [geminiKey, setGeminiKey] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    skills: [] as string[],
    experience: '',
    timezone: '',
    preferredWeeklyPayout: 500,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [knowledgeQuestions, setKnowledgeQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const skillOptions = [
    'React', 'Node.js', 'Python', 'Java', 'PHP', 'Angular', 'Vue.js',
    'Video Editing', 'Adobe Premiere', 'After Effects', 'UI/UX Design',
    'Graphic Design', 'Content Writing', 'Digital Marketing', 'SEO'
  ];

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // -----------------------------------------------------
  // GOOGLE SIGNUP
  // -----------------------------------------------------
  const handleGoogleSignup = async () => {
    try {
      const result = await googleAuth();
      const user = result.user;

      const newUser: User = {
        id: `worker-${Date.now()}`,
        email: user.email || "",
        password: "",
        fullName: user.displayName || "",
        phone: "",
        skills: [],
        experience: "",
        timezone: "",
        preferredWeeklyPayout: 0,
        accountStatus: "pending",
        role: "worker",
        knowledgeScore: 0,
        demoTaskCompleted: false,
        createdAt: new Date().toISOString(),
        balance: 0,
      };

      const users = storage.getUsers();
      storage.setUsers([...users, newUser]);
      storage.setCurrentUser(newUser);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Google signup failed.");
    }
  };

  // -----------------------------------------------------
  // GITHUB SIGNUP
 const handleGithubSignup = async () => {
  try {
    const result = await githubAuth();
    const user = result.user;

    const githubName =
      user.displayName ||
      user.reloadUserInfo?.screenName || // GitHub username
      user.email?.split("@")[0] ||       // fallback username
      "New User";

    const users = storage.getUsers();
    const existing = users.find(u => u.email === user.email);

    if (existing) {
      storage.setCurrentUser(existing);
      return router.push("/dashboard");
    }

    const newUser = {
      id: user.uid,
      email: user.email || "",
      fullName: githubName,
      password: "",
      role: "worker",
      accountStatus: "active",
      createdAt: new Date().toISOString(),

      // required for dashboard
      skills: [],
      experience: "",
      phone: "",
      timezone: "",
      preferredWeeklyPayout: 0,
      balance: 0,
      knowledgeScore: 0,
      demoTaskCompleted: false,
    };

    storage.setUsers([...users, newUser]);
    storage.setCurrentUser(newUser);
    router.push("/dashboard");

  } catch (err) {
    console.error(err);
    alert("GitHub login failed");
  }
};


  // email
  const handleEmailSignup = async () => {
    try {
      const result = await firebaseSignup(formData.email, formData.password);

      alert("Verification email sent! Please check your inbox.");
      console.log("Trying to send verification email to:", formData.email);

      router.push("/login"); // Force email verification
    } catch (err: any) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        alert("Email already exists.");
      } else if (err.code === "auth/weak-password") {
        alert("Weak password.");
      } else {
        alert("Signup failed");
      }
    }
  };

  // -----------------------------------------------------
  // ON NORMAL FORM SIGNUP (Your Steps)
  // -----------------------------------------------------
  const handleNext = async () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.fullName || !formData.phone) {
        alert('Please fill all fields');
        return;
      }
      setStep(2);
    }
    else if (step === 2) {
      if (selectedSkills.length === 0 || !formData.experience || !formData.timezone) {
        alert('Please complete all fields');
        return;
      }

      setFormData({ ...formData, skills: selectedSkills });

      if (!geminiKey) {
        alert('Using demo knowledge check (Gemini key missing)');
        setStep(3);
        setKnowledgeQuestions([
          {
            question: 'Sample Question: What is React?',
            options: ['A Library', 'A Framework', 'A Language', 'A Database'],
            correctAnswer: 0
          }
        ]);
        return;
      }

      setLoading(true);
      try {
        initGemini(geminiKey);
        const questions = await generateKnowledgeQuestions(selectedSkills);
        setKnowledgeQuestions(questions);
        setAnswers(new Array(questions.length).fill(-1));
        setStep(3);
      } catch (error) {
        console.error(error);
        alert('Using sample questions.');
        setKnowledgeQuestions([
          {
            question: 'Sample Question: What is React?',
            options: ['A Library', 'A Framework', 'A Language', 'A Database'],
            correctAnswer: 0
          }
        ]);
        setAnswers([0]);
        setStep(3);
      }
      setLoading(false);
    }
    else if (step === 3) {
      const correctCount = answers.filter((ans, idx) => ans === knowledgeQuestions[idx].correctAnswer).length;
      const finalScore = (correctCount / knowledgeQuestions.length) * 100;
      setScore(finalScore);

      if (finalScore < 60) {
        alert('Knowledge check score too low. Please try again or improve your skills.');
        return;
      }

      // ⭐ Firebase email OTP verification signup
      await handleEmailSignup();
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 py-12">
      <Head>
        <title>Sign Up - Cehpoint</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 animate-fade-in">

        {/* HEADER */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:scale-110 inline-block transition-transform">
              Cehpoint
            </span>
          </Link>
          <h1 className="text-4xl font-black mt-6 text-gray-900">Join Our Platform</h1>
          <p className="text-gray-600 mt-3 text-lg">Start your project-based work journey today</p>
        </div>

        {/* FORM CARD */}
        <div className="glass-card rounded-3xl premium-shadow p-10">

          {/* STEP INDICATOR */}
          <div className="flex justify-between mb-10">
            {['Basic Info', 'Skills', 'Verification'].map((label, i) => (
              <div key={i} className={`flex-1 text-center ${step >= i + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-12 h-12 rounded-full ${step >= i + 1 ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gray-300'
                  } text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-lg`}>
                  {step > i + 1 ? <CheckCircle size={22} /> : i + 1}
                </div>
                <p className="text-sm font-bold">{label}</p>
              </div>
            ))}
          </div>

          {/* ---------------- STEP 1 ---------------- */}
          {step === 1 && (
            <div className="space-y-6">

              {/* OAUTH BUTTONS */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-5 py-3 rounded-xl shadow-sm hover:bg-gray-50 transition"
                >
                  <img src="/google.png" className="w-5 h-5" />
                  <span className="font-medium">Sign up with Google</span>
                </button>

                <button
                  onClick={handleGithubSignup}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl shadow hover:bg-gray-800 transition"
                >
                  <img src="/github.png" className="w-5 h-5 invert" />
                  <span className="font-medium">Sign up with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* BASIC INFO INPUTS */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          )}

          {/* ---------------- STEP 2 ---------------- */}
          {step === 2 && (
            <div className="space-y-4">

              <label className="block text-sm font-bold mb-3 text-gray-700">Select Your Skills</label>
              <div className="grid grid-cols-2 gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-lg border-2 transition ${selectedSkills.includes(skill)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Experience Level</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Select experience</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3-5 years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Timezone</label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g., IST, PST, EST"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Preferred Weekly Payout ($)</label>
                <input
                  type="number"
                  value={formData.preferredWeeklyPayout}
                  onChange={(e) => setFormData({ ...formData, preferredWeeklyPayout: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-bold mb-3 text-gray-700">Gemini API Key (Optional)</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="Enter Gemini API key"
                />
              </div>

            </div>
          )}

          {/* ---------------- STEP 3 ---------------- */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Knowledge Check</h3>
              {knowledgeQuestions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          const newAns = [...answers];
                          newAns[idx] = optIdx;
                          setAnswers(newAns);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg border-2 transition ${answers[idx] === optIdx
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={loading}
              className={step === 1 ? 'ml-auto' : ''}
              fullWidth={step === 1}
            >
              {loading ? 'Loading...' : step === 3 ? 'Complete Signup' : 'Next'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 font-medium">
                Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}