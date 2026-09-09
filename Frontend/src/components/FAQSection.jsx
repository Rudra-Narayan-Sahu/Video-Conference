import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Do I need to install an app or plugin to join a call?",
      a: "No downloads or installations are required. AuraMeet runs directly in any modern browser (Chrome, Safari, Edge, Firefox, Brave) via standard WebRTC."
    },
    {
      q: "How are calls encrypted and secured?",
      a: "All audio, video, and screen sharing streams are encrypted end-to-end using DTLS and SRTP (AES-256). Room connections are secured and unauthorized access is prevented."
    },
    {
      q: "Can I share my screen with audio?",
      a: "Yes. You can share your entire desktop, specific application window, or browser tab with full audio pass-through with a single click."
    },
    {
      q: "What bandwidth is recommended for HD video?",
      a: "For 1080p video, we recommend a 2-4 Mbps internet connection. Our adaptive bitrate algorithm dynamically adjusts quality to maintain audio clarity even on slower networks."
    }
  ];

  return (
    <section id="faq" className="section-container" style={{ paddingBottom: '70px' }}>
      <div className="section-header">
        <div className="section-tag">
          <span>FAQ</span>
        </div>
        <h2 className="section-title">
          Frequently asked questions
        </h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                    color: 'var(--text-secondary)'
                  }}
                />
              </button>

              {isOpen && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
