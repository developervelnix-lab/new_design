import React, { useState, useEffect } from 'react';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useSite } from "../../context/SiteContext";

const features = [
  {
    title: 'Fast Withdrawal',
    num: '01',
    color: '#a78bfa',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'
  },
  {
    title: 'Instant Deposit',
    num: '02',
    color: '#22d3ee',
    icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
  },
  {
    title: '1-Click Signup',
    num: '03',
    color: '#34d399',
    icon: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  },
  {
    title: 'Trusted Platform',
    num: '04',
    color: '#fbbf24',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  }
];

const FeaturesSection = () => {
  const COLORS = useColors();
  const { accountInfo } = useSite();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollingFeatures = [...features, ...features];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="features-section mt-7 mb-7 px-4 md:px-0 w-full">
      {/* Header aligned with other sections */}
      <div className="features-section-head flex items-center justify-between mb-4 px-1 md:px-2">
        <h2 className="section-banner max-w-full" style={{ fontFamily: FONTS.head }}>
          <span>Why Choose {accountInfo?.service_site_name || 'velplay365'}?</span>
        </h2>
      </div>

      {/* Grid of clean, horizontal cards */}
      <div className="features-scroll-shell">
      <div className="features-grid grid grid-cols-2 md:grid-cols-4 gap-3">
        {scrollingFeatures.map((f, i) => {
          const baseIndex = i % features.length;
          const isActive = baseIndex === activeIndex;
          return (
            <div
              key={`${f.title}-${i}`}
              className={`feature-card group flex items-center justify-between py-2.5 px-4 rounded-2xl border transition-all duration-300 overflow-hidden relative cursor-default ${isActive ? 'active' : ''} ${i >= features.length ? 'is-duplicate' : ''}`}
              onMouseEnter={() => setActiveIndex(baseIndex)}
            >
              {/* Subtle glow (active state) */}
              <div 
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: `linear-gradient(90deg, transparent, ${f.color}15)` }}
              ></div>
              
              <div className="flex flex-col gap-0.5 relative z-10">
                <span 
                  className={`text-2xl font-black transition-opacity duration-300 leading-none tracking-tighter ${isActive ? 'opacity-100' : 'opacity-20'}`}
                  style={{ fontFamily: FONTS.head, color: f.color }}
                >
                  {f.num}
                </span>
                <h3 
                  className="feature-title text-xs font-bold uppercase tracking-[1px] transition-colors duration-300"
                  style={{ fontFamily: FONTS.ui }}
                >
                  {f.title}
                </h3>
              </div>

              <div className={`feature-icon-wrapper relative z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-inner ${isActive ? 'scale-110' : ''}`}>
                <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`} style={{ fill: f.color }}>
                  <path d={f.icon} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
