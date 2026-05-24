import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, User, Zap, Mic, MicOff } from 'lucide-react';
import type { Message, Size } from '../types';
import { useStore } from '../store/useStore';

interface AIShopperPilotProps {
  onSelectAndAdd: (productId: number, size: Size) => void;
  currentLocation: string;
}

const botWelcome = "👋 Welcome to QUICK_STYLE Concierge. I am your personal AI stylist. Need a swift wardrobe change for an unexpected event, spilled coffee, or a night out? Describe your fit requirements below.";

export const AIShopperPilot: React.FC<AIShopperPilotProps> = ({
  onSelectAndAdd,
  currentLocation
}) => {
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

  // Zustand voice status
  const { voiceSearching, setVoiceSearching } = useStore();

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const appendUserMessage = (text: string) => {
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate backend bot thinking delay
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      let actionNode: React.ReactNode = null;

      const normalized = text.toLowerCase();
      if (normalized.includes("coffee") || normalized.includes("spilled") || normalized.includes("l shirt")) {
        replyText = "Oh no! Spilled coffee is the worst. Don't worry, we can get you sorted in minutes.<br><br>I highly recommend the <b>Apex Tech Hoodie (Lavender Edition)</b> in size <b>L</b>. It's stocked right at Boutique A (only 0.8 km away). Our cross-brand calibration gives it a <b>94% True Fit match</b> for Zara Size M profiles.";
        actionNode = (
          <button
            onClick={() => onSelectAndAdd(1, 'L')}
            className="mt-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 text-gray-950 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-md transition-all border border-panelBorder"
          >
            <Zap className="w-3.5 h-3.5 fill-[#5C1324] text-[#5C1324]" />
            <span>Select Size L & Add To Bag</span>
          </button>
        );
      } else if (normalized.includes("formal") || normalized.includes("presentation")) {
        replyText = "A presentation needs a polished, confident look. Let's get you set up.<br><br>I suggest the premium <b>Vanguard Techwear Utility Jacket</b> which offers structured design detailing, or the elegant <b>Amethyst Knit Sweater</b>. Both pair perfectly with formal trousers. The knit sweater has a <b>96% True Fit score</b> and only 1 remains in local stock!";
        actionNode = (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => onSelectAndAdd(3, 'M')}
              className="px-4 py-2 rounded-full bg-[#5C1324] hover:bg-[#430E1A] text-white text-[10px] font-bold active:scale-95 transition-all"
            >
              Add Knit Sweater (M)
            </button>
            <button
              onClick={() => onSelectAndAdd(2, 'L')}
              className="px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-gray-950 text-[10px] font-bold active:scale-95 transition-all border border-panelBorder"
            >
              Add Tech Jacket (L)
            </button>
          </div>
        );
      } else if (normalized.includes("sneaker") || normalized.includes("jeans")) {
        replyText = "Classic look! Muted denim pairs beautifully with lavender and pastel hues.<br><br>Go for the <b>Apex Tech Hoodie (Lavender Edition)</b> to complete the streetwear aesthetic. It is available right now for instant dispatch from Boutique A.";
        actionNode = (
          <button
            onClick={() => onSelectAndAdd(1, 'M')}
            className="mt-2 px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 text-gray-950 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-md transition-all border border-panelBorder"
          >
            <Zap className="w-3.5 h-3.5 fill-[#5C1324] text-[#5C1324]" />
            <span>Add Hoodie in size M</span>
          </button>
        );
      } else {
        replyText = `Interesting styling query! Based on your location near <b>${currentLocation}</b>, I am browsing local boutiques.<br><br>For a tailored recommendation, check out the <b>Amethyst Knit Sweater</b> (0.5 km away) for cozy elegance, or the <b>Aero-Knit Activewear Tee</b> (1.9 km away) in Electric Coral if you need something lightweight. Let me know what styles catch your eye!`;
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date()
      };
      
      if (actionNode) {
        (botMsg as any).action = actionNode;
      }

      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
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
    <div id="ai-stylist" className="lg:col-span-5 glass-card rounded-3xl border border-panelBorder p-6 flex flex-col justify-between shadow-2xl relative min-h-[460px] md:min-h-[500px] bg-white/90">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A880]/5 rounded-full filter blur-3xl pointer-events-none"></div>
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-panelBorder/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-[#F5F0FF] p-2.5 rounded-xl border border-purple-200/50">
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
      <div className="flex-1 my-4 space-y-4 overflow-y-auto pr-1 max-h-[260px] md:max-h-[300px] scrollbar-thin scrollbar-thumb-panelBorder/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="w-full text-center py-2 animate-fade-in">
                <span className="text-[10px] bg-[#F5F0FF] text-purple-950 border border-purple-200/50 px-3.5 py-1.5 rounded-full font-semibold">
                  <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
                </span>
              </div>
            );
          }
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
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-panelBorder hover:border-[#C5A880] text-gray-700 hover:text-gray-900 transition-all duration-200"
          >
            🔥 Spilled coffee
          </button>
          <button
            onClick={() => handleChipClick('🎓 Formal look for presentation')}
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-panelBorder hover:border-[#C5A880] text-gray-700 hover:text-gray-900 transition-all duration-200"
          >
            🎓 Presentation look
          </button>
          <button
            onClick={() => handleChipClick('👟 Sneaker match for blue jeans')}
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-panelBorder hover:border-[#C5A880] text-gray-700 hover:text-gray-900 transition-all duration-200"
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
          className="w-full h-11 pl-4 pr-20 rounded-full bg-[#FAF8F5] border border-panelBorder text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:border-coral transition-all"
        />
        
        {/* Mic inside chat box input */}
        <button
          type="button"
          onClick={handleLocalMic}
          className={`absolute right-11 top-1.5 h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
            voiceSearching
              ? 'bg-[#5C1324] border-[#5C1324] text-white animate-pulse'
              : 'bg-[#FAF8F5] border-panelBorder text-coral hover:border-[#5C1324]/50'
          }`}
          title="Speak styling query"
        >
          {voiceSearching ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        </button>

        <button
          type="submit"
          className="absolute right-1.5 top-1.5 h-8 w-8 bg-gray-950 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </form>
    </div>
  );
};
