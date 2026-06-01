import React from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaTelegramPlane,
  FaWhatsapp,
  FaDownload,
  FaTwitter
} from "react-icons/fa";
import { useColors } from '../../hooks/useColors';

import { useSite } from "../../context/SiteContext";
import { URL as BASE_URL } from "../../utils/constants"
import { usePWAInstall } from "../../hooks/usePWAInstall"

const Footer = () => {
  const COLORS = useColors();
  const { accountInfo } = useSite();
  const { isInstalled, isInstallable, installApp, platform } = usePWAInstall();

  const handleSmartAppAction = () => {
    if (isInstalled) {
      window.open(window.location.origin, '_blank');
    } else if (isInstallable) {
      installApp();
    } else if (platform === 'android') {
      window.open(accountInfo?.service_app_download_url || "/ranamatch.apk", "_blank");
    } else {
      window.open(window.location.origin, '_blank');
    }
  };

  return (
    <footer className="pt-4 pb-28 md:pb-4 px-4 md:px-8 border-t border-black/10 dark:border-white/10 relative overflow-hidden"
      style={{ backgroundColor: COLORS.bg2, color: 'white', fontFamily: COLORS.fontUi || 'Rajdhani' }}>
      {/* Visual Depth Accents */}
      <div
        className="absolute top-0 left-0 w-full h-[1px] z-10"
        style={{ background: `linear-gradient(to right, transparent, ${COLORS.brand}4D, transparent)` }}
      ></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-full pointer-events-none">
        <div
          className="absolute top-0 left-0 w-64 h-64 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: `${COLORS.brand}0D` }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 blur-[150px] rounded-full translate-x-1/4 translate-y-1/4"
          style={{ backgroundColor: `${COLORS.brand}08` }}
        ></div>
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <img
                  src={accountInfo?.service_site_logo?.startsWith('http') ? accountInfo.service_site_logo : (!accountInfo?.service_site_logo ? "/banner/image.png" : `${BASE_URL}${accountInfo?.service_site_logo}`)}
                  alt={accountInfo?.service_site_name || 'Site'}
                  className="h-8 w-auto px-1"
                  onError={(e) => { e.target.src = "/banner/image.png"; }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-black text-lg tracking-tighter uppercase leading-none">{(accountInfo?.service_site_name || 'SITE').toUpperCase()}</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] mt-1" style={{ color: COLORS.brand }}>{accountInfo?.service_tagline || ''}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-black/70 dark:text-white/70 font-medium">
              <strong className="text-black dark:text-white">{accountInfo?.service_site_name || 'Site'}</strong> is the best platform for live and uninterrupted online
              betting for sports, Live 24hr betting with a wide spectrum of sports
              such as Cricket, Soccer, Horse Racing, Kabaddi, <strong style={{ color: COLORS.brand }}>Aviator
                Predictor</strong>, Hockey, Basketball, <strong style={{ color: COLORS.brand }}>Andar Bahar Game</strong> and
              many more.
            </p>

            {/* Social Icons - Now correctly placed under Velplay365 description */}
            <div className="flex items-center gap-3 flex-wrap justify-start">
              {(() => {
                if (accountInfo?.service_social_links && accountInfo.service_social_links.length > 0) {
                  const iconMap = {
                    'whatsapp': { icon: <FaWhatsapp />, color: "hover:text-green-500", prefix: "https://wa.me/" },
                    'telegram': { icon: <FaTelegramPlane />, color: "hover:text-blue-400", prefix: "" },
                    'instagram': { icon: <FaInstagram />, color: "hover:text-pink-500", prefix: "" },
                    'facebook': { icon: <FaFacebookF />, color: "hover:text-blue-500", prefix: "" },
                    'twitter': { icon: <FaTwitter />, color: "hover:text-sky-400", prefix: "" }
                  };
                  return accountInfo.service_social_links.map((link, i) => {
                    const platform = link.platform.toLowerCase();
                    let url = link.value;
                    const meta = iconMap[platform] || iconMap['telegram'];
                    if (platform === 'whatsapp' && !url.includes('wa.me')) {
                      url = meta.prefix + url.replace(/\s+/g, '');
                    } else if (!url.startsWith('http')) {
                      url = 'https://' + url;
                    }
                    return (
                      <a key={'dyn_soc' + i} href={url} target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-base text-black/40 dark:text-white/40 transition-all duration-300 ${meta.color} hover:bg-gray-100 dark:bg-white/10 hover:border-black/20 dark:border-white/20`}>
                        {meta.icon}
                      </a>
                    );
                  });
                }
                return null;
              })()}
            </div>

            {/* Address - Now dynamically linked to backend SITE_ADDRESS */}
            {accountInfo?.service_address && (
              <p className="text-[10px] text-black/60 dark:text-white/60 font-medium max-w-sm text-left leading-relaxed">
                📍 {accountInfo.service_address}
              </p>
            )}
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-black dark:text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-[2px]" style={{ backgroundColor: COLORS.brand }}></span>
              Quick Navigation
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              {[
                { name: "Live Betting", href: "#" },
                { name: "Cricket Hub", href: "#" },
                { name: "Casino Lobby", href: "#" },
                { name: "Direct Support", href: accountInfo?.service_support_url || "#" },
                { name: "Promotions", href: "/promotion" },
                { name: isInstalled ? "Go to App" : "Get App", href: "#", onClick: handleSmartAppAction }
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.href} onClick={(e) => { if (link.onClick) { e.preventDefault(); link.onClick(); } }} className="text-xs font-bold text-black/60 dark:text-white/60 hover:text-black dark:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 group cursor-pointer">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-black dark:text-white font-black text-base uppercase tracking-tight leading-tight glow-text">100% Safe & Instant Payments</h2>
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed font-medium">
                You can make payments and receive earnings instantly via your UPI ID...
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-600/20 border border-red-600/40 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest">18+ Only</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 rounded-lg text-[10px] font-black uppercase tracking-widest">G</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 rounded-lg text-[10px] font-black uppercase tracking-widest">GT</span>
            </div>

            <button
              onClick={handleSmartAppAction}
              className="inline-flex items-center gap-3 px-6 py-2.5 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(34,197,94,0.4)] cursor-pointer"
              style={{ backgroundColor: '#22C55E' }}
            >
              <FaDownload className="text-sm" />
              {isInstalled ? "Go to App" : "Get App"}
            </button>
          </div>

          {/* Section 4: Payments & Advice */}
          <div className="space-y-4 lg:text-right flex flex-col items-center lg:items-end">
            <h2 className="text-black dark:text-white font-black text-[10px] uppercase tracking-[0.3em] w-full text-center lg:text-right">Accepted Modes Of Payments</h2>
            <div className="w-full bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.01)] group hover:bg-white/[0.08] transition-all flex items-center justify-center lg:justify-end">
              <img
                src="https://i.postimg.cc/3w5tyBC0/paymentopt1-removebg-preview-1.png"
                alt="Payment Options"
                className="h-10 md:h-12 w-auto object-contain brightness-150 contrast-150 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              />
            </div>
          </div>
        </div>

        {/* Brand Bar & Social */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-12 gap-y-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-[10px] text-black/40 dark:text-white/40 font-black uppercase tracking-[0.4em]">
                © Copyright 2025 {accountInfo?.service_site_name || 'Site'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                "Responsible Gambling",
                "Terms & Condition",
                "KYC Policy"
              ].map((text, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-[9px] font-black text-black/30 dark:text-white/30 hover:text-black dark:text-white uppercase tracking-[0.2em] transition-colors whitespace-nowrap"
                >
                  {text}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Responsibility Disclaimer Row */}
            <p
              className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-center leading-relaxed max-w-2xl"
              style={{ color: COLORS.brand, filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.2))' }}
            >
              Gambling can be addictive, please play responsibly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
