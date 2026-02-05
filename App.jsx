import React, { useState, useMemo } from 'react';
import { 
  Layout, Factory as FactoryIcon, Settings2, Monitor, PlusCircle, ChevronLeft, 
  ChevronRight, Calendar, Database, Thermometer, Activity, CheckCircle2, 
  History as HistoryIcon, Layers, Box, Copy, AlertOctagon, AlertTriangle, CheckCircle, RefreshCw, X, RotateCcw, MapPin, ClipboardCheck, User as UserIcon, Clock
} from 'lucide-react';

// --- Constants (ดึงมาจากต้นฉบับของคุณ) ---
const FABRIC_STANDARDS = [
  { label: "100% Cotton", limit: 56 },
  { label: "90% Cotton 10% Elastane/Spandex", limit: 56 },
  { label: "70% Cotton 30% Polyamide", limit: 59 },
  { label: "80% Cotton 20% Polyester", limit: 59 },
  { label: "70% Cotton 30% Polyester", limit: 53 },
  { label: "60% Cotton 40% Polyester", limit: 45 },
  { label: "50% Cotton 50% Polyester", limit: 37 },
  { label: "50% Cotton 50% Polyacrylic", limit: 62 },
  { label: "100% Viscose/ Rayon/ Modal", limit: 59 },
  { label: "90% Viscose 10% Elastane/Spandex", limit: 59 },
  { label: "50% Viscose 50% Cotton", limit: 48 },
  { label: "80% Viscose 20% Polyamide", limit: 59 },
  { label: "50% Viscose 50% Polyester", limit: 57 },
  { label: "30% Viscose 70% Polyester", limit: 62 },
  { label: "100% Linen/ Flax", limit: 67 },
  { label: "60% Linen 40% Cotton", limit: 47 },
  { label: "100% Polyamide", limit: 67 },
  { label: "100% Polyacrylic", limit: 83 },
  { label: "100% Polyester", limit: 57 },
  { label: "100% Leather", limit: 22 },
  { label: "Packing paper, packaging carton boxes", limit: 10 }
];

const ROOM_LINE_DATA = {
  "A": ["PD-SA01", "PD-SA02", "PD-SA03", "PD-SA04", "PD-SA05"],
  "B": ["PD-SB01", "PD-SB02", "PD-SB03", "PD-SB04", "PD-SB05"],
  "H": ["PD-SH01", "PD-SH02", "PD-SH03", "PD-SH04", "PD-SH05"]
};

const FACTORIES = ["TTT", "TN", "TM2", "VAS"];
const DEPARTMENTS = ["Fabric Warehouse", "Heat Transfer", "Cutting Room", "Sewing Room", "Final Inspection"];

// --- Main App ---
const App = () => {
  const [view, setView] = useState('home');
  const [selectedFactory, setSelectedFactory] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [records, setRecords] = useState([
    { id: 1, factory: 'TTT', department: 'Fabric Warehouse', temperature: 28, humidity: 55, user: 'Admin', ampm: 'AM', type: 'Environment', date: '5/2/2569' }
  ]);

  const checkHumidityDanger = (h, dept) => parseFloat(h) > 65;

  const HomeView = () => (
    <div className="max-w-5xl mx-auto p-4 space-y-10 animate-in fade-in duration-700">
      <section className="bg-gradient-to-br from-[#3b4083] to-[#8f8cb8] rounded-[2.5rem] p-12 text-white shadow-2xl">
        <h1 className="text-5xl font-extrabold tracking-tighter">HygroTrack <br /><span className="text-[#dbf2f2]">V2.4.2 Mockup</span></h1>
        <p className="mt-4 text-lg opacity-90">ระบบจำลองการบันทึกค่าความชื้น (ข้อมูลจะไม่ถูกบันทึกลงฐานข้อมูลจริง)</p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><FactoryIcon size={20}/> Select Factory</h2>
          <div className="grid grid-cols-2 gap-3">
            {FACTORIES.map(f => (
              <button key={f} onClick={() => setSelectedFactory(f)} className={`p-6 rounded-3xl border-2 font-bold transition-all ${selectedFactory === f ? 'bg-[#3b4083] text-white' : 'bg-white border-[#F1EDFF] text-[#8f8cb8]'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Layout size={20}/> Select Department</h2>
          <div className="bg-white p-4 rounded-3xl border border-[#F1EDFF] max-h-60 overflow-y-auto">
            {DEPARTMENTS.map(d => (
              <button key={d} onClick={() => setSelectedDept(d)} className={`w-full text-left p-4 mb-2 rounded-xl font-medium ${selectedDept === d ? 'bg-[#3b4083] text-white' : 'bg-[#f9f8ff] text-[#8f8cb8]'}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button disabled={!selectedFactory || !selectedDept} onClick={() => setView('dashboard')} className="bg-[#3b4083] text-white px-20 py-5 rounded-full font-black text-xl disabled:opacity-20 shadow-2xl hover:scale-105 active:scale-95 transition-all">ENTER DASHBOARD</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f8ff] font-sans text-[#3b4083] pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F1EDFF] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3b4083] rounded-xl flex items-center justify-center text-white"><Thermometer size={22} /></div>
          <span className="font-black text-xl uppercase tracking-tighter">HygroTrack</span>
        </div>
        <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full uppercase tracking-widest border border-orange-200">Mockup Version</span>
      </nav>
      <main className="mt-8 px-4">
        {view === 'home' && <HomeView />}
        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <button onClick={() => setView('home')} className="flex items-center gap-2 font-black uppercase text-sm"><ChevronLeft size={20}/> Back</button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 bg-white rounded-3xl border text-center shadow-sm">
                <span className="text-[10px] uppercase font-black opacity-50 block mb-1">Total Records</span>
                <span className="text-3xl font-black">{records.length}</span>
              </div>
              <button onClick={() => setView('form')} className="p-6 bg-[#dbf2f2] rounded-3xl border-2 border-[#7ab6b5] flex flex-col items-center justify-center hover:scale-105 transition-all">
                <PlusCircle size={32} className="mb-1" />
                <span className="text-[10px] font-black uppercase">New Entry</span>
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-[#F1EDFF] shadow-sm overflow-hidden">
              <div className="bg-[#3b4083] p-6 text-white flex justify-between items-center"><h3 className="font-black uppercase">Recent Analysis</h3></div>
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-[#f9f8ff] border-b text-[10px] font-black text-[#8f8cb8] uppercase"><th className="px-8 py-4">Time</th><th className="px-8 py-4">Temp/Hum</th><th className="px-8 py-4">Operator</th><th className="px-8 py-4 text-center">Status</th></tr></thead>
                <tbody className="divide-y divide-[#F1EDFF]">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-8 py-6 font-black">{r.ampm}</td>
                      <td className="px-8 py-6 font-black text-lg">{r.temperature}°C / {r.humidity}%</td>
                      <td className="px-8 py-6 font-bold">{r.user}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${checkHumidityDanger(r.humidity) ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
                          {checkHumidityDanger(r.humidity) ? 'Take Action' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {view === 'form' && (
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-[#F1EDFF]">
            <h2 className="text-3xl font-black uppercase mb-8">New Entry</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.target);
                const newRec = {
                  id: Date.now(),
                  factory: selectedFactory,
                  department: selectedDept,
                  temperature: data.get('temp'),
                  humidity: data.get('hum'),
                  user: data.get('user'),
                  ampm: data.get('ampm'),
                  type: 'Environment'
                };
                setRecords([newRec, ...records]);
                setView('dashboard');
              }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-50">Temperature (°C)</label><input required name="temp" type="number" step="0.1" className="w-full p-5 bg-[#f9f8ff] rounded-2xl outline-none border-2 border-transparent focus:border-[#7ab6b5]" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-50">Humidity (%)</label><input required name="hum" type="number" step="0.1" className="w-full p-5 bg-[#f9f8ff] rounded-2xl outline-none border-2 border-transparent focus:border-[#7ab6b5]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-50">Time Slot</label><select name="ampm" className="w-full p-5 bg-[#f9f8ff] rounded-2xl outline-none"><option>AM</option><option>PM</option><option>OT</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-50">Operator</label><input required name="user" type="text" className="w-full p-5 bg-[#f9f8ff] rounded-2xl outline-none border-2 border-transparent focus:border-[#7ab6b5]" /></div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setView('dashboard')} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black uppercase">Discard</button>
                <button type="submit" className="flex-1 py-5 bg-[#3b4083] text-white rounded-2xl font-black uppercase shadow-xl hover:bg-[#2e3266]">Save Record</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
