import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { TrendingUp, Cpu, Zap, Package } from 'lucide-react';

const salesData = [
  { time: '09:00', sales: 1200 },
  { time: '10:00', sales: 2400 },
  { time: '11:00', sales: 3800 },
  { time: '12:00', sales: 3100 },
  { time: '13:00', sales: 4900 },
  { time: '14:00', sales: 6200 },
  { time: '15:00', sales: 5800 },
  { time: '16:00', sales: 7400 }
];

const boutiqueData = [
  { name: 'Boutique A', orders: 48, revenue: 3790 },
  { name: 'Boutique B', orders: 32, revenue: 4768 },
  { name: 'Boutique C', orders: 19, revenue: 1805 },
  { name: 'Boutique D', orders: 42, revenue: 1890 }
];

const sizeDistribution = [
  { name: 'Size S', value: 24, color: '#C5A880' },
  { name: 'Size M', value: 45, color: '#5C1324' },
  { name: 'Size L', value: 21, color: '#A58E83' },
  { name: 'Size XL', value: 10, color: '#E8E2D9' }
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-fade-in">
      
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1 */}
        <div className="glass-card rounded-2xl border border-panelBorder p-6 flex items-center gap-4 hover:border-coral/20 transition-all bg-white">
          <div className="bg-[#5C1324]/10 p-3.5 rounded-xl border border-coral/10 text-coral">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Live Platform GMV</p>
            <h4 className="text-xl font-extrabold text-gray-900 font-jakarta mt-0.5">$20,653.00</h4>
            <span className="text-[9px] text-[#10B981] font-bold">+18.4% vs yesterday</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card rounded-2xl border border-panelBorder p-6 flex items-center gap-4 hover:border-coral/20 transition-all bg-white">
          <div className="bg-[#5C1324]/10 p-3.5 rounded-xl border border-coral/10 text-coral">
            <Zap className="w-6 h-6 fill-coral/10" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg Delivery Speed</p>
            <h4 className="text-xl font-extrabold text-gray-900 font-jakarta mt-0.5">11.4 mins</h4>
            <span className="text-[9px] text-[#10B981] font-bold">100% SLA compliance</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card rounded-2xl border border-panelBorder p-6 flex items-center gap-4 hover:border-coral/20 transition-all bg-white">
          <div className="bg-[#C5A880]/15 p-3.5 rounded-xl border border-[#C5A880]/20 text-[#C5A880]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Calibration Accuracy</p>
            <h4 className="text-xl font-extrabold text-gray-900 font-jakarta mt-0.5">94.6%</h4>
            <span className="text-[9px] text-[#C5A880] font-bold">0.8% return rate</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card rounded-2xl border border-panelBorder p-6 flex items-center gap-4 hover:border-coral/20 transition-all bg-white">
          <div className="bg-[#10B981]/10 p-3.5 rounded-xl border border-[#10B981]/20 text-emerald-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Local Couriers</p>
            <h4 className="text-xl font-extrabold text-gray-900 font-jakarta mt-0.5">14 Riders</h4>
            <span className="text-[9px] text-gray-500 font-semibold">4 in Adityapur Hub</span>
          </div>
        </div>

      </div>

      {/* Main Charts Bento Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Trend Line (7 Columns) */}
        <div className="lg:col-span-8 glass-card border border-panelBorder rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[350px] bg-white">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Live Platform Sales Trend</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hourly distribution in USD</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5C1324" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5C1324" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" vertical={false} />
                <XAxis dataKey="time" stroke="#6B7280" tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#6B7280" tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E2D9', borderRadius: '12px' }}
                  labelStyle={{ color: '#5C1324', fontWeight: 'bold', fontSize: '11px' }}
                  itemStyle={{ color: '#1F1A24', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#5C1324"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FAF8F5', stroke: '#5C1324', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sizing Distribution Pie (4 Columns) */}
        <div className="lg:col-span-4 glass-card border border-panelBorder rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[350px] bg-white">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Fit Request Share</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Size calibration distribution</p>
          </div>
          <div className="h-48 mt-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E2D9', borderRadius: '12px' }}
                  itemStyle={{ color: '#1F1A24', fontSize: '11px' }}
                />
                <Pie
                  data={sizeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sizeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total</span>
              <span className="text-xl font-extrabold text-gray-900 font-jakarta">100%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sizeDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Boutique rank table (5 Columns) */}
        <div className="lg:col-span-5 glass-card border border-panelBorder rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[350px] bg-white">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Local Boutique Standing</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active zero-inventory storefronts</p>
          </div>
          <div className="mt-4 flex-1 space-y-3">
            {boutiqueData.map((boutique, index) => (
              <div key={boutique.name} className="flex items-center justify-between p-3 rounded-xl bg-[#F5F1E8]/40 border border-panelBorder">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white border border-panelBorder flex items-center justify-center text-xs font-bold text-[#C5A880]">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{boutique.name}</p>
                    <p className="text-[9px] text-gray-550 font-semibold uppercase">{boutique.orders} orders processed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-coral">${boutique.revenue}</p>
                  <p className="text-[9px] text-gray-500 font-semibold uppercase">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boutique comparison chart (7 Columns) */}
        <div className="lg:col-span-7 glass-card border border-panelBorder rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[350px] bg-white">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Boutique Comparison Metrics</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revenue allocation vs orders</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={boutiqueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#6B7280" tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8E2D9', borderRadius: '12px' }}
                  itemStyle={{ color: '#1F1A24', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#5C1324" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
