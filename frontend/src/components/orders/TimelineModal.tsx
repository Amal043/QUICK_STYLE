import React from 'react';
import { X } from 'lucide-react';

interface TimelineEvent {
  title: string;
  timestamp: string;
  details?: string[];
  isCompleted: boolean;
  isLast?: boolean;
}

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TimelineEvent[];
}

export default function TimelineModal({ isOpen, onClose, events }: TimelineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-gray-900">Order Updates</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="relative pl-6">
            {/* Vertical Line */}
            <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-gray-200"></div>

            {events.map((event, index) => (
              <div key={index} className="relative mb-8 last:mb-0">
                {/* Status Dot */}
                <div 
                  className={`absolute -left-[30px] w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 
                    ${event.isCompleted ? 'bg-emerald-500' : 'bg-gray-300'}`}
                ></div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-2">
                    <h4 className={`font-bold ${event.isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  
                  {event.details && event.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-gray-600 mb-1 leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
