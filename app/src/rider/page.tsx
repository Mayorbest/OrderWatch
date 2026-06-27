'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, QrCode, ArrowRightLeft, CreditCard, 
  Wallet, X, CheckCircle2, AlertTriangle, 
  QrCode as QrIcon, Activity, ArrowDownRight, ArrowUpRight, Radar
} from 'lucide-react';

// ==========================================
// 🛡️ LAYER 1: STRICT TYPE DEFINITIONS
// ==========================================
interface OrderWatchProfile {
  id: string;
  fullName: string;
  role: 'rider';
  walletBalance: number;
  virtualAccountNumber: string;
  virtualBankName: string;
  avatarUrl: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface TransactionItem {
  txId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  timestamp: string;
}

interface ActiveDriverNode {
  id: string;
  fullName: string;
  vehiclePlate: string;
  activeRoute: string;
  currentFare: number;
  surgeMultiplier: string;
}

// ==========================================
// 🚀 LAYER 2: MAIN DASHBOARD COMPONENT
// ==========================================
export default function RiderDashboard() {
  const router = useRouter();

  // 1. Core System State
  const [userId, setUserId] = useState<string | null>(null); 
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  
  // 2. Data Streams
  const [profile, setProfile] = useState<OrderWatchProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [txHistory, setTxHistory] = useState<TransactionItem[]>([]);

  // 3. Radar State (Dynamic Drivers)
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriverNode[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<ActiveDriverNode | null>(null);

  // 4. Modal UI Controllers
  const [activeModal, setActiveModal] = useState<'none' | 'notifications' | 'p2p' | 'transit' | 'topup'>('none');

  // 5. Transaction Sub-States
  const [transitStep, setTransitStep] = useState<'scan' | 'select' | 'verify' | 'processing' | 'success' | 'failed'>('scan');
  const [transferStep, setTransferStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');
  const [targetFriendId, setTargetFriendId] = useState('');
  const [friendName, setFriendName] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  // ==========================================
  // 🔐 LAYER 3: AUTHENTICATION GUARD
  // ==========================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('ow_active_rider');
      if (!savedSession) {
        // ✅ SENIOR DEV FIX: Aggressively bounce unauthenticated traffic to login
        router.push('/src/login');
      } else {
        setUserId(savedSession);
      }
    }
  }, [router]);

  // ==========================================
  // 📡 LAYER 4: REAL-TIME TELEMETRY ENGINE
  // ==========================================
  const syncEcosystemTelemetry = useCallback(async () => {
    if (!userId) return;

    try {
      const resNtf = await fetch(`http://127.0.0.1:5000/api/v1/notifications/${userId}`, { cache: 'no-store' });
      const dataNtf = await resNtf.json();
      if (dataNtf.status === 'success') {
        setNotifications(dataNtf.notifications);
        setUnreadCount(dataNtf.unreadCount);
      }

      const resUser = await fetch(`http://127.0.0.1:5000/api/v1/users/verify/${userId}`, { cache: 'no-store' });
      const dataUser = await resUser.json();
      if (dataUser.status === 'success' && dataUser.profile) {
        setProfile({
          id: userId,
          fullName: dataUser.profile.fullName,
          role: 'rider',
          walletBalance: dataUser.profile.walletBalance, 
          virtualAccountNumber: dataUser.profile.virtualAccountNumber || "9958194021",
          virtualBankName: dataUser.profile.virtualBankName || "Wema Bank (Nomba)",
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dataUser.profile.fullName)}`
        });
      }

      const resTx = await fetch(`http://127.0.0.1:5000/api/v1/transactions/${userId}`, { cache: 'no-store' });
      const dataTx = await resTx.json();
      if (dataTx.status === 'success') {
        setTxHistory(dataTx.transactions);
      }
    } catch (err) {
      console.warn("Background sync paused: Node unreachable.");
    } finally {
      setIsHydrating(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    syncEcosystemTelemetry(); 
    const heartbeat = setInterval(syncEcosystemTelemetry, 3500); 
    return () => clearInterval(heartbeat);
  }, [userId, syncEcosystemTelemetry]);


  // ==========================================
  // 💸 LAYER 5: DYNAMIC TRANSACTION DISPATCHERS
  // ==========================================
  
  // 🚀 RADAR: FETCH LIVE DRIVERS
  const fetchActiveFleetRadar = async () => {
    setTransitStep('processing');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/drivers/active', { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        setActiveDrivers(data.drivers);
        setTransitStep('select');
      } else {
        setTransitStep('failed');
      }
    } catch (err) {
      setTransitStep('failed');
    }
  };

  // 🚀 PAYMENT: DYNAMIC DRIVER TARGETING
  const handleTransitPayment = async () => {
    if (!selectedDriver) return;
    setTransitStep('processing');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/payments/p2p-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ SENIOR DEV FIX: No hardcoded targets. Strict dynamic JSON payload.
        body: JSON.stringify({ 
          senderId: userId, 
          receiverId: selectedDriver.id, 
          amount: selectedDriver.currentFare 
        })
      });
      if (res.ok) {
        setTransitStep('success');
        syncEcosystemTelemetry(); 
      } else {
        setTransitStep('failed');
      }
    } catch {
      setTransitStep('failed');
    }
  };

  const handleP2PLookup = async () => {
    setTransferStep('processing');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/v1/users/verify/${targetFriendId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        setFriendName(data.fullName);
        setTransferStep('confirm');
      } else {
        alert("Target signature mismatch. User not found.");
        setTransferStep('input');
      }
    } catch {
      setTransferStep('input');
    }
  };

  const handleP2PExecution = async () => {
    setTransferStep('processing');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/payments/p2p-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, receiverId: targetFriendId, amount: Number(transferAmount) })
      });
      if (res.ok) {
        setTransferStep('success');
        syncEcosystemTelemetry(); 
      } else {
        setTransferStep('confirm');
      }
    } catch {
      setTransferStep('confirm');
    }
  };

  const executeSimulatedTopUp = async () => {
    if (!topUpAmount) return;
    setIsToppingUp(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/payments/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: Number(topUpAmount) })
      });
      if (res.ok) {
        syncEcosystemTelemetry(); // Pulls the new balance and the new history row instantly!
        resetModals();
      }
    } catch (err) {
      console.error("Simulation failed");
    } finally {
      setIsToppingUp(false);
      setTopUpAmount('');
    }
  };

  const resetModals = () => {
    setActiveModal('none');
    setTransitStep('scan');
    setTransferStep('input');
    setTargetFriendId('');
    setTransferAmount('');
    setSelectedDriver(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('ow_active_rider');
    router.push('/src/login');
  };

  // ==========================================
  // 🖥️ LAYER 6: RENDER ENGINE
  // ==========================================
  
  if (isHydrating || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center font-mono text-xs text-gray-500 space-y-3">
        <Activity className="w-5 h-5 text-green-500 animate-pulse" />
        <span>Authenticating OrderWatch Handshake...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans pb-12 selection:bg-green-500/30">
      
      {/* --- HEADER --- */}
      <header className="max-w-md mx-auto px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-gray-800 bg-gray-900 shadow-lg" />
          <div>
            <h2 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Rider Terminal</h2>
            <h1 className="text-md font-black tracking-tight text-gray-100">{profile.fullName}</h1>
            {/* 👇 SENIOR DEV FIX: Clickable, copyable ID badge for P2P transfers */}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(profile.id);
                alert(`Copied ID: ${profile.id}`);
              }}
              className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[9px] font-mono text-blue-400 hover:bg-blue-500/20 transition active:scale-95"
            >
              ID: {profile.id} <span>📋</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveModal('notifications')} className="relative p-2.5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition">
            <Bell size={18} className="text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/40">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* --- BALANCE CARD --- */}
      <section className="max-w-md mx-auto px-4 mt-6">
        <div className="bg-gradient-to-br from-green-600 to-emerald-900 rounded-3xl p-6 shadow-2xl shadow-green-900/20 space-y-6">
          <div className="flex items-center justify-between text-green-100/80 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2"><Wallet size={14} /> Available Assets</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            ₦{profile.walletBalance.toLocaleString()}
          </h1>
          <div className="bg-black/20 border border-white/10 p-3.5 rounded-2xl text-[11px] font-mono flex items-center justify-between backdrop-blur-sm">
            <div>
              <p className="opacity-60 text-[9px] uppercase tracking-wider font-bold">Nomba Inbound Route</p>
              <p className="font-black text-white mt-0.5 text-sm tracking-widest">{profile.virtualAccountNumber}</p>
            </div>
            <span className="opacity-90 font-bold text-right">{profile.virtualBankName}</span>
          </div>
        </div>
      </section>

      {/* --- ACTION GRID --- */}
      <section className="max-w-md mx-auto px-4 mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => setActiveModal('transit')} className="bg-gradient-to-r from-blue-600 to-indigo-700 border border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 font-black col-span-2 transition active:scale-95 shadow-lg shadow-blue-500/10">
          <QrCode size={24} className="text-white" /> 
          <span className="text-sm tracking-wide text-white">Pay Transit Fare (Radar)</span>
        </button>
        <button onClick={() => setActiveModal('topup')} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition active:scale-95 hover:bg-gray-800">
          <CreditCard className="text-green-400" size={22} /> 
          <span className="text-xs font-bold text-gray-300">Bank TopUp</span>
        </button>
        <button onClick={() => setActiveModal('p2p')} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition active:scale-95 hover:bg-gray-800">
          <ArrowRightLeft className="text-blue-400" size={22} /> 
          <span className="text-xs font-bold text-gray-300">Send Friend</span>
        </button>
      </section>

      {/* --- RECENT TRANSACTIONS LEDGER --- */}
      <section className="max-w-md mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black font-mono uppercase text-gray-500 tracking-wider">Recent Activity</h3>
        </div>
        
        <div className="space-y-3">
          {txHistory.length > 0 ? (
            txHistory.map((tx) => {
              const isDebit = tx.senderId === userId;
              return (
                <div key={tx.txId} className="bg-gray-900 border border-gray-800/60 p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDebit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {isDebit ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-200">{isDebit ? tx.receiverName : tx.senderName}</p>
                      <p className="text-[10px] font-mono text-gray-500 mt-0.5">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black font-mono ${isDebit ? 'text-white' : 'text-green-400'}`}>
                    {isDebit ? '-' : '+'}₦{tx.amount.toLocaleString()}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-6 text-center text-gray-500 text-xs font-mono">
              No financial routing detected on this token.
            </div>
          )}
        </div>

        <div className="pt-8 text-center">
            <button onClick={handleLogout} className="text-[10px] text-gray-600 font-mono font-bold uppercase tracking-widest hover:text-red-400 transition">Disconnect Node</button>
        </div>
      </section>

      {/* ========================================== */}
      {/* 🛸 MODAL OVERLAYS */}
      {/* ========================================== */}

      {/* 1. TRANSIT RADAR MODAL */}
      {activeModal === 'transit' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-t-3xl border-t border-gray-800 p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-xs font-black font-mono uppercase text-blue-400">Transit Gateway Radar</h2>
              <button onClick={resetModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={14}/></button>
            </div>
            
            {transitStep === 'scan' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center bg-gray-950/50 space-y-3">
                  <QrIcon size={42} className="mx-auto text-gray-600 animate-pulse" />
                  <p className="text-xs text-gray-400">Align camera with vehicle manifest OR fetch nearby drivers.</p>
                </div>
                <button onClick={fetchActiveFleetRadar} className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl text-xs font-bold font-mono transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                    <Radar size={16} /> Sweep Radar For Active Vehicles
                </button>
              </div>
            )}

            {transitStep === 'select' && (
              <div className="space-y-3 animate-in slide-in-from-right duration-200">
                  <p className="text-[10px] text-gray-500 font-mono uppercase font-bold mb-2 flex items-center gap-1.5"><Radar size={12} className="text-blue-400 animate-spin-slow"/> Nearby Operating Nodes</p>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {activeDrivers.length > 0 ? activeDrivers.map(d => (
                        <div key={d.id} onClick={() => { setSelectedDriver(d); setTransitStep('verify'); }} className="bg-gray-950 p-4 border border-gray-800 rounded-xl cursor-pointer hover:border-blue-500 transition shadow-inner">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-black text-white">{d.fullName}</h4>
                                    <p className="text-[10px] font-mono text-gray-400 mt-1">Route: {d.activeRoute}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-md font-black text-green-400">₦{d.currentFare}</p>
                                    <p className="text-[8px] text-red-400 mt-0.5 border border-red-500/20 bg-red-500/10 px-1 py-0.5 rounded uppercase">{d.surgeMultiplier}x AI Surge</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                      <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500 font-mono">No active fleet operators detected in domain.</p>
                      </div>
                    )}
                  </div>
              </div>
            )}

            {transitStep === 'verify' && selectedDriver && (
              <div className="space-y-4 animate-in slide-in-from-right duration-200">
                <div className="bg-gray-950 p-4 border border-gray-800 text-center rounded-xl font-mono text-xs shadow-inner">
                  <p className="text-gray-500 uppercase text-[9px] font-bold">Vehicle Identity Locked</p>
                  <p className="font-black mt-1 text-white text-sm">{selectedDriver.fullName}</p>
                  <span className="text-blue-400 font-bold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/20 inline-block mt-1.5">{selectedDriver.vehiclePlate}</span>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 text-center font-mono">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Dynamic Route Fare</p>
                  <h1 className="text-4xl font-black text-green-400 mt-1">₦{selectedDriver.currentFare}</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTransitStep('select')} className="bg-gray-950 border border-gray-800 hover:bg-gray-800 py-4 px-4 rounded-xl text-xs font-bold transition">Back</button>
                  <button onClick={handleTransitPayment} className="flex-1 bg-green-500 hover:bg-green-600 py-4 rounded-xl text-xs font-bold tracking-wide transition shadow-lg shadow-green-500/20">Authorize Ledger Settlement</button>
                </div>
              </div>
            )}

            {transitStep === 'processing' && (
               <div className="text-center py-10 font-mono text-xs text-gray-400 space-y-3">
                 <div className="w-6 h-6 border-2 border-t-blue-500 border-gray-800 rounded-full animate-spin mx-auto"/>
                 <p>Processing cryptographic handshakes...</p>
               </div>
            )}

            {transitStep === 'success' && (
              <div className="text-center py-8 space-y-4 animate-in zoom-in duration-200">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
                <div>
                  <h3 className="text-lg font-black text-white">Payment Cleared</h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Gate unlocked successfully.</p>
                </div>
                <button onClick={resetModals} className="w-full bg-gray-800 hover:bg-gray-700 py-3.5 rounded-xl text-xs font-bold transition">Dismiss Dashboard</button>
              </div>
            )}

            {transitStep === 'failed' && (
              <div className="text-center py-6 space-y-3">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                <h3 className="text-md font-black text-red-400">Settlement Rejected</h3>
                <p className="text-xs text-gray-500">Check balance data loops or network sync.</p>
                <button onClick={() => setTransitStep('select')} className="w-full bg-gray-950 border border-gray-800 py-2.5 rounded-xl text-xs font-bold mt-2">Retry Frame</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. P2P MODAL */}
      {activeModal === 'p2p' && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
         <div className="bg-gray-900 w-full max-w-md rounded-t-3xl border-t border-gray-800 p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
           <div className="flex items-center justify-between border-b border-gray-800 pb-3">
             <h2 className="text-xs font-black font-mono uppercase text-blue-400">P2P Network Transfer</h2>
             <button onClick={resetModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={14}/></button>
           </div>
           
           {transferStep === 'input' && (
             <div className="space-y-4">
               <div>
                 <label className="block text-[10px] font-bold font-mono uppercase text-gray-500 mb-2">Recipient Profile ID</label>
                 <input type="text" value={targetFriendId} onChange={(e) => setTargetFriendId(e.target.value)} placeholder="ow_rider_XXXXXX" className="w-full p-3.5 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xs uppercase text-white outline-none focus:border-blue-500 transition" />
               </div>
               <button onClick={handleP2PLookup} disabled={!targetFriendId} className="w-full bg-blue-500 hover:bg-blue-600 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40 font-mono transition">Verify Identity</button>
             </div>
           )}

           {transferStep === 'confirm' && (
             <div className="space-y-4 animate-in slide-in-from-right duration-200">
               <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center font-mono text-xs">
                 <p className="text-blue-400 font-bold uppercase text-[9px] tracking-wider">Beneficiary Confirmed</p>
                 <p className="font-black text-white text-lg mt-1">{friendName}</p>
               </div>
               <div>
                 <label className="block text-[10px] font-bold font-mono uppercase text-gray-500 mb-2">Amount to Send (₦)</label>
                 <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0" className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xl font-black text-center text-white outline-none focus:border-green-500 transition" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setTransferStep('input')} className="bg-gray-950 border border-gray-800 hover:bg-gray-800 py-3.5 rounded-xl text-xs font-bold font-mono transition">Back</button>
                 <button onClick={handleP2PExecution} disabled={!transferAmount} className="bg-green-500 hover:bg-green-600 py-3.5 rounded-xl text-xs font-bold font-mono disabled:opacity-40 transition">Send Funds</button>
               </div>
             </div>
           )}

            {transferStep === 'processing' && (
               <div className="text-center py-10 font-mono text-xs text-gray-400 space-y-3">
                 <div className="w-6 h-6 border-2 border-t-blue-500 border-gray-800 rounded-full animate-spin mx-auto"/>
                 <p>Dispatching ledger update...</p>
               </div>
            )}

           {transferStep === 'success' && (
             <div className="text-center py-8 space-y-4 animate-in zoom-in duration-200">
               <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
               <div>
                 <h3 className="text-lg font-black text-white">Transfer Successful</h3>
                 <p className="text-xs text-gray-400 mt-1 font-mono">Funds routed to {friendName}.</p>
               </div>
               <button onClick={resetModals} className="w-full bg-gray-800 hover:bg-gray-700 py-3.5 rounded-xl text-xs font-bold transition">Acknowledge</button>
             </div>
           )}
         </div>
       </div>
      )}

      {/* 3. TOP-UP MODAL (WITH SIMULATED LEDGER PUSH) */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-xs rounded-3xl p-6 space-y-5 animate-in scale-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 font-mono">Funding Account</h3>
              <button onClick={resetModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={12}/></button>
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 shadow-inner">
                <p className="text-gray-500 uppercase text-[9px] font-bold mb-0.5">Account Number</p>
                <p className="font-black text-white tracking-widest text-lg">{profile.virtualAccountNumber}</p>
                <p className="font-bold text-gray-400 mt-1">{profile.virtualBankName}</p>
              </div>

              {/* DEMO SIMULATION INPUT */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold font-mono uppercase text-gray-500 mb-2">Simulate Bank Deposit (₦)</label>
                <input 
                  type="number" 
                  value={topUpAmount} 
                  onChange={(e) => setTopUpAmount(e.target.value)} 
                  placeholder="e.g. 5000" 
                  className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xl font-black text-center text-white outline-none focus:border-green-500 transition" 
                />
              </div>
            </div>

            <button 
              onClick={executeSimulatedTopUp} 
              disabled={isToppingUp || !topUpAmount}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl text-xs font-bold transition disabled:opacity-50 font-mono"
            >
              {isToppingUp ? 'Processing Push...' : 'Simulate Deposit Transfer'}
            </button>
          </div>
        </div>
      )}

      {/* 4. NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-t-3xl border-t border-gray-800 p-6 space-y-4 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
              <h2 className="text-xs font-black font-mono uppercase tracking-widest flex items-center gap-2 text-gray-200"><Bell size={14} className="text-blue-400"/> Activity Stream</h2>
              <button onClick={resetModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={14}/></button>
            </div>
            <div className="overflow-y-auto space-y-2.5 pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-100">{n.title}</span>
                    <span className="text-gray-500 font-mono text-[9px]">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-gray-500 font-mono text-xs py-8">No alerts generated yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}