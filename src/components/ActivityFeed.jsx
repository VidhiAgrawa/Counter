import React from 'react';
import { Users, History, Activity, UserCheck } from 'lucide-react';

export function ActivityFeed({ 
  logs = [], 
  peers = [], 
  nickname 
}) {
  return (
    <div className="w-full max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      {/* Connected Squad Members */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Connected Squad
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            {peers.length + 1} Online
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* User's own badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-xs font-medium text-cyan-200">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <span>{nickname}</span>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-bold">You</span>
          </div>

          {/* Other peer badges */}
          {peers.map((peer, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{peer.nickname || `Friend #${idx + 1}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Live Activity
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
        </div>

        <div className="flex-1 max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic text-center py-2">No activity recorded yet</p>
          ) : (
            logs.slice(0, 8).map((log, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-800/40 last:border-0"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="font-semibold text-cyan-300">{log.user}:</span>
                  <span className="text-slate-400 truncate">{log.text}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
