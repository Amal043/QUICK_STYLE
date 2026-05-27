import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentStatusBarProps {
  activeAgent: string;
  statusText: string;
  isProcessing: boolean;
}

export default function AgentStatusBar({ activeAgent, statusText, isProcessing }: AgentStatusBarProps) {
  if (!isProcessing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 backdrop-blur border-b border-slate-700/50 sticky top-0 z-10 text-sm"
      >
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">{activeAgent}</span>
          <span className="text-slate-300 font-mono text-xs">{statusText}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
