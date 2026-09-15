import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Settings, Check } from 'lucide-react';

export function TimerControls({
  status,
  durationSeconds,
  onStart,
  onPause,
  onReset,
  onSelectPreset,
  onSetCustomTime
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMins, setCustomMins] = useState(5);
  const [customSecs, setCustomSecs] = useState(0);

  const presets = [
    { label: '1 Min', value: 60 },
    { label: '3 Min', value: 180 },
    { label: '5 Min', value: 300, isPopular: true },
    { label: '10 Min', value: 600 },
    { label: '15 Min', value: 900 },
    { label: '25 Min 🍅', value: 1500 },
    { label: '30 Min', value: 1800 },
    { label: '60 Min', value: 3600 },
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const total = (parseInt(customMins) || 0) * 60 + (parseInt(customSecs) || 0);
    if (total > 0) {
      onSetCustomTime(total);
      setShowCustomModal(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      
      {/* Primary Action Buttons (Start, Pause, Reset) */}
      <div className="flex items-center justify-center gap-4">
        {status === 'RUNNING' ? (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onPause}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-base shadow-xl shadow-amber-950/50 border border-amber-400/30 transition-all"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pause Timer</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
            className="flex-1 max-w-[220px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-950/60 border border-cyan-300/40 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{status === 'PAUSED' ? 'Resume Timer' : 'Start Countdown'}</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-800 hover:border-slate-700 shadow-md transition-all"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </motion.button>
      </div>

      {/* Preset Buttons Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Select Timer Duration
          </span>
          <button
            onClick={() => setShowCustomModal(true)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            <Settings className="w-3 h-3" />
            Custom Time
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((preset) => {
            const isSelected = durationSeconds === preset.value;
            return (
              <motion.button
                key={preset.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPreset(preset.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/80 border border-cyan-400/50'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {preset.label}
                {preset.isPopular && !isSelected && (
                  <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-cyan-500 text-slate-950 text-[9px] font-black rounded-full uppercase">
                    Popular
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Time Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-slate-900 border border-cyan-800/60 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Set Custom Duration
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={customMins}
                      onChange={(e) => setCustomMins(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-lg focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSecs}
                      onChange={(e) => setCustomSecs(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-lg focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/50"
                  >
                    Set Timer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
