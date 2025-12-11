import React from 'react';
import { AgentConfig, AgentType } from '../types';

interface AgentCardProps {
  config: AgentConfig;
  isActive: boolean;
  isCoordinator?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ config, isActive, isCoordinator }) => {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl p-4 transition-all duration-300 border
        ${isActive 
          ? 'shadow-lg ring-2 ring-offset-1 ring-hospital-500 scale-105 bg-white border-transparent' 
          : 'bg-white/80 border-slate-200 hover:bg-white text-slate-500 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-xl text-white shadow-sm
          ${config.color}
        `}>
          {config.icon}
        </div>
        {isActive && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>
      
      <h3 className={`font-semibold text-sm ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
        {config.name}
      </h3>
      
      {!isCoordinator && (
        <p className="text-xs mt-1 leading-relaxed line-clamp-2">
          {config.description}
        </p>
      )}
    </div>
  );
};

export default AgentCard;