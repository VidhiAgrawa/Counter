import mqtt from 'mqtt';

// Multi-Tab + Cross-Device Real-Time Sync Engine
// Uses BroadcastChannel for local tabs & MQTT over WebSockets for internet cross-device sync

const PUBLIC_MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
export const DEPLOYED_BASE_URL = 'https://counter-sync.vercel.app';

export function getShareableRoomUrl(roomId) {
  if (typeof window === 'undefined') return `${DEPLOYED_BASE_URL}/#room=${roomId}`;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isLocal 
    ? DEPLOYED_BASE_URL 
    : `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '');
  return `${baseUrl}/#room=${roomId}`;
}

export function getRoomIdFromUrl() {
  const hash = window.location.hash.replace('#', '');
  const searchParams = new URLSearchParams(window.location.search);
  const queryRoom = searchParams.get('room');

  if (queryRoom) return queryRoom;
  if (hash.startsWith('room=')) return hash.replace('room=', '');
  if (hash.length > 0) return hash;

  // Generate random default room ID
  const randomId = 'squad-' + Math.floor(1000 + Math.random() * 9000);
  return randomId;
}

export function setRoomIdInUrl(roomId) {
  const newUrl = `${window.location.origin}${window.location.pathname}#room=${roomId}`;
  window.history.replaceState(null, '', newUrl);
}

export function createSyncEngine(roomId, onStateReceived, onPeerEvent) {
  let broadcastChannel = null;
  let mqttClient = null;
  const clientId = 'peer_' + Math.random().toString(36).substring(2, 9);
  const topic = `countdown_app_v1/${roomId}/state`;
  const presenceTopic = `countdown_app_v1/${roomId}/presence`;

  // 1. Setup Local BroadcastChannel (Same Browser Multi-Tab Sync)
  if ('BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(`sync_room_${roomId}`);
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.senderId !== clientId) {
          handleIncomingMessage(event.data);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization failed', e);
    }
  }

  // 2. Setup MQTT over WebSockets (Cross-Device Internet Sync)
  try {
    mqttClient = mqtt.connect(PUBLIC_MQTT_BROKER, {
      clientId: clientId,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 3000,
    });

    mqttClient.on('connect', () => {
      console.log('Connected to global MQTT real-time sync broker');
      mqttClient.subscribe(topic);
      mqttClient.subscribe(presenceTopic);

      // Announce presence & request latest timer state from existing room members
      publishMessage({
        type: 'REQUEST_STATE',
        senderId: clientId,
        roomId: roomId,
      });
    });

    mqttClient.on('message', (incomingTopic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload && payload.senderId !== clientId) {
          handleIncomingMessage(payload);
        }
      } catch (e) {
        console.error('Failed to parse incoming MQTT payload', e);
      }
    });

    mqttClient.on('error', (err) => {
      console.warn('MQTT Connection Error:', err);
    });
  } catch (err) {
    console.warn('MQTT client creation error', err);
  }

  function handleIncomingMessage(data) {
    if (data.type === 'SYNC_STATE') {
      if (onStateReceived) {
        onStateReceived(data.state, data.actionBy, data.action);
      }
    } else if (data.type === 'REQUEST_STATE') {
      if (onPeerEvent) {
        onPeerEvent('STATE_REQUESTED', data);
      }
    } else if (data.type === 'PEER_JOINED' || data.type === 'PEER_PRESENCE') {
      if (onPeerEvent) {
        onPeerEvent('PEER_PRESENCE', data);
      }
    }
  }

  function publishMessage(payload) {
    const fullPayload = {
      ...payload,
      senderId: clientId,
      timestamp: Date.now(),
    };

    // Broadcast locally
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(fullPayload);
      } catch (err) {
        console.debug('BroadcastChannel postMessage error:', err);
      }
    }

    // Broadcast globally over MQTT
    if (mqttClient && mqttClient.connected) {
      try {
        mqttClient.publish(topic, JSON.stringify(fullPayload), { qos: 0 });
      } catch (err) {
        console.debug('MQTT publish error:', err);
      }
    }
  }

  return {
    clientId,
    broadcastState: (timerState, actionBy = 'Someone', action = 'UPDATE') => {
      publishMessage({
        type: 'SYNC_STATE',
        state: timerState,
        actionBy,
        action,
      });
    },
    sendStateResponse: (timerState, actionBy = 'System') => {
      publishMessage({
        type: 'SYNC_STATE',
        state: timerState,
        actionBy,
        action: 'INITIAL_SYNC',
      });
    },
    announcePresence: (nickname) => {
      publishMessage({
        type: 'PEER_PRESENCE',
        nickname,
      });
    },
    destroy: () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      if (mqttClient) {
        try {
          mqttClient.end();
        } catch (err) {
          console.debug('MQTT client end error:', err);
        }
      }
    },
  };
}
