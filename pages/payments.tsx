// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import Head from 'next/head';

// import Layout from '../components/Layout';
// import Card from '../components/Card';
// import Button from '../components/Button';

// import { storage } from '../utils/storage';
// import type { User, Payment } from '../utils/types';

// import { format } from 'date-fns';
// import { DollarSign, TrendingUp, Download } from 'lucide-react';

// export default function Payments() {
//   const router = useRouter();

//   const [user, setUser] = useState<User | null>(null);
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [withdrawAmount, setWithdrawAmount] = useState('');
//   const [showWithdraw, setShowWithdraw] = useState(false);

//   /* ----------------------------------------
//    * LOAD USER + PAYMENTS
//    * --------------------------------------*/
//   useEffect(() => {
//     const currentUser = storage.getCurrentUser();

//     if (!currentUser || currentUser.role !== 'worker') {
//       router.push('/login');
//       return;
//     }

//     setUser(currentUser);
//     loadPayments(currentUser.id);
//   }, [router]);

//   const loadPayments = async (userId: string) => {
//     const list = await storage.getPaymentsByUser(userId);
//     setPayments(list);
//   };

//   /* ----------------------------------------
//    * HANDLE WITHDRAWAL
//    * --------------------------------------*/
//   const handleWithdraw = async () => {
//     if (!user) return;

//     const amount = parseFloat(withdrawAmount);

//     if (isNaN(amount) || amount <= 0) {
//       alert('Enter a valid amount');
//       return;
//     }

//     if (amount > user.balance) {
//       alert('Insufficient balance');
//       return;
//     }

//     if (!user.payoutAccount?.verified) {
//       alert('Please verify your payout account first');
//       return;
//     }

//     // Create a withdrawal record
//     const newPayment: Omit<Payment, "id"> = {
//       userId: user.id,
//       amount,
//       type: 'withdrawal',
//       status: 'pending',
//       createdAt: new Date().toISOString(),
//     };

//     await storage.createPayment(newPayment);

//     // Deduct from user balance
//     await storage.updateUser(user.id, {
//       balance: user.balance - amount,
//     });

//     // Update local storage session
//     storage.setCurrentUser({
//       ...user,
//       balance: user.balance - amount,
//     });

//     setUser({
//       ...user,
//       balance: user.balance - amount,
//     });

//     setWithdrawAmount('');
//     setShowWithdraw(false);

//     await loadPayments(user.id);
//     alert('Withdrawal request submitted!');
//   };

//   if (!user) return null;

//   const totalEarnings = payments
//     .filter(p => p.type === 'task-payment' && p.status === 'completed')
//     .reduce((sum, p) => sum + p.amount, 0);

//   const totalWithdrawn = payments
//     .filter(p => p.type === 'withdrawal' && p.status === 'completed')
//     .reduce((sum, p) => sum + p.amount, 0);

//   return (
//     <Layout>
//       <Head>
//         <title>Payments - Cehpoint</title>
//       </Head>

//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <h1 className="text-3xl font-bold text-gray-900">Payments & Earnings</h1>
//           <Button onClick={() => setShowWithdraw(!showWithdraw)}>
//             <Download size={18} />
//             <span>Withdraw</span>
//           </Button>
//         </div>

//         <div className="grid md:grid-cols-3 gap-6">
//           <Card className="text-center">
//             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
//               <DollarSign size={24} />
//             </div>
//             <p className="text-3xl font-bold text-gray-900">${user.balance.toFixed(2)}</p>
//             <p className="text-sm text-gray-600 mt-1">Available Balance</p>
//           </Card>

//           <Card className="text-center">
//             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
//               <TrendingUp size={24} />
//             </div>
//             <p className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
//             <p className="text-sm text-gray-600 mt-1">Total Earned</p>
//           </Card>

//           <Card className="text-center">
//             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
//               <Download size={24} />
//             </div>
//             <p className="text-3xl font-bold text-gray-900">${totalWithdrawn.toFixed(2)}</p>
//             <p className="text-sm text-gray-600 mt-1">Total Withdrawn</p>
//           </Card>
//         </div>

//         {showWithdraw && (
//           <Card className="bg-indigo-50">
//             <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Amount ($)</label>
//                 <input
//                   type="number"
//                   value={withdrawAmount}
//                   onChange={(e) => setWithdrawAmount(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
//                   placeholder="Enter amount"
//                   max={user.balance}
//                 />
//                 <p className="text-sm text-gray-600 mt-1">
//                   Available: ${user.balance.toFixed(2)}
//                 </p>
//               </div>
//               {!user.payoutAccount?.verified && (
//                 <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
//                   <p className="text-sm text-yellow-800">
//                     Please verify your payout account to withdraw funds
//                   </p>
//                 </div>
//               )}
//               <div className="flex space-x-3">
//                 <Button onClick={handleWithdraw} disabled={!user.payoutAccount?.verified}>
//                   Confirm Withdrawal
//                 </Button>
//                 <Button variant="outline" onClick={() => setShowWithdraw(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         )}

//         <Card>
//           <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
//           {payments.length === 0 ? (
//             <p className="text-center text-gray-500 py-8">No transactions yet</p>
//           ) : (
//             <div className="space-y-3">
//               {payments.map(payment => (
//                 <div
//                   key={payment.id}
//                   className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
//                 >
//                   <div>
//                     <p className="font-medium">
//                       {payment.type === 'task-payment' ? 'Task Payment' : 'Withdrawal'}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p
//                       className={`font-semibold ${
//                         payment.type === 'task-payment'
//                           ? 'text-green-600'
//                           : 'text-red-600'
//                       }`}
//                     >
//                       {payment.type === 'task-payment' ? '+' : '-'}$
//                       {payment.amount.toFixed(2)}
//                     </p>
//                     <span
//                       className={`text-xs px-2 py-1 rounded ${
//                         payment.status === 'completed'
//                           ? 'bg-green-100 text-green-700'
//                           : payment.status === 'pending'
//                           ? 'bg-yellow-100 text-yellow-700'
//                           : 'bg-red-100 text-red-700'
//                       }`}
//                     >
//                       {payment.status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Card>
//       </div>
//     </Layout>
//   );
// }





























import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

import { storage } from '../utils/storage';
import type { User, Payment } from '../utils/types';

import { format } from 'date-fns';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

export default function Payments() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ----------------------------------------
   * LOAD USER + PAYMENTS
   * --------------------------------------*/
  useEffect(() => {
    const currentUser = storage.getCurrentUser();

    if (!currentUser || currentUser.role !== 'worker') {
      router.replace('/login');
      return;
    }

    setUser(currentUser);
    loadPayments(currentUser.id);
  }, [router]);

  const loadPayments = async (userId: string) => {
    // Load payment history
    const list = await storage.getPaymentsByUser(userId);
    setPayments(list);

    // Load updated user balance from Firestore
    const updatedUser = await storage.getUserById(userId);
    if (updatedUser) {
      setUser(updatedUser);
      storage.setCurrentUser(updatedUser); // sync session
    }
  };


  /* ----------------------------------------
   * HANDLE WITHDRAWAL
   * --------------------------------------*/
  const handleWithdraw = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount');
      return;
    }

    if (amount > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setSubmitting(true);

    try {
      // Create withdrawal payment record
      const paymentPayload: Omit<Payment, 'id'> = {
        userId: user.id,
        amount,
        type: 'withdrawal',
        status: 'pending', // used as "pending admin / processing"
        createdAt: new Date().toISOString(),
      };

      await storage.createPayment(paymentPayload);

      // If payout account is verified → process like normal: deduct immediately
      if (user.payoutAccount?.verified) {
        const newBalance = user.balance - amount;

        await storage.updateUser(user.id, {
          balance: newBalance,
        });

        const updatedUser: User = {
          ...user,
          balance: newBalance,
        };

        storage.setCurrentUser(updatedUser);
        setUser(updatedUser);

        alert('Withdrawal request submitted!');
      } else {
        // Not verified → treat as admin approval required.
        // Admin will see this pending withdrawal and process it.
        alert('Withdrawal request sent to admin for approval.');
      }

      setWithdrawAmount('');
      setShowWithdraw(false);
      await loadPayments(user.id);
    } catch (err) {
      console.error('Withdrawal error:', err);
      alert('Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const totalEarnings = payments
    .filter((p) => p.type === 'task-payment' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalWithdrawn = payments
    .filter((p) => p.type === 'withdrawal' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Layout>
      <Head>
        <title>Payments - Cehpoint</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Payments &amp; Earnings
          </h1>
          <Button onClick={() => setShowWithdraw((s) => !s)}>
            <Download size={18} />
            <span>Withdraw</span>
          </Button>
        </div>

        {/* SUMMARY CARDS */}
        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${user?.balance?.toFixed(2) ?? "0.00"}
          </p>
          <p className="text-sm text-gray-600 mt-1">Available Balance</p>
        </Card>


        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${totalEarnings.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Earned</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Download size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${totalWithdrawn.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total Withdrawn</p>
        </Card>
      </div>

      {/* WITHDRAW SECTION */}
      {showWithdraw && (
        <Card className="bg-indigo-50">
          <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter amount"
                max={user.balance}
              />
              <p className="text-sm text-gray-600 mt-1">
                Available: ${user.balance.toFixed(2)}
              </p>
            </div>

            {!user.payoutAccount?.verified && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Your payout account is not verified. Withdrawal requests
                  will be sent to the admin for approval.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button onClick={handleWithdraw} disabled={submitting}>
                {submitting ? 'Processing…' : 'Confirm Withdrawal'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWithdraw(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TRANSACTION HISTORY */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {payments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => {
              const isWithdrawal = payment.type === 'withdrawal';
              const isTaskPayment = payment.type === 'task-payment';

              const statusLabel =
                isWithdrawal && payment.status === 'pending'
                  ? 'Pending admin/processing'
                  : payment.status;


              return (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {isTaskPayment ? 'Task Payment' : 'Withdrawal'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(
                        new Date(payment.createdAt),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${isTaskPayment
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}
                    >
                      {isTaskPayment ? '+' : '-'}$
                      {payment.amount.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${payment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout >
  );
}
