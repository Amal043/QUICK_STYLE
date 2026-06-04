import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Calendar, ChevronRight, MapPin, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function History() {
  const { orderHistory, isLoggedIn, activeOrderId, setActiveOrderId } = useStore();
  const navigate = useNavigate();

  // If not logged in, show a premium login prompt
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="bg-white border border-panelBorder rounded-3xl p-8 shadow-2xl">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 font-display-md">Access Order History</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Please log in or sign up to view your previous boutique purchases and track active deliveries.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="w-full bg-[#5C1324] text-white py-3.5 rounded-xl font-bold hover:bg-[#4A0F1D] transition-colors shadow-md">
              Sign In
            </Link>
            <Link to="/signup" className="w-full bg-[#FAF8F5] border border-panelBorder text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-outline-variant/20">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="font-display-md text-3xl text-on-surface">Purchase History</h1>
          <p className="text-sm text-on-surface-variant mt-1.5 font-light">
            Track active shipments and view your past collection orders.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-surface-container border border-outline-variant/30 px-4 py-2 rounded-full text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>12-Min Quick Delivery Active</span>
        </div>
      </div>

      {orderHistory.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-panelBorder rounded-3xl p-12 text-center shadow-lg max-w-lg mx-auto">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-display-md">No Orders Yet</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Your shopping history is currently empty. Explore our latest curated collections and place an order to get it delivered in under 12 minutes!
          </p>
          <Link to="/collection" className="inline-block bg-[#5C1324] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4A0F1D] transition-colors shadow-md">
            Start Shopping
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orderHistory.map((order: any) => {
            const isActive = activeOrderId === order.orderId;
            return (
              <div 
                key={order.orderId} 
                className="bg-white border border-panelBorder rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in"
              >
                {/* Order Top Bar */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-panelBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                      <p className="font-extrabold text-gray-900 text-sm mt-0.5">{order.orderId}</p>
                    </div>
                    <div className="border-l border-panelBorder h-8 hidden sm:block"></div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Placed</span>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mt-0.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{order.date} · {order.time}</span>
                      </div>
                    </div>
                    <div className="border-l border-panelBorder h-8 hidden sm:block"></div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                      <p className="font-extrabold text-[#5C1324] text-sm mt-0.5">₹{order.amount}</p>
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <span className="bg-blue-100 text-blue-700 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                        In Transit
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>

                {/* Items list */}
                <div className="p-6 divide-y divide-gray-100">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-panelBorder/30">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm md:text-base leading-snug">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 font-semibold">
                            Size: <span className="text-gray-700 font-extrabold">{item.size}</span> &nbsp;·&nbsp; Qty: <span className="text-gray-700 font-extrabold">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-gray-900">₹{item.price * item.quantity}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">₹{item.price} each</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Action Button */}
                <div className="px-6 py-4 bg-gray-50/20 border-t border-panelBorder/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin className="w-4 h-4 text-coral" />
                    <span>{order.address ? `Delivered to ${order.address}` : "Delivered to registered location"}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveOrderId(order.orderId);
                      navigate(`/order-status?order_id=${order.orderId}`);
                    }}
                    className={`flex items-center gap-1 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm
                      ${isActive 
                        ? 'bg-[#5C1324] text-white hover:bg-[#4A0F1D] hover:shadow' 
                        : 'bg-white border border-panelBorder text-[#5C1324] hover:bg-gray-50 hover:border-coral'}`}
                  >
                    {isActive ? 'Track Live Map' : 'View Order Details'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
