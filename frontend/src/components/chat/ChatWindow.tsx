import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import VoiceInputButton from './VoiceInputButton';
import AgentStatusBar from './AgentStatusBar';
import NegotiationCard from './NegotiationCard';

export default function ChatWindow() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [activeAgent, setActiveAgent] = useState('');
  const [statusText, setStatusText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    setActiveAgent('intent_detector');
    setStatusText('Extracting entities...');
    
    try {
      const res = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: "test-session",
          message: input
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'agent',
        content: data.reply,
        products: data.product_recommendations
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
      <AgentStatusBar activeAgent={activeAgent} statusText={statusText} isProcessing={isProcessing} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <span className="text-4xl">✨</span>
            <p>Tell me what you're looking for...</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-3 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
              {m.content}
            </div>
            
            {/* If there's a product recommendation */}
            {m.products && m.products.map((p: any, idx: number) => (
              <div key={idx} className="mt-2 bg-slate-800 border border-slate-700 rounded-xl p-3 w-[85%]">
                <img src={p.images?.main || "https://placehold.co/150"} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                <h4 className="font-semibold text-slate-200">{p.name}</h4>
                <p className="text-emerald-400 font-medium">₹{p.price?.selling_price || p.price}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Fit: {p.fit_accuracy}%</span>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded transition">Buy Now</button>
                </div>
              </div>
            ))}
          </motion.div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-200 transition">
          <ImageIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-full flex items-center px-4 overflow-hidden">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Describe your perfect outfit..."
            className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-200 placeholder-slate-500"
          />
        </div>
        <VoiceInputButton onTranscript={setInput} disabled={isProcessing} />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isProcessing}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
