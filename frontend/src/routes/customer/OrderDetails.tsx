import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Star, Download, ChevronRight, CheckCircle2, Copy } from 'lucide-react';
import { useStore } from '../../store/useStore';
import TimelineModal from '../../components/orders/TimelineModal';
import LiveMapTracker from '../../components/orders/LiveMapTracker';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orderHistory, userProfile, updateOrderStatus } = useStore();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showRatingToast, setShowRatingToast] = useState(false);

  // Live tracking state
  const [phase, setPhase] = useState("assigning");
  const [statusMessage, setStatusMessage] = useState("Connecting to delivery network...");
  const [partner, setPartner] = useState<any>(null);
  const [isLive, setIsLive] = useState(true);

  const order = orderHistory.find((o: any) => o.orderId === orderId);

  useEffect(() => {
    if (!order) return;
    
    if (order.status === 'Delivered') {
      setIsLive(false);
      setPhase('delivered');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/tracking/${orderId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatusMessage(data.status);
        setPhase(data.phase);
        if (data.partner) setPartner(data.partner);

        if (data.phase === 'delivered') {
           setIsLive(false);
           updateOrderStatus(orderId!, 'Delivered');
        }
      } catch (err) {
        console.error('WebSocket msg error', err);
      }
    };

    return () => ws.close();
  }, [orderId, order?.status]);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <button onClick={() => navigate('/history')} className="text-blue-600 hover:underline">
          Return to History
        </button>
      </div>
    );
  }

  const orderDateObj = new Date(`${order.date} ${order.time}`);
  const nextDayObj = new Date(orderDateObj.getTime() + 24 * 60 * 60 * 1000);
  
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const getEventStatus = (stepIndex: number) => {
    if (phase === 'delivered') return true;
    const phaseOrder = ['assigning', 'heading_to_store', 'packing', 'delivering'];
    const currentPhaseIdx = phaseOrder.indexOf(phase);
    return stepIndex <= currentPhaseIdx;
  };

  const events = [
    {
      title: "Order Confirmed",
      timestamp: `${formatDate(orderDateObj)} - ${formatTime(orderDateObj)}`,
      details: ["Your Order has been placed.", "Seller has processed your order."],
      isCompleted: getEventStatus(0)
    },
    {
      title: "Shipped & Partner Assigned",
      timestamp: getEventStatus(1) ? "Now" : "Pending",
      details: ["Delivery partner is heading to the boutique."],
      isCompleted: getEventStatus(1)
    },
    {
      title: "Picked Up / Out For Delivery",
      timestamp: getEventStatus(2) ? "Now" : "Pending",
      details: ["Your item has been picked up and is on the way."],
      isCompleted: getEventStatus(3)
    },
    {
      title: "Delivered",
      timestamp: phase === 'delivered' ? "Now" : "Pending",
      details: ["Your item has been delivered."],
      isCompleted: phase === 'delivered'
    }
  ];

  const primaryItem = order.items && order.items.length > 0 ? order.items[0] : null;
  const sellingPrice = order.amount;
  const listingPrice = Math.round(sellingPrice * 1.4); 
  const discount = listingPrice - sellingPrice;

  // Determine timeline line progress percentage based on phase
  const getProgressPercentage = () => {
    switch (phase) {
       case 'assigning': return 10;
       case 'heading_to_store': return 35;
       case 'packing': return 60;
       case 'delivering': return 85;
       case 'delivered': return 100;
       default: return 0;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 animate-fade-in">
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="font-bold text-lg text-gray-900">Order Details</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span>Order #{order.orderId}</span>
            <button className="text-blue-600 hover:text-blue-700 p-1">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 flex flex-col gap-6">
        
        {/* TOP: Live Map Tracker Container (Only shown when not delivered) */}
        {isLive && (
           <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row h-auto md:h-[400px]">
             <div className="w-full md:w-2/3 h-[300px] md:h-full relative bg-gray-100">
                <LiveMapTracker 
                  phase={phase} 
                  partnerInfo={partner} 
                  storeLocation={{ 
                    lat: primaryItem?.store_location?.coordinates[1] || 22.5015, 
                    lng: primaryItem?.store_location?.coordinates[0] || 88.3616 
                  }}
                  homeLocation={{
                    lat: userProfile?.addresses?.[0]?.location?.lat || 22.4981,
                    lng: userProfile?.addresses?.[0]?.location?.lon || userProfile?.addresses?.[0]?.location?.lng || 88.3653
                  }}
                />
             </div>
             <div className="w-full md:w-1/3 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-200 bg-gradient-to-br from-white to-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{statusMessage}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {phase === 'assigning' && "Looking for the nearest delivery partner."}
                  {phase === 'heading_to_store' && "Partner is heading to the store."}
                  {phase === 'packing' && "Order is being packed at the boutique."}
                  {phase === 'delivering' && "Partner is out for delivery to your location."}
                </p>
                
                {/* Dynamic Status Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                   <div 
                     className="h-full bg-blue-600 transition-all duration-1000 ease-in-out" 
                     style={{ width: `${getProgressPercentage()}%` }}
                   />
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span className={phase === 'assigning' ? 'text-blue-600' : ''}>Store</span>
                  <span className={phase === 'delivering' ? 'text-blue-600' : ''}>Transit</span>
                  <span>Home</span>
                </div>
             </div>
           </div>
        )}

        {/* BOTTOM: Order Details Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              {primaryItem && (
                <div className="flex gap-4 border-b border-gray-100 pb-5 mb-5">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-lg leading-tight mb-1">{primaryItem.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Size: {primaryItem.size} | Seller: {primaryItem.store_name || "QUICK_STYLE Boutique"}</p>
                    <div className="flex items-end gap-2">
                      <span className="font-bold text-xl text-gray-900">₹{sellingPrice}</span>
                    </div>
                  </div>
                  <div className="w-24 h-24 flex-shrink-0 border border-gray-200 rounded overflow-hidden">
                    <img src={primaryItem.image} alt={primaryItem.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Static Minimal Tracking Summary */}
              <div className="relative pl-8 mb-6">
                <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-gray-200">
                   <div className="absolute top-0 left-0 w-full bg-emerald-500 transition-all duration-1000" style={{ height: `${getProgressPercentage()}%` }} />
                </div>
                
                <div className="mb-6 relative">
                  <div className={`absolute -left-7 w-3.5 h-3.5 rounded-full border-2 shadow-sm mt-1 transition-colors ${getEventStatus(0) ? 'bg-emerald-500 border-white' : 'bg-white border-gray-300'}`}></div>
                  <p className="font-medium text-gray-900">Order Confirmed</p>
                </div>
                <div className="relative">
                  <div className={`absolute -left-7 w-3.5 h-3.5 rounded-full border-2 shadow-sm mt-1 transition-colors ${phase === 'delivered' ? 'bg-emerald-500 border-white' : 'bg-white border-gray-300'}`}></div>
                  <p className="font-medium text-gray-900">Delivered</p>
                </div>
              </div>

              <button 
                onClick={() => setIsTimelineOpen(true)}
                className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline"
              >
                See All Updates <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 text-center font-medium">
              <button 
                onClick={() => navigate('/chat')}
                className="w-full py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-800"
              >
                <MessageSquare className="w-5 h-5 text-gray-500" /> Chat with us
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 relative">
              <h3 className="font-bold text-gray-900 mb-4">Rate your experience</h3>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  <span>Rate the product</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(i => (
                    <Star 
                      key={i} 
                      onClick={() => {
                        setRating(i);
                        setShowRatingToast(true);
                        setTimeout(() => setShowRatingToast(false), 3000);
                      }}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        i <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              {showRatingToast && (
                <div className="absolute top-0 right-4 transform -translate-y-full mt-2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded shadow-lg animate-fade-in">
                  You rated {rating} star{rating > 1 ? 's' : ''}! Thank you.
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-4">Delivery details</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">{order.address ? 'Other' : 'Registered Location'}</p>
                  <p className="text-sm text-gray-600">{order.address || 'Address registered with profile'}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <span className="text-gray-900">{order.customerName || userProfile?.name || 'Soumyajit Mukhopadhyay'}</span>
                  <span>{order.customerPhone || userProfile?.phone || '9875464949'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-4">Price details</h3>
              <div className="space-y-3 text-sm border-b border-dashed border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Listing price</span>
                  <span className="line-through">₹{listingPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Selling price</span>
                  <span>₹{sellingPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total fees</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Other discount</span>
                  <span>-₹{discount}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-gray-900 mb-6">
                <span>Total amount</span>
                <span>₹{sellingPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                <span>Paid By</span>
                <span className="font-medium bg-gray-100 px-2 py-1 rounded">UPI</span>
              </div>
              <button className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5" /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <TimelineModal 
        isOpen={isTimelineOpen} 
        onClose={() => setIsTimelineOpen(false)} 
        events={events} 
      />
    </div>
  );
}
