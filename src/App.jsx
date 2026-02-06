import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Factory as FactoryIcon, Building2, ClipboardCheck, History as HistoryIcon, 
  PlusCircle, ChevronLeft, AlertTriangle, CheckCircle2, Thermometer, Droplets, 
  User as UserIcon, Clock, Smartphone, ChevronRight, Settings2, Database, Monitor, 
  Calendar, Activity, ArrowRight, CheckCircle, AlertCircle, Sparkles, Loader2, X, 
  FileText, Lightbulb, MapPin, Save, Check, RotateCcw, Info, Box, Layers, 
  Map as MapIcon, ShieldAlert, Tag, Hash, AlertOctagon, RefreshCw, Copy 
} from 'lucide-react';

// --- Constants & Standards ---
const FABRIC_STANDARDS = [
  { label: "100% Cotton", limit: 56 },
  { label: "90% Cotton 10% Elastane/Spandex (Cotton content 85% - 99%)", limit: 56 },
  { label: "70% Cotton 30% Polyamide (Cotton content 65% - 75%)", limit: 59 },
  { label: "80% Cotton 20% Polyester (Cotton content 75%-85%)", limit: 59 },
  { label: "70% Cotton 30% Polyester (Cotton content 65% - 75%)", limit: 53 },
  { label: "60% Cotton 40% Polyester (Cotton content 55% - 65%)", limit: 45 },
  { label: "50% Cotton 50% Polyester (Cotton content 45% - 55%)", limit: 37 },
  { label: "50% Cotton 50% Polyacrylic (Cotton content 45% - 55%)", limit: 62 },
  { label: "100% Viscose/ Rayon/ Modal", limit: 59 },
  { label: "100% Linen/ Flax", limit: 67 },
  { label: "100% Polyester", limit: 57 },
  { label: "100% Leather", limit: 22 },
  { label: "Packing paper, packaging carton boxes and corrugated export cartons", limit: 10 }
];

const ROOM_LINE_DATA = {
  "A": ["PD-SA01", "PD-SA02", "PD-SA03", "PD-SA04", "PD-SA05"],
  "B": ["PD-SB01", "PD-SB02", "PD-SB03", "PD-SB04", "PD-SB05"],
  "H": ["PD-SH01", "PD-SH02", "PD-SH03", "PD-SH04", "PD-SH05"]
};

const FACTORIES = ["TTT", "TN", "TM2", "VAS"];
const DEPARTMENTS = [
  "Fabric Warehouse", "Heat Transfer", "Cutting Room", "Store Acc(Heat Tranfer)",
  "Embroidery", "Sample Room", "Print", "Pad Print", "Supermarket", "Lab",
  "Final Inspection", "Finished Goods WH", "Sublimation", "Sewing Room"
];
const GARMENT_LABELS = ["Humidty% 1st Garment", "Humidty% 2nd Garment", "Humidty% 3rd Garment"];

// --- Helper Functions ---
const getSetStatus = (fabric, hum) => {
  if (!fabric || hum === '') return null;
  const std = FABRIC_STANDARDS.find(s => s.label === fabric);
  if (!std) return null;
  const h = parseFloat(hum);
  if (h > std.limit) return "Exceed Standard";
  if (h === std.limit) return "Potential Risk";
  return "Normal";
};

const calculateSectionRisk = (sets) => {
  if (!sets || sets.length === 0) return null;
  let maxRiskLevel = 0;
  sets.forEach(set => {
    const status = getSetStatus(set.fabric, set.hum);
    if (status === "Exceed Standard") maxRiskLevel = Math.max(maxRiskLevel, 2);
    else if (status === "Potential Risk") maxRiskLevel = Math.max(maxRiskLevel, 1);
  });
  // แก้ไข Syntax Error สำหรับ Vercel โดยการครอบวงเล็บรอบ JSX ใน Object
  if (maxRiskLevel === 2) return { label: "High Risk", color: "bg-red-500", icon: (<AlertOctagon size={12}/>) };
  if (maxRiskLevel === 1) return { label: "Potential Risk", color: "bg-orange-500", icon: (<AlertTriangle size={12}/>) };
  return { label: "No Risk", color: "bg-emerald-500", icon: (<CheckCircle size={12}/>) };
};

const isPrintingDept = (dept) => dept === 'Print';
const isSewingRoom = (dept) => dept === 'Sewing Room';
const getAMPMOptions = (dept) => isPrintingDept(dept) ? ["AM1", "AM2", "PM1", "PM2", "OT1", "OT2"] : ["AM", "PM", "OT"];
const checkHumidityDanger = (humidity, dept) => {
  const h = parseFloat(humidity);
  if (!h) return false;
  return isPrintingDept(dept) ? h > 50 : h > 65;
};

const getTodoText = (dept) => dept === 'Fabric Warehouse' ?
  "สุ่มตรวจเช็คค่าความชื้นกับผ้าที่เก็บไว้บนพาเลทเริ่มจากบริเวณศูนย์กลางของ WH 1 จุด และอีก 4 จุดจากทั้ง 4 มุมห้อง..." : 
  "สุ่มตรวจเช็คค่าความชื้นกับผ้าที่เก็บไว้ภายในห้องตัดเริ่มจากบริเวณศูนย์กลางของห้อง 1จุด และอีก 4 จุดจากทั้ง 4 มุมห้อง...";

const ProductDataInputs = ({ title, icon: Icon, sets, setter, colorClass }) => {
  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setter(newSets);
  };
  const applyFirstToAll = () => {
    const firstSet = sets[0];
    const newSets = sets.map((set, index) => (index === 0 ? set : { ...set, cjo: firstSet.cjo, po: firstSet.po, fabric: firstSet.fabric }));
    setter(newSets);
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between p-3 ${colorClass} rounded-2xl`}>
        <div className="flex items-center gap-2"><Icon size={18} /><span className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</span></div>
        <button type="button" onClick={applyFirstToAll} className="flex items-center gap-1.5 px-3 py-1 bg-white/50 hover:bg-white rounded-lg transition-all text-[9px] font-black uppercase border border-current/20 shadow-sm active:scale-95"><Copy size={12} /> Apply Info to All</button>
      </div>
      <div className="grid gap-6">
        {sets.map((set, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#F1EDFF] shadow-sm space-y-4">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{GARMENT_LABELS[i]}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1"><label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">CJO</label><input type="text" value={set.cjo} onChange={e => updateSet(i, 'cjo', e.target.value)} className="w-full p-3 bg-[#f9f8ff] border border-slate-100 rounded-xl outline-none text-xs font-bold text-[#3b4083]" /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">PO</label><input type="text" value={set.po} onChange={e => updateSet(i, 'po', e.target.value)} className="w-full p-3 bg-[#f9f8ff] border border-slate-100 rounded-xl outline-none text-xs font-bold text-[#3b4083]" /></div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">Fabric Type</label>
                <select value={set.fabric} onChange={e => updateSet(i, 'fabric', e.target.value)} className="w-full p-3 bg-[#f9f8ff] border border-slate-100 rounded-xl outline-none text-[10px] font-bold text-[#3b4083] appearance-none cursor-pointer">
                  <option value="">Select Fabric</option>
                  {FABRIC_STANDARDS.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">Humidity (%)</label><input type="number" step="0.1" value={set.hum} onChange={e => updateSet(i, 'hum', e.target.value)} className="w-full p-3 bg-[#f9f8ff] border border-slate-100 rounded-xl outline-none text-xs font-black text-[#3b4083]" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('home');
  const [selectedFactory, setSelectedFactory] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState('Environment');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentEntryId, setCurrentEntryId] = useState(null);

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
    if (record.status === 'Resolved') return "Resolved";
    if (record.type === 'Product') {
      const sRisk = calculateSectionRisk(record.semi_sets)?.label;
      const pRisk = calculateSectionRisk(record.product_sets)?.label;
      if (sRisk === "High Risk" || pRisk === "High Risk") return "Take Action";
      const hadHigh = (record.product_history || []).some(h => calculateSectionRisk(h.semi_sets)?.label === "High Risk" || calculateSectionRisk(h.product_sets)?.label === "High Risk");
      return hadHigh ? "Resolved" : "No action needed";
    }
    return checkHumidityDanger(record.humidity, record.department) ? "Take Action" : "No action needed";
  };

  const HomeView = () => (
    <div className="max-w-5xl mx-auto p-4 space-y-10 animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3b4083] to-[#8f8cb8] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"><Settings2 size={14} /> Monitoring</div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter">HygroTrack <br /><span className="text-[#dbf2f2]">V2.4.2 Workflows</span></h1>
            <p className="text-[#F1EDFF] text-lg opacity-90 max-w-md">ระบบบันทึกค่าความชื้นแบบจำลอง (Mock Mode)</p>
          </div>
          <Monitor size={80} className="text-[#dbf2f2] opacity-80 hidden lg:block" />
        </div>
      </section>
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 px-2 text-[#3b4083]"><FactoryIcon size={20} /><h2 className="text-xl font-bold uppercase tracking-tighter">Factory</h2></div>
          <div className="grid grid-cols-2 gap-3">
            {FACTORIES.map(f => <button key={f} onClick={() => setSelectedFactory(f)} className={`p-6 rounded-[2rem] font-bold transition-all border-2 ${selectedFactory === f ? 'bg-[#3b4083] text-white shadow-xl scale-105 border-transparent' : 'bg-white border-[#F1EDFF] text-[#8f8cb8] hover:border-[#7ab6b5]'}`}>{f}</button>)}
          </div>
        </section>
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 px-2 text-[#3b4083]"><Layout size={20} /><h2 className="text-xl font-bold uppercase tracking-tighter">Department</h2></div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-[#F1EDFF] shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {DEPARTMENTS.map(d => <button key={d} onClick={() => { setSelectedDept(d); setActiveTypeTab('Environment'); }} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${selectedDept === d ? 'bg-[#3b4083] text-white shadow-md' : 'bg-[#f9f8ff] text-[#8f8cb8] hover:bg-[#F1EDFF]'}`}><span className="font-medium">{d}</span><ChevronRight size={16} className={selectedDept === d ? 'opacity-100' : 'opacity-0'} /></button>)}
            </div>
          </div>
        </section>
      </div>
      <div className="flex justify-center pt-4"><button disabled={!selectedFactory || !selectedDept} onClick={() => setView('dashboard')} className="bg-[#3b4083] text-white px-24 py-5 rounded-full font-black text-xl disabled:opacity-20 transition-all shadow-2xl uppercase tracking-[0.2em] hover:scale-105 active:scale-95">Select</button></div>
    </div>
  );

  const DashboardView = () => {
    const [statusFilter, setStatusFilter] = useState('all');
    const baseFiltered = useMemo(() => records.filter(r => r.factory === selectedFactory && r.department === selectedDept), [records, selectedFactory, selectedDept]);
    const typeFiltered = useMemo(() => {
      const targetType = isSewingRoom(selectedDept) ? activeTypeTab : 'Environment';
      return baseFiltered.filter(r => r.type === targetType);
    }, [baseFiltered, selectedDept, activeTypeTab]);
    const stats = useMemo(() => {
      const action = typeFiltered.filter(r => getActionStatus(r) === 'Take Action').length;
      const res = typeFiltered.filter(r => getActionStatus(r) === 'Resolved').length;
      return { all: typeFiltered.length, takeAction: action, resolved: res, safe: typeFiltered.length - action - res };
    }, [typeFiltered]);
    const finalFiltered = useMemo(() => statusFilter === 'all' ? typeFiltered : typeFiltered.filter(r => getActionStatus(r) === statusFilter), [typeFiltered, statusFilter]);
    const grouped = finalFiltered.reduce((groups, r) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
      return groups;
    }, {});
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [d1, m1, y1] = a.split('/').map(Number), [d2, m2, y2] = b.split('/').map(Number);
      return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, y1);
    });

    const renderProd = (title, Icon, sets, risk) => (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><div className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest flex items-center gap-2"><Icon size={14} /> {title}</div>{sets && risk && <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-black uppercase ${risk.color} text-white`}>{risk.icon} {risk.label}</div>}</div>
        <div className="grid gap-3">{sets?.map((set, i) => {
          const s = getSetStatus(set.fabric, set.hum);
          return (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0"><div className="text-[8px] font-black text-slate-300">{GARMENT_LABELS[i]}</div><div className="text-[11px] font-bold text-[#3b4083] truncate">{set.cjo} | {set.po}</div><div className="text-[8px] text-[#8f8cb8] font-bold truncate mt-0.5">{set.fabric}</div></div>
              <div className="text-right ml-4"><div className={`text-xl font-black ${s === 'Exceed Standard' ? 'text-red-500' : s === 'Potential Risk' ? 'text-orange-500' : 'text-[#3b4083]'}`}>{set.hum}%</div>{s && <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded inline-block mt-1 ${s === 'Exceed Standard' ? 'bg-red-500 text-white animate-pulse' : s === 'Potential Risk' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>{s}</div>}</div>
            </div>
          );
        })}</div>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><button onClick={() => setView('home')} className="flex items-center gap-2 text-[#3b4083] font-black uppercase text-sm group"><ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Home</button>{isSewingRoom(selectedDept) && <div className="bg-[#F1EDFF] p-1 rounded-full flex gap-1 shadow-inner border border-[#3b4083]/10">{['Environment', 'Product'].map(t => <button key={t} onClick={() => setActiveTypeTab(t)} className={`px-8 py-2 rounded-full text-[10px] font-black uppercase transition-all ${activeTypeTab === t ? 'bg-[#3b4083] text-white shadow-md' : 'text-[#8f8cb8] hover:text-[#3b4083]'}`}>{t}</button>)}</div>}<div className="flex items-center gap-3"><span className="px-4 py-1.5 bg-[#3b4083] text-white rounded-full text-[10px] font-black uppercase tracking-widest">{selectedFactory}</span><span className="px-4 py-1.5 bg-[#7ab6b5] text-white rounded-full text-[10px] font-black uppercase tracking-widest">{selectedDept}</span></div></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button onClick={() => setStatusFilter('all')} className={`p-4 rounded-[2.5rem] border-2 transition-all flex flex-col items-center ${statusFilter === 'all' ? 'bg-[#3b4083] text-white shadow-xl border-transparent' : 'bg-white border-[#F1EDFF] text-[#8f8cb8]'}`}><span className="text-[9px] font-black uppercase opacity-60">Total</span><span className="text-2xl font-black">{stats.all}</span></button>
          <button onClick={() => setStatusFilter('No action needed')} className={`p-4 rounded-[2.5rem] border-2 transition-all flex flex-col items-center ${statusFilter === 'No action needed' ? 'bg-[#0cc784] text-white shadow-xl border-transparent' : 'bg-white border-[#F1EDFF] text-[#0cc784]'}`}><span className="text-[9px] font-black uppercase opacity-80">Safe</span><span className="text-2xl font-black">{stats.safe}</span></button>
          <button onClick={() => setStatusFilter('Resolved')} className={`p-4 rounded-[2.5rem] border-2 transition-all flex flex-col items-center ${statusFilter === 'Resolved' ? 'bg-[#3b4083] text-[#dbf2f2] shadow-xl border-transparent' : 'bg-white border-[#F1EDFF] text-[#3b4083]'}`}><span className="text-[9px] font-black uppercase opacity-80">Resolved</span><span className="text-2xl font-black">{stats.resolved}</span></button>
          <button onClick={() => setStatusFilter('Take Action')} className={`p-4 rounded-[2.5rem] border-2 transition-all flex flex-col items-center ${statusFilter === 'Take Action' ? 'bg-[#ffbc5e] text-white shadow-xl border-transparent' : 'bg-white border-[#F1EDFF] text-[#ffbc5e]'}`}><span className="text-[9px] font-black uppercase opacity-80">Action</span><span className="text-2xl font-black">{stats.takeAction}</span></button>
          <button onClick={() => { setView('form'); setCurrentEntryId(null); }} className="p-4 rounded-[2.5rem] bg-[#dbf2f2] border-2 border-[#7ab6b5] text-[#3b4083] flex flex-col items-center justify-center group active:scale-95 transition-all"><PlusCircle size={24} /><span className="text-[9px] font-black uppercase mt-1">New Entry</span></button>
        </div>
        <div className="space-y-12 pb-20">
          {sortedDates.length === 0 ? <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-[#F1EDFF] text-[#8f8cb8]"><Database size={48} className="mx-auto mb-4 opacity-20" /><p className="font-bold uppercase tracking-widest text-xs">No {activeTypeTab} records found.</p></div> : sortedDates.map(date => (
            <div key={date} className="bg-white border border-[#F1EDFF] rounded-[3rem] shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-500">
              <div className="bg-[#3b4083] px-10 py-6 text-white flex items-center justify-between"><div className="flex items-center gap-4"><Calendar size={24} className="text-[#dbf2f2]" /><h3 className="text-2xl font-black tracking-tighter uppercase">{date}</h3></div><span className="bg-[#8f8cb8]/40 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{(isSewingRoom(selectedDept) ? activeTypeTab : 'Environment')} Analysis</span></div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-[#f9f8ff] border-b border-[#F1EDFF] text-[10px] font-black text-[#8f8cb8] uppercase tracking-[0.2em]"><th className="px-8 py-5">Time Slot</th>{ (isSewingRoom(selectedDept) && activeTypeTab === 'Product') ? (<><th className="px-8 py-5">Room</th><th className="px-8 py-5">Line</th><th className="px-8 py-5">Operator</th><th className="px-8 py-5">TimeStamp</th><th className="px-8 py-5 text-center">Status</th></>) : (<><th className="px-8 py-5">Temp</th><th className="px-8 py-5">Hygro</th><th className="px-8 py-5">Operator</th><th className="px-8 py-5 text-center">Status</th></>)}</tr></thead>
                  <tbody className="divide-y divide-[#F1EDFF]">
                    {grouped[date].map(record => {
                      const status = getActionStatus(record), isDanger = status === 'Take Action', isRes = status === 'Resolved', isProd = record.type === 'Product';
                      return (
                        <React.Fragment key={record.id}>
                          <tr className={`hover:bg-[#dbf2f2]/20 transition-colors ${isDanger ? 'bg-[#ffbc5e]/5' : ''}`}>
                            <td className="px-8 py-6"><div className="text-sm font-black text-[#3b4083] uppercase">{record.ampm}</div></td>
                            {isProd ? (<><td className="px-8 py-6 font-bold text-sm text-[#3b4083]">Room {record.room}</td><td className="px-8 py-6"><span className="text-[10px] bg-[#F1EDFF] text-[#3b4083] px-3 py-1 rounded-lg font-black uppercase">{record.line}</span></td><td className="px-8 py-6 font-bold text-sm text-[#3b4083]">{record.user}</td><td className="px-8 py-6 font-black text-[10px] text-[#8f8cb8]">{record.displayTime}</td><td className="px-8 py-6 text-center"><span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${isDanger ? 'bg-[#ffbc5e]/10 text-[#ffbc5e] border-[#ffbc5e]' : isRes ? 'bg-[#3b4083]/10 text-[#3b4083] border-[#3b4083]' : 'bg-[#0cc784]/10 text-[#0cc784] border-[#0cc784]'}`}>{isDanger ? (<Activity size={12} />) : (<CheckCircle2 size={12} />)}{status}</span></td></>) : (<><td className="px-8 py-6 font-black text-xl text-[#ffbc5e]">{record.temperature}°C</td><td className="px-8 py-6"><div className={`flex items-center gap-1.5 font-black text-xl ${isDanger ? 'text-[#ffbc5e]' : 'text-[#7ab6b5]'}`}>{record.humidity}%</div></td><td className="px-8 py-6 font-bold text-sm text-[#3b4083]">{record.user}</td><td className="px-8 py-6 text-center"><span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${isDanger ? 'bg-[#ffbc5e]/10 text-[#ffbc5e] border-[#ffbc5e]' : isRes ? 'bg-[#3b4083]/10 text-[#3b4083] border-[#3b4083]' : 'bg-[#0cc784]/10 text-[#0cc784] border-[#0cc784]'}`}>{isDanger ? (<Activity size={12} />) : (<CheckCircle2 size={12} />)}{status}</span></td></>)}
                          </tr>
                          {(isDanger || isRes || isProd) && (
                            <tr className="bg-slate-50/20"><td colSpan={isProd ? 6 : 5} className="px-10 py-5">
                              {record.type === 'Environment' && (isDanger || isRes) && (
                                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm relative space-y-4 mb-4">
                                  <div className="flex items-start gap-4"><div className={`p-2 rounded-xl ${isRes ? 'bg-[#3b4083]/10 text-[#3b4083]' : 'bg-[#ffbc5e]/10 text-[#ffbc5e]'}`}><ClipboardCheck size={20} /></div><div className="flex-1 pr-40"><div className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isRes ? 'text-[#3b4083]' : 'text-[#ffbc5e]'}`}>Recommended Action</div><p className="text-[#3b4083] text-xs font-bold italic leading-relaxed whitespace-pre-line">{record.todo}</p></div>{!isRes && <button onClick={() => { setCurrentEntryId(record.id); setView('extra'); }} className="absolute right-6 top-6 flex items-center gap-2 px-4 py-2 bg-[#ffbc5e] text-[#3b4083] rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-md active:scale-95"><RotateCcw size={12} /> Record 4 Points AquaBoy</button>}</div>
                                  {record.checks_4pts?.map((round, rIdx) => (
                                    <div key={rIdx} className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                                      <div className="flex items-center justify-between"><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Check Round {rIdx + 1}</div><span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${round.result === 'Pass' ? 'bg-[#0cc784] text-white' : 'bg-red-500 text-white'}`}>{round.result}</span></div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map(num => {
                                        const std = FABRIC_STANDARDS.find(s => s.label === round[`pos${num}_fabric`]);
                                        const isOver = parseFloat(round[`pos${num}_hum`]) > (std?.limit || 0);
                                        return <div key={num} className={`bg-[#f9f8ff] p-3 rounded-2xl border ${isOver ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}><div className="text-[8px] font-bold text-slate-400">P{num}</div><div className={`text-md font-black ${isOver ? 'text-red-500' : 'text-[#3b4083]'}`}>{round[`pos${num}_hum`]}%</div><div className="text-[7px] font-medium text-[#7ab6b5] truncate">{round[`pos${num}_fabric`]}</div></div>;
                                      })}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {isProd && (
                                <div className="space-y-12">
                                  {record.product_history?.map((h, idx) => <div key={idx} className="relative p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50"><div className="absolute -top-3 left-8 px-4 py-1 bg-slate-400 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-sm"><HistoryIcon size={10} /> Previous Round {idx + 1} ({new Date(h.timestamp).toLocaleTimeString()})</div><div className="grid md:grid-cols-2 gap-8 mt-4">{renderProd("Semi-Product History", Layers, h.semi_sets, calculateSectionRisk(h.semi_sets))}{renderProd("Finished Product History", Box, h.product_sets, calculateSectionRisk(h.product_sets))}</div></div>)}
                                  <div className="relative"><div className="grid md:grid-cols-2 gap-8">{renderProd("Semi-Product Checks", Layers, record.semi_sets, calculateSectionRisk(record.semi_sets))}{renderProd("Finished Product Checks", Box, record.product_sets, calculateSectionRisk(record.product_sets))}</div>{isDanger && <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end"><button onClick={() => { setCurrentEntryId(record.id); setView('extra_product'); }} className="flex items-center gap-2 px-6 py-3 bg-[#ffbc5e] text-[#3b4083] rounded-2xl font-black uppercase text-xs hover:scale-105 transition-all shadow-lg active:scale-95"><RefreshCw size={14} /> Re-check Product Sets</button></div>}</div>
                                </div>
                              )}
                            </td></tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FormView = () => {
    const isProd = isSewingRoom(selectedDept) && activeTypeTab === 'Product';
    const [form, setForm] = useState({ temperature: '', humidity: '', ampm: getAMPMOptions(selectedDept)[0], user: '', room: isProd ? 'A' : '', line: isProd ? 'PD-SA01' : '' });
    const initSet = { cjo: '', po: '', fabric: '', hum: '' };
    const [semi, setSemi] = useState([{ ...initSet }, { ...initSet }, { ...initSet }]);
    const [prod, setProd] = useState([{ ...initSet }, { ...initSet }, { ...initSet }]);
    const [sub, setSub] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      setSub(true);
      const cSemi = semi.filter(s => s.cjo.trim() !== '' || s.hum !== ''), cProd = prod.filter(s => s.cjo.trim() !== '' || s.hum !== '');
      saveToLocal([{ id: Date.now().toString(), ...form, semi_sets: isProd ? cSemi : [], product_sets: isProd ? cProd : [], factory: selectedFactory, department: selectedDept, type: isSewingRoom(selectedDept) ? activeTypeTab : 'Environment', timestamp: { seconds: Math.floor(Date.now() / 1000) }, date: new Date().toLocaleDateString('th-TH'), displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), todo: getTodoText(selectedDept), product_history: [] }, ...records]);
      setSub(false);
      setView('dashboard');
    };

    return (
      <div className="max-w-5xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[#3b4083] mb-8 font-black uppercase text-sm group"><ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Discard</button>
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#F1EDFF]">
          <div className="bg-[#3b4083] p-10 text-white flex justify-between items-center"><div><h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">New Entry Log</h2><p className="text-[#8f8cb8] font-bold mt-1 uppercase text-xs">{selectedFactory} | {selectedDept}</p></div><div className="bg-[#dbf2f2] text-[#3b4083] px-6 py-2 rounded-2xl text-[11px] font-black uppercase shadow-lg border border-white/20 tracking-widest">{activeTypeTab} Mode</div></div>
          <form onSubmit={handleSubmit} className="p-10 space-y-12">
            {!isProd ? (<><div className="grid grid-cols-2 gap-8"><div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest">Temperature (°C)</label><input required type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} className="w-full p-5 bg-[#f9f8ff] border-2 border-transparent focus:border-[#7ab6b5] focus:bg-white rounded-[1.5rem] outline-none text-xl font-black text-[#3b4083] shadow-inner" /></div><div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest">Humidity (%)</label><input required type="number" step="0.1" value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} className={`w-full p-5 bg-[#f9f8ff] border-2 focus:bg-white rounded-[1.5rem] outline-none text-xl font-black shadow-inner transition-all ${checkHumidityDanger(form.humidity, selectedDept) ? 'border-[#ffbc5e] text-[#ffbc5e]' : 'border-transparent text-[#3b4083]'}`} /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest">Time Slot</label><select value={form.ampm} onChange={e => setForm({...form, ampm: e.target.value})} className="w-full p-5 bg-[#f9f8ff] rounded-[1.5rem] outline-none font-bold text-[#3b4083] appearance-none cursor-pointer">{getAMPMOptions(selectedDept).map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div><div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest">Operator Name</label><input required type="text" value={form.user} onChange={e => setForm({...form, user: e.target.value})} className="w-full p-5 bg-[#f9f8ff] border-2 border-transparent focus:border-[#7ab6b5] rounded-[1.5rem] outline-none font-bold text-[#3b4083] shadow-inner transition-all" placeholder="Your Name" /></div></div></>) : (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#F1EDFF]/40 rounded-[2.5rem] border border-[#3b4083]/10">
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-[0.2em] flex items-center gap-1"><MapIcon size={12}/> Room Selection</label><select required value={form.room} onChange={e => setForm({...form, room: e.target.value, line: ROOM_LINE_DATA[e.target.value][0]})} className="w-full p-5 bg-white border border-[#F1EDFF] rounded-[1.5rem] outline-none font-black text-[#3b4083] shadow-sm appearance-none cursor-pointer">{['A', 'B', 'H'].map(r => <option key={r} value={r}>Room {r}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-[0.2em] flex items-center gap-1"><Layers size={12}/> Line Selection</label><select required value={form.line} onChange={e => setForm({...form, line: e.target.value})} className="w-full p-5 bg-white border border-[#F1EDFF] rounded-[1.5rem] outline-none font-black text-[#3b4083] shadow-sm appearance-none cursor-pointer">{(ROOM_LINE_DATA[form.room] || []).map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Time Slot</label><select value={form.ampm} onChange={e => setForm({...form, ampm: e.target.value})} className="w-full p-5 bg-white border border-[#F1EDFF] rounded-[1.5rem] outline-none font-bold text-[#3b4083] appearance-none cursor-pointer">{getAMPMOptions(selectedDept).map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#8f8cb8] uppercase tracking-widest flex items-center gap-1"><UserIcon size={12}/> Operator Name</label><input required type="text" value={form.user} onChange={e => setForm({...form, user: e.target.value})} className="w-full p-5 bg-white border border-[#F1EDFF] focus:border-[#7ab6b5] rounded-[1.5rem] outline-none font-bold text-[#3b4083] shadow-sm transition-all" placeholder="Enter Operator Name" /></div>
                </div>
                <ProductDataInputs title="Semi-Product Checks" icon={Layers} sets={semi} setter={setSemi} colorClass="bg-[#3b4083]/10 text-[#3b4083]" /><ProductDataInputs title="Finished Product Checks" icon={Box} sets={prod} setter={setProd} colorClass="bg-[#0cc784]/10 text-[#0cc784]" />
              </div>
            )}
            <button disabled={sub} type="submit" className="w-full py-5 bg-[#3b4083] text-white rounded-[2rem] font-black text-lg shadow-xl uppercase tracking-[0.3em] hover:bg-[#2e3266] active:scale-95 transition-all">{sub ? 'Processing...' : 'SAVE'}</button>
          </form>
        </div>
      </div>
    );
  };

  const ExtraProductFormView = () => {
    const initSet = { cjo: '', po: '', fabric: '', hum: '' };
    const [s, setS] = useState([{ ...initSet }, { ...initSet }, { ...initSet }]);
    const [p, setP] = useState([{ ...initSet }, { ...initSet }, { ...initSet }]);
    const [u, setU] = useState(false);
    const handleUpdate = (e) => {
      e.preventDefault();
      setU(true);
      const cSemi = s.filter(i => i.cjo.trim() !== '' || i.hum !== ''), cProd = p.filter(i => i.cjo.trim() !== '' || i.hum !== '');
      const pass = calculateSectionRisk(cSemi)?.label !== "High Risk" && calculateSectionRisk(cProd)?.label !== "High Risk";
      saveToLocal(records.map(r => r.id === currentEntryId ? { ...r, product_history: [...(r.product_history || []), { semi_sets: r.semi_sets, product_sets: r.product_sets, timestamp: new Date().toISOString() }], semi_sets: cSemi, product_sets: cProd, status: pass ? 'Resolved' : 'Take Action' } : r));
      setU(false);
      setView('dashboard');
    };
    return (
      <div className="max-w-5xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-[#ffbc5e] overflow-hidden">
          <div className="bg-[#ffbc5e] p-8 text-[#3b4083] flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-3 bg-[#3b4083] text-white rounded-2xl shadow-lg"><RefreshCw size={24} /></div><h2 className="text-2xl font-black uppercase">Re-check Product Sets</h2></div><X className="cursor-pointer" onClick={() => setView('dashboard')} /></div>
          <form onSubmit={handleUpdate} className="p-10 space-y-12 bg-[#f9f8ff]"><ProductDataInputs title="New Semi-Product Monitoring" icon={Layers} sets={s} setter={setS} colorClass="bg-[#3b4083]/10 text-[#3b4083]" /><ProductDataInputs title="New Finished Product Monitoring" icon={Box} sets={p} setter={setP} colorClass="bg-[#0cc784]/10 text-[#0cc784]" /><button disabled={u} type="submit" className="w-full py-5 bg-[#3b4083] text-white rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all uppercase tracking-widest">{u ? (<Loader2 className="animate-spin" />) : 'SAVE'}</button></form>
        </div>
      </div>
    );
  };

  const ExtraFormView = () => {
    const d = FABRIC_STANDARDS[0].label, [pts, setPts] = useState({ pos1_hum: '', pos1_fabric: d, pos2_hum: '', pos2_fabric: d, pos3_hum: '', pos3_fabric: d, pos4_hum: '', pos4_fabric: d }), [u, setU] = useState(false);
    const handleUpdate = (e) => {
      e.preventDefault();
      let pass = true;
      for (let i = 1; i <= 4; i++) { if (parseFloat(pts[`pos${i}_hum`]) > (FABRIC_STANDARDS.find(s => s.label === pts[`pos${i}_fabric`])?.limit || 0)) pass = false; }
      setU(true);
      saveToLocal(records.map(r => r.id === currentEntryId ? { ...r, checks_4pts: [...(r.checks_4pts || []), { ...pts, timestamp: new Date().toISOString(), result: pass ? 'Pass' : 'Fail' }], status: pass ? 'Resolved' : 'Take Action' } : r));
      setU(false);
      setView('dashboard');
    };
    return (
      <div className="max-w-5xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-[#ffbc5e] overflow-hidden">
          <div className="bg-[#ffbc5e] p-8 text-[#3b4083] flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-3 bg-[#3b4083] text-white rounded-2xl shadow-lg"><MapPin size={24} /></div><h2 className="text-2xl font-black uppercase">Standard Check</h2></div><RotateCcw size={32} /></div>
          <form onSubmit={handleUpdate} className="p-10 space-y-8 bg-[#f9f8ff]"><div className="grid md:grid-cols-2 gap-8">{[1, 2, 3, 4].map(n => (<div key={n} className="p-6 bg-white rounded-[2.5rem] border-2 border-[#F1EDFF] shadow-sm hover:border-[#ffbc5e] transition-all"><div className="flex items-center gap-2 text-[#3b4083] font-black text-xs uppercase tracking-widest"><span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] text-white bg-[#ffbc5e]">{n}</span> Position {n}</div><div className="space-y-1"><label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">Fabric Type</label><select required value={pts[`pos${n}_fabric`]} onChange={e => setPts({...pts, [`pos${n}_fabric`]: e.target.value})} className="w-full p-4 bg-[#f9f8ff] rounded-xl outline-none font-bold text-[#3b4083] text-[11px] appearance-none cursor-pointer border border-transparent focus:border-[#7ab6b5]">{FABRIC_STANDARDS.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}</select></div><div className="space-y-1"><label className="text-[9px] font-black text-[#8f8cb8] uppercase tracking-wider">Humidity (%)</label><input required type="number" value={pts[`pos${n}_hum`]} onChange={e => setPts({...pts, [`pos${n}_hum`]: e.target.value})} className="w-full p-4 bg-[#f9f8ff] border-2 border-transparent rounded-xl outline-none font-black text-lg focus:border-[#ffbc5e] focus:bg-white transition-all" /></div></div>))}</div><button disabled={u} type="submit" className="w-full py-5 bg-[#3b4083] text-white rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all uppercase tracking-widest">{u ? (<Loader2 className="animate-spin" />) : 'SAVE'}</button></form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f8ff] font-sans text-[#3b4083] pb-20 selection:bg-[#dbf2f2]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F1EDFF] px-8 py-5 flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#3b4083] rounded-xl flex items-center justify-center text-white shadow-lg"><Thermometer size={22} strokeWidth={3} /></div><span className="font-black text-xl tracking-tighter uppercase">HygroTrack</span></div><div className="flex items-center gap-2 px-4 py-2 bg-[#0cc784]/10 rounded-full border border-[#0cc784]/20"><div className="w-1.5 h-1.5 bg-[#0cc784] rounded-full animate-pulse"></div><span className="text-[10px] font-black text-[#0cc784] uppercase tracking-[0.2em]">Mock Sync</span></div></nav>
      <main className="mt-8 px-4">{view === 'home' && <HomeView />}{view === 'dashboard' && <DashboardView />}{view === 'form' && <FormView />}{view === 'extra' && <ExtraFormView />}{view === 'extra_product' && <ExtraProductFormView />}</main>
      {loading && (<div className="fixed inset-0 bg-[#f9f8ff]/80 flex items-center justify-center z-[100] backdrop-blur-md"><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-[#3b4083] border-t-transparent rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase tracking-widest">Loading...</p></div></div>)}
    </div>
  );
};

export default App;
