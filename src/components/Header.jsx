import React, { useState } from 'react';
import { 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Volume2, 
  VolumeX, 
  User, 
  Bell, 
  Sparkles,
  Wifi
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Header({ 
  roomId, 
  copySuccess, 
  onCopyLink, 
  onOpenQrModal, 
  nickname, 
  onUpdateNickname, 
  isMuted, 
  onToggleMute, 
  alarmType, 
  onChangeAlarmType,
  onTestSound
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(nickname);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateNickname(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <header className="w-full border-b border-cyan-950/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Room Info */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20"
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  Couter
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  <Wifi className="w-2.5 h-2.5 animate-ping text-cyan-400" />
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">Shareable Real-Time Squad Countdown</p>
            </div>
          </div>

          {/* Room Badge & Share for Mobile */}
          <div className="flex md:hidden items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 pl-2.5 text-xs">
            <span className="text-slate-400">Room:</span>
            <span className="font-mono text-cyan-300 font-bold max-w-[70px] truncate">{roomId}</span>
            <button
              onClick={onCopyLink}
              className="p-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium"
              title="Copy Share Link"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onOpenQrModal}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-medium"
              title="Show QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
          
          {/* Room ID Badge & Share Button */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 rounded-xl p-1.5 pl-3">
            <span className="text-xs text-slate-400 font-medium">Room:</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{roomId}</span>
            <button
              onClick={onCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenQrModal}
              title="Show QR Code for Mobile"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>

          {/* User Nickname */}
          <div className="relative">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-28 px-2.5 py-1 text-xs bg-slate-900 border border-cyan-500 rounded-lg text-white focus:outline-none"
                  autoFocus
                  maxLength={15}
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-500"
                >
                  Save
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all"
                title="Click to edit nickname"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-200">{nickname}</span>
                <span className="text-[10px] text-slate-500 font-mono">(Edit)</span>
              </button>
            )}
          </div>

          {/* Alarm Type Selector & Sound Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/80 rounded-xl p-1">
            <select
              value={alarmType}
              onChange={(e) => onChangeAlarmType(e.target.value)}
              className="bg-slate-950 text-slate-300 text-xs px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="emergency">🚨 Siren Alarm</option>
              <option value="digital">⌚ Digital Beep</option>
              <option value="boxing">🔔 Boxing Bell</option>
              <option value="nuclear">⚠️ Nuclear Sound</option>
            </select>

            <button
              onClick={onTestSound}
              className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/50 rounded-lg text-xs font-medium transition-colors"
              title="Test Sound Tone"
            >
              Test
            </button>

            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg transition-colors ${
                isMuted 
                  ? 'bg-red-950/60 text-red-400 border border-red-800/50' 
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
              }`}
              title={isMuted ? 'Audio Muted (Click to Unmute)' : 'Audio Active'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
