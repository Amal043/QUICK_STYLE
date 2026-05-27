import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Cpu, ShieldAlert, CheckCircle, RefreshCw, Activity, ArrowRight, Zap, Play, Trash2 } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface LogLine {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'warn' | 'success' | 'error';
}

const mockSimulationSteps = [
  {
    agent: 'Intent Detector',
    message: '🔍 Parsing query: "Yellow dress for brunch under ₹2000, size M"',
    type: 'info',
    action: 'parse',
    details: { keywords: 'yellow dress, brunch', budget: 2000, size: 'M' }
  },
  {
    agent: 'Stylist Agent',
    message: '👗 Stylist Agent → Searching Elasticsearch. Filters: [max_price=2000, size=M]',
    type: 'info',
    action: 'search',
    details: { round: 1, excluded_brands: [] }
  },
  {
    agent: 'Stylist Agent',
    message: '👗 Stylist Agent → Proposed: Zara Yellow Floral Wrap Dress (Confidence: 89%)',
    type: 'success',
    action: 'propose',
    details: { product: 'Zara Yellow Floral Wrap Dress', brand: 'Zara', confidence: '89%' }
  },
  {
    agent: 'Anti-Return Agent',
    message: '📏 Anti-Return Agent → Checking database return logs for brand "Zara"...',
    type: 'info',
    action: 'check',
    details: { brand: 'Zara' }
  },
  {
    agent: 'Anti-Return Agent',
    message: '📏 Anti-Return Agent → OBJECTION: User returned Zara size M twice in the past 6 months (fit_issue: runs_small). Match score drops by 48%!',
    type: 'error',
    action: 'objection',
    details: { brand: 'Zara', penalty: '48%', adjusted: '41%' }
  },
  {
    agent: 'Supervisor Agent',
    message: '⚠️ Supervisor Agent → Conflict detected. Match confidence of 41% is below threshold (50%). Directing Stylist to find alternative.',
    type: 'warn',
    action: 'conflict',
    details: { round: 1 }
  },
  {
    agent: 'Stylist Agent',
    message: '👗 Stylist Agent → Searching Elasticsearch (Round 2). Excluded brands: ["Zara"]',
    type: 'info',
    action: 'search',
    details: { round: 2, excluded_brands: ['Zara'] }
  },
  {
    agent: 'Stylist Agent',
    message: '👗 Stylist Agent → Proposed: Fabindia Yellow Cotton Wrap Dress (Confidence: 85%)',
    type: 'success',
    action: 'propose',
    details: { product: 'Fabindia Yellow Cotton Wrap Dress', brand: 'Fabindia', confidence: '85%' }
  },
  {
    agent: 'Anti-Return Agent',
    message: '📏 Anti-Return Agent → Checking database return logs for brand "Fabindia"...',
    type: 'info',
    action: 'check',
    details: { brand: 'Fabindia' }
  },
  {
    agent: 'Anti-Return Agent',
    message: '📏 Anti-Return Agent → APPROVED: No return risk detected for Fabindia. Adjusted confidence: 85%',
    type: 'success',
    action: 'approve',
    details: { brand: 'Fabindia', adjusted: '85%' }
  },
  {
    agent: 'Supervisor Agent',
    message: '✅ Supervisor Agent → Negotiation complete. Final product approved: Fabindia Yellow Cotton Wrap Dress (Size M).',
    type: 'success',
    action: 'resolve',
    details: { product: 'Fabindia Yellow Cotton Wrap Dress', rounds: 2 }
  }
];

export default function AgentBrain() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>('Idle');
  const [activeStatus, setActiveStatus] = useState<string>('Awaiting query...');
  const [isSimulating, setIsSimulating] = useState(false);
  const [negotiationRounds, setNegotiationRounds] = useState<any[]>([]);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Connect to the WebSocket to listen for live backend events
  const handleLiveWSMessage = (event: any) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // 1. Raw Agent Log event
    if (event.agent) {
      let friendlyAgent = event.agent;
      if (event.agent === 'stylist_agent') friendlyAgent = 'Stylist Agent';
      if (event.agent === 'anti_return_agent') friendlyAgent = 'Anti-Return Agent';
      
      setActiveAgent(friendlyAgent);
      
      let type: 'info' | 'warn' | 'success' | 'error' = 'info';
      if (event.status === 'complete') type = 'success';
      if (event.status === 'objection') type = 'error';

      let msg = event.negotiation_line || `${friendlyAgent}: ${event.action} (${event.status})`;
      
      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp,
          agent: friendlyAgent,
          message: msg,
          type
        }
      ]);
    }

    // 2. Negotiation Mediator Event
    if (event.type) {
      setActiveAgent('Supervisor Agent');
      let type: 'info' | 'warn' | 'success' | 'error' = 'info';
      if (event.type === 'negotiation_conflict') {
        type = 'warn';
        setActiveStatus('Recalibrating fit rules...');
        setNegotiationRounds(prev => [
          ...prev,
          {
            round: event.round,
            stylistProposal: 'Zara Dress',
            stylistConfidence: `${Math.round((event.stylist_confidence || 0.75) * 100)}%`,
            objection: true,
            adjusted: `${Math.round((event.adjusted_confidence || 0.41) * 100)}%`,
            evidence: event.evidence || [],
            status: 'conflict'
          }
        ]);
      } else if (event.type === 'negotiation_resolved') {
        type = 'success';
        setActiveStatus('Styling approved!');
        setNegotiationRounds(prev => [
          ...prev,
          {
            round: event.round,
            stylistProposal: event.final_product || 'Selected Product',
            stylistConfidence: `${Math.round((event.final_confidence || 0.75) * 100)}%`,
            objection: false,
            adjusted: `${Math.round((event.final_confidence || 0.75) * 100)}%`,
            status: 'approved'
          }
        ]);
      }

      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp,
          agent: 'Supervisor Agent',
          message: event.message || `Supervisor: ${event.type}`,
          type
        }
      ]);
    }
  };

  const { status: wsStatus } = useWebSocket('/ws/chat/demo-session', {
    onMessage: handleLiveWSMessage,
    shouldReconnect: true,
    reconnectInterval: 2000
  });

  const clearLogs = () => {
    setLogs([]);
    setNegotiationRounds([]);
    setActiveAgent('Idle');
    setActiveStatus('Cleared logs.');
  };

  // Run the mock simulation step-by-step
  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    clearLogs();
    
    for (let index = 0; index < mockSimulationSteps.length; index++) {
      const step = mockSimulationSteps[index];
      setActiveAgent(step.agent);
      
      // Map actions to descriptive statuses
      if (step.action === 'parse') setActiveStatus('Parsing entities...');
      else if (step.action === 'search') setActiveStatus('Searching Elasticsearch...');
      else if (step.action === 'propose') setActiveStatus('Item proposed.');
      else if (step.action === 'check') setActiveStatus('Analyzing returns...');
      else if (step.action === 'objection') setActiveStatus('Return risk detected!');
      else if (step.action === 'conflict') setActiveStatus('Supervisor mediating...');
      else if (step.action === 'approve') setActiveStatus('Fit approved.');
      else if (step.action === 'resolve') setActiveStatus('Styling resolved!');

      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          agent: step.agent,
          message: step.message,
          type: step.type as any
        }
      ]);

      // If it's an objection or approval, record the round details
      if (step.action === 'objection') {
        setNegotiationRounds(prev => [
          ...prev,
          {
            round: 1,
            stylistProposal: 'Zara Yellow Wrap Dress',
            stylistConfidence: '89%',
            objection: true,
            adjusted: '41%',
            evidence: ['User returned Zara size M twice in the past 6 months due to poor fit (runs_small)'],
            status: 'conflict'
          }
        ]);
      } else if (step.action === 'approve') {
        setNegotiationRounds(prev => [
          ...prev,
          {
            round: 2,
            stylistProposal: 'Fabindia Yellow Cotton Dress',
            stylistConfidence: '85%',
            objection: false,
            adjusted: '85%',
            status: 'approved'
          }
        ]);
      }

      await new Promise(resolve => setTimeout(resolve, 1800));
    }
    
    setIsSimulating(false);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-30"></div>
      
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 z-10 relative gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <h1 className="text-xl font-bold tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              AGENT_NEGO_BRAIN_v3.0
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Live multi-agent conflict mediation & sizing consensus terminal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* WS Connection Status */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${
              wsStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
            }`}></span>
            <span>Channel WS: {wsStatus === 'open' ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-xs font-bold font-mono tracking-wider transition-all active:scale-[0.98] border border-indigo-500/25 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>RUN SIMULATOR</span>
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center justify-center p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* Left Column: Fleet State (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Current Active Agent Status */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Current Activity Matrix</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Stylist Agent Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                activeAgent === 'Stylist Agent' 
                  ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500">AGENT 01</span>
                  {activeAgent === 'Stylist Agent' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>}
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-200">Stylist Agent</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                  {activeAgent === 'Stylist Agent' ? activeStatus : 'Standing by...'}
                </p>
              </div>

              {/* Anti-Return Agent Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                activeAgent === 'Anti-Return Agent' 
                  ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/10' 
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500">AGENT 02</span>
                  {activeAgent === 'Anti-Return Agent' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>}
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-200">Anti-Return Agent</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                  {activeAgent === 'Anti-Return Agent' ? activeStatus : 'Standing by...'}
                </p>
              </div>

              {/* Supervisor Agent Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                activeAgent === 'Supervisor Agent' 
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10' 
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500">MEDIATOR</span>
                  {activeAgent === 'Supervisor Agent' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>}
                </div>
                <h4 className="text-xs font-bold font-mono text-slate-200">Supervisor</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                  {activeAgent === 'Supervisor Agent' ? activeStatus : 'Standing by...'}
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Negotiation Round Visualization */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-lg flex-1">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Mediation Consensus Rounds</span>
            </h3>

            {negotiationRounds.length === 0 ? (
              <div className="border border-slate-800 border-dashed rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
                No active negotiation rounds. Send a message in customer chat or run the simulator.
              </div>
            ) : (
              <div className="space-y-4">
                {negotiationRounds.map((roundVal, i) => (
                  <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-indigo-400 font-bold">ROUND {roundVal.round}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        roundVal.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}>
                        {roundVal.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Stylist Recommendation side */}
                      <div className="space-y-1 bg-slate-900/40 p-2.5 rounded border border-slate-800/50">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Stylist Recommendation</span>
                        <p className="text-slate-200 font-bold line-clamp-1">{roundVal.stylistProposal}</p>
                        <p className="text-[11px] text-slate-400">Match score: <strong className="text-emerald-400">{roundVal.stylistConfidence}</strong></p>
                      </div>

                      {/* Anti Return Verdict side */}
                      <div className="space-y-1 bg-slate-900/40 p-2.5 rounded border border-slate-800/50">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Anti-Return Analysis</span>
                        <p className={roundVal.objection ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {roundVal.objection ? '⚠️ OBJECTION RAISED' : '✅ APPROVED'}
                        </p>
                        <p className="text-[11px] text-slate-400">Recalibrated score: <strong className={roundVal.objection ? 'text-rose-400' : 'text-emerald-400'}>{roundVal.adjusted}</strong></p>
                      </div>
                    </div>

                    {/* Objection Evidence */}
                    {roundVal.evidence && roundVal.evidence.length > 0 && (
                      <div className="mt-3 bg-rose-950/20 border border-rose-900/30 p-2.5 rounded text-rose-300/90 text-[11px]">
                        <span className="text-[9px] text-rose-400 uppercase font-bold block mb-1">Conflict Evidence</span>
                        <ul className="list-disc list-inside space-y-1">
                          {roundVal.evidence.map((ev: string, idx: number) => (
                            <li key={idx} className="line-clamp-2">{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Console Log (5 columns) */}
        <div className="lg:col-span-5 flex flex-col h-[520px]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
            
            {/* Terminal Header */}
            <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xs font-bold tracking-wider text-slate-300">STREAMING_LOGS</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>

            {/* Scrollable logs */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-2.5 bg-slate-950">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic h-full flex items-center justify-center">
                  $ tail -f agent_negotiation.log
                </div>
              ) : (
                logs.map((log) => {
                  let colorClass = 'text-slate-400';
                  if (log.type === 'success') colorClass = 'text-emerald-400';
                  if (log.type === 'warn') colorClass = 'text-amber-400';
                  if (log.type === 'error') colorClass = 'text-rose-400';
                  
                  return (
                    <div key={log.id} className="flex gap-2 items-start hover:bg-slate-900/50 p-0.5 rounded transition">
                      <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
                      <span className={`${colorClass} leading-relaxed break-words`}>
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal status bar */}
            <div className="bg-slate-950 border-t border-slate-850 p-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Lines: {logs.length}</span>
              <span>Buffer: OK</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
