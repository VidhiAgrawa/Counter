import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { AlarmOverlay } from './components/AlarmOverlay';
import { QrCodeModal } from './components/QrCodeModal';
import { ActivityFeed } from './components/ActivityFeed';

import { 
  getRoomIdFromUrl, 
  setRoomIdInUrl, 
  createSyncEngine 
} from './utils/syncEngine';

import { 
  playAlarm, 
  stopAlarm, 
  testAlarmSound, 
  getAudioContext, 
  toggleMute 
} from './utils/audioEngine';

export default function App() {
  // Room & User State
  const [roomId] = useState(() => getRoomIdFromUrl());
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('sync_timer_nickname') || `Friend_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [peers, setPeers] = useState([]);
  const [logs, setLogs] = useState([]);

  // Audio Settings
  const [isMuted, setIsMuted] = useState(false);
  const [alarmType, setAlarmType] = useState('emergency');
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Timer Core State
  const [durationSeconds, setDurationSeconds] = useState(300); // Default 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  const [targetTimestamp, setTargetTimestamp] = useState(null);
  const [lastActionBy, setLastActionBy] = useState('');
  const [lastAction, setLastAction] = useState('');

  // Refs
  const syncEngineRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Sync Room URL Hash
  useEffect(() => {
    setRoomIdInUrl(roomId);
  }, [roomId]);

  // Save nickname
  const handleUpdateNickname = (newName) => {
    setNickname(newName);
    localStorage.setItem('sync_timer_nickname', newName);
    if (syncEngineRef.current) {
      syncEngineRef.current.announcePresence(newName);
    }
  };

  // Add Log Entry
  const addLog = useCallback((user, text) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ user, text, time: timeStr }, ...prev.slice(0, 20)]);
  }, []);

  // Unlock Audio on First Click
  useEffect(() => {
    const unlockAudio = () => {
      getAudioContext();
      setAudioUnlocked(true);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Request Web Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Helper: Trigger Desktop Notification
  const fireNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (err) {
        console.debug('Notification exception:', err);
      }
    }
  }, []);

  // Handle Incoming Sync Events
  const handleIncomingState = useCallback((incomingState, actionBy, action) => {
    if (!incomingState) return;

    if (incomingState.durationSeconds !== undefined) {
      setDurationSeconds(incomingState.durationSeconds);
    }
    if (incomingState.status) {
      setStatus(incomingState.status);
    }
    if (incomingState.targetTimestamp) {
      setTargetTimestamp(incomingState.targetTimestamp);
    }
    if (incomingState.remainingSeconds !== undefined) {
      setRemainingSeconds(incomingState.remainingSeconds);
    }

    if (actionBy) setLastActionBy(actionBy);
    if (action) setLastAction(action);

    // If incoming state triggers alarm
    if (incomingState.status === 'COMPLETED') {
      playAlarm(alarmType, isMuted ? 0 : 0.9);
      fireNotification('CountDown Finished!', `${actionBy || 'Squad'} timer completed!`);
    } else if (incomingState.status !== 'COMPLETED') {
      stopAlarm();
    }

    addLog(actionBy || 'Peer', action || 'Updated countdown');
  }, [alarmType, isMuted, addLog, fireNotification]);

  // Handle Peer Presence
  const handlePeerEvent = useCallback((eventType, data) => {
    if (eventType === 'PEER_PRESENCE') {
      if (data.nickname) {
        setPeers(prev => {
          if (!prev.some(p => p.senderId === data.senderId)) {
            addLog('System', `${data.nickname} joined the room`);
            return [...prev, { senderId: data.senderId, nickname: data.nickname }];
          }
          return prev;
        });
      }
    } else if (eventType === 'STATE_REQUESTED') {
      // Send current state to newly joined peer
      if (syncEngineRef.current) {
        syncEngineRef.current.sendStateResponse({
          durationSeconds,
          remainingSeconds,
          status,
          targetTimestamp
        }, nickname);
      }
    }
  }, [durationSeconds, remainingSeconds, status, targetTimestamp, nickname, addLog]);

  // Initialize Real-time Sync Engine
  useEffect(() => {
    const engine = createSyncEngine(roomId, handleIncomingState, handlePeerEvent);
    syncEngineRef.current = engine;
    engine.announcePresence(nickname);

    return () => {
      engine.destroy();
    };
  }, [roomId, handleIncomingState, handlePeerEvent, nickname]);

  // Main Timer Countdown Loop
  useEffect(() => {
    if (status === 'RUNNING' && targetTimestamp) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diffSecs = Math.max(0, Math.ceil((targetTimestamp - now) / 1000));
        
        setRemainingSeconds(diffSecs);

        if (diffSecs <= 0) {
          clearInterval(timerIntervalRef.current);
          setStatus('COMPLETED');
          playAlarm(alarmType, isMuted ? 0 : 0.9);
          fireNotification("TIME'S UP!", "The synchronized timer has ended!");
        }
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [status, targetTimestamp, alarmType, isMuted, fireNotification]);

  // Helper: Broadcast state change
  const broadcastStateChange = (newStatus, newRemaining, newDuration, newTarget, actionText) => {
    const updatedState = {
      status: newStatus,
      remainingSeconds: newRemaining,
      durationSeconds: newDuration,
      targetTimestamp: newTarget,
    };

    setStatus(newStatus);
    setRemainingSeconds(newRemaining);
    setDurationSeconds(newDuration);
    setTargetTimestamp(newTarget);
    setLastActionBy(nickname);
    setLastAction(actionText);

    if (syncEngineRef.current) {
      syncEngineRef.current.broadcastState(updatedState, nickname, actionText);
    }

    addLog('You', actionText);
  };

  // Actions
  const handleStart = () => {
    getAudioContext();
    stopAlarm();

    const currentSecs = remainingSeconds > 0 ? remainingSeconds : durationSeconds;
    const target = Date.now() + currentSecs * 1000;
    
    broadcastStateChange('RUNNING', currentSecs, durationSeconds, target, `Started ${Math.round(durationSeconds/60)} min timer`);
  };

  const handlePause = () => {
    broadcastStateChange('PAUSED', remainingSeconds, durationSeconds, null, 'Paused timer');
  };

  const handleReset = () => {
    stopAlarm();
    broadcastStateChange('IDLE', durationSeconds, durationSeconds, null, 'Reset timer');
  };

  const handleSelectPreset = (presetSecs) => {
    stopAlarm();
    broadcastStateChange('IDLE', presetSecs, presetSecs, null, `Selected ${Math.round(presetSecs/60)} min preset`);
  };

  const handleSetCustomTime = (customSecs) => {
    stopAlarm();
    broadcastStateChange('IDLE', customSecs, customSecs, null, `Set custom time (${Math.floor(customSecs/60)}m ${customSecs%60}s)`);
  };

  const handleAdjustTime = (deltaSecs) => {
    const newRemaining = Math.max(0, remainingSeconds + deltaSecs);
    const newDuration = Math.max(newRemaining, durationSeconds + (deltaSecs > 0 ? deltaSecs : 0));
    const newTarget = status === 'RUNNING' ? Date.now() + newRemaining * 1000 : null;

    const label = deltaSecs > 0 ? `+${deltaSecs/60}m` : `${deltaSecs/60}m`;
    broadcastStateChange(status, newRemaining, newDuration, newTarget, `Adjusted time (${label})`);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
    if (muted) stopAlarm();
  };

  const handleTestSound = () => {
    getAudioContext();
    testAlarmSound(alarmType, isMuted ? 0 : 0.9);
  };

  return (
    <div className="min-h-screen bg-[#080a10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header Navigation */}
      <Header
        roomId={roomId}
        copySuccess={copySuccess}
        onCopyLink={handleCopyLink}
        onOpenQrModal={() => setShowQrModal(true)}
        nickname={nickname}
        onUpdateNickname={handleUpdateNickname}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        alarmType={alarmType}
        onChangeAlarmType={setAlarmType}
        onTestSound={handleTestSound}
      />

      {/* Interactive Unmute Banner if audio context locked */}
      {!audioUnlocked && (
        <div 
          onClick={() => { getAudioContext(); setAudioUnlocked(true); }}
          className="bg-gradient-to-r from-cyan-950 via-teal-950 to-slate-950 border-b border-cyan-800/40 py-2 px-4 text-center cursor-pointer hover:opacity-90 transition-opacity"
        >
          <p className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-2">
            <span>🔊 Click anywhere to enable full loud sound alarms for your room!</span>
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col justify-between gap-8">
        
        {/* Timer Display Ring */}
        <TimerDisplay
          remainingSeconds={remainingSeconds}
          durationSeconds={durationSeconds}
          status={status}
          onAdjustTime={handleAdjustTime}
          lastActionBy={lastActionBy}
          lastAction={lastAction}
        />

        {/* Primary Controls & Presets */}
        <TimerControls
          status={status}
          durationSeconds={durationSeconds}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSelectPreset={handleSelectPreset}
          onSetCustomTime={handleSetCustomTime}
        />

        {/* Real-time Room Squad & Activity Feed */}
        <ActivityFeed
          logs={logs}
          peers={peers}
          nickname={nickname}
        />


      </main>

      {/* Full-Screen Loud Alarm Overlay when Finished */}
      <AlarmOverlay
        show={status === 'COMPLETED'}
        onRestart={handleStart}
        onStopAlarm={() => {
          stopAlarm();
          setStatus('IDLE');
        }}
        durationMins={Math.round(durationSeconds / 60)}
      />

      {/* QR Code Sharing Modal */}
      <QrCodeModal
        show={showQrModal}
        onClose={() => setShowQrModal(false)}
        roomId={roomId}
        copySuccess={copySuccess}
        onCopyLink={handleCopyLink}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>SyncTimer — Synchronized Real-Time Squad Countdown App</p>
      </footer>

    </div>
  );
}
