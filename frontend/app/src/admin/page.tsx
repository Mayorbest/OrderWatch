'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Landmark, Scale, Bus, History, Layers, Activity, User } from 'lucide-react';

// ==========================================
// 🛡️ LAYER 1: STRICT TYPE DEFINITIONS (FIXED)
// ==========================================
interface FleetOperator {
  id: string;
  name: string;
  plate: string;
  activeRoute: string;
  taxPaid: number;
}

interface AuditTransaction {
  txId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  taxDeducted: number;
  timestamp: string;
}

interface EcosystemMetrics {
  riders: number;
  drivers: number;
  total: number;
}

interface GovernmentAnalytics {
  grossRevenue: number;
  taxCollected: number;
  ecosystem: EcosystemMetrics;
  operatorFleet: FleetOperator[];
  ledgerLogs: AuditTransaction[];
}

// ==========================================
// 🚀 LAYER 2: COMMAND CENTER COMPONENT
// ==========================================
export default function GovernmentCommandCenter() {
  const [data, setData] = useState<GovernmentAnalytics | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(true);

  // 📡 RESOLVED FETCH FUNCTION
  const fetchLiveStateAnalytics = useCallback(async () => {
    try {
      const res = await fetch('https://orderwatch-cg01.onrender.com/api/v1/admin/analytics', { cache: 'no-store' });
      if (!res.ok) throw new Error("Network latency anomaly detected.");
      
      const responsePayload = await res.json();
      
      if (responsePayload.status === 'success') {
        setData(responsePayload.analytics);
      }
    } catch (err) {
      console.warn("[SYS_WARN] Telemetry pipe drop: Server unreachable.", err);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveStateAnalytics();
    const coreHeartbeat = setInterval(fetchLiveStateAnalytics, 3500); 
    return () => clearInterval(coreHeartbeat);
  }, [fetchLiveStateAnalytics]);

  // ==========================================
  // 🖥️ LAYER 3: RENDER ENGINE
  // ==========================================
  if (isUpdating && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center font-mono text-xs text-gray-500 space-y-3">
        <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
        <span>[SYS_AUTH] Initializing Secure Institutional Decorum Pipeline...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans pb-12 selection:bg-blue-500/30">
      
      {/* --- HEADER --- */}
      <header className="border-b border-gray-900 bg-gray-900/30 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/5">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black font-mono uppercase tracking-tight text-gray-100">OrderWatch Command Console</h1>
              <p className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-widest mt-0.5">State Transport Regulatory Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">Node Active</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        
        {/* --- DYNAMIC ECOSYSTEM METRICS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
            <Landmark className="absolute -right-4 -bottom-4 text-gray-800 opacity-20" size={80} />
            <p className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">Gross Throughput</p>
            <h2 className="text-2xl font-black text-white font-mono mt-1">₦{(data?.grossRevenue || 0).toLocaleString()}</h2>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-center border-l-2 border-l-green-500 relative overflow-hidden">
             <Scale className="absolute -right-4 -bottom-4 text-green-900 opacity-10" size={80} />
            <p className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">Platform Tax (5%)</p>
            <h2 className="text-2xl font-black text-green-400 font-mono mt-1">₦{(data?.taxCollected || 0).toLocaleString()}</h2>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
            <User className="absolute -right-4 -bottom-4 text-blue-900 opacity-10" size={80} />
            <p className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">Active Riders</p>
            <h2 className="text-2xl font-black text-blue-400 font-mono mt-1">{data?.ecosystem?.riders || 0} Nodes</h2>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
            <Bus className="absolute -right-4 -bottom-4 text-purple-900 opacity-10" size={80} />
            <p className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">Fleet Operators</p>
            <h2 className="text-2xl font-black text-purple-400 font-mono mt-1">{data?.ecosystem?.drivers || 0} Active</h2>
          </div>
        </section>

        {/* --- SPLIT CORE FRAMES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* FLEET COMPLIANCE LOG */}
          <section className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              <Layers size={14} className="text-purple-400" /> Active Domain Fleet Logs
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {data?.operatorFleet && data.operatorFleet.length > 0 ? (
                data.operatorFleet.map((driver) => (
                  <div key={driver.id} className="bg-gray-950 border border-gray-800/60 p-3.5 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-black text-gray-200">{driver.name}</h4>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">{driver.id}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-400 text-[10px] font-mono rounded font-bold">{driver.plate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-gray-900">
                      <span className="text-gray-500 truncate max-w-[130px]">{driver.activeRoute !== 'None' ? `📍 ${driver.activeRoute}` : '⏸️ Idle Status'}</span>
                      <span className="text-green-400 font-bold">₦{driver.taxPaid.toFixed(0)} Paid</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center border border-dashed border-gray-800 rounded-xl text-gray-600 font-mono py-8 text-xs">No active vehicle nodes tracked.</div>
              )}
            </div>
          </section>

          {/* CRYPTOGRAPHIC AUDIT RAIL */}
          <section className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              <History size={14} className="text-blue-400" /> Cryptographic Fiscal Audit Trail
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              {data?.ledgerLogs && data.ledgerLogs.length > 0 ? (
                <table className="w-full text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="text-gray-500 border-b border-gray-800 uppercase text-[9px] font-bold tracking-wider">
                      <th className="pb-3 pt-1">Hash ID</th>
                      <th className="pb-3 pt-1">Rider</th>
                      <th className="pb-3 pt-1">Vehicle</th>
                      <th className="pb-3 pt-1">Gross</th>
                      <th className="pb-3 pt-1 text-right">Tax (5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40 text-gray-300">
                    {data.ledgerLogs.map((tx) => (
                      <tr key={tx.txId} className="hover:bg-gray-950/40 transition-colors">
                        <td className="py-3.5 text-blue-400 font-black">{tx.txId}</td>
                        <td className="py-3.5 max-w-[90px] truncate text-gray-400">{tx.senderName}</td>
                        <td className="py-3.5 max-w-[90px] truncate text-gray-200">{tx.receiverName}</td>
                        <td className="py-3.5 font-bold text-white">₦{tx.amount}</td>
                        <td className="py-3.5 text-right text-green-400 font-black">+₦{tx.taxDeducted.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center border border-dashed border-gray-800 rounded-xl text-gray-600 font-mono py-16 text-xs uppercase">
                  Awaiting streaming transit frame captures...
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}