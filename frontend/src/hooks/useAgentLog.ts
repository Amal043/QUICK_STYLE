import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface AgentLogEvent {
  session_id: string;
  timestamp: number;
  agent?: string;
  action?: string;
  status?: string;
  details?: any;
  duration_ms?: number;
  negotiation_line?: string;
  
  // Negotiation Mediator Event fields
  type?: 'negotiation_conflict' | 'negotiation_resolved' | 'negotiation_forced';
  round?: number;
  message?: string;
  stylist_confidence?: number;
  anti_return_penalty?: number;
  adjusted_confidence?: number;
  evidence?: string[];
  final_product?: string;
  final_confidence?: number;
  decision?: string;
}

export function useAgentLog(sessionId: string) {
  const [logs, setLogs] = useState<AgentLogEvent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [negotiations, setNegotiations] = useState<any[]>([]);

  const handleMessage = useCallback((event: any) => {
    setLogs((prev) => [...prev, event]);

    // Parse status and active agent
    if (event.agent) {
      let friendlyAgent = event.agent;
      if (event.agent === 'stylist_agent') friendlyAgent = 'Stylist Agent';
      if (event.agent === 'anti_return_agent') friendlyAgent = 'Anti-Return Agent';
      
      setActiveAgent(friendlyAgent);
      setIsProcessing(event.status === 'running');
      
      if (event.action === 'elasticsearch_search') {
        setStatusText(`Searching products (Round ${event.details?.round || 1})...`);
      } else if (event.action === 'loading_return_history') {
        setStatusText(`Analyzing return history for ${event.details?.checking_brand || 'brand'}...`);
      } else if (event.action === 'proposal_ready') {
        setStatusText(`Proposed: ${event.details?.product} (${event.details?.brand})`);
      } else if (event.action === 'verdict_complete') {
        setStatusText(event.status === 'objection' ? 'Objection raised due to return risk!' : 'Fit check approved!');
      }
    }

    // Parse negotiation event
    if (event.type) {
      // It is a mediator event
      setIsProcessing(event.type === 'negotiation_conflict');
      setActiveAgent('Supervisor Agent');
      
      if (event.type === 'negotiation_conflict') {
        setStatusText('Conflict detected. Recalibrating fit rules...');
        setNegotiations((prev) => {
          // Avoid duplicate rounds if events trigger twice
          if (prev.some(n => n.round === event.round && n.resolution === 'conflict')) return prev;
          return [
            ...prev,
            {
              round: event.round,
              stylistConfidence: `${Math.round((event.stylist_confidence || 0.75) * 100)}%`,
              antiReturnObjection: true,
              adjustedConfidence: `${Math.round((event.adjusted_confidence || 0.41) * 100)}%`,
              evidence: event.evidence || [],
              resolution: 'conflict'
            }
          ];
        });
      } else if (event.type === 'negotiation_resolved') {
        setStatusText('Negotiation complete. Styling approved!');
        setNegotiations((prev) => {
          if (prev.some(n => n.round === event.round && n.resolution === 'approved')) return prev;
          return [
            ...prev,
            {
              round: event.round,
              stylistConfidence: `${Math.round((event.final_confidence || 0.75) * 100)}%`,
              antiReturnObjection: false,
              adjustedConfidence: `${Math.round((event.final_confidence || 0.75) * 100)}%`,
              resolution: 'approved',
              productName: event.final_product || 'Selected Item'
            }
          ];
        });
      } else if (event.type === 'negotiation_forced') {
        setStatusText(`Negotiation forced: ${event.decision}`);
        setNegotiations((prev) => {
          if (prev.some(n => n.round === event.round && n.resolution.startsWith('forced_'))) return prev;
          return [
            ...prev,
            {
              round: event.round,
              resolution: `forced_${event.decision}`
            }
          ];
        });
      }
    }
  }, []);

  const wsUrl = sessionId ? `/ws/chat/${sessionId}` : null;
  const { status } = useWebSocket(wsUrl, {
    onMessage: handleMessage,
    shouldReconnect: true,
    reconnectInterval: 2000
  });

  const clearLogs = useCallback(() => {
    setLogs([]);
    setActiveAgent('');
    setStatusText('');
    setIsProcessing(false);
    setNegotiations([]);
  }, []);

  return {
    logs,
    activeAgent,
    statusText,
    isProcessing: isProcessing || status === 'connecting',
    negotiations,
    clearLogs,
    connectionStatus: status
  };
}
