import React from 'react';
import { AdminDashboard } from '../../components/AdminDashboard';

const DashboardRoute: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse"></span>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-jakarta">
          QUICK_STYLE Admin Panel
        </h2>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default DashboardRoute;
