// Web Audio API Synthesizer Engine for Loud Alarms
// No external mp3 file dependencies - 100% reliable synth tones

let audioCtx = null;
let alarmInterval = null;
let currentOscillators = [];
let masterGainNode = null;
let isAudioMuted = false;
let globalVolume = 0.9;

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setVolume(val) {
  globalVolume = Math.max(0, Math.min(1, val));
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(isAudioMuted ? 0 : globalVolume, audioCtx.currentTime);
  }
}

export function toggleMute() {
  isAudioMuted = !isAudioMuted;
  setVolume(globalVolume);
  return isAudioMuted;
}

export function getMuteState() {
  return isAudioMuted;
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  currentOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // ignore already stopped oscillators
    }
  });
  currentOscillators = [];
  if (masterGainNode) {
    try {
      masterGainNode.disconnect();
    } catch {
      // ignore disconnect errors
    }
    masterGainNode = null;
  }
}

export function playAlarm(alarmType = 'emergency', volume = 0.9) {
  const ctx = getAudioContext();
  if (!ctx) return;

  stopAlarm(); // stop any active audio first

  globalVolume = volume;
  masterGainNode = ctx.createGain();
  masterGainNode.gain.setValueAtTime(isAudioMuted ? 0 : globalVolume, ctx.currentTime);
  masterGainNode.connect(ctx.destination);

  if (alarmType === 'emergency') {
    // High-decibel alternating emergency siren
    let toggle = false;
    const playSirenPulse = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      const freq = toggle ? 1200 : 850;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      toggle = !toggle;

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      currentOscillators.push(osc);
    };

    playSirenPulse();
    alarmInterval = setInterval(playSirenPulse, 320);

  } else if (alarmType === 'digital') {
    // Rapid digital watch alarm (beeps 4 times then pauses)
    let step = 0;
    const playDigitalBeep = () => {
      if (step < 4) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2600, ctx.currentTime);

        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(masterGainNode);

        osc.start();
        osc.stop(ctx.currentTime + 0.09);
        currentOscillators.push(osc);
      }
      step = (step + 1) % 6; // 4 beeps + 2 silences
    };

    playDigitalBeep();
    alarmInterval = setInterval(playDigitalBeep, 120);

  } else if (alarmType === 'boxing') {
    // Deep metallic gong ring
    const playGong = () => {
      [440, 880, 1320, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const initialVol = 0.6 / (i + 1);
        gain.gain.setValueAtTime(initialVol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(masterGainNode);

        osc.start();
        osc.stop(ctx.currentTime + 1.9);
        currentOscillators.push(osc);
      });
    };

    playGong();
    alarmInterval = setInterval(playGong, 2000);

  } else if (alarmType === 'nuclear') {
    // Low to high sweeping warning siren
    const playSweep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.9);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start();
      osc.stop(ctx.currentTime + 1.15);
      currentOscillators.push(osc);
    };

    playSweep();
    alarmInterval = setInterval(playSweep, 1250);
  }
}

export function testAlarmSound(alarmType = 'emergency', volume = 0.9) {
  playAlarm(alarmType, volume);
  setTimeout(() => {
    stopAlarm();
  }, 2500);
}
