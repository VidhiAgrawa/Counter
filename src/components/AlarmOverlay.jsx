import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RotateCcw, VolumeX, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function AlarmOverlay({ 
  show, 
  onRestart, 
  onStopAlarm
}) {
  useEffect(() => {
    if (show) {
      // Trigger festive confetti burst when countdown ends
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.debug('Confetti launch error:', err);
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-flash-red"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-slate-950 border-2 border-red-500 rounded-3xl p-8 w-full max-w-lg shadow-[0_0_80px_rgba(239,68,68,0.7)] text-center space-y-6 relative overflow-hidden"
        >
          {/* Top glowing ambient light */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Alarm Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center animate-ping absolute" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-xl shadow-red-600/50 relative">
              <Bell className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              COUNTDOWN FINISHED!
            </h2>
            <p className="text-sm text-red-200/90 max-w-xs mx-auto">
              Your squad's timer has reached zero! A loud alarm is currently playing.
            </p>
          </div>

          {/* Sound wave equalizer animation */}
          <div className="flex items-center justify-center gap-1.5 h-8">
            <div className="w-1.5 bg-red-400 rounded-full sound-bar-1" />
            <div className="w-1.5 bg-red-400 rounded-full sound-bar-2" />
            <div className="w-1.5 bg-red-400 rounded-full sound-bar-3" />
            <div className="w-1.5 bg-red-400 rounded-full sound-bar-4" />
            <div className="w-1.5 bg-red-400 rounded-full sound-bar-2" />
            <div className="w-1.5 bg-red-400 rounded-full sound-bar-1" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-950/80 transition-all"
            >
              <RotateCcw className="w-5 h-5 fill-current" />
              <span>Restart Timer</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStopAlarm}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-red-300 font-bold text-base border border-red-900/60 shadow-lg transition-all"
            >
              <VolumeX className="w-5 h-5 text-red-400" />
              <span>Stop Alarm</span>
            </motion.button>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
