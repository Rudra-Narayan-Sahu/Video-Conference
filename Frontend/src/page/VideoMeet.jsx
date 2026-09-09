import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { iceServers, BACKEND_URL } from '../utils/webrtcConfig';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share2, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Send, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

export default function VideoMeet() {
  const { url: meetingUrl } = useParams();
  const meetingCode = meetingUrl || 'general-meeting';
  const navigate = useNavigate();
  const { user, addToActivity } = useAuth();

  const currentUserName = user?.name || user?.username || 'Guest_' + Math.floor(100 + Math.random() * 900);

  // Media state
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  // UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // WebRTC & Peer states
  const [remoteStreams, setRemoteStreams] = useState({});
  const [activePeers, setActivePeers] = useState([]);

  // Refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const chatBottomRef = useRef(null);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  useEffect(() => {
    addToActivity(meetingCode);
  }, [meetingCode]);

  useEffect(() => {
    let isMounted = true;

    const startCall = async () => {
      // 1. Get Camera and Microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not access camera/mic:", err.message);
        setPermissionError("Camera or microphone access denied. Joining in listen-only mode.");
      }

      // 2. Connect to Socket.IO Server
      const socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-call', meetingCode);
      });

      // 3. User Joined
      socket.on('user-joined', async (joinedSocketId, allRoomPeers) => {
        if (!isMounted) return;
        setActivePeers(allRoomPeers.filter(id => id !== socket.id));

        if (joinedSocketId === socket.id) {
          allRoomPeers.forEach(async (peerId) => {
            if (peerId !== socket.id && !peerConnections.current[peerId]) {
              await createPeerConnection(peerId, true);
            }
          });
        } else {
          showToast(`A participant joined`);
        }
      });

      // 4. WebRTC Signaling
      socket.on('signal', async (fromId, message) => {
        if (!isMounted) return;
        try {
          const signalData = JSON.parse(message);

          if (signalData.sdp) {
            let pc = peerConnections.current[fromId];
            if (!pc) {
              pc = await createPeerConnection(fromId, false);
            }

            if (signalData.sdp.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit('signal', fromId, JSON.stringify({ sdp: answer }));
            } else if (signalData.sdp.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
            }
          }

          if (signalData.candidate) {
            const pc = peerConnections.current[fromId];
            if (pc) {
              await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
            }
          }
        } catch (err) {
          console.error("Signaling error:", err);
        }
      });

      // 5. In-Call Chat
      socket.on('chat-message', (data, sender, senderSocketId) => {
        if (!isMounted) return;
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            sender: sender || 'Participant',
            text: data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: senderSocketId === socket.id
          }
        ]);

        if (senderSocketId !== socket.id) {
          setUnreadChatCount(prev => prev + 1);
        }
      });

      // 6. User Disconnect
      socket.on('user-left', (leftSocketId) => {
        if (!isMounted) return;
        if (peerConnections.current[leftSocketId]) {
          peerConnections.current[leftSocketId].close();
          delete peerConnections.current[leftSocketId];
        }

        setRemoteStreams(prev => {
          const updated = { ...prev };
          delete updated[leftSocketId];
          return updated;
        });

        setActivePeers(prev => prev.filter(id => id !== leftSocketId));
        showToast('A participant left');
      });
    };

    startCall();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};

      if (socketRef.current) {
        socketRef.current.emit('user-left');
        socketRef.current.disconnect();
      }
    };
  }, [meetingCode]);

  const createPeerConnection = async (peerId, isInitiator) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[peerId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal', peerId, JSON.stringify({ candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: {
          stream: event.streams[0],
          id: peerId
        }
      }));
    };

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('signal', peerId, JSON.stringify({ sdp: offer }));
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    }

    return pc;
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoActive(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenVideoTrack;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        setScreenSharing(true);

        screenVideoTrack.onended = () => {
          revertToCameraStream();
        };
      } catch (err) {
        console.warn("Screen share cancelled:", err);
      }
    } else {
      revertToCameraStream();
    }
  };

  const revertToCameraStream = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    if (localStreamRef.current) {
      const cameraVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && cameraVideoTrack) {
          sender.replaceTrack(cameraVideoTrack);
        }
      });
    }
    setScreenSharing(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socketRef.current) return;

    socketRef.current.emit('chat-message', messageInput.trim(), currentUserName);
    setMessageInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Meeting link copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeaveMeeting = () => {
    navigate('/home');
  };

  const remotePeerIds = Object.keys(remoteStreams);
  const totalParticipants = remotePeerIds.length + 1;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'var(--bg-app)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
            <Video size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{meetingCode}</span>
            <button 
              onClick={handleCopyLink}
              className="btn-ghost" 
              style={{ padding: '3px 8px', fontSize: '11px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: '4px' }}
              title="Copy Link"
            >
              {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Invite'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
            <ShieldCheck size={14} />
            <span>Encrypted Call</span>
          </div>

          <button 
            onClick={() => setParticipantsOpen(!participantsOpen)}
            className="btn-ghost"
            style={{ padding: '5px 10px', fontSize: '12px', background: participantsOpen ? 'var(--bg-surface-elevated)' : 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}
          >
            <Users size={14} />
            <span>{totalParticipants}</span>
          </button>
        </div>
      </header>

      {permissionError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '6px 20px',
          fontSize: '12px',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertCircle size={14} />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Main Workspace Stage */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', padding: '12px', gap: '12px' }}>
        
        {/* Video Grid */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: totalParticipants === 1 ? '1fr' : totalParticipants === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          maxHeight: '100%',
          overflowY: 'auto'
        }}>
          
          {/* Local Tile */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '220px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#0e1118',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: screenSharing ? 'none' : 'scaleX(-1)'
              }}
            />

            {!videoActive && !screenSharing && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: '#11141c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {currentUserName[0]?.toUpperCase() || 'Y'}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Camera is Off</span>
              </div>
            )}

            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pointerEvents: 'none'
            }}>
              <div className="participant-name-tag">
                <span>{currentUserName} (You)</span>
                {screenSharing && <span style={{ color: '#38bdf8', fontSize: '10px' }}>• Sharing Screen</span>}
              </div>

              <div className={`tile-badge-icon ${!micActive ? 'muted' : ''}`}>
                {!micActive ? <MicOff size={12} /> : <Mic size={12} className="text-emerald-400" />}
              </div>
            </div>
          </div>

          {/* Remote Tiles */}
          {remotePeerIds.map((peerId) => (
            <RemoteVideoTile 
              key={peerId} 
              peerId={peerId} 
              stream={remoteStreams[peerId]?.stream} 
            />
          ))}

          {remotePeerIds.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              Share this meeting link to invite others.
            </div>
          )}

        </div>

        {/* Chat Drawer */}
        {chatOpen && (
          <div className="chat-sidebar" style={{ width: '320px', height: '100%', borderRadius: '12px', zIndex: 60 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Meeting Chat</span>
              <button onClick={() => setChatOpen(false)} className="btn-ghost" style={{ padding: '3px' }}>
                <X size={16} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No messages yet.
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`chat-bubble ${msg.isSelf ? 'sent' : 'received'}`}>
                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>
                      {msg.sender} • {msg.time}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }}>
              <input 
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message..."
                style={{
                  flex: 1,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 12px', borderRadius: '6px' }}>
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* Participants Drawer */}
        {participantsOpen && (
          <div className="chat-sidebar" style={{ width: '260px', height: '100%', borderRadius: '12px', zIndex: 60 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Participants ({totalParticipants})</span>
              <button onClick={() => setParticipantsOpen(false)} className="btn-ghost" style={{ padding: '3px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-surface-elevated)', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{currentUserName} (You)</span>
                {micActive ? <Mic size={13} className="text-emerald-400" /> : <MicOff size={13} className="text-rose-400" />}
              </div>

              {remotePeerIds.map(peerId => (
                <div key={peerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-app)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Peer #{peerId.substring(0, 5)}</span>
                  <span style={{ fontSize: '11px', color: '#10b981' }}>Connected</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Control Dock */}
      <footer style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        zIndex: 50
      }}>
        <div className="control-dock" style={{ margin: 0 }}>
          <button 
            onClick={toggleMic}
            className={`dock-btn ${!micActive ? 'off' : ''}`}
            title={micActive ? 'Mute' : 'Unmute'}
          >
            {micActive ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          <button 
            onClick={toggleVideo}
            className={`dock-btn ${!videoActive ? 'off' : ''}`}
            title={videoActive ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          <button 
            onClick={toggleScreenShare}
            className={`dock-btn ${screenSharing ? 'active' : ''}`}
            title={screenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Share2 size={18} />
          </button>

          <button 
            onClick={() => {
              setChatOpen(!chatOpen);
              setUnreadChatCount(0);
            }}
            className={`dock-btn ${chatOpen ? 'active' : ''}`}
            style={{ position: 'relative' }}
            title="Chat"
          >
            <MessageSquare size={18} />
            {unreadChatCount > 0 && !chatOpen && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {unreadChatCount}
              </span>
            )}
          </button>

          <button 
            onClick={handleLeaveMeeting}
            className="dock-btn danger"
            title="Leave Meeting"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </footer>

      {toastMessage && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '12px',
          color: '#fff',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function RemoteVideoTile({ peerId, stream }) {
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && stream) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '220px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#0e1118',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <video 
        ref={remoteVideoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        <div className="participant-name-tag">
          <span>Peer #{peerId.substring(0, 5)}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#10b981' }}>HD</span>
      </div>
    </div>
  );
}
