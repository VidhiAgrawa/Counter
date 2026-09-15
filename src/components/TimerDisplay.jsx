import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Plus, Minus, Bell, Sparkles } from 'lucide-react';

export function TimerDisplay({ 
  remainingSeconds, 
  durationSeconds, 
  status, 
  onAdjustTime,
  lastActionBy,
  lastAction
}) {
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Calculate Progress Percentage for SVG Circle
  const progressPercent = durationSeconds > 0 
    ? Math.max(0, Math.min(100, (remainingSeconds / durationSeconds) * 100))
    : 0;

  // SVG Ring calculation
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Dynamic status color
  const isCritical = remainingSeconds > 0 && remainingSeconds <= 10;
  const isWarning = remainingSeconds > 10 && remainingSeconds <= 60;

  let strokeColor = '#06b6d4'; // Cyan
  let strokeGlowClass = 'drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]';

  if (isCritical || status === 'COMPLETED') {
    strokeColor = '#ef4444'; // Red
    strokeGlowClass = 'drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]';
  } else if (isWarning) {
    strokeColor = '#f59e0b'; // Amber
    strokeGlowClass = 'drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]';
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      
      {/* Background radial glow */}
      <div 
        className={`absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
          status === 'COMPLETED' || isCritical
            ? 'bg-red-600 opacity-40 animate-pulse'
            : isWarning
            ? 'bg-amber-500 opacity-30'
            : 'bg-cyan-500'
        }`} 
      />

      {/* Circular Timer Ring */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-88 sm:h-88">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
          {/* Outer Track Circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            className="stroke-slate-900/90 fill-none"
            strokeWidth="12"
          />
          {/* Outer Track Ring Border */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            className="stroke-slate-800/40 fill-none"
            strokeWidth="1"
          />
          {/* Animated Progress Circle */}
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            className={`fill-none transition-all duration-300 ${strokeGlowClass}`}
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute flex flex-col items-center justify-center text-center p-4">
          
          {/* Status Badge */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2 border ${
              status === 'RUNNING'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60 shadow-lg shadow-cyan-950/50'
                : status === 'PAUSED'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : status === 'COMPLETED'
                ? 'bg-red-950/90 text-red-300 border-red-600/80 animate-bounce'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {status === 'RUNNING' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
            {status === 'PAUSED' && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
            {status === 'COMPLETED' && (
              <Bell className="w-3.5 h-3.5 text-red-400 animate-spin" />
            )}
            <span>{status === 'COMPLETED' ? "TIME'S UP!" : status}</span>
          </motion.div>

          {/* Big Digital Digits */}
          <AnimatePresence mode="wait">
            <motion.div
              key={remainingSeconds}
              initial={{ opacity: 0.85, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-mono-digits text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-md select-none ${
                isCritical || status === 'COMPLETED'
                  ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                  : isWarning
                  ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'
              }`}
            >
              {formatTime(remainingSeconds)}
            </motion.div>
          </AnimatePresence>

          {/* Action subtitle feed */}
          {lastActionBy && (
            <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] truncate font-medium">
              <span className="text-cyan-400">{lastActionBy}</span>: {lastAction || 'updated'}
            </p>
          )}

          {/* Sound bars animation if running */}
          {status === 'RUNNING' && (
            <div className="flex items-center gap-1 mt-3 h-4">
              <div className="w-1 bg-cyan-400 rounded-full sound-bar-1" />
              <div className="w-1 bg-cyan-400 rounded-full sound-bar-2" />
              <div className="w-1 bg-cyan-400 rounded-full sound-bar-3" />
              <div className="w-1 bg-cyan-400 rounded-full sound-bar-4" />
            </div>
          )}

        </div>
      </div>

      {/* Floating Adjust Time Controls (+1m / -1m / +5m) */}
      <div className="flex items-center gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAdjustTime(-60)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all shadow-md"
          title="Subtract 1 minute"
        >
          <Minus className="w-3.5 h-3.5 text-red-400" />
          <span>1m</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAdjustTime(60)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all shadow-md"
          title="Add 1 minute"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>1m</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAdjustTime(300)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 text-xs font-semibold transition-all shadow-md"
          title="Add 5 minutes"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>5m</span>
        </motion.button>
      </div>

    </div>
  );
}
