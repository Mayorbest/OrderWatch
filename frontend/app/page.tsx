import Link from 'next/link';
import { ArrowRight, Bus, ShieldCheck, Activity, CreditCard } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="w-full bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bus className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">OrderWatch</span>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-500">
          <Link href="#features" className="hover:text-indigo-600 transition">Features</Link>
          <Link href="#impact" className="hover:text-indigo-600 transition">SDG Impact</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>Live at Nomba x DevCareer Hackathon</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-6 max-w-4xl">
          Digitizing the Veins of <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            African Transit.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl">
          An AI-powered, open-loop IoT payment ecosystem that eliminates cash friction, optimizes routing, and automates state tax collection for the informal transport sector.
        </p>

        {/* Action Portals for Judges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-4">
          <Link href="src/register" className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer">
            <CreditCard className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900">Rider Portal</h3>
            <p className="text-sm text-gray-500 mt-2 text-center">Fund your Nomba transit wallet and view tap history.</p>
          </Link>
          
          <Link href="src/driver" className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all cursor-pointer">
            <Activity className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900">Driver Portal</h3>
            <p className="text-sm text-gray-500 mt-2 text-center">Track live revenue and view AI surge multiplier zones.</p>
          </Link>
          
          <Link href="src/admin" className="group flex flex-col items-center p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-black hover:shadow-xl transition-all cursor-pointer">
            <ShieldCheck className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white">Gov Audit Terminal</h3>
            <p className="text-sm text-gray-400 mt-2 text-center">Live hardware sync for automated tax revenue tracking.</p>
          </Link>
        </div>
      </main>

      {/* Feature Highlight */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Powered by cutting-edge infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <CreditCard className="text-gray-700" />
              </div>
              <h4 className="font-bold text-gray-900">Nomba API Bridge</h4>
              <p className="text-sm text-gray-500 mt-2">Instant virtual account provisioning and webhook processing for frictionless top-ups.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <ShieldCheck className="text-gray-700" />
              </div>
              <h4 className="font-bold text-gray-900">Atomic Tax Routing</h4>
              <p className="text-sm text-gray-500 mt-2">Strict backend logic that mathematically isolates personal funds from automated 5% state tax deductions.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Activity className="text-gray-700" />
              </div>
              <h4 className="font-bold text-gray-900">IoT Edge Processing</h4>
              <p className="text-sm text-gray-500 mt-2">Custom ESP32 microcontrollers with hardware debouncing to prevent accidental double-charges.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}