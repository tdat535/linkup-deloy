import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, className }) => {
  return (
    <div className={`rounded-2xl shadow p-4 bg-white flex items-center justify-between ${className}`}>
      <div>
        <div className="text-gray-500 text-sm">{title}</div>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </div>
      <div className="text-4xl text-blue-500">{icon}</div>
    </div>
  );
};

export default DashboardCard;
