import React, { useRef } from 'react';
import { StudentData, GlobalSettings, MockSeriesRecord } from '../../types';
import EditableField from '../shared/EditableField';

interface SeriesBroadSheetProps {
  students: StudentData[];
  settings: GlobalSettings;
  onSettingChange: (key: keyof GlobalSettings, value: any) => void;
  currentProcessed: { id: number; aggregate: number; rank: number; totalScore: number; category: string }[];
}

const SeriesBroadSheet: React.FC<SeriesBroadSheetProps> = ({ students, settings, onSettingChange, currentProcessed }) => {
  const mockSeriesNames = settings.committedMocks || [];
  const subjectCount = 10;
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onSettingChange('schoolLogo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getAggGrade = (agg: number) => {
    if (agg <= 10) return { label: 'EXC', color: 'text-emerald-600', weight: 4 };
    if (agg <= 20) return { label: 'HIGH', color: 'text-blue-600', weight: 3 };
    if (agg <= 36) return { label: 'PASS', color: 'text-orange-600', weight: 2 };
    return { label: 'REM', color: 'text-red-600', weight: 1 };
  };

  const LogoArea = () => (
    <div 
      className="w-24 h-24 relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-blue-50 transition-all no-print mx-auto mb-4"
      onClick={() => logoInputRef.current?.click()}
    >
      {settings.schoolLogo ? (
        <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 12.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
          <span className="text-[7px] font-black text-gray-300 uppercase">Logo</span>
        </div>
      )}
      <div className="hidden print:block absolute inset-0">
        {settings.schoolLogo && <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-contain" />}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 print:p-0 min-h-screen max-w-full">
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
      
      <div className="text-center mb-10 space-y-2">
        <LogoArea />
        <h1 className="text-4xl font-black uppercase text-blue-950 tracking-tighter">
          <EditableField value={settings.schoolName} onChange={(v) => onSettingChange('schoolName', v)} className="text-center w-full" />
        </h1>
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">
          <EditableField value={settings.schoolAddress || "ACADEMY ADDRESS"} onChange={(v) => onSettingChange('schoolAddress', v)} className="text-center w-full" />
        </p>
        <div className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3 uppercase tracking-widest">
           Hub ID: <EditableField value={settings.schoolNumber} onChange={(v) => onSettingChange('schoolNumber', v)} />
        </div>
        <h2 className="text-lg font-black uppercase text-red-700 tracking-tight bg-red-50 py-1 border-y border-red-100 mb-4">
           <EditableField value={settings.examTitle} onChange={(v) => onSettingChange('examTitle', v)} className="text-center w-full" />
        </h2>
        <div className="bg-blue-900 text-white px-10 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl flex items-center gap-4 mx-auto w-fit">
           <span>Series Tracker Hub</span>
           <span>AY: <EditableField value={settings.academicYear} onChange={(v) => onSettingChange('academicYear', v)} /></span>
        </div>
      </div>

      <div className="shadow-2xl border border-gray-200 rounded-[2.5rem] bg-white overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar-horizontal scroll-smooth">
          <table className="w-full text-[10px] border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-blue-950 text-white uppercase text-[8px] tracking-widest">
                <th className="p-5 text-left border-r border-blue-900 sticky left-0 bg-blue-950 z-40">Candidate particulars</th>
                {mockSeriesNames.map((m) => (
                  <th key={m} className="p-3 border-r border-blue-900 text-center" colSpan={2}>{m}</th>
                ))}
                <th className="p-3 bg-red-700 text-center" colSpan={3}>Current Status</th>
              </tr>
              <tr className="bg-blue-50 text-blue-900 uppercase text-[7px] font-black border-b-2 border-blue-900">
                <th className="p-3 sticky left-0 bg-blue-50 z-40"></th>
                {mockSeriesNames.map((m) => (
                  <React.Fragment key={m + '-sub'}>
                    <th className="p-1.5 border-r border-blue-100 w-10 text-center">Agg</th>
                    <th className="p-1.5 border-r border-blue-100 w-12 text-center">Rank</th>
                  </React.Fragment>
                ))}
                <th className="p-1.5 border-r border-red-100 w-12 bg-red-50">Agg</th>
                <th className="p-1.5 border-r border-red-100 w-14 bg-red-50">Rank</th>
                <th className="p-1.5 bg-red-50">Level</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const live = currentProcessed.find(p => p.id === student.id);
                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                    <td className="p-4 font-black uppercase text-blue-900 sticky left-0 bg-white group-hover:bg-blue-50/50 z-30">{student.name}</td>
                    {mockSeriesNames.map((m) => {
                      const record = student.seriesHistory?.[m];
                      const gradeInfo = record ? getAggGrade(record.aggregate) : null;
                      return (
                        <React.Fragment key={m + student.id}>
                          <td className={`p-2 border-r border-gray-50 text-center font-mono font-bold ${gradeInfo?.color || 'text-gray-400'}`}>{record?.aggregate || '-'}</td>
                          <td className="p-2 border-r border-gray-50 text-center text-[9px] text-gray-400 italic">#{record?.rank || '-'}</td>
                        </React.Fragment>
                      );
                    })}
                    <td className="p-3 bg-red-50 text-center font-black text-red-700 text-sm border-r border-red-100">{live?.aggregate || '-'}</td>
                    <td className="p-3 bg-red-50 text-center font-mono text-xs text-red-600 border-r border-red-100">#{live?.rank || '-'}</td>
                    <td className="p-3 bg-red-50 text-center font-black text-[8px] uppercase text-red-800">{live?.category || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeriesBroadSheet;