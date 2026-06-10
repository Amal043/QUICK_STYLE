import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Image as ImageIcon, Upload, Send, Sparkles, CheckCircle2, ArrowLeft, Loader2, Camera, User, Mic } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const { adminMode } = useStore();
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fallback check
  useEffect(() => {
    if (!adminMode) {
       navigate('/account');
    }
  }, [adminMode]);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'system' | 'user' | 'agent', text: string, image?: string, images?: string[], user_images?: string[]}[]>([
    { role: 'agent', text: 'Hello! I am your AI Registry Assistant. Upload 1–3 photos of the clothing item and I will analyze it with Gemini Vision, generate professional model photos, and register it instantly.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatImageFiles, setChatImageFiles] = useState<File[]>([]);
  const [chatImagePreviews, setChatImagePreviews] = useState<string[]>([]);
  const [accumulatedImages, setAccumulatedImages] = useState<string[]>([]); // To send all images to stateless backend
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Manual Form State
  const [formData, setFormData] = useState({
    name: '', description: '', brand: '', category: 'Men', price: '', size: 'M'
  });
  const [manualImageFile, setManualImageFile] = useState<File | null>(null);
  const [manualImagePreview, setManualImagePreview] = useState<string | null>(null);

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // Max 3 images
      setChatImageFiles(files);
      
      const previews: string[] = [];
      files.forEach(file => {
         const reader = new FileReader();
         reader.onload = (ev) => {
            previews.push(ev.target?.result as string);
            if (previews.length === files.length) {
               setChatImagePreviews([...previews]);
            }
         };
         reader.readAsDataURL(file);
      });
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
          
          // Auto-send if there's at least one image
          if (chatImagePreviews.length > 0) {
             // We can't auto-send easily here because state updates are async, 
             // but we will let the user click send. Or we can just set it.
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone error", err);
        alert("Please allow microphone access");
      }
    }
  };

  const handleManualImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setManualImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setManualImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() && !audioBlob && chatImagePreviews.length === 0) return;

    const newMessage: any = { role: 'user', text: chatInput || (audioBlob ? '🎤 *Voice Recording*' : 'Uploaded Images') };
    if (chatImagePreviews.length > 0) newMessage.user_images = [...chatImagePreviews];
    
    setChatMessages(prev => [...prev, newMessage]);
    
    // Capture current state for the request
    const currentInput = chatInput;
    const currentImages = chatImagePreviews;
    const currentAudio = audioBlob;

    setChatInput('');
    setChatImageFiles([]);
    setChatImagePreviews([]);
    setAudioBlob(null);
    
     // Show AI thinking
     setIsSubmitting(true);
     setChatMessages(prev => [...prev, { role: 'system', text: '🔍 Gemini Vision is analyzing your image... then generating AI model photos (may take ~30s)...' }]);
 
     // Combine previous accumulated images with any new ones
     const allImagesForBackend = [...accumulatedImages, ...currentImages];
     setAccumulatedImages(allImagesForBackend);
 
     try {
        // Make actual API call to backend agent
        const fd = new FormData();
        fd.append('message', currentInput);
        if (allImagesForBackend.length > 0) {
            fd.append('images_base64', JSON.stringify(allImagesForBackend));
        }
        
        const historyToSend = chatMessages.filter(m => m.role !== 'system').map(m => ({role: m.role, text: m.text}));
        fd.append('chat_history', JSON.stringify(historyToSend));
        
        if (currentAudio) {
           fd.append('audio_file', currentAudio, 'voice.webm');
       }
       
       const res = await fetch('/api/v1/agent/add-product', {
           method: 'POST',
           body: fd
       });

       const data = await res.json();
       setChatMessages(prev => prev.filter(m => m.role !== 'system'));
       
       if (data.status === 'success') {
          const genImages: string[] = data.generated_images || [];
          setChatMessages(prev => [...prev, {
             role: 'agent',
             text: data.reply || `✅ Registered "${data.product.name}" successfully!`,
             images: genImages.length > 0 ? genImages : undefined
          }]);
          setSuccess(true);
          setAccumulatedImages([]); // Clear accumulated on success
       } else {
          setChatMessages(prev => [...prev, {
             role: 'agent',
             text: data.reply || "Could you provide more details? (e.g. Price, Name, Category)"
          }]);
       }
    } catch (err) {
       setChatMessages(prev => prev.filter(m => m.role !== 'system'));
       setChatMessages(prev => [...prev, { role: 'agent', text: "Sorry, the agent encountered an error processing that request." }]);
    }
    setIsSubmitting(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualImagePreview) {
       alert("Please upload at least 1 image");
       return;
    }
    setIsSubmitting(true);
    
    try {
       const fd = new FormData();
       fd.append('message', `Register product: ${formData.name}, Price: ${formData.price}, Category: ${formData.category}, Brand: ${formData.brand}, Size: ${formData.size}. Description: ${formData.description}.`);
       fd.append('images_base64', JSON.stringify([manualImagePreview]));
       
       const res = await fetch('/api/v1/agent/add-product', {
           method: 'POST',
           body: fd
       });
       const data = await res.json();
       if (data.status === 'success') {
          setSuccess(true);
       } else {
          alert("Error: " + data.reply);
       }
    } catch (err) {
       alert("Network error communicating with the agent.");
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="bg-gray-50 min-h-screen pb-12 animate-fade-in text-gray-900">
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="font-bold text-lg font-display-md">Add New Product</h1>
          </div>
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button 
              onClick={() => setActiveMode('ai')} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeMode === 'ai' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Agent
            </button>
            <button 
              onClick={() => setActiveMode('manual')} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeMode === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Upload className="w-3.5 h-3.5" /> Manual
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {success ? (
           <div className="bg-white rounded-3xl p-12 border border-panelBorder shadow-xl text-center max-w-2xl mx-auto mt-12 animate-scale-up">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-display-md font-bold text-gray-900 mb-3">Product Registered!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                 The product was successfully validated, 3 AI model images were generated, and it has been published to your boutique.
              </p>
              <button onClick={() => { setSuccess(false); setChatMessages([{ role: 'agent', text: 'Ready for the next product!' }]); }} className="bg-[#5C1324] hover:bg-[#4A0F1D] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md">
                 Add Another Product
              </button>
           </div>
        ) : (
          <div className="bg-white rounded-3xl border border-panelBorder shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            
            {activeMode === 'ai' ? (
              // AI Chatbot UI
              <div className="flex-1 flex flex-col bg-[#FAF8F5]">
                 <div className="bg-white border-b border-panelBorder p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                       <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900">Registry Agent</h3>
                       <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                         <p className="text-xs text-purple-600 font-semibold">Online · Powered by Gemini Vision + Pollinations AI</p>
                       </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">AI Powered</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {chatMessages.map((msg, idx) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl p-4 ${
                             msg.role === 'user' ? 'bg-[#5C1324] text-white rounded-tr-sm shadow-md' :
                             msg.role === 'system' ? 'bg-transparent border border-dashed border-gray-300 text-gray-500 text-xs w-full text-center' :
                             'bg-white border border-panelBorder text-gray-800 rounded-tl-sm shadow-sm'
                          }`}>
                             {msg.role === 'system' ? (
                                <div className="flex items-center justify-center gap-2">
                                   <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> {msg.text}
                                </div>
                             ) : (
                                <>
                                   {msg.user_images && msg.user_images.length > 0 && (
                                       <div className="flex gap-2 flex-wrap mb-3">
                                          {msg.user_images.map((imgUrl: string, i: number) => (
                                            <img key={i} src={imgUrl} className="h-24 w-24 object-cover rounded-lg border border-white/20" alt="Upload" />
                                          ))}
                                       </div>
                                    )}
                                   <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                   {msg.images && msg.images.length > 0 && (
                                     <div className="mt-3">
                                       <p className="text-[10px] uppercase tracking-wider font-bold text-purple-600 mb-2 flex items-center gap-1">
                                         <Sparkles className="w-3 h-3" /> AI-Generated Model Photos
                                       </p>
                                       <div className="flex gap-2 flex-wrap">
                                         {msg.images.map((imgUrl, i) => (
                                           <img
                                             key={i}
                                             src={imgUrl}
                                             alt={`AI Model ${i + 1}`}
                                             className="h-36 w-24 object-cover rounded-xl border-2 border-purple-200 shadow-sm"
                                             onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                           />
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                </>
                             )}
                          </div>
                       </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>
                                  <div className="p-4 bg-white border-t border-panelBorder">
                    {chatImagePreviews.length > 0 && (
                       <div className="mb-3 flex gap-2">
                          {chatImagePreviews.map((preview, i) => (
                             <div key={i} className="relative inline-block">
                                <img src={preview} className="h-16 w-16 object-cover rounded-xl border-2 border-blue-500" />
                                <button onClick={() => { 
                                   const newPreviews = [...chatImagePreviews];
                                   newPreviews.splice(i, 1);
                                   setChatImagePreviews(newPreviews);
                                }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-[10px] font-bold">✕</button>
                             </div>
                          ))}
                       </div>
                    )}
                    {audioBlob && (
                       <div className="mb-3 flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full w-max text-xs font-bold border border-blue-100">
                          🎤 Voice Recording Ready
                          <button onClick={() => setAudioBlob(null)} className="text-red-500 ml-2 hover:text-red-700">✕</button>
                       </div>
                    )}
                    <div className="flex items-center gap-2">
                       <input type="file" multiple accept="image/*" id="chat-img-upload" className="hidden" onChange={handleChatImageSelect} />
                       <label htmlFor="chat-img-upload" className="p-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors text-gray-600">
                          <Camera className="w-5 h-5" />
                       </label>
                       <input 
                          type="text" 
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                          placeholder={isRecording ? "Recording..." : "Type product details or use mic..."}
                          className="flex-1 bg-gray-100 border-none rounded-xl p-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50"
                          disabled={isRecording}
                       />
                       <button 
                          onClick={handleMicClick}
                          className={`p-3.5 rounded-xl transition-colors shadow-sm flex-shrink-0 ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                       >
                          <Mic className="w-5 h-5" />
                       </button>
                       <button 
                          onClick={handleSendChatMessage}
                          disabled={isSubmitting || (!chatInput && !audioBlob && chatImagePreviews.length === 0)}
                          className="p-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-md"
                       >
                          <Send className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              // Manual Form UI
              <form onSubmit={handleManualSubmit} className="flex-1 flex flex-col">
                 <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image Upload */}
                    <div>
                       <h3 className="font-bold text-gray-900 mb-4">Product Images</h3>
                       <input type="file" accept="image/*" id="manual-upload" className="hidden" onChange={handleManualImageSelect} />
                       <label htmlFor="manual-upload" className="block w-full h-80 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all overflow-hidden group">
                          {manualImagePreview ? (
                             <img src={manualImagePreview} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
                                <ImageIcon className="w-12 h-12 mb-3" />
                                <p className="font-bold text-sm">Click to upload raw clothing image</p>
                                <p className="text-xs mt-1">AI will automatically generate 3 model images</p>
                             </div>
                          )}
                       </label>
                    </div>
                    
                    {/* Right: Details Form */}
                    <div className="space-y-4">
                       <h3 className="font-bold text-gray-900 mb-4">Product Details</h3>
                       
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50" />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                             <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-gray-500 uppercase">Brand</label>
                             <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50" />
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                             <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50">
                                <option>Men</option><option>Women</option><option>Unisex</option>
                             </select>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-xs font-bold text-gray-500 uppercase">Base Size</label>
                             <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50">
                                <option>S</option><option>M</option><option>L</option><option>XL</option>
                             </select>
                          </div>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="bg-[#5C1324] hover:bg-[#4A0F1D] disabled:opacity-70 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#5C1324]/20 transition-all flex items-center gap-2">
                       {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                       {isSubmitting ? 'Generating AI Models & Registering...' : 'Register Product with AI'}
                    </button>
                 </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
