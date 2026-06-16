'use client';

import React, { useState, useEffect } from 'react';
import { Bell, QrCode, ArrowDownRight, ArrowUpRight, Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  passenger: string;
  driver?: string;
  amount: number;
  date: string;
  status?: string;
}

export default function RiderDashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [riderName, setRiderName] = useState<string>("Loading...");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(1000);
  const [fundStatus, setFundStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const passengerId = 'Rider_Olamide_992';

  // NOTICE: ALL FETCHES NOW USE 127.0.0.1
 useEffect(() => {
    const fetchRiderData = async () => {
      try {
        // 1. Fetch Balance WITH Cache-Busting
        const res = await fetch(`http://127.0.0.1:5000/api/rider/${passengerId}`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          setRiderName(data.name);
        }

        // 2. Fetch Ledger WITH Cache-Busting
        const txRes = await fetch(`http://127.0.0.1:5000/api/transactions`, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (txRes.ok) setTransactions(await txRes.json());
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRiderData();
    const interval = setInterval(fetchRiderData, 2000);
    return () => clearInterval(interval);
  }, [passengerId]);

  const simulateScanPay = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/webhook/nomba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'success',
          amount: 500,
          passengerId: passengerId,
          driverId: 'Driver_Kunle_404',
          transactionRef: `QR_SCAN_${Math.floor(Math.random() * 10000)}`
        })
      });

      if (response.ok) setIsScannerOpen(false);
    } catch (error) {
      console.error("Webhook error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFundWallet = async () => {
    setFundStatus('processing'); 
    try {
      const response = await fetch('http://127.0.0.1:5000/api/rider/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId: passengerId, amount: fundAmount })
      });

      if (response.ok) {
        setFundStatus('success'); 
      } else {
        setFundStatus('error'); 
      }
    } catch (error) {
      setFundStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <header className="col-span-1 md:col-span-12 flex justify-between items-center mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hi, {riderName} 👋</h1>
            <p className="text-sm text-gray-500">Ready to ride?</p>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        </header>

        <section className="col-span-1 md:col-span-7">
          <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-500 ${balance !== null && balance < 0 ? 'bg-gradient-to-br from-red-600 to-red-900' : 'bg-gradient-to-br from-green-600 to-emerald-800'}`}>
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
              <QrCode className="w-48 h-48" />
            </div>
            <h2 className="text-sm font-medium text-white/80 mb-1">NombaTransit Balance</h2>
            <div className="text-4xl font-extrabold tracking-tight mb-6">
              {balance !== null ? `₦${balance.toLocaleString()}.00` : <Loader2 className="w-8 h-8 animate-spin" />}
            </div>
            <button onClick={() => setIsFundModalOpen(true)} className="w-full bg-white text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition shadow-sm flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" /> Fund Wallet
            </button>
          </div>
        </section>

        <section className="col-span-1 md:col-span-5">
          <button onClick={() => setIsScannerOpen(true)} className="w-full h-full min-h-[160px] bg-gray-900 rounded-2xl p-6 flex flex-col items-center justify-center text-white hover:bg-gray-800 transition shadow-lg border border-gray-700 group">
            <div className="p-4 bg-gray-800 rounded-full mb-3 group-hover:bg-green-500 transition-colors">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold">Scan to Pay Driver</h2>
          </button>
        </section>

        <section className="col-span-1 md:col-span-12 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {transactions.length === 0 ? (
               <p className="p-6 text-center text-gray-500 text-sm">No recent trips found.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.status === 'WALLET_FUNDED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.status === 'WALLET_FUNDED' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{tx.status === 'WALLET_FUNDED' ? 'Bank Top-Up' : 'Danfo Boarding'}</p>
                      <p className="text-xs text-gray-500">Ref: {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.status === 'WALLET_FUNDED' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.status === 'WALLET_FUNDED' ? '+' : '-'}₦{tx.amount}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {isFundModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in text-center">
            <div className="p-6">
              {fundStatus === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-16 h-16 text-green-500 mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-gray-900">Please wait...</h3>
                </div>
              )}
              {fundStatus === 'success' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-3xl font-black text-gray-900">Successful</h3>
                  <p className="text-gray-500 text-sm mt-2 mb-6">₦{fundAmount} added to your wallet.</p>
                  <button onClick={() => { setIsFundModalOpen(false); setFundStatus('idle'); }} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">
                    Close
                  </button>
                </div>
              )}
              {fundStatus === 'error' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Fail</h3>
                  <p className="text-gray-500 text-sm mt-2 mb-6">Server down at the moment. Try again later.</p>
                  <button onClick={() => { setIsFundModalOpen(false); setFundStatus('idle'); }} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">
                    Close
                  </button>
                </div>
              )}
              {fundStatus === 'idle' && (
                <>
                  <div className="border-b border-gray-100 pb-4 mb-4"><h2 className="font-bold text-xl text-gray-900">Fund Wallet</h2></div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[500, 1000, 2000, 5000].map(amt => (
                      <button key={amt} onClick={() => setFundAmount(amt)} className={`py-2 rounded-xl font-bold border-2 ${fundAmount === amt ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200'}`}>
                        ₦{amt}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleFundWallet} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 mb-3">
                    Pay ₦{fundAmount} via Nomba
                  </button>
                  <button onClick={() => setIsFundModalOpen(false)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <h2 className="font-bold text-xl text-gray-900 mb-4">Scan Driver's QR</h2>
            <button onClick={simulateScanPay} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 mb-3">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Simulate Successful Scan"}
            </button>
            <button onClick={() => setIsScannerOpen(false)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}