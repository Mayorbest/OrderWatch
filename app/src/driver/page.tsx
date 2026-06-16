'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, MapPin, QrCode, Loader2, CheckCircle } from 'lucide-react';

const routeNames: Record<number, string> = {
  500: "Yaba - Iyana Ipaja",
  400: "Iyana Ipaja - Sango",
  900: "Yaba - Sango (Direct)"
};

export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [routePopup, setRoutePopup] = useState<string | null>(null); 

  const driverId = 'Driver_Kunle_404';

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        // UPGRADED: 127.0.0.1 + Cache Busting!
        const res = await fetch(`http://127.0.0.1:5000/api/driver/${driverId}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (res.ok) {
          setDriver(await res.json());
        }
      } catch (error) {
        // Silently catch the error so it doesn't crash the console if the backend restarts
        console.warn("Backend disconnected. Retrying...");
      }
    };
    
    fetchDriver();
    const interval = setInterval(fetchDriver, 2000); 
    return () => clearInterval(interval);
  }, []);

  const handleRouteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true);
    const newFare = parseInt(e.target.value);
    const oldFare = driver?.activeFare || 500;
    
    try {
      // UPGRADED: 127.0.0.1
      const response = await fetch('http://127.0.0.1:5000/api/driver/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, newFare })
      });

      if (response.ok) {
        setRoutePopup(`You've successfully changed your route from ${routeNames[oldFare]} to ${routeNames[newFare]}.`);
      } else {
        alert("Failed to update on server. Is the backend down?");
      }
    } catch (error) {
      console.error("Failed to update route", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <header className="col-span-1 md:col-span-12 flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Driver Console</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {driver ? `${driver.name} | ${driver.vehiclePlate}` : 'Loading...'}
            </p>
          </div>
        </header>

        <section className="col-span-1 md:col-span-8">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-400 font-medium flex items-center gap-2"><Wallet className="w-5 h-5"/> Today's Shift Revenue</h2>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">Live Sync</span>
            </div>
            <div className="text-5xl font-extrabold mb-2">
              {driver ? `₦${driver.totalEarnings.toLocaleString()}.00` : <Loader2 className="w-8 h-8 animate-spin" />}
            </div>
          </div>
        </section>

        <section className="col-span-1 md:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm relative">
            <h3 className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-2 flex items-center gap-1"><MapPin className="w-4 h-4"/> Active Route/Stage</h3>
            
            <select 
              onChange={handleRouteChange}
              value={driver?.activeFare || 500}
              disabled={isUpdating}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
            >
              <option value="500">Yaba - Iyana Ipaja (₦500)</option>
              <option value="400">Iyana Ipaja - Sango (₦400)</option>
              <option value="900">Yaba - Sango (Direct) (₦900)</option>
            </select>
            
            {isUpdating && <Loader2 className="absolute top-1/2 right-8 w-5 h-5 animate-spin text-green-500" />}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Current Fare Set:</h3>
              <p className="text-xl text-green-600 dark:text-green-400 font-black">
                 {driver ? `₦${driver.activeFare || 500}` : '...'}
              </p>
            </div>
            <QrCode className="w-10 h-10 text-gray-800 dark:text-gray-200" />
          </div>
        </section>
      </div>

      {routePopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl zoom-in duration-200">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">{routePopup}</p>
            <button 
              onClick={() => setRoutePopup(null)}
              className="w-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white font-bold py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}