
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { STATUS_COLORS } from '../constants';
import { MedicalMember, MedicalDoctor, VitalLog, PageDesign, MedicalDocument } from '../types';
import { Icons } from '../constants';
import { GoogleGenAI } from "@google/genai";

type MedicalTab = 'family' | 'relatives' | 'doctors' | 'forms' | 'graphs';
type RecordTab = 'Biometrics' | 'Vault';
type TimeRange = '1W' | '1M' | 'ALL';

const METRIC_CONFIG: Record<string, { label: string; color: string; unit: string; max: number }> = {
  heartRate: { label: 'Heart Rate', color: '#f43f5e', unit: 'BPM', max: 200 },
  spo2: { label: 'SpO2', color: '#0ea5e9', unit: '%', max: 100 },
  glucose: { label: 'Glucose', color: '#10b981', unit: 'mg/dL', max: 300 },
  weight: { label: 'Weight', color: '#f59e0b', unit: 'lbs', max: 400 },
  respiratoryRate: { label: 'Resp Rate', color: '#8b5cf6', unit: 'br/m', max: 40 },
  hrv: { label: 'HRV', color: '#d946ef', unit: 'ms', max: 150 },
  temperature: { label: 'Temp', color: '#64748b', unit: '°F', max: 105 },
  bodyFat: { label: 'Body Fat', color: '#4f46e5', unit: '%', max: 50 },
  muscleMass: { label: 'Muscle', color: '#f97316', unit: 'lbs', max: 250 },
  boneMass: { label: 'Bone Mass', color: '#ef4444', unit: 'lbs', max: 20 },
  bodyWater: { label: 'Body Water', color: '#06b6d4', unit: '%', max: 100 },
  visceralFat: { label: 'Visceral', color: '#111827', unit: 'idx', max: 20 },
  caloricIntake: { label: 'Calories', color: '#84cc16', unit: 'kcal', max: 5000 },
  proteinIntake: { label: 'Protein', color: '#3b82f6', unit: 'g', max: 300 },
  carbIntake: { label: 'Carbs', color: '#fb923c', unit: 'g', max: 600 },
  fatIntake: { label: 'Healthy Fats', color: '#db2777', unit: 'g', max: 200 },
  bmr: { label: 'BMR', color: '#a855f7', unit: 'kcal', max: 3000 },
  strengthLevel: { label: 'Strength', color: '#000000', unit: '/100', max: 100 },
  enduranceLevel: { label: 'Endurance', color: '#16a34a', unit: '/100', max: 100 },
};

const MedicalHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MedicalTab>('family');
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set(['heartRate', 'glucose', 'weight']));
  const [alertThreshold, setAlertThreshold] = useState(20);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [lastAlert, setLastAlert] = useState<{ metric: string; delta: number; doctor: string } | null>(null);
  
  const [members, setMembers] = useState<MedicalMember[]>(() => {
    const saved = localStorage.getItem('OMNI_MED_MEMBERS_V1');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', name: 'John Smith', relationship: 'Father', email: 'john.smith@email.com', phone: '555-0101', birthDate: '1965-05-15', healthRecords: 'Hypertension managed with Lisinopril.', type: 'Family', documents: [] },
      { id: 'm2', name: 'Mary Smith', relationship: 'Sister', email: 'mary.s@email.com', phone: '555-0102', birthDate: '1992-11-22', healthRecords: 'No significant issues.', type: 'Family', documents: [] },
      { id: 'm3', name: 'Bill Johnson', relationship: 'Uncle', email: 'bill.j@email.com', phone: '555-0103', birthDate: '1970-08-10', healthRecords: 'Type 2 Diabetes.', type: 'Relative', documents: [] },
    ];
  });

  const [doctors, setDoctors] = useState<MedicalDoctor[]>(() => {
    const saved = localStorage.getItem('OMNI_MED_DOCTORS_V1');
    return saved ? JSON.parse(saved) : [
      { id: 'd1', name: 'Dr. Sarah Carter', specialty: 'General Practice', clinic: 'Oakwood Medical Center', phone: '555-9000', email: 'dr.carter@oakwood.com', assignedMemberId: 'm1', calendarUrl: 'https://calendar.google.com' },
      { id: 'd2', name: 'Dr. Alan Vance', specialty: 'Cardiology', clinic: 'Heart & Vascular Institute', phone: '555-9100', email: 'dr.vance@heartinstitute.com' },
    ];
  });

  const [vitals, setVitals] = useState<VitalLog[]>(() => {
    const saved = localStorage.getItem('OMNI_MED_VITALS_V1');
    if (saved) return JSON.parse(saved);
    
    const seed = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const ts = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
      seed.push({ 
        id: `v-seed-${i}`, 
        memberId: 'm1', 
        timestamp: ts, 
        heartRate: 65 + Math.random() * 25, 
        bloodPressure: '118/78', 
        glucose: 85 + Math.random() * 40, 
        weight: 188 - i * 0.15, 
        height: 70, temperature: 98.4 + Math.random() * 0.6, 
        respiratoryRate: 12 + Math.random() * 6, 
        hrv: 35 + Math.random() * 30, 
        spo2: 96 + Math.random() * 4,
        bodyFat: 21, muscleMass: 142, boneMass: 7.2, bodyWater: 58, visceralFat: 7, caloricIntake: 2300, proteinIntake: 170, carbIntake: 260, fatIntake: 68, bmr: 1850, strengthLevel: 78, enduranceLevel: 82 
      });
    }
    return seed;
  });

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isHealthRecordModalOpen, setIsHealthRecordModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeRecordTab, setActiveRecordTab] = useState<RecordTab>('Biometrics');

  const [memberForm, setMemberForm] = useState<Partial<MedicalMember>>({ type: 'Family' });
  const [doctorForm, setDoctorForm] = useState<Partial<MedicalDoctor>>({});
  const [vitalForm, setVitalForm] = useState<Partial<VitalLog>>({
    timestamp: new Date().toISOString().slice(0, 16),
    heartRate: 72,
    bloodPressure: '120/80',
    glucose: 100,
    weight: 150,
    height: 68,
    temperature: 98.6,
    respiratoryRate: 16,
    hrv: 45,
    spo2: 98,
    bodyFat: 20,
    muscleMass: 120,
    boneMass: 6,
    bodyWater: 60,
    visceralFat: 5,
    caloricIntake: 2000,
    proteinIntake: 150,
    carbIntake: 200,
    fatIntake: 60,
    bmr: 1600,
    strengthLevel: 50,
    enduranceLevel: 50
  });

  const memberImageRef = useRef<HTMLInputElement>(null);
  const doctorImageRef = useRef<HTMLInputElement>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('OMNI_MED_MEMBERS_V1', JSON.stringify(members));
    localStorage.setItem('OMNI_MED_DOCTORS_V1', JSON.stringify(doctors));
    localStorage.setItem('OMNI_MED_VITALS_V1', JSON.stringify(vitals));
  }, [members, doctors, vitals]);

  const addMember = () => {
    if (!memberForm.name) return;
    if (memberForm.id) {
      setMembers(members.map(m => m.id === memberForm.id ? { ...m, ...memberForm } as MedicalMember : m));
    } else {
      const newMember: MedicalMember = {
        id: `m-${Date.now()}`,
        name: memberForm.name || '',
        relationship: memberForm.relationship || '',
        email: memberForm.email || '',
        phone: memberForm.phone || '',
        birthDate: memberForm.birthDate || '',
        healthRecords: memberForm.healthRecords || '',
        type: memberForm.type || 'Family',
        avatarUrl: memberForm.avatarUrl,
        documents: []
      };
      setMembers([...members, newMember]);
    }
    setIsMemberModalOpen(false);
    setMemberForm({ type: 'Family' });
  };

  const addDoctor = () => {
    if (!doctorForm.name) return;
    if (doctorForm.id) {
      setDoctors(doctors.map(d => d.id === doctorForm.id ? { ...d, ...doctorForm } as MedicalDoctor : d));
    } else {
      const newDoc: MedicalDoctor = {
        id: `d-${Date.now()}`,
        name: doctorForm.name || '',
        specialty: doctorForm.specialty || '',
        clinic: doctorForm.clinic || '',
        phone: doctorForm.phone || '',
        email: doctorForm.email || '',
        avatarUrl: doctorForm.avatarUrl,
        calendarUrl: doctorForm.calendarUrl,
        assignedMemberId: doctorForm.assignedMemberId
      };
      setDoctors([...doctors, newDoc]);
    }
    setIsDoctorModalOpen(false);
    setDoctorForm({});
  };

  const runNeuralVitalCheck = async (newLog: VitalLog) => {
    setIsAiAnalyzing(true);
    const member = members.find(m => m.id === newLog.memberId);
    const history = vitals.filter(v => v.memberId === newLog.memberId).slice(-5);
    
    if (history.length < 1) {
      setIsAiAnalyzing(false);
      return;
    }

    const baseline = history[0];
    const metricsToCheck = ['heartRate', 'weight', 'glucose'] as const;
    let alertFound = false;

    for (const metric of metricsToCheck) {
      const baseVal = (baseline as any)[metric] || 0;
      const newVal = (newLog as any)[metric] || 0;
      if (baseVal === 0) continue;
      
      const delta = Math.abs((newVal - baseVal) / baseVal) * 100;
      
      if (delta >= alertThreshold) {
        alertFound = true;
        const primaryDoc = doctors[0]; // Assuming first doc is primary for mock
        
        setLastAlert({ metric, delta: Math.round(delta), doctor: primaryDoc.name });
        
        // Notify Architect AI
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `URGENT MEDICAL ALERT. Patient ${member?.name} has a ${metric} deviation of ${delta.toFixed(1)}%. 
          Baseline: ${baseVal}, New Value: ${newVal}. 
          Actions:
          1. Send Emergency Notification Email to ${primaryDoc.email}.
          2. Initiate Autonomous VoIP Handshake to ${primaryDoc.phone}.
          3. Schedule Online Consultation at ${primaryDoc.clinic} for the earliest availability.
          
          Generate a formal clinical alert summary for the physician dashboard.`
        });

        alert(`🚨 NEURAL ALERT: patient ${member?.name} exhibits a critical ${metric} shift of ${delta.toFixed(1)}%.
        
AI ASSISTANT ACTIONS INITIATED:
✓ Dispatching Clinical Alert to ${primaryDoc.email}
✓ Activating Voice Outreach to ${primaryDoc.clinic}
✓ Auto-Scheduling Appointment in Clinical Calendar`);
        break;
      }
    }
    setIsAiAnalyzing(false);
  };

  const addVital = () => {
    if (!selectedMemberId) return;
    const newLog: VitalLog = {
      id: `v-${Date.now()}`,
      memberId: selectedMemberId,
      timestamp: new Date().toISOString(),
      heartRate: Number(vitalForm.heartRate) || 0,
      bloodPressure: vitalForm.bloodPressure || '120/80',
      glucose: Number(vitalForm.glucose) || 0,
      weight: Number(vitalForm.weight) || 0,
      height: Number(vitalForm.height) || 0,
      temperature: Number(vitalForm.temperature) || 98.6,
      respiratoryRate: Number(vitalForm.respiratoryRate) || 0,
      hrv: Number(vitalForm.hrv) || 0,
      spo2: Number(vitalForm.spo2) || 0,
      bodyFat: Number(vitalForm.bodyFat) || 0,
      muscleMass: Number(vitalForm.muscleMass) || 0,
      boneMass: Number(vitalForm.boneMass) || 0,
      bodyWater: Number(vitalForm.bodyWater) || 0,
      visceralFat: Number(vitalForm.visceralFat) || 0,
      caloricIntake: Number(vitalForm.caloricIntake) || 0,
      proteinIntake: Number(vitalForm.proteinIntake) || 0,
      carbIntake: Number(vitalForm.carbIntake) || 0,
      fatIntake: Number(vitalForm.fatIntake) || 0,
      bmr: Number(vitalForm.bmr) || 0,
      strengthLevel: Number(vitalForm.strengthLevel) || 0,
      enduranceLevel: Number(vitalForm.enduranceLevel) || 0
    };
    setVitals([...vitals, newLog]);
    runNeuralVitalCheck(newLog);
    setIsHealthRecordModalOpen(false);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedMemberId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: MedicalDocument = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: file.type,
          url: reader.result as string,
          date: new Date().toLocaleDateString(),
          isEncrypted: true
        };
        setMembers(prev => prev.map(m => m.id === selectedMemberId ? { ...m, documents: [...(m.documents || []), newDoc] } : m));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateShareLink = () => {
    const memberName = members.find(m => m.id === selectedMemberId)?.name || 'Patient';
    const mockUrl = `https://omniportal.app/health-sync/${selectedMemberId || 'global'}?key=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(mockUrl);
    alert(`Secure Handshake Link generated for ${memberName}. Professionals can now access the intake interface.`);
  };

  const handleMemberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMemberForm({ ...memberForm, avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleDoctorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDoctorForm({ ...doctorForm, avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const filteredVitals = useMemo(() => {
    let logs = vitals.filter(v => !selectedMemberId || v.memberId === selectedMemberId);
    logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (timeRange === '1W') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      logs = logs.filter(v => new Date(v.timestamp).getTime() >= weekAgo.getTime());
    } else if (timeRange === '1M') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      logs = logs.filter(v => new Date(v.timestamp).getTime() >= monthAgo.getTime());
    }
    return logs;
  }, [vitals, selectedMemberId, timeRange]);

  const toggleMetric = (key: string) => {
    const next = new Set(visibleMetrics);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVisibleMetrics(next);
  };

  const formatMetricValue = (val: any) => {
    if (val === undefined || val === null) return '--';
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  };

  const renderMatrixGraph = () => {
    if (filteredVitals.length < 2) return (
      <div className="h-[450px] flex flex-col items-center justify-center border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[4rem] opacity-20">
         <span className="text-8xl">📊</span>
         <p className="text-xl font-black uppercase tracking-[0.4em] mt-4 text-slate-500 dark:text-slate-400">Telemetry Feed Offline</p>
         <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Initialize biometric stream to populate matrix</p>
      </div>
    );

    const width = 1000;
    const height = 450;
    const padding = 60;
    
    const timePoints = filteredVitals.map(v => new Date(v.timestamp).getTime());
    const minTime = Math.min(...timePoints);
    const maxTime = Math.max(...timePoints);
    const timeRangeMs = (maxTime - minTime) || 1;

    return (
      <div className="bg-white dark:bg-[#1e293b] p-12 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-2xl space-y-10 relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <span className="text-[200px]">📈</span>
        </div>
        
        <div className="flex justify-between items-end relative z-10 px-4">
           <div className="space-y-1">
              <h3 className="text-4xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">Health Spectrum Analysis</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Unified Neural Biometrics // Synchronized Temporal Stream</p>
           </div>
           <div className="flex items-center space-x-4">
              <button 
                onClick={generateShareLink}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg flex items-center space-x-2"
              >
                <span>🔗</span> <span>Professional Share</span>
              </button>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl shadow-inner border border-slate-200/50 dark:border-white/10">
                {(['1W', '1M', 'ALL'] as TimeRange[]).map(r => (
                  <button 
                    key={r} 
                    onClick={() => setTimeRange(r)}
                    className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-white dark:bg-indigo-600 shadow-lg text-indigo-600 dark:text-white scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    {r === '1W' ? '7 Days' : r === '1M' ? '30 Days' : 'Full Horizon'}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="relative h-[450px] w-full mt-4">
           <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
             {[0, 0.25, 0.5, 0.75, 1].map(lvl => (
               <line 
                 key={lvl} x1={padding} y1={padding + (height - 2 * padding) * lvl} 
                 x2={width - padding} y2={padding + (height - 2 * padding) * lvl} 
                 stroke="#f1f5f9" className="dark:stroke-white/5" strokeWidth="2" strokeDasharray="4 4"
               />
             ))}
             
             {Array.from(visibleMetrics).map(key => {
               const config = METRIC_CONFIG[key];
               if (!config) return null;

               const points = filteredVitals.map((v) => {
                 const x = padding + ((new Date(v.timestamp).getTime() - minTime) / timeRangeMs) * (width - 2 * padding);
                 const val = (v as any)[key] || 0;
                 const y = height - padding - ((val / config.max) * (height - 2 * padding));
                 return `${x},${y}`;
               }).join(' ');

               return (
                 <polyline 
                   key={key} fill="none" stroke={config.color} strokeWidth="5" 
                   strokeLinecap="round" strokeLinejoin="round" points={points} 
                   className="animate-dash" 
                 />
               );
             })}
           </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-10 border-t border-slate-50 dark:border-white/5 relative z-10">
           {/* Neural Threshold Monitor */}
           <div className="md:col-span-4 bg-slate-900 dark:bg-black p-8 text-white space-y-6 shadow-xl rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute inset-0 pattern-grid opacity-5"></div>
              <div className="relative flex items-center space-x-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:rotate-6 transition-transform">🧠</div>
                 <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Neural Protocol</p>
                    <h4 className="text-sm font-black uppercase tracking-tight mt-1">Threshold Monitor</h4>
                 </div>
              </div>
              <div className="relative space-y-3">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">Deviation Cap</span>
                    <span className="text-xl font-black text-indigo-400">{alertThreshold}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="5" 
                    value={alertThreshold} 
                    onChange={e => setAlertThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500" 
                 />
                 <p className="text-[8px] text-slate-500 font-medium leading-relaxed italic pr-4">"If Weight, BP, or Glucose shifts more than {alertThreshold}%, Gemini will autonomousley signal the medical network and initiate scheduling protocols."</p>
              </div>
              <button 
                onClick={() => alert(`Threshold confirmed at ${alertThreshold}%. Neural watchdog active.`)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
              >
                Confirm Parameters
              </button>
           </div>

           {/* Metrics Legend */}
           <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(METRIC_CONFIG).map(([key, cfg]) => {
                const isActive = visibleMetrics.has(key);
                const lastVal = filteredVitals[filteredVitals.length - 1] ? (filteredVitals[filteredVitals.length - 1] as any)[key] : undefined;
                return (
                  <button 
                      key={key} 
                      onClick={() => toggleMetric(key)}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-start space-y-2 group ${isActive ? 'bg-white dark:bg-slate-800 shadow-xl scale-105 border-slate-200 dark:border-indigo-500/30' : 'bg-slate-50 dark:bg-black/20 border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                  >
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cfg.color }}></div>
                        <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-tighter truncate w-16">{cfg.label}</span>
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {formatMetricValue(lastVal)} 
                        <span className="text-[8px] opacity-30 uppercase font-bold ml-1">{cfg.unit}</span>
                      </p>
                  </button>
                );
              })}
           </div>
        </div>
      </div>
    );
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8faff] dark:bg-[#0c0e12] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 shrink-0 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center space-x-6">
           <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-rose-200 dark:shadow-rose-900/20 text-white group hover:rotate-6 transition-transform">🏥</div>
           <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Medical Hub</h2>
              <div className="flex items-center space-x-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Health Intelligence Core</span>
              </div>
           </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-inner">
           {(['family', 'relatives', 'doctors', 'forms', 'graphs'] as MedicalTab[]).map(tab => (
             <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); if (tab !== 'forms' && tab !== 'graphs') setSelectedMemberId(null); }} 
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-indigo-600 shadow-lg text-rose-600 dark:text-white scale-105' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}
             >
                {tab === 'family' ? '👨‍👩‍👧 Family' : tab === 'relatives' ? '👥 Relatives' : tab === 'doctors' ? '🩺 Doctors' : tab === 'forms' ? '📝 Intake' : '📈 Spectrum'}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 pattern-grid-light dark:pattern-grid-dark relative scrollbar-hide bg-slate-50/30 dark:bg-transparent">
         <div className="max-w-7xl mx-auto space-y-12 pb-40">
            
            {(activeTab === 'family' || activeTab === 'relatives') && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-end px-4">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{activeTab === 'family' ? 'Family Registry' : 'Relative Registry'}</h3>
                       <p className="text-slate-500 dark:text-slate-400 font-medium italic">Synchronized health profiles for active members.</p>
                    </div>
                    <button 
                      onClick={() => { setMemberForm({ type: activeTab === 'family' ? 'Family' : 'Relative' }); setIsMemberModalOpen(true); }}
                      className="px-8 py-3.5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black dark:hover:bg-slate-200 active:scale-95 transition-all"
                    >
                      + Add Member
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {members.filter(m => m.type === (activeTab === 'family' ? 'Family' : 'Relative')).map(member => (
                      <div key={member.id} className="bg-white dark:bg-[#1e293b] rounded-[3.5rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm hover:shadow-2xl transition-all group relative flex flex-col space-y-8">
                         <div className="flex justify-between items-start">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform overflow-hidden relative border border-white/50 dark:border-white/5">
                               {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : <span className="opacity-30">👤</span>}
                            </div>
                            <div className="flex flex-col items-end">
                               <button 
                                 onClick={() => { setMemberForm(member); setIsMemberModalOpen(true); }}
                                 className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-rose-600 hover:text-white transition-all mb-4 shadow-sm"
                               >
                                  ✎
                               </button>
                               <span className="text-[9px] font-black bg-slate-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest text-slate-500 dark:text-indigo-400 mb-1">{member.relationship}</span>
                               <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Born: {member.birthDate}</span>
                            </div>
                         </div>
                         <div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{member.name}</h4>
                            <div className="space-y-1 mt-2">
                               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
                                  <span className="w-3.5 h-3.5 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mr-2 text-[8px]">📧</span>
                                  {member.email}
                               </p>
                               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
                                  <span className="w-3.5 h-3.5 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mr-2 text-[8px]">📞</span>
                                  {member.phone}
                               </p>
                            </div>
                         </div>
                         <div className="flex-1 bg-slate-50 dark:bg-black/20 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 overflow-hidden shadow-inner">
                            <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-3 flex justify-between">
                               <span>Clinical Narrative</span>
                               <span className="text-rose-500 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>SYNCED</span>
                            </p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-3">"{member.healthRecords || 'No specific clinical notes established.'}"</p>
                         </div>
                         <div className="flex space-x-3">
                            <button 
                               onClick={() => { setSelectedMemberId(member.id); setActiveRecordTab('Biometrics'); setIsHealthRecordModalOpen(true); }}
                               className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:bg-rose-700 transition-all active:scale-95"
                            >
                               Biometrics
                            </button>
                            <button 
                               onClick={() => { setSelectedMemberId(member.id); setActiveRecordTab('Vault'); setIsHealthRecordModalOpen(true); }}
                               className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                            >
                               Vault
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'doctors' && (
              <div className="space-y-10 animate-in fade-in">
                 <div className="flex justify-between items-end px-4">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Medical Network</h3>
                       <p className="text-slate-500 dark:text-slate-400 font-medium italic">Verified healthcare providers linked to your hub.</p>
                    </div>
                    <button 
                       onClick={() => { setDoctorForm({}); setIsDoctorModalOpen(true); }}
                       className="px-8 py-3.5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black dark:hover:bg-slate-200 transition-all"
                    >
                       + Link Provider
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {doctors.map(doc => (
                      <div key={doc.id} className="bg-white dark:bg-[#1e293b] rounded-[3.5rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm hover:shadow-2xl transition-all group flex items-start space-x-10 relative">
                         <button 
                            onClick={() => { setDoctorForm(doc); setIsDoctorModalOpen(true); }}
                            className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                         >
                            ✎
                         </button>
                         <div className="w-24 h-24 bg-rose-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform overflow-hidden border border-white/50 dark:border-white/5 relative shrink-0">
                            {doc.avatarUrl ? <img src={doc.avatarUrl} className="w-full h-full object-cover" /> : <span className="opacity-30">🩺</span>}
                            {lastAlert && (
                              <div className="absolute inset-0 bg-rose-600/20 flex items-center justify-center animate-pulse">
                                 <span className="text-xs font-black text-white bg-rose-600 px-2 py-1 rounded shadow-lg">ALERT</span>
                              </div>
                            )}
                         </div>
                         <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                               <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{doc.name}</h4>
                               <div className="flex flex-wrap gap-2">
                                  <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100 dark:border-rose-500/20">{doc.specialty}</span>
                                  {doc.assignedMemberId && (
                                    <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 flex items-center">
                                      <span className="w-1 h-1 rounded-full bg-indigo-500 mr-2"></span>
                                      For: {members.find(m => m.id === doc.assignedMemberId)?.name || 'Member'}
                                    </span>
                                  )}
                                  {lastAlert && (
                                     <span className="text-[8px] font-black text-rose-500 animate-bounce">URGENT ACTION</span>
                                  )}
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-white/5 pt-4">
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Clinic</p>
                                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{doc.clinic}</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contact</p>
                                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{doc.phone}</p>
                                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate">{doc.email}</p>
                               </div>
                            </div>
                            <div className="flex space-x-3 pt-2">
                               {doc.calendarUrl && (
                                 <a href={doc.calendarUrl} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-900/10 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2">
                                   <span>🗓️</span> <span>Book Online</span>
                                 </a>
                               )}
                               <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-300 dark:text-slate-600">
                                  <Icons.Message className="w-5 h-5" />
                                </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'forms' && (
              <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-4">
                 <div className="bg-white dark:bg-[#1e293b] rounded-[4rem] p-16 shadow-2xl border border-slate-200 dark:border-white/5 space-y-12 relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                       <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl text-white">📝</div>
                          <div>
                             <h3 className="text-3xl font-black uppercase tracking-tight dark:text-white">Professional Intake</h3>
                             <p className="text-slate-500 dark:text-slate-400 font-medium italic">Capture verified biometric observations.</p>
                          </div>
                       </div>
                       <button 
                         onClick={generateShareLink}
                         className="px-8 py-3 bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                       >
                         🔗 Share Handshake Link
                       </button>
                    </div>

                    <div className="grid grid-cols-1 gap-12 relative z-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Identity Hub Selection</label>
                          <select 
                            className="w-full bg-slate-50 dark:bg-black/20 border-2 border-transparent focus:bg-white dark:focus:bg-black/40 focus:border-rose-500 p-6 rounded-3xl font-black text-lg outline-none transition-all shadow-inner dark:text-white appearance-none cursor-pointer"
                            value={selectedMemberId || ''}
                            onChange={e => setSelectedMemberId(e.target.value)}
                          >
                             <option value="">Select Identity...</option>
                             {members.map(m => <option key={m.id} value={m.id} className="dark:bg-[#1e293b]">{m.name} ({m.relationship})</option>)}
                          </select>
                       </div>

                       {selectedMemberId && (
                         <div className="space-y-10 animate-in zoom-in-95">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Heart Rate (BPM)</label>
                                  <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.heartRate} onChange={e => setVitalForm({...vitalForm, heartRate: Number(e.target.value)})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Blood Pressure</label>
                                  <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" placeholder="120/80" value={vitalForm.bloodPressure} onChange={e => setVitalForm({...vitalForm, bloodPressure: e.target.value})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Glucose (mg/dL)</label>
                                  <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.glucose} onChange={e => setVitalForm({...vitalForm, glucose: Number(e.target.value)})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Weight (lbs)</label>
                                  <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.weight} onChange={e => setVitalForm({...vitalForm, weight: Number(e.target.value)})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Temp (°F)</label>
                                  <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.temperature} onChange={e => setVitalForm({...vitalForm, temperature: Number(e.target.value)})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">SpO2 (%)</label>
                                  <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.spo2} onChange={e => setVitalForm({...vitalForm, spo2: Number(e.target.value)})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">HRV (ms)</label>
                                  <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.hrv} onChange={e => setVitalForm({...vitalForm, hrv: Number(e.target.value)})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Resp Rate</label>
                                  <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 dark:text-white" value={vitalForm.respiratoryRate} onChange={e => setVitalForm({...vitalForm, respiratoryRate: Number(e.target.value)})} />
                               </div>
                            </div>
                            <button 
                               onClick={addVital}
                               disabled={isAiAnalyzing}
                               className="w-full py-8 bg-rose-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center space-x-4"
                            >
                               {isAiAnalyzing ? (
                                 <>
                                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                   <span>Neural Vital Scan...</span>
                                 </>
                               ) : (
                                 <span>Commit Telemetry to Member Matrix</span>
                               )}
                            </button>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'graphs' && (
              <div className="space-y-12 animate-in zoom-in-95">
                 <div className="flex justify-between items-center px-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Neural Spectrum</h3>
                      <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Multi-Metric Biometric Visualization</p>
                    </div>
                    <select 
                      className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer hover:border-rose-400 dark:text-white"
                      value={selectedMemberId || ''}
                      onChange={e => setSelectedMemberId(e.target.value)}
                    >
                       <option value="">Consolidated View</option>
                       {members.map(m => <option key={m.id} value={m.id} className="dark:bg-[#1e293b]">{m.name}</option>)}
                    </select>
                 </div>

                 {renderMatrixGraph()}

                 <div className="bg-slate-900 dark:bg-black rounded-[4rem] p-16 text-white flex justify-between items-center relative overflow-hidden shadow-2xl border dark:border-white/5">
                    <div className="absolute inset-0 pattern-grid opacity-5"></div>
                    <div className="relative space-y-6">
                       <div className="inline-flex items-center px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Sheet Sync v4.2 Active</span>
                       </div>
                       <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Automated Clinical Archival</h3>
                       <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed italic">"Every biometric signal is mirrored to your HIPAA-compliant vault for longitudinal analysis and professional consultation."</p>
                       <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all active:scale-95 transform">Synchronize Global Matrix</button>
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>

      {isMemberModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in" onClick={() => setIsMemberModalOpen(false)}>
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[4rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-12 border-b border-slate-50 dark:border-white/5 bg-rose-50/30 dark:bg-rose-900/10 flex justify-between items-center">
                 <div className="flex items-center space-x-6">
                    <div 
                      onClick={() => memberImageRef.current?.click()}
                      className="w-20 h-20 bg-rose-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-2xl cursor-pointer overflow-hidden group/modal-img relative ring-4 ring-white dark:ring-slate-800"
                    >
                       {memberForm.avatarUrl ? <img src={memberForm.avatarUrl} className="w-full h-full object-cover" /> : <span>👤</span>}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/modal-img:opacity-100 flex items-center justify-center transition-all">
                          <span className="text-[8px] font-black text-white uppercase tracking-tighter">Avatar</span>
                       </div>
                    </div>
                    <input type="file" ref={memberImageRef} className="hidden" accept="image/*" onChange={handleMemberImageUpload} />
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{memberForm.id ? 'Edit Profile' : 'New Identity'}</h3>
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2">Member Registry Node</p>
                    </div>
                 </div>
                 <button onClick={() => setIsMemberModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all">✕</button>
              </div>
              <div className="p-12 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Display Name</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" value={memberForm.name || ''} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Relationship</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="e.g. Daughter" value={memberForm.relationship || ''} onChange={e => setMemberForm({...memberForm, relationship: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Email Address</label>
                       <input type="email" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="email@address.com" value={memberForm.email || ''} onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Phone Number</label>
                       <input type="tel" className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="555-0100" value={memberForm.phone || ''} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Clinical Narrative (Notes)</label>
                    <textarea className="w-full bg-slate-50 dark:bg-black/20 p-6 rounded-[2rem] font-medium text-sm h-32 outline-none shadow-inner border border-transparent focus:border-rose-300 resize-none leading-relaxed text-slate-700 dark:text-slate-300" placeholder="Allergies, blood type, history..." value={memberForm.healthRecords || ''} onChange={e => setMemberForm({...memberForm, healthRecords: e.target.value})} />
                 </div>
                 <button onClick={addMember} className="w-full py-6 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-[10px] shadow-2xl hover:bg-rose-600 transition-all active:scale-95 transform">
                    {memberForm.id ? 'Save Node Updates' : 'Sync Identity'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in" onClick={() => setIsDoctorModalOpen(false)}>
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[4rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-12 border-b border-slate-50 dark:border-white/5 bg-rose-50/30 dark:bg-rose-900/10 flex justify-between items-center">
                 <div className="flex items-center space-x-6">
                    <div 
                      onClick={() => doctorImageRef.current?.click()}
                      className="w-20 h-20 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-2xl cursor-pointer overflow-hidden group/modal-img relative ring-4 ring-white dark:ring-slate-700"
                    >
                       {doctorForm.avatarUrl ? <img src={doctorForm.avatarUrl} className="w-full h-full object-cover" /> : <span>🩺</span>}
                    </div>
                    <input type="file" ref={doctorImageRef} className="hidden" accept="image/*" onChange={handleDoctorImageUpload} />
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{doctorForm.id ? 'Edit Provider' : 'Link Provider'}</h3>
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2">Verified Professional</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDoctorModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all">✕</button>
              </div>
              <div className="p-12 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Provider Name</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="Dr. Sarah Smith" value={doctorForm.name || ''} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Specialty</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="e.g. Cardiology" value={doctorForm.specialty || ''} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Clinic Entity</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="City General" value={doctorForm.clinic || ''} onChange={e => setDoctorForm({...doctorForm, clinic: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Assign to Member</label>
                       <select 
                         className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none shadow-inner appearance-none cursor-pointer"
                         value={doctorForm.assignedMemberId || ''}
                         onChange={e => setDoctorForm({...doctorForm, assignedMemberId: e.target.value})}
                       >
                          <option value="" className="dark:bg-[#1e293b]">No Assignment</option>
                          {members.map(m => <option key={m.id} value={m.id} className="dark:bg-[#1e293b]">{m.name} ({m.relationship})</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Phone</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="555-0100" value={doctorForm.phone || ''} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Email</label>
                       <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="dr@clinic.com" value={doctorForm.email || ''} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Public Calendar / Booking URL</label>
                    <input className="w-full bg-slate-50 dark:bg-black/20 p-5 rounded-2xl font-black outline-none shadow-inner border border-transparent focus:border-rose-300 text-slate-900 dark:text-white" placeholder="https://..." value={doctorForm.calendarUrl || ''} onChange={e => setDoctorForm({...doctorForm, calendarUrl: e.target.value})} />
                 </div>
                 <button onClick={addDoctor} className="w-full py-6 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-rose-600 transition-all active:scale-95 transform">
                    {doctorForm.id ? 'Save Clinical Profile' : 'Anchor to Hub'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {isHealthRecordModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in" onClick={() => setIsHealthRecordModalOpen(false)}>
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-5xl rounded-[4rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-10 border-b border-slate-50 dark:border-white/5 bg-rose-50/30 dark:bg-rose-900/10 flex justify-between items-center">
                 <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-2xl">📈</div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Health Spectrum</h3>
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2">{selectedMember?.name} // Secured Node</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <button 
                      onClick={generateShareLink}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center space-x-2"
                    >
                      <span>🚀</span> <span>Professional Access</span>
                    </button>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl shadow-inner border border-slate-200/50 dark:border-white/10">
                        {(['Biometrics', 'Vault'] as RecordTab[]).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveRecordTab(tab)}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeRecordTab === tab ? 'bg-white dark:bg-indigo-600 shadow-lg text-rose-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}
                        >
                            {tab === 'Biometrics' ? '📊 Matrix' : '🔐 Vault'}
                        </button>
                        ))}
                    </div>
                    <button onClick={() => setIsHealthRecordModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-all">✕</button>
                 </div>
              </div>

              <div className="p-10 max-h-[75vh] overflow-y-auto scrollbar-hide">
                {activeRecordTab === 'Biometrics' ? (
                  <div className="space-y-12 animate-in fade-in duration-300">
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest px-2 border-l-4 border-indigo-500 ml-1 pl-4">Core Vitals</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Heart Rate (BPM)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.heartRate} onChange={e => setVitalForm({...vitalForm, heartRate: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">BP (Sys/Dia)</label>
                              <input className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.bloodPressure} onChange={e => setVitalForm({...vitalForm, bloodPressure: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Glucose (mg/dL)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.glucose} onChange={e => setVitalForm({...vitalForm, glucose: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Weight (lbs)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.weight} onChange={e => setVitalForm({...vitalForm, weight: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Temp (°F)</label>
                              <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.temperature} onChange={e => setVitalForm({...vitalForm, temperature: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">SpO2 (%)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.spo2} onChange={e => setVitalForm({...vitalForm, spo2: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">HRV (ms)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.hrv} onChange={e => setVitalForm({...vitalForm, hrv: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Resp Rate</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.respiratoryRate} onChange={e => setVitalForm({...vitalForm, respiratoryRate: Number(e.target.value)})} />
                          </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 tracking-widest px-2 border-l-4 border-rose-500 ml-1 pl-4">Body Composition</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Body Fat (%)</label>
                              <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.bodyFat} onChange={e => setVitalForm({...vitalForm, bodyFat: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Muscle Mass (lbs)</label>
                              <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.muscleMass} onChange={e => setVitalForm({...vitalForm, muscleMass: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Bone Mass (lbs)</label>
                              <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.boneMass} onChange={e => setVitalForm({...vitalForm, boneMass: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Body Water (%)</label>
                              <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.bodyWater} onChange={e => setVitalForm({...vitalForm, bodyWater: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Visceral Fat</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.visceralFat} onChange={e => setVitalForm({...vitalForm, visceralFat: Number(e.target.value)})} />
                          </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest px-2 border-l-4 border-emerald-500 ml-1 pl-4">Nutrition & Performance</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Daily Calories</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.caloricIntake} onChange={e => setVitalForm({...vitalForm, caloricIntake: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Protein (g)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.proteinIntake} onChange={e => setVitalForm({...vitalForm, proteinIntake: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Carbs (g)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.carbIntake} onChange={e => setVitalForm({...vitalForm, carbIntake: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Fats (g)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.fatIntake} onChange={e => setVitalForm({...vitalForm, fatIntake: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Strength (1-100)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.strengthLevel} onChange={e => setVitalForm({...vitalForm, strengthLevel: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Endurance (1-100)</label>
                              <input type="number" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-xl font-black outline-none shadow-inner text-slate-900 dark:text-white" value={vitalForm.enduranceLevel} onChange={e => setVitalForm({...vitalForm, enduranceLevel: Number(e.target.value)})} />
                          </div>
                        </div>
                    </div>

                    <button onClick={addVital} className="w-full py-8 bg-rose-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-rose-700 active:scale-95 transition-all mt-4">Commit Neural Biometric Data</button>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                       <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">Secure Asset Vault</h4>
                          <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">End-to-End Encrypted Records</p>
                       </div>
                       <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => docUploadRef.current?.click()}
                            className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                          >
                            + Secure Upload
                          </button>
                          <input type="file" ref={docUploadRef} className="hidden" onChange={handleDocumentUpload} />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                       {selectedMember?.documents?.map(doc => (
                         <div key={doc.id} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-white dark:hover:bg-[#1e293b] hover:shadow-xl transition-all group">
                            <div className="flex items-center space-x-6">
                               <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                  {doc.type.includes('image') ? '🖼️' : doc.type.includes('pdf') ? '📕' : '📄'}
                               </div>
                               <div>
                                  <h5 className="text-sm font-black text-slate-800 dark:text-white truncate max-w-[150px] uppercase tracking-tight">{doc.name}</h5>
                                  <div className="flex items-center space-x-2 mt-1">
                                     <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{doc.date}</span>
                                     {doc.isEncrypted && (
                                       <span className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                          <span className="mr-1">🔒</span> Encrypted
                                       </span>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm">📥</button>
                               <button 
                                 onClick={() => setMembers(prev => prev.map(m => m.id === selectedMemberId ? { ...m, documents: m.documents?.filter(d => d.id !== doc.id) } : m))}
                                 className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-sm"
                               >
                                  🗑️
                               </button>
                            </div>
                         </div>
                       ))}
                       {(!selectedMember?.documents || selectedMember.documents.length === 0) && (
                         <div className="col-span-full py-40 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[4rem] flex flex-col items-center justify-center opacity-20">
                            <span className="text-6xl mb-4">🔐</span>
                            <p className="text-xl font-black uppercase tracking-widest dark:text-white">Vault Empty</p>
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default MedicalHub;
