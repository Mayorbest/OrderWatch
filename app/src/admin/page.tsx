'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, Activity, Bus, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchGovData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/government/analytics`);
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error(error);
      }
    };
    fetchGovData();
    const interval = setInterval(fetchGovData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 border-b border-gray-300 dark:border-gray-800 pb-4">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Landmark className="text-green-600" /> NombaTransit Gov-Ops
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Lagos State Informal Transport Monitoring</p>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Tax Collected (5%)</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">
              {data ? `₦${data.analytics.totalTaxCollected.toLocaleString()}` : '...'}
            </h2>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Gross Transport Economy</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">
              {data ? `₦${data.analytics.totalGrossRevenue.toLocaleString()}` : '...'}
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Taps/Rides Today</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">
              {data ? data.analytics.totalRidesProcessed : '...'}
            </h2>
          </div>
        </div>

        {/* LIVE LEDGER */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500 animate-pulse" /> Live Audit Trail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs uppercase font-bold">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Driver / Plate</th>
                  <th className="p-3">Gross Fare</th>
                  <th className="p-3 text-green-600">Tax Siphoned</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800 dark:text-gray-200">
                {data && data.recentLedger.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3 font-mono text-xs">{tx.id}</td>
                    <td className="p-3">{tx.passenger}</td>
                    <td className="p-3">{tx.driver} ({tx.vehicle})</td>
                    <td className="p-3 font-bold">₦{tx.amount}</td>
                    <td className="p-3 font-bold text-green-600">+₦{tx.taxCollected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}