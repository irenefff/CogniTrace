import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardStore } from "~lib/store";
import { Analyzer } from "~lib/analyzer";
import { db } from "~lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { generateCertificate } from "~lib/pdf/generator";
import { ReplayViewer } from "~features/replay/viewer";
import { Download, FileCheck } from "lucide-react";
import "~style/main.css";

const COLORS = ['#0088FE', '#FF8042'];

function SidePanel() {
  const { analysis, setAnalysis } = useDashboardStore();
  const [currentTabTitle, setCurrentTabTitle] = useState("Loading...");
  
  // Direct DB access for debugging/reliability
  const sessions = useLiveQuery(() => db.sessions.orderBy('startTime').reverse().toArray());
  
  // Logic to find the RELEVANT session
  // 1. If we can match by URL, that's best.
  // 2. Otherwise, look for the most recent session that actually has events.
  const activeSession = sessions && sessions.length > 0 
    ? sessions.sort((a, b) => b.startTime - a.startTime)[0] // Start with newest
    : null;
    
  // More robust active session finding logic could be:
  // const activeSession = sessions?.find(s => s.url === currentTabUrl) || sessions?.[0];
    
  const events = useLiveQuery(
    async () => {
        if (!activeSession) return [];
        return await db.events.where('sessionId').equals(activeSession.id).sortBy('timestamp');
    },
    [activeSession?.id]
  );
  
  // Log for debugging
  useEffect(() => {
      console.log("SidePanel Direct DB: Sessions:", sessions);
      console.log("SidePanel Direct DB: Active Session:", activeSession);
      console.log("SidePanel Direct DB: Events:", events?.length);
  }, [sessions, activeSession, events]);

  useEffect(() => {
    // ALWAYS run analysis if we have an active session, even if events are 0 (to show initial state)
    if (activeSession) {
      const eventList = events || [];
      const analyzer = new Analyzer(eventList);
      const result = analyzer.analyze();
      
      // Manually override integrity score if no events yet
      if (eventList.length === 0) {
          result.integrityScore = 100;
          result.sourceBreakdown = { original: 100, pasted: 0 };
      }
      
      setAnalysis(result);
    }
  }, [events, activeSession]);
  
  useEffect(() => {
      // Get current tab title
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.title) setCurrentTabTitle(tabs[0].title);
      });
  }, []);

  const handleExport = async () => {
      if (analysis) {
          await generateCertificate(analysis, currentTabTitle);
      }
  };

  if (!analysis || !events) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 p-4">
            <div className="mb-4 text-xl font-bold">Waiting for data... (v2.1 Debug)</div>
            <div className="text-xs font-mono bg-gray-200 p-2 rounded text-left w-full overflow-auto max-h-60 border border-blue-500">
                <div className="font-bold text-blue-600">DEBUG DIAGNOSTICS:</div>
                <div>Session Count: {sessions ? sessions.length : 'Loading...'}</div>
                <div>Active Session ID: {activeSession ? activeSession.id : 'None'}</div>
                <div>Events Loaded: {events ? events.length : 'null'}</div>
                <div>Analysis Ready: {analysis ? 'Yes' : 'No'}</div>
                <div>Current Tab: {currentTabTitle}</div>
                <div>Last Update: {new Date().toLocaleTimeString()}</div>
                
                {sessions && sessions.length === 0 && (
                    <div className="mt-2 text-red-500">
                        No sessions found in DB. 
                        <br/>1. Check if Content Script is loaded.
                        <br/>2. Type something in the page.
                        <br/>3. Check Background console for errors.
                    </div>
                )}
            </div>
        </div>
    );
  }

  const chartData = [
    { name: 'Original', value: analysis.sourceBreakdown.original },
    { name: 'Pasted', value: analysis.sourceBreakdown.pasted },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="p-4 bg-white shadow-sm border-b sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            CogniTrace
        </h1>
        <button 
            onClick={handleExport}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Export Certificate"
        >
            <Download size={20} />
        </button>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Integrity Score Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-4xl font-black text-slate-800 mb-1">{analysis.integrityScore}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Integrity Score</div>
          </div>
          <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
            style={{ width: `${analysis.integrityScore}%` }}
          />
        </div>
        
        {/* Replay Viewer */}
        <ReplayViewer events={events} />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-lg font-bold text-slate-700">
                {Math.round(analysis.activeTime / 1000 / 60)}m
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Active Time</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-lg font-bold text-slate-700">
                {analysis.pasteCount}
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Pastes Detected</div>
          </div>
        </div>

        {/* Source Breakdown Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Source Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-[-20px] relative z-10">
             <div className="flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-[#0088FE]"></span> Original
             </div>
             <div className="flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-[#FF8042]"></span> Pasted
             </div>
          </div>
        </div>
        
        {/* Entropy Debug Info (Optional) */}
        <div className="text-xs text-gray-300 text-center font-mono">
            Entropy: {analysis.entropy.toFixed(2)} bits
        </div>

      </main>
    </div>
  );
}

export default SidePanel;
