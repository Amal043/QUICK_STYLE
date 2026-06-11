import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Sparkles, Send, User, Zap, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { Message, Size } from '../../types';
import { useAgentLog } from '../../hooks/useAgentLog';
import AgentStatusBar from '../../components/chat/AgentStatusBar';
import NegotiationCard from '../../components/chat/NegotiationCard';

const botWelcome = "👋 Welcome to QUICK_STYLE Concierge. I am your personal AI stylist. Need a swift wardrobe change for an unexpected event, spilled coffee, or a night out? Describe your fit requirements below.";

import hoodieImg from '../../assets/lavender_hoodie.png';
import jacketImg from '../../assets/techwear_jacket.png';
import sweaterImg from '../../assets/knit_sweater.png';
import shirtImg from '../../assets/activewear_shirt.png';

export default function Chat() {
  const navigate = useNavigate();
  const {
    selectedSizes,
    setSize,
    addToCart,
    currentLocation,
    voiceSearching,
    setVoiceSearching
  } = useStore();

  const [sessionId] = useState(() => {
    const savedSession = sessionStorage.getItem('quickstyle_chat_session');
    if (savedSession) return savedSession;
    const newSession = `sess-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('quickstyle_chat_session', newSession);
    return newSession;
  });

  const {
    activeAgent,
    statusText,
    isProcessing: agentProcessing,
    negotiations,
    clearLogs
  } = useAgentLog(sessionId);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('quickstyle_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Do not render stored action nodes (JSX), just text.
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp), action: undefined }));
      } catch (e) {}
    }
    return [{
      id: 'welcome',
      sender: 'bot',
      text: botWelcome,
      timestamp: new Date()
    }];
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip HTML tags for speech
    const plain = text.replace(/<[^>]*>/g, '').replace(/\*/g, '').trim();
    if (!plain) return;
    const utter = new SpeechSynthesisUtterance(plain.slice(0, 400));
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.lang = 'en-US';
    // Prefer a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Save messages to session storage without the React elements (actions)
    const messagesToSave = messages.map(({ action, ...m }: any) => m);
    sessionStorage.setItem('quickstyle_chat_messages', JSON.stringify(messagesToSave));
  }, [messages, isTyping]);

  const mapImage = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("hoodie")) return hoodieImg;
    if (n.includes("jacket") || n.includes("blazer") || n.includes("tote") || n.includes("bag")) return jacketImg;
    if (n.includes("sweater") || n.includes("pants") || n.includes("joggers") || n.includes("trousers") || n.includes("shoes") || n.includes("sneakers") || n.includes("loafers") || n.includes("boots")) return sweaterImg;
    if (n.includes("tee") || n.includes("shirt") || n.includes("shorts")) return shirtImg;
    return hoodieImg;
  };

  const handleSelectAndAddToCart = (recProduct: any, size: Size) => {
    setSize(recProduct.id, size);
    setTimeout(() => {
      addToCart({
        id: recProduct.id,
        name: recProduct.name,
        price: recProduct.price || { mrp: 1999, selling_price: 1599, discount_percent: 20 },
        image: mapImage(recProduct.name),
        gallery: [],
        frames_365: [], // mapped fields
        frames_360: [],
        has_360: false,
        category: recProduct.name.includes("Knit") ? 'Loungewear' : recProduct.name.includes("Tee") ? 'Activewear' : recProduct.name.includes("Blazer") ? 'Formals' : 'Streetwear',
        subcategory: '',
        brand: recProduct.boutique || 'Quick Style',
        gender: 'unisex',
        boutique: recProduct.boutique,
        store_name: recProduct.boutique,
        store_location: { type: 'Point', coordinates: [86.14, 22.80] },
        distance: 1.0,
        delivery_eta: 12,
        fitAccuracy: recProduct.fit_accuracy || 95,
        stock: { [size]: 5 },
        description: '',
        rating: { average: 4.8, count: 120 },
        colors: [],
        sizes_available: [size],
        tags: []
      } as any, size);
    }, 100);
  };

  const handleVirtualTryOn = async (recProduct: any) => {
    setIsTyping(true);
    try {
      const response = await fetch('/api/v1/vto/try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_image_url: 'placeholder_user_image',
          garment_image_url: mapImage(recProduct.name),
          category: recProduct.category || 'tops'
        })
      });
      const data = await response.json();
      setIsTyping(false);
      
      const vtoMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: `Here is a Virtual Try-On of the **${recProduct.name}**! ✨`,
        timestamp: new Date()
      };
      
      (vtoMsg as any).action = (
        <div className="mt-2 rounded-xl overflow-hidden border border-panelBorder/30">
          <img src={data.generated_image_url} alt="Virtual Try On" className="w-full max-h-64 object-cover" />
        </div>
      );
      
      setMessages(prev => [...prev, vtoMsg]);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const appendUserMessage = async (text: string) => {
    clearLogs();
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          location: currentLocation || 'NIT Jamshedpur Campus'
        })
      });
      
      if (!response.ok) {
        throw new Error('Chat API returned an error');
      }
      
      const data = await response.json();
      setIsTyping(false);
      
      if (data.commands && data.commands.length > 0) {
        data.commands.forEach((cmd: any) => {
          if (cmd.type === 'navigate') {
            navigate(cmd.path);
          } else if (cmd.type === 'checkout') {
            navigate('/cart');
          }
        });
      }

      let actionNode: React.ReactNode = null;
      if (data.product_recommendations && data.product_recommendations.length > 0) {
        actionNode = (
          <div className="mt-3 space-y-2 w-full">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#A27B5C] mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#A27B5C]" />
              <span>Curated Styling Selection</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {data.product_recommendations.map((rec: any) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-panelBorder/60 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                  <div>
                    <div className="relative w-full h-24 bg-[#FAF8F5] rounded-xl overflow-hidden mb-2 border border-panelBorder/30">
                      <img 
                        src={mapImage(rec.name)} 
                        alt={rec.name}
                        className="w-full h-full object-contain p-2"
                      />
                      <span className="absolute top-1.5 right-1.5 bg-[#5C1324] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                        {rec.fit_accuracy}% Fit
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-[11px] line-clamp-1">{rec.name}</h4>
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{rec.brand} • {rec.boutique}</p>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] font-bold text-gray-900">₹{rec.price.selling_price}</span>
                      {rec.price.mrp > rec.price.selling_price && (
                        <>
                          <span className="text-[9px] text-gray-400 line-through">₹{rec.price.mrp}</span>
                          <span className="text-[9px] text-[#A27B5C] font-semibold">-{rec.price.discount_percent}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 mt-2.5">
                    <button
                      onClick={() => handleSelectAndAddToCart(rec, rec.suggested_size as Size)}
                      className="flex-1 py-1.5 rounded-xl bg-[#5C1324] hover:bg-[#430E1A] text-white text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Zap className="w-2.5 h-2.5 fill-white text-white" />
                      <span>Bag ({rec.suggested_size})</span>
                    </button>
                    <button
                      onClick={() => handleVirtualTryOn(rec)}
                      className="flex-1 py-1.5 rounded-xl bg-[#FAF0F1] hover:bg-[#F2DCDD] text-[#5C1324] border border-[#5C1324]/20 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#5C1324]" />
                      <span>Try it On</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.reply.replace(/\n/g, '<br>'),
        timestamp: new Date()
      };

      if (actionNode) {
        (botMsg as any).action = actionNode;
      }

      setMessages((prev) => [...prev, botMsg]);
      speakText(data.reply);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: "I'm sorry, I encountered an issue connecting to the styling engine. Please check if the backend server is running.",
        timestamp: new Date()
      }]);
    }
  };

  // Listen to custom voice query event from Header component
  useEffect(() => {
    const handleVoiceQuery = (e: Event) => {
      const query = (e as CustomEvent).detail;
      setInputText(query);
      setIsTyping(true);
      setTimeout(() => {
        appendUserMessage(query);
        setInputText('');
      }, 800);
    };

    const handleStartVoice = () => {
      if (!voiceSearching) {
        handleLocalMic();
      }
    };

    window.addEventListener('voice-query', handleVoiceQuery);
    window.addEventListener('start-voice-recording', handleStartVoice);
    return () => {
      window.removeEventListener('voice-query', handleVoiceQuery);
      window.removeEventListener('start-voice-recording', handleStartVoice);
    };
  }, [voiceSearching]);

  const handleChipClick = (prompt: string) => {
    appendUserMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    appendUserMessage(text);
    setInputText('');
  };

  // Native MediaRecorder API for Voice
  const handleLocalMic = async () => {
    if (voiceSearching) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setVoiceSearching(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          
          setIsTyping(true);
          const userMsg: Message = {
            id: Math.random().toString(),
            sender: 'user',
            text: '🎤 *Audio Message*',
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, userMsg]);
          
          try {
            const formData = new FormData();
            formData.append('audio_file', audioBlob, 'audio.webm');
            formData.append('session_id', sessionId);
            formData.append('location', currentLocation || 'NIT Jamshedpur Campus');

            const response = await fetch('/api/v1/chat/message/audio', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) throw new Error('Failed to process audio');
            const data = await response.json();
            
            // Re-use logic to render AI response
            setIsTyping(false);
            
            if (data.commands && data.commands.length > 0) {
              data.commands.forEach((cmd: any) => {
                if (cmd.type === 'navigate') {
                  navigate(cmd.path);
                } else if (cmd.type === 'checkout') {
                  navigate('/cart');
                }
              });
            }
            
            let actionNode: React.ReactNode = null;
            if (data.product_recommendations && data.product_recommendations.length > 0) {
              actionNode = (
                <div className="mt-3 space-y-2 w-full">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#A27B5C] mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#A27B5C]" />
                    <span>Curated Styling Selection</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                    {data.product_recommendations.map((rec: any) => (
                      <div key={rec.id} className="bg-white rounded-2xl border border-panelBorder/60 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                        <div>
                          <div className="relative w-full h-24 bg-[#FAF8F5] rounded-xl overflow-hidden mb-2 border border-panelBorder/30">
                            <img 
                              src={mapImage(rec.name)} 
                              alt={rec.name}
                              className="w-full h-full object-contain p-2"
                            />
                            <span className="absolute top-1.5 right-1.5 bg-[#5C1324] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                              {rec.fit_accuracy}% Fit
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-[11px] line-clamp-1">{rec.name}</h4>
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{rec.brand} • {rec.boutique}</p>
                          
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[11px] font-bold text-gray-900">₹{rec.price.selling_price}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={() => handleSelectAndAddToCart(rec, rec.suggested_size as Size)}
                            className="flex-1 py-1.5 rounded-xl bg-[#5C1324] hover:bg-[#430E1A] text-white text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Zap className="w-2.5 h-2.5 fill-white text-white" />
                            <span>Bag ({rec.suggested_size})</span>
                          </button>
                          <button
                            onClick={() => handleVirtualTryOn(rec)}
                            className="flex-1 py-1.5 rounded-xl bg-[#FAF0F1] hover:bg-[#F2DCDD] text-[#5C1324] border border-[#5C1324]/20 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#5C1324]" />
                            <span>Try it On</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            const botMsg: Message = {
              id: Math.random().toString(),
              sender: 'bot',
              text: data.reply.replace(/\n/g, '<br>'),
              timestamp: new Date()
            };
            
            if (actionNode) (botMsg as any).action = actionNode;
            setMessages((prev) => [...prev, botMsg]);

          } catch (error) {
            console.error("Error uploading audio", error);
            setIsTyping(false);
          }
        };

        mediaRecorder.start();
        setVoiceSearching(true);
      } catch (err) {
        console.error("Microphone access denied", err);
        alert("Please allow microphone access to use voice search.");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-card rounded-3xl border border-panelBorder p-6 flex flex-col justify-between shadow-2xl relative min-h-[500px] md:min-h-[550px] bg-white animate-fade-in">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A880]/5 rounded-full filter blur-3xl pointer-events-none"></div>
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-panelBorder/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-[#FAF0F1] p-2.5 rounded-xl border border-coral/10">
              <Sparkles className="w-4 h-4 text-coral animate-pulse" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald border border-white"></span>
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              AI Concierge Stylist
            </h2>
            <p className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase">QUICK_STYLE LUXE PILOT</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isSpeaking) { stopSpeaking(); return; }
              setTtsEnabled(prev => !prev);
            }}
            title={isSpeaking ? 'Stop speaking' : ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
              isSpeaking
                ? 'bg-coral/15 border-coral/30 text-coral animate-pulse'
                : ttsEnabled
                ? 'bg-emerald/10 border-emerald/30 text-emerald'
                : 'bg-gray-100 border-panelBorder text-gray-400 hover:text-gray-600'
            }`}
          >
            {isSpeaking ? <Volume2 className="w-3 h-3" /> : ttsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span>{isSpeaking ? 'Speaking...' : ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
          <span className="text-[10px] text-coral bg-coral/5 px-3 py-1 rounded-full border border-coral/15 font-bold">12m Delivery</span>
        </div>
      </div>

      {/* Chat Logs Area */}
      <div className="flex-1 my-4 space-y-4 overflow-y-auto pr-1 max-h-[340px] md:max-h-[380px] scrollbar-thin scrollbar-thumb-panelBorder/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[90%] items-start animate-fade-in ${
                isUser ? 'self-end justify-end ml-auto' : ''
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-lavender-deep border border-panelBorder flex items-center justify-center flex-shrink-0 text-coral">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#5C1324] text-white rounded-2xl rounded-tr-none shadow-md shadow-[#5C1324]/10 font-medium'
                    : 'bg-[#F5F1E8] border border-panelBorder/60 rounded-2xl rounded-tl-none text-gray-800 font-light'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                {/* Custom Action Element */}
                {(msg as any).action && (
                  <div className="mt-1">
                    {(msg as any).action}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-[#F7EBEF] border border-[#5C1324]/20 flex items-center justify-center flex-shrink-0 text-coral">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Multi-Agent Negotiation Card Feed */}
        {negotiations.length > 0 && (
          <div className="space-y-3 p-3.5 bg-[#F5F1E8]/40 rounded-2xl border border-panelBorder/65 max-w-[85%] animate-fade-in">
            <p className="text-[9px] uppercase tracking-wider font-extrabold text-[#5C1324] mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#5C1324] fill-[#5C1324]" />
              <span>Real-Time Fit Negotiation</span>
            </p>
            {negotiations.map((neg, idx) => (
              <div key={idx} className="bg-white border border-panelBorder/50 rounded-xl p-3 text-xs shadow-sm">
                <div className="flex justify-between items-center border-b border-panelBorder/30 pb-1.5 mb-2 font-bold text-gray-800">
                  <span>Round {neg.round}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    neg.resolution === 'approved' ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral'
                  }`}>
                    {neg.resolution.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-700">
                  {neg.productName && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stylist Proposal:</span>
                      <span className="font-semibold">{neg.productName} ({neg.stylistConfidence})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Anti-Return Check:</span>
                    <span className={neg.antiReturnObjection ? "text-coral font-bold" : "text-emerald font-bold"}>
                      {neg.antiReturnObjection ? "Objection Raised" : "Approved"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Adjusted Match:</span>
                    <span className="font-mono">{neg.adjustedConfidence}</span>
                  </div>
                  {neg.evidence && neg.evidence.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-panelBorder/20 text-[10px] text-coral/80 bg-coral/5 p-1.5 rounded">
                      <p className="font-bold uppercase tracking-wider text-[8px] mb-0.5">Objection Evidence:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {neg.evidence.map((ev: string, i: number) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(isTyping || agentProcessing) && (
          <div className="flex gap-2.5 max-w-[85%] items-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-lavender-deep border border-panelBorder flex items-center justify-center flex-shrink-0 text-coral">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#F5F1E8] border border-panelBorder/60 rounded-2xl rounded-tl-none p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
              {agentProcessing && activeAgent && (
                <div className="text-[10px] text-gray-500 font-mono">
                  ⚡ <strong className="text-[#5C1324]">{activeAgent}</strong>: {statusText}
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset Chips */}
      <div className="space-y-2 mb-3">
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Suggested Concierge Inquiries</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleChipClick('🔥 Spilled coffee, need a fresh L shirt')}
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-panelBorder hover:border-[#C5A880] text-gray-700 hover:text-gray-900 transition-all duration-200 cursor-pointer"
          >
            🔥 Spilled coffee
          </button>
          <button
            onClick={() => handleChipClick('🎓 Formal look for presentation')}
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-panelBorder hover:border-[#C5A880] text-gray-700 hover:text-gray-900 transition-all duration-200 cursor-pointer"
          >
            🎓 Presentation look
          </button>
          <button
            onClick={() => handleChipClick('👟 Sneaker match for blue jeans')}
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-panelBorder hover:border-[#C5A880] text-gray-700 hover:text-gray-900 transition-all duration-200 cursor-pointer"
          >
            👟 Sneaker match
          </button>
        </div>
      </div>

      {/* Chat Input Form with Voice Button */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={voiceSearching ? "Listening..." : "Tell me what you are looking for..."}
          className="w-full h-11 pl-4 pr-20 rounded-full bg-[#FAF8F5] border border-panelBorder text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#C5A880] transition-all"
        />
        
        {/* Mic inside chat box input */}
        <button
          type="button"
          onClick={handleLocalMic}
          className={`absolute right-11 top-1.5 h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            voiceSearching
              ? 'bg-[#5C1324] border-[#5C1324] text-white animate-pulse'
              : 'bg-[#FAF8F5] border-panelBorder text-[#C5A880] hover:border-[#5C1324]/50'
          }`}
          title="Speak styling query"
        >
          {voiceSearching ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        </button>

        <button
          type="submit"
          className="absolute right-1.5 top-1.5 h-8 w-8 bg-gray-955 hover:bg-gray-850 text-white rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </form>
    </div>
  );
}
