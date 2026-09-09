import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsAndSocialProof from '../components/StatsAndSocialProof';
import MeetingPlayground from '../components/MeetingPlayground';
import BentoFeatures from '../components/BentoFeatures';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';
import DevicePreviewModal from '../components/DevicePreviewModal';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isGreenRoomOpen, setIsGreenRoomOpen] = useState(false);
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleStartInstantMeeting = () => {
    const randomCode = 'aur-' + Math.floor(100 + Math.random() * 900) + '-' + Math.random().toString(36).substring(2, 6);
    setActiveRoomCode(randomCode);
    setIsGreenRoomOpen(true);
    addToast(`Generated Meeting Room: ${randomCode}`, 'success');
  };

  const handleJoinMeeting = (code) => {
    const cleanCode = code.trim().replace(/\s+/g, '-');
    if (!cleanCode) return;
    setActiveRoomCode(cleanCode);
    setIsGreenRoomOpen(true);
    addToast(`Connecting to room: ${cleanCode}...`, 'info');
  };

  const handleOpenGreenRoom = () => {
    setActiveRoomCode('aur-preview-room');
    setIsGreenRoomOpen(true);
  };

  const handleConfirmJoin = (meetingConfig) => {
    setIsGreenRoomOpen(false);
    navigate(`/${meetingConfig.roomCode}`);
  };

  const handleSelectPlan = (planName) => {
    navigate('/auth');
  };

  const handleNewsletter = (email) => {
    addToast(`Subscribed ${email} to AuraMeet updates!`, 'success');
  };

  return (
    <div className="app-container">
      {/* Ambient Grid Background */}
      <div className="ambient-grid"></div>

      {/* Floating Header */}
      <Navbar 
        onOpenNewMeeting={handleStartInstantMeeting}
        onOpenJoinModal={() => handleJoinMeeting('aur-general-room')}
      />

      {/* Hero Section with Interactive Mockup */}
      <HeroSection 
        onStartInstantMeeting={handleStartInstantMeeting}
        onJoinMeeting={handleJoinMeeting}
        onOpenGreenRoom={handleOpenGreenRoom}
      />

      {/* Stats & Client Logos */}
      <StatsAndSocialProof />

      {/* Interactive Meeting Canvas Playground */}
      <MeetingPlayground />

      {/* High-Tech Bento Grid Features */}
      <BentoFeatures />

      {/* Pricing Section */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* FAQ Accordion */}
      <FAQSection />

      {/* Footer */}
      <Footer onNewsletterSubscribe={handleNewsletter} />

      {/* Green Room / Device Preview Modal */}
      <DevicePreviewModal 
        isOpen={isGreenRoomOpen}
        onClose={() => setIsGreenRoomOpen(false)}
        onConfirmJoin={handleConfirmJoin}
        roomCode={activeRoomCode}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-400" />
            ) : t.type === 'alert' ? (
              <AlertCircle size={18} className="text-rose-400" />
            ) : (
              <Info size={18} className="text-cyan-400" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}