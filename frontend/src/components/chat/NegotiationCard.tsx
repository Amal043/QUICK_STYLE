import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Scale } from 'lucide-react';

interface NegotiationCardProps {
  round: number;
  productName: string;
  stylistConfidence: string;
  antiReturnObjection: boolean;
  adjustedConfidence: string;
  resolution?: string;
}

export default function NegotiationCard({
  round,
  productName,
  stylistConfidence,
  antiReturnObjection,
  adjustedConfidence,
  resolution
}: NegotiationCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-700 rounded-lg p-4 my-2 text-sm"
    >
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
        <Scale className="w-4 h-4 text-purple-400" />
        <span className="font-semibold text-slate-200">Live Agent Negotiation (Round {round})</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
          <span className="text-slate-400">Stylist Proposal:</span>
          <span className="text-slate-200">{productName} <span className="text-emerald-400 text-xs">({stylistConfidence} match)</span></span>
        </div>
        
        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
          <span className="text-slate-400">Anti-Return Check:</span>
          {antiReturnObjection ? (
            <span className="flex items-center gap-1 text-red-400">
              <ShieldAlert className="w-4 h-4" /> Objection Raised
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-4 h-4" /> Approved
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
          <span className="text-slate-400">Final Confidence:</span>
          <span className="text-slate-200 font-mono">{adjustedConfidence}</span>
        </div>
        
        {resolution && (
          <div className="mt-2 pt-2 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Supervisor Decision</span>
            <p className={`mt-1 font-medium ${resolution === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {resolution === 'approved' ? 'Proceeding with Recommendation' : 'Forcing Suggestion Change'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
