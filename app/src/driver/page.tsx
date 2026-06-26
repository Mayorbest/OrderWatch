'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navigation, Car, Landmark, Bell, 
  RefreshCw, QrCode as QrIcon, Activity, 
  MapPin, CheckCircle2, ArrowDownRight, X, AlertTriangle 
} from 'lucide-react';

// ==========================================
// 🛡️ LAYER 1: STRICT TYPE DEFINITIONS
// ==========================================
interface OrderWatchDriverProfile {
  id: string;
  fullName: string;
  role: 'driver';
  walletBalance: number;
  vehiclePlate: string;
  domain: string;
  activeRoute: string;
  activeFare: number;
  allowedRoutes: string[];
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
  senderName: string;
  amount: number;
  timestamp: string;
}

// ==========================================
// 🚀 LAYER 2: MAIN DASHBOARD COMPONENT
// ==========================================
export default function DriverDashboard() {
  const [driverId, setDriverId] = useState<string>('');
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  
  const [profile, setProfile] = useState<OrderWatchDriverProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [txHistory, setTxHistory] = useState<TransactionItem[]>([]);

  // Modals & UI States
  const [activeModal, setActiveModal] = useState<'none' | 'notifications' | 'routeSelect' | 'withdraw'>('none');
  const [isUpdatingRoute, setIsUpdatingRoute] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  // ==========================================
  // 📡 LAYER 3: REAL-TIME TELEMETRY ENGINE
  // ==========================================
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const persistedId = localStorage.getItem('ow_active_driver');
      setDriverId(persistedId || 'ow_driver_554930');
    }
  }, []);

  const syncDriverTelemetry = useCallback(async () => {
    if (!driverId) return;

    try {
      const ntfResponse = await fetch(`http://127.0.0.1:5000/api/v1/notifications/${driverId}`, { cache: 'no-store' });
      const ntfData = await ntfResponse.json();
      if (ntfData.status === 'success') {
        setNotifications(ntfData.notifications);
        setUnreadCount(ntfData.unreadCount);
      }

      const userResponse = await fetch(`http://127.0.0.1:5000/api/v1/users/verify/${driverId}`, { cache: 'no-store' });
      const userData = await userResponse.json();
      if (userData.status === 'success' && userData.profile) {
        setProfile({
          id: driverId,
          fullName: userData.profile.fullName,
          role: 'driver',
          walletBalance: userData.profile.walletBalance,
          vehiclePlate: userData.profile.vehiclePlate || "LAG-451-IK",
          domain: userData.profile.domain || "Lagos Mainland",
          activeRoute: userData.profile.activeRoute || "None",
          activeFare: userData.profile.activeFare || 0,
          allowedRoutes: userData.profile.allowedRoutes || ["Yaba - Iyana Ipaja", "Yaba - Sango (Direct)"]
        });
      }

      const txResponse = await fetch(`http://127.0.0.1:5000/api/v1/transactions/${driverId}`, { cache: 'no-store' });
      const txData = await txResponse.json();
      if (txData.status === 'success') {
        setTxHistory(txData.transactions);
      }
    } catch (err) {
      console.warn("Driver synchronization failure. Node offline.");
    } finally {
      setIsHydrating(false);
    }
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;
    syncDriverTelemetry();
    const heartbeat = setInterval(syncDriverTelemetry, 3500);
    return () => clearInterval(heartbeat);
  }, [driverId, syncDriverTelemetry]);

  // ==========================================
  // 🧠 LAYER 4: DRIVER ACTION DISPATCHERS
  // ==========================================

  const handleRouteOptimization = async (route: string) => {
    if (!route || !driverId) return;
    setIsUpdatingRoute(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/driver/route-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, selectedRoute: route })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        syncDriverTelemetry();
        setTimeout(() => setActiveModal('none'), 600); // Close modal smoothly
      } else {
        alert(data.message || "Boundary guard exception occurred.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingRoute(false);
    }
  };

  const executeWithdrawal = () => {
    setWithdrawStep('processing');
    setTimeout(() => {
      setWithdrawStep('success');
      // In a real app, this hits a payout endpoint. For the demo, we show the success modal.
    }, 1500);
  };

  const closeModals = () => {
    setActiveModal('none');
    setWithdrawStep('confirm');
  };

  // ==========================================
  // 🖥️ LAYER 5: RENDER ENGINE
  // ==========================================

  if (isHydrating || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center font-mono text-xs text-gray-500 space-y-3">
        <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
        <span>Compiling Fleet Node Metrics...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans pb-12 selection:bg-blue-500/30">
      
      {/* --- HEADER --- */}
      <header className="max-w-md mx-auto px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center text-blue-400 font-black font-mono shadow-lg shadow-blue-500/10">
            DRV
          </div>
          <div>
            <h2 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Fleet Operator</h2>
            <h1 className="text-md font-black tracking-tight text-gray-100">{profile.fullName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-md text-[10px] font-mono text-gray-400 font-bold tracking-widest">{profile.vehiclePlate}</span>
          <button onClick={() => setActiveModal('notifications')} className="relative p-2 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition">
            <Bell size={16} className="text-gray-300" />
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">{unreadCount}</span>}
          </button>
        </div>
      </header>

      {/* --- REVENUE & QR DASHBOARD --- */}
      <section className="max-w-md mx-auto px-4 mt-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold font-mono uppercase tracking-wider">
            <Landmark size={14} className="text-green-400" /> Settlable Revenue
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">₦{profile.walletBalance.toLocaleString()}</h1>
            <p className="text-[9px] font-mono text-gray-500 mt-1 uppercase">Automated 5% State Tax Deducted</p>
          </div>
          <button onClick={() => setActiveModal('withdraw')} disabled={profile.walletBalance <= 0} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg shadow-green-500/20 font-mono tracking-wide">
            Withdraw to Bank
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center border border-gray-800 shadow-xl">
          <div className="w-full aspect-square bg-gray-50 rounded-xl p-1 flex items-center justify-center">
            <QrIcon size={75} className="text-gray-950" />
          </div>
          <span className="text-[8px] text-gray-900 font-black font-mono tracking-widest mt-2 uppercase">Scan to Pay</span>
        </div>
      </section>

      {/* --- AI NAVIGATION CONTROL --- */}
      <section className="max-w-md mx-auto px-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase text-gray-400 flex items-center gap-1.5">
              <Navigation size={14} className="text-blue-400" /> AI Pricing Engine
            </h3>
            <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">{profile.domain}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-950 border border-gray-800 p-4 rounded-2xl shadow-inner">
            <div>
              <p className="text-[9px] font-bold font-mono uppercase text-gray-500">Active Pipeline</p>
              <p className="text-xs font-bold text-gray-200 mt-1 truncate">{profile.activeRoute}</p>
            </div>
            <div className="text-right border-l border-gray-800 pl-3">
              <p className="text-[9px] font-bold font-mono uppercase text-gray-500">Calculated Fare</p>
              <p className="text-lg font-black text-green-400 mt-0.5">₦{profile.activeFare}</p>
            </div>
          </div>

          <button onClick={() => setActiveModal('routeSelect')} className="w-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 py-3.5 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2">
            <MapPin size={14} /> Update Active Route Matrix
          </button>
        </div>
      </section>

      {/* --- RECENT FARES LEDGER --- */}
      <section className="max-w-md mx-auto px-4 mt-8">
        <h3 className="text-xs font-black font-mono uppercase text-gray-500 tracking-wider mb-4">Boarding Logs</h3>
        <div className="space-y-3">
          {txHistory.length > 0 ? (
            txHistory.map((tx) => (
              <div key={tx.txId} className="bg-gray-900 border border-gray-800/60 p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <ArrowDownRight size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-200">{tx.senderName}</p>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-400 font-mono">+₦{tx.amount}</p>
                  <p className="text-[8px] text-gray-500 font-mono mt-0.5">Tax Split Executed</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-6 text-center text-gray-500 text-xs font-mono">
              No fares collected on this shift yet.
            </div>
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* 🛸 MODAL OVERLAYS */}
      {/* ========================================== */}

      {/* 1. ROUTE SELECTION MODAL */}
      {activeModal === 'routeSelect' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-t-3xl border-t border-gray-800 p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-xs font-black font-mono uppercase text-blue-400">AI Route Optimization</h2>
              <button onClick={closeModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={14}/></button>
            </div>
            
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Select operational path to recalculate surge metrics:</p>
            
            <div className="space-y-3">
              {profile.allowedRoutes.map((route) => (
                <button 
                  key={route}
                  onClick={() => handleRouteOptimization(route)}
                  disabled={isUpdatingRoute}
                  className="w-full bg-gray-950 border border-gray-800 hover:border-blue-500 p-4 rounded-xl text-left flex items-center justify-between group transition disabled:opacity-50"
                >
                  <span className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition">{route}</span>
                  {isUpdatingRoute ? <RefreshCw size={14} className="animate-spin text-gray-500" /> : <MapPin size={14} className="text-gray-600 group-hover:text-blue-400 transition" />}
                </button>
              ))}
              
              {/* Boundary enforcement showcase */}
              <button onClick={() => alert("Error: Route strictly outside registered LGA domain. Execution locked.")} className="w-full bg-gray-950 border border-red-500/20 p-4 rounded-xl text-left flex items-center justify-between opacity-60 hover:opacity-100 transition">
                <span className="text-sm font-bold text-red-400">Victoria Island - Ajah</span>
                <AlertTriangle size={14} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWAL MODAL */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-xs rounded-3xl p-6 space-y-5 animate-in scale-in duration-200">
            {withdrawStep === 'confirm' && (
              <>
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 font-mono">Ledger Settlement</h3>
                  <button onClick={closeModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={12}/></button>
                </div>
                <div className="text-center space-y-2 py-2">
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Available Payout</p>
                  <h1 className="text-3xl font-black text-white">₦{profile.walletBalance.toLocaleString()}</h1>
                </div>
                <button onClick={executeWithdrawal} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl text-xs font-mono transition shadow-lg shadow-green-500/20">
                  Process Payout to Bank
                </button>
              </>
            )}
            
            {withdrawStep === 'processing' && (
              <div className="text-center py-8 font-mono text-xs text-gray-400 space-y-4">
                <div className="w-6 h-6 border-2 border-t-green-500 border-gray-800 rounded-full animate-spin mx-auto"/>
                <p>Clearing transaction via Nomba protocol...</p>
              </div>
            )}

            {withdrawStep === 'success' && (
              <div className="text-center py-6 space-y-4 animate-in zoom-in duration-200">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
                <div>
                  <h3 className="text-lg font-black text-white">Settlement Complete</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">Funds routed to commercial bank node.</p>
                </div>
                <button onClick={closeModals} className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded-xl text-xs font-bold font-mono transition">Acknowledge</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-t-3xl border-t border-gray-800 p-6 space-y-4 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
              <h2 className="text-xs font-black font-mono uppercase tracking-widest flex items-center gap-2 text-gray-200"><Bell size={14} className="text-blue-400"/> Fleet Stream Log</h2>
              <button onClick={closeModals} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={14}/></button>
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