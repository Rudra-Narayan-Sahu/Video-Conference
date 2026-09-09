// STUN / ICE Server Configuration for WebRTC
export const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
    // Future TURN server configuration can easily be inserted here:
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'user',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10
};

// Deployed Render backend URL with environment override support
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://video-conferencee.onrender.com';
