# ⏱️ Real-Time Shared Countdown App

A modern, high-performance, real-time synchronized countdown timer application designed for teams, remote work sessions, events, games, and friends. Built with React 19, Vite, Tailwind CSS v4, Framer Motion, and real-time pub/sub synchronization.

---

## ✨ Features

- ⚡ **Cross-Device & Multi-Tab Real-Time Sync**: Synchronize timer status (Start, Pause, Reset, Adjust Time) instantaneously across different devices, phones, and browser tabs.
- 🌐 **MQTT WebSockets & Local BroadcastChannel**: Uses MQTT over WebSockets for global internet synchronization + `BroadcastChannel` API for zero-latency multi-tab local syncing.
- 🔗 **Instant Room Sharing**: Join or create custom room IDs directly via URL hash (`#room=squad-1234`), copyable invite links, or scannable QR Code generation.
- 🔊 **Web Audio Synthesizer**: Custom Web Audio API tone generator featuring 4 distinct alarm sounds (*Emergency Siren*, *Gentle Chime*, *Retro Beep*, *Synth Wave*) with volume controls and mute toggles — zero external audio dependencies!
- 🎆 **Visual Celebrations & Alarm Overlays**: Flashing full-screen alarm overlay with instant stop triggers and celebratory confetti explosions (`canvas-confetti`) when timers complete.
- 👥 **Live Presence & Activity Log**: Real-time room activity feed tracking participant presence, nickname changes, and action timestamps.
- 🔔 **Desktop Web Notifications**: Push notifications alert users when the timer finishes, even if the app tab is minimized or running in the background.
- 🎨 **Futuristic UI & Micro-Animations**: Sleek dark mode design powered by Tailwind CSS v4, Glassmorphism, dynamic radial progress indicators, and Framer Motion transitions.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-Time Engine**: [MQTT.js](https://github.com/mqttjs/MQTT.js) (WebSockets `wss://broker.emqx.io:8084/mqtt`) + HTML5 `BroadcastChannel`
- **Audio Engine**: Web Audio API (Synthesizer Oscillators & Gain Nodes)
- **Utilities**: `canvas-confetti`, `qrcode`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn` / `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/VidhiAgrawa/Counter.git
   cd Counter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Test Real-Time Sync**:
   - Open the app in two separate browser windows or tabs.
   - Or share the room URL/QR Code with another device on the internet.
   - Any timer start, pause, reset, or duration change will instantly replicate across all participants!

---

## 🏗️ Project Structure

```text
Counter/
├── public/               # Static assets
├── src/
│   ├── assets/           # App images and branding icons
│   ├── components/       # UI Components
│   │   ├── ActivityFeed.jsx   # Live room activity log & participant presence
│   │   ├── AlarmOverlay.jsx   # Full-screen flashing completion modal & stop controls
│   │   ├── Header.jsx         # Navigation bar, room status, QR modal trigger & audio controls
│   │   ├── QrCodeModal.jsx    # QR Code generator for quick room joining
│   │   ├── TimerControls.jsx  # Start/Pause/Reset & preset duration selectors
│   │   └── TimerDisplay.jsx   # Radial clock ring & main time readout
│   ├── utils/            # Core Utility Engines
│   │   ├── audioEngine.js     # Web Audio API synthesizer for alarms & sound effects
│   │   └── syncEngine.js      # MQTT WebSockets + BroadcastChannel sync coordinator
│   ├── App.jsx           # Main application state orchestrator
│   ├── index.css         # Tailwind CSS & global styles
│   └── main.jsx          # React DOM entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## 📡 Real-Time Synchronization Architecture

1. **Local Multi-Tab Sync**: Uses `BroadcastChannel("sync_room_<roomId>")` to update other tabs on the same browser instantly without hitting the network.
2. **Global Cross-Device Sync**: Connects via WebSockets to a public MQTT broker (`wss://broker.emqx.io:8084/mqtt`).
3. **Timestamp Reconciliation**: Timer calculation relies on target completion timestamps (`targetTimestamp = Date.now() + remainingMs`) to maintain frame-accurate synchronization across client clocks without drift.

---

## 📜 Available Scripts

- `npm run dev` - Launches Vite local development server with HMR.
- `npm run build` - Builds optimized production bundle in `dist/`.
- `npm run preview` - Locally previews the production build.
- `npm run lint` - Runs ESLint to check for code quality and syntax errors.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

