import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Factory as FactoryIcon, Building2, ClipboardCheck, History as HistoryIcon, 
  PlusCircle, ChevronLeft, AlertTriangle, CheckCircle2, Thermometer, Droplets, 
  User as UserIcon, Clock, Smartphone, ChevronRight, Settings2, Database, Monitor, 
  Calendar, Activity, ArrowRight, CheckCircle, AlertCircle, Sparkles, Loader2, X, 
  FileText, Lightbulb, MapPin, Save, Check, RotateCcw, Info, Box, Layers, 
  Map as MapIcon, ShieldAlert, Tag, Hash, AlertOctagon, RefreshCw, Copy 
} from 'lucide-react'; [cite: 4, 5]

// --- Constants & Standards ---
const FABRIC_STANDARDS = [
  { label: "100% Cotton", limit: 56 },
  { label: "90% Cotton 10% Elastane/Spandex (Cotton content 85% - 99%)", limit: 56 },
  { label: "100% Polyester", limit: 57 },
  { label: "100% Leather", limit: 22 },
  { label: "Packing paper, packaging carton boxes and corrugated export cartons", limit: 10 }
]; [cite: 7, 8, 9]

const ROOM_LINE_DATA = {
  "A": ["PD-SA01", "PD-SA02", "PD-SA03", "PD-SA04", "PD-SA05"],
  "B": ["PD-SB01", "PD-SB02", "PD-SB03", "PD-SB04", "PD-SB05"],
  "H": ["PD-SH01", "PD-SH02", "PD-SH03", "PD-SH04", "PD-SH05"]
}; [cite: 10]

const FACTORIES = ["TTT", "TN", "TM2", "VAS"]; [cite: 11]
const DEPARTMENTS = ["Fabric Warehouse", "Cutting Room", "Sewing Room", "Final Inspection"]; [cite: 11]
const GARMENT_LABELS = ["Humidty% 1st Garment", "Humidty% 2nd Garment", "Humidty% 3rd Garment"]; [cite: 12]

// --- Helper Functions ---
const getSetStatus = (fabric, hum) => {
  if (!fabric || hum === '') return null; [cite: 13]
  const std = FABRIC_STANDARDS.find(s => s.label === fabric); [cite: 14]
  if (!std) return null;
  const h = parseFloat(hum);
  if (h > std.limit) return "Exceed Standard"; [cite: 15]
  if (h === std.limit) return "Potential Risk";
  return "Normal";
};

const calculateSectionRisk = (sets) => {
  if (!sets || sets.length === 0) return null; [cite: 16]
  let maxRiskLevel = 0;
  sets.forEach(set => { [cite: 17]
    const status = getSetStatus(set.fabric, set.hum);
    if (status === "Exceed Standard") maxRiskLevel = Math.max(maxRiskLevel, 2);
    else if (status === "Potential Risk") maxRiskLevel = Math.max(maxRiskLevel, 1);
  });
  // จุดสำคัญ: ครอบวงเล็บรอบ JSX เพื่อแก้ Error Syntax ใน Vercel
  if (maxRiskLevel === 2) return { label: "High Risk", color: "bg-red-500", icon: (<AlertOctagon size={12}/>) }; [cite: 18]
  if (maxRiskLevel === 1) return { label: "Potential Risk", color: "bg-orange-500", icon: (<AlertTriangle size={12}/>) }; [cite: 19]
  return { label: "No Risk", color: "bg-emerald-500", icon: (<CheckCircle size={12}/>) }; [cite: 20]
};

const isSewingRoom = (dept) => dept === 'Sewing Room'; [cite: 21]
const checkHumidityDanger = (humidity, dept) => {
  const h = parseFloat(humidity);
  if (!h) return false; [cite: 23]
  return h > 65; [cite: 24]
};

const ProductDataInputs = ({ title, icon: Icon, sets, setter, colorClass }) => {
  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value; [cite: 27]
    setter(newSets);
  };
  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between p-3 ${colorClass} rounded-2xl`}>
        <div className="flex items-center gap-2"><Icon size={18} /><span className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</span></div>
      </div>
      <div className="grid gap-6">
        {sets.map((set, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#F1EDFF] shadow-sm space-y-4">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{GARMENT_LABELS[i]}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">CJO</label>
                <input type="text" value={set.cjo} onChange={e => updateSet(i, 'cjo', e.target.value)} className="w-full p-3 bg-[#f9f8ff] border border-slate-100 rounded-xl outline-none text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">Humidity (%)</label>
                <input type="number" value={set.hum} onChange={e => updateSet(i, 'hum', e.target.value)} className="w-full p-3 bg-[#f9f8ff] border border-slate-100 rounded-xl outline-none text-xs font-black" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('home');
  const [selectedFactory, setSelectedFactory] = useState(''); [cite: 37]
  const [selectedDept, setSelectedDept] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState('Environment');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true); [cite: 38]

  useEffect(() => {
    const saved = localStorage.getItem('hygro_mock_data');
    if (saved) setRecords(JSON.parse(saved));
    setLoading(false);
  }, []);

  const saveToLocal = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem('hygro_mock_data', JSON.stringify(newRecords));
  };

  const getActionStatus = (record) => {
    if (record.status === 'Resolved') return "Resolved"; [cite: 43]
    return checkHumidityDanger(record.humidity, record.department) ? "Take Action" : "No action needed"; [cite: 48]
  };

  const HomeView = () => (
    <div className="max-w-5xl mx-auto p-4 space-y-10 animate-in fade-in duration-700">
      <section className="bg-gradient-to-br from-[#3b4083] to-[#8f8cb8] rounded-[2.5rem] p-12 text-white shadow-2xl">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter">HygroTrack V2.4.2</h1>
        <p className="text-[#F1EDFF] mt-2">Mock Preview Mode (ข้อมูลเก็บไว้ในเครื่อง)</p>
      </section>
      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase text-[#3b4083]">Select Factory</h2>
          <div className="grid grid-cols-2 gap-3">
            {FACTORIES.map(f => (
              <button key={f} onClick={() => setSelectedFactory(f)} className={`p-6 rounded-[2rem] font-bold border-2 ${selectedFactory === f ? 'bg-[#3b4083] text-white' : 'bg-white text-[#8f8cb8]'}`}>{f}</button>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase text-[#3b4083]">Select Department</h2>
          <div className="bg-white p-6 rounded-[2.5rem] border border-[#F1EDFF] grid gap-2">
            {DEPARTMENTS.map(d => (
              <button key={d} onClick={() => setSelectedDept(d)} className={`p-4 rounded-2xl text-left ${selectedDept === d ? 'bg-[#3b4083] text-white' : 'bg-[#f9f8ff] text-[#8f8cb8]'}`}>{d}</button>
            ))}
          </div>
        </section>
      </div>
      <div className="flex justify-center"><button disabled={!selectedFactory || !selectedDept} onClick={() => setView('dashboard')} className="bg-[#3b4083] text-white px-24 py-5 rounded-full font-black text-xl disabled:opacity-20 transition-all uppercase tracking-widest">Select</button></div>
    </div>
  );

  const DashboardView = () => {
    const typeFiltered = records.filter(r => r.factory === selectedFactory && r.department === selectedDept); [cite: 56]
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => setView('home')} className="text-[#3b4083] font-bold flex items-center gap-2"><ChevronLeft size={20}/> HOME</button>
          <button onClick={() => setView('form')} className="bg-[#3b4083] text-white px-6 py-3 rounded-full font-black uppercase text-sm flex items-center gap-2"><PlusCircle size={18}/> New Entry</button>
        </div>
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-[#F1EDFF]">
           {typeFiltered.length === 0 ? <p className="text-center text-slate-400 py-10">No records found.</p> : (
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-[#F1EDFF]">
                   <th className="py-4">Time</th><th className="py-4">Temp</th><th className="py-4">Hygro</th><th className="py-4">Operator</th><th className="py-4">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#F1EDFF]">
                 {typeFiltered.map(record => (
                   <tr key={record.id} className="text-sm font-bold text-[#3b4083]">
                     <td className="py-5">{record.ampm}</td><td className="py-5">{record.temperature}°C</td><td className="py-5 text-[#7ab6b5]">{record.humidity}%</td><td className="py-5">{record.user}</td>
                     <td className="py-5"><span className={`px-4 py-1.5 rounded-full text-[10px] uppercase ${checkHumidityDanger(record.humidity) ? 'bg-orange-100 text-orange-500' : 'bg-emerald-100 text-emerald-500'}`}>{getActionStatus(record)}</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    );
  };

  const FormView = () => {
    const [form, setForm] = useState({ temperature: '', humidity: '', ampm: 'AM', user: '' });
    const handleSubmit = (e) => {
      e.preventDefault();
      const newRec = { id: Date.now().toString(), ...form, factory: selectedFactory, department: selectedDept, date: new Date().toLocaleDateString('th-TH') };
      saveToLocal([newRec, ...records]);
      setView('dashboard');
    };
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-[#F1EDFF]">
          <h2 className="text-2xl font-black text-[#3b4083] mb-8 uppercase">New Entry Log</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" placeholder="Temp" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} className="p-4 bg-[#f9f8ff] rounded-2xl outline-none" />
              <input required type="number" placeholder="Humidity" value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} className="p-4 bg-[#f9f8ff] rounded-2xl outline-none" />
            </div>
            <input required type="text" placeholder="Your Name" value={form.user} onChange={e => setForm({...form, user: e.target.value})} className="w-full p-4 bg-[#f9f8ff] rounded-2xl outline-none" />
            <button type="submit" className="w-full py-5 bg-[#3b4083] text-white rounded-full font-black uppercase tracking-widest">SAVE</button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f8ff]">
      <nav className="p-6 bg-white border-b border-[#F1EDFF] flex justify-between items-center">
        <span className="font-black text-xl uppercase text-[#3b4083]">HygroTrack</span>
        <span className="text-[10px] font-black text-[#0cc784] uppercase bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 animate-pulse">Mock Sync</span>
      </nav>
      <main className="mt-8">{view === 'home' && <HomeView />}{view === 'dashboard' && <DashboardView />}{view === 'form' && <FormView />}</main>
    </div>
  );
};

export default App;
