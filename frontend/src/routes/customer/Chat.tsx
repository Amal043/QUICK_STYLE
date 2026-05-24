import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, User, Zap, Mic, MicOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Message, Size } from '../../types';

const botWelcome = "👋 Welcome to QUICK_STYLE Concierge. I am your personal AI stylist. Need a swift wardrobe change for an unexpected event, spilled coffee, or a night out? Describe your fit requirements below.";

export default function Chat() {
  const {
    selectedSizes,
    setSize,
    addToCart,
    currentLocation,
    voiceSearching,
    setVoiceSearching
  } = useStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: botWelcome,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const mapImage = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("hoodie")) return "/src/assets/lavender_hoodie.png";
    if (n.includes("jacket")) return "/src/assets/techwear_jacket.png";
    if (n.includes("sweater")) return "/src/assets/knit_sweater.png";
    if (n.includes("tee") || n.includes("shirt")) return "/src/assets/activewear_shirt.png";
    if (n.includes("blazer")) return "/src/assets/techwear_jacket.png";
    return "/src/assets/lavender_hoodie.png";
  };

  const handleSelectAndAddToCart = (recProduct: any, size: Size) => {
    setSize(recProduct.id, size);
    setTimeout(() => {
      addToCart({
        id: recProduct.id,
        name: recProduct.name,
        price: recProduct.price,
        image: mapImage(recProduct.name),
        category: recProduct.name.includes("Knit") ? 'Loungewear' : recProduct.name.includes("Tee") ? 'Activewear' : recProduct.name.includes("Blazer") ? 'Formals' : 'Streetwear',
        boutique: recProduct.boutique,
        distance: 1.0,
        fitAccuracy: recProduct.fit_accuracy,
        stock: 5,
        rating: 4.8,
        reviewsCount: 120,
        description: ''
      }, size);
    }, 100);
  };

  const appendUserMessage = async (text: string) => {
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
          session_id: 'demo-session',
          message: text,
          location: currentLocation || 'NIT Jamshedpur Campus'
        })
      });
      
      if (!response.ok) {
        throw new Error('Chat API returned an error');
      }
      
      const data = await response.json();
      setIsTyping(false);

      let actionNode: React.ReactNode = null;
      if (data.product_recommendations && data.product_recommendations.length > 0) {
        if (data.product_recommendations.length === 1) {
          const rec = data.product_recommendations[0];
          actionNode = (
            <button
              onClick={() => handleSelectAndAddToCart(rec, rec.suggested_size as Size)}
              className="mt-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 text-gray-950 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-md transition-all border border-panelBorder cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-[#5C1324] text-[#5C1324]" />
              <span>Select Size {rec.suggested_size} & Add To Bag</span>
            </button>
          );
        } else {
          actionNode = (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.product_recommendations.map((rec: any) => (
                <button
                  key={rec.id}
                  onClick={() => handleSelectAndAddToCart(rec, rec.suggested_size as Size)}
                  className="px-4 py-2 rounded-full bg-[#5C1324] hover:bg-[#430E1A] text-white text-[10px] font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Add {rec.name} ({rec.suggested_size})
                </button>
              ))}
            </div>
          );
        }
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

    window.addEventListener('voice-query', handleVoiceQuery);
    return () => window.removeEventListener('voice-query', handleVoiceQuery);
  }, []);

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

  // Native Web Speech API
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const handleLocalMic = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (voiceSearching) {
      recognition.stop();
      setVoiceSearching(false);
    } else {
      setVoiceSearching(true);
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setVoiceSearching(false);
        setTimeout(() => {
          appendUserMessage(transcript);
          setInputText('');
        }, 800);
      };

      recognition.onerror = () => {
        setVoiceSearching(false);
      };

      recognition.onend = () => {
        setVoiceSearching(false);
      };

      recognition.start();
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
        <span className="text-[10px] text-coral bg-coral/5 px-3 py-1 rounded-full border border-coral/15 font-bold">12m Delivery</span>
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

        {isTyping && (
          <div className="flex gap-2.5 max-w-[85%] items-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-lavender-deep border border-panelBorder flex items-center justify-center flex-shrink-0 text-coral">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#F5F1E8] border border-panelBorder/60 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0.3s' }}></span>
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
