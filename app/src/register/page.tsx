'use client';

import React, { useState } from 'react';
import { User, CheckCircle2, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Role = 'rider' | 'driver';

export default function RegisterDashboard() {
    const router = useRouter();
    
    // Core Profile States
    const [role, setRole] = useState<Role>('rider');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Driver-Specific States
    const [licensePlate, setLicensePlate] = useState('');
    const [assignedDomain, setAssignedDomain] = useState('Lagos Mainland');

    // UI/UX States
    const [isLoading, setIsLoading] = useState(false);
    const [successProfile, setSuccessProfile] = useState<any>(null);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            fullName,
            phoneNumber,
            role,
            ...(role === 'driver' && { licensePlate, assignedDomain }),
        };

        try {
            const res = await fetch('https://orderwatch-cg01.onrender.com/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (res.ok && data.status === 'success') {
                // Securely commit the active session to the browser node
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`ow_active_${data.profile.role}`, data.profile.id);
                }
                setSuccessProfile(data.profile);
            } else {
                alert(data.message || 'Registration failed. Check server connection.');
            }
        } catch (err) {
            console.error('Auth network error:', err);
            alert('Critical failure: Could not connect to the backend node.');
        } finally {
            setIsLoading(false);
        }
    };

    const proceedToDashboard = () => {
        if (!successProfile) return;
        // Dynamically route the user to their specific workspace
        router.push(`/src/${successProfile.role}`);
    };

    // ==========================================
    // 🖥️ SUCCESS STATE OVERLAY
    // ==========================================
    if (successProfile) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-green-500/30">
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-12 h-12 text-green-400 animate-bounce" />
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Node Provisioned!</h2>
                        <p className="text-sm text-gray-400 mt-1 font-mono">{successProfile.id}</p>
                    </div>

                    {successProfile.role === 'rider' && (
                        <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800/80 text-left space-y-1 shadow-inner">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Assigned Virtual Account</p>
                            <p className="text-2xl font-black text-green-400 tracking-widest font-mono">{successProfile.virtualAccountNumber}</p>
                            <p className="text-xs text-gray-400 font-bold">{successProfile.virtualBankName}</p>
                        </div>
                    )}

                    <button 
                        onClick={proceedToDashboard}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                        Initialize Dashboard <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // 🖥️ REGISTRATION FORM
    // ==========================================
    return (
        <main className="min-h-screen bg-gray-950 text-white font-sans flex items-center justify-center p-4 md:p-8 selection:bg-blue-500/30">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                
                {/* Header */}
                <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                        <ShieldCheck className="text-blue-400" size={24} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-100">OrderWatch Network</h1>
                    <p className="text-xs text-gray-400 font-mono">Decentralized Transit Onboarding</p>
                </div>

                {/* Role Selector Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {(['rider', 'driver'] as Role[]).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition capitalize text-xs font-bold ${
                                role === r 
                                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' 
                                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                            }`}
                        >
                            {r === 'rider' ? <User size={20} /> : <Car size={20} />}
                            {r} Account
                        </button>
                    ))}
                </div>

                {/* Input Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5 font-mono">Full Name</label>
                        <input 
                            required 
                            type="text" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-gray-700" 
                            placeholder="e.g. Olamide Jegede" 
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5 font-mono">Phone Number</label>
                        <input 
                            required 
                            type="tel" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                            className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-gray-700" 
                            placeholder="e.g. 0810 000 0000" 
                        />
                    </div>

                    {/* Driver Specific Fields */}
                    {role === 'driver' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5 font-mono">Vehicle License Plate</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={licensePlate} 
                                    onChange={(e) => setLicensePlate(e.target.value)} 
                                    className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 text-white text-sm focus:border-blue-500 outline-none transition placeholder:text-gray-700" 
                                    placeholder="e.g. KJA-789-AA" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5 font-mono">Assigned Route Domain</label>
                                <select 
                                    value={assignedDomain} 
                                    onChange={(e) => setAssignedDomain(e.target.value)} 
                                    className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 text-white text-sm focus:border-blue-500 outline-none transition appearance-none"
                                >
                                    <option value="Lagos Mainland">Lagos Mainland Transport</option>
                                    <option value="Ikeja Zone">Ikeja Transit Zone</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
                        >
                            {isLoading ? 'Provisioning Infrastructure...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>

                {/* Login Redirect */}
                <div className="pt-2 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-500 font-mono">
                        Already operating a node?{' '}
                        <button onClick={() => router.push('/src/login')} className="text-blue-400 font-bold hover:text-blue-300 transition underline decoration-blue-500/30 underline-offset-2">
                            Log In Here
                        </button>
                    </p>
                </div>

            </div>
        </main>
    );
}