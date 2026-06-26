'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Car, ArrowRight } from 'lucide-react';

export default function LoginDashboard() {
    const router = useRouter();
    const [role, setRole] = useState<'rider' | 'driver'>('rider');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, role })
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                localStorage.setItem(`ow_active_${data.profile.role}`, data.profile.id);
                router.push(data.profile.role === 'rider' ? '/src' : `/src/${data.profile.role}`);
            } else {
                alert(data.message || 'Login failed.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Welcome Back</h1>
                    <p className="text-sm text-gray-400 mt-1">Authenticate into the OrderWatch Node</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {(['rider', 'driver'] as const).map((r) => (
                        <button key={r} onClick={() => setRole(r)} className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 capitalize text-xs font-bold transition ${role === r ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                            {r === 'rider' ? <User size={20} /> : <Car size={20} />} {r}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-500 uppercase mb-1.5">Phone Number</label>
                        <input required type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-4 bg-gray-950 rounded-xl border border-gray-800 text-white font-mono outline-none focus:border-blue-500" placeholder="0810..." />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50">
                        {isLoading ? 'Authenticating...' : 'Access Dashboard'} <ArrowRight size={16}/>
                    </button>
                </form>
                <p className="text-center text-xs text-gray-500">New node? <a href="/src/register" className="text-green-400 font-bold hover:underline">Register</a></p>
            </div>
        </main>
    );
}