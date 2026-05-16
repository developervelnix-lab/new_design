import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaShareSquare, FaPlusSquare, FaGooglePlay, FaApple } from 'react-icons/fa';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { URL as BASE_URL } from "../../utils/constants";

const AppInstallModal = ({ isOpen, onClose, isInstallable, installApp, isInstalled, currentPlatform, apkUrl, accountInfo }) => {
  const COLORS = useColors();

  if (!isOpen) return null;

  const siteName = accountInfo?.service_site_name || "Official Platform";
  const getSafeLogoUrl = (logoPath) => {
    if (!logoPath || logoPath === "/favicon.png" || logoPath.includes('favicon.png')) return "/app_logo/app_logo.png";
    if (logoPath.startsWith('http') || logoPath.startsWith('data:')) return logoPath;

    // If it's a relative path from the backend, prepend BASE_URL
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${base}${path}`;
  };

  const siteLogo = getSafeLogoUrl(accountInfo?.service_site_logo);

  const handleInstall = () => {
    if (currentPlatform === 'android' && !isInstalled) {
      window.location.href = apkUrl || "/velplay.apk";
    } else if (isInstallable) {
      installApp();
    } else {
      window.location.href = '/?mode=standalone';
    }
    onClose();
  };

  const isAndroid = currentPlatform === 'android';
  const isIOS = currentPlatform === 'ios';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={isAndroid || isIOS ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
          animate={isAndroid || isIOS ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isAndroid || isIOS ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`relative w-full ${isAndroid || isIOS ? 'max-w-none rounded-t-[2.5rem]' : 'max-w-[480px] rounded-[2rem]'} bg-[#fdfdfd] dark:bg-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col`}
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {/* Header Bar (for mobile dragging look) */}
          {(isAndroid || isIOS) && (
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-white/10"></div>
            </div>
          )}

          {/* Close Button (Desktop Only) */}
          {!isAndroid && !isIOS && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-[110]"
            >
              <FaTimes className="text-gray-400" />
            </button>
          )}

          <div className="p-8 space-y-8">
            {/* App Profile Header */}
            <div className={`flex ${isAndroid || isIOS ? 'items-center' : 'flex-col items-center text-center'} gap-5`}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 flex-shrink-0 bg-gray-100 dark:bg-white/5">
                <img
                  src={siteLogo}
                  alt={siteName}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => { e.target.src = "/app_logo/app_logo.png"; }}
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-[#111] dark:text-white leading-tight tracking-tight">{siteName}</h2>
                <span className="text-sm font-semibold text-brand tracking-wider uppercase mt-1">Direct Web App</span>
                <span className="text-xs text-black/40 dark:text-white/40 mt-1">{window.location.host}</span>
              </div>
            </div>

            {/* Platform Specific Content */}
            {isIOS ? (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-500/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <FaApple size={20} />
                  <span className="font-bold text-sm">iOS Installation Guide</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Tap the <FaShareSquare className="inline-block mx-1 text-blue-500" /> <strong>Share</strong> button in the browser toolbar.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Scroll down and select <FaPlusSquare className="inline-block mx-1 text-blue-500" /> <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-6">
                <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100/50 dark:border-green-500/10 rounded-3xl p-6">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-4">
                    <FaGooglePlay size={18} />
                    <span className="font-bold text-sm">Android Ready</span>
                  </div>
                  <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                    Install for a faster, full-screen gaming experience. No browser tabs, immediate access from your home screen.
                  </p>
                </div>
                <button
                  onClick={handleInstall}
                  className="w-full py-5 rounded-2xl bg-brand text-black font-black text-lg shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{ background: COLORS.brandGradient }}
                >
                  <FaDownload />
                  <span>INSTALL NOW</span>
                </button>
              </div>
            ) : (
              /* Desktop Presentation */
              <div className="space-y-6">


                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleInstall}
                    className="w-full py-4 rounded-xl bg-brand text-black font-black text-sm tracking-widest uppercase shadow-xl shadow-brand/10 hover:brightness-105 active:scale-95 transition-all"
                    style={{ background: COLORS.brandGradient }}
                  >
                    Install Application
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-xl bg-transparent text-black/40 dark:text-white/40 font-black text-sm tracking-widest uppercase hover:text-black dark:hover:text-white transition-all"
                  >
                    Stay in Browser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-[#111] border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em]">{accountInfo?.service_site_name || 'Site'} Verified</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">Secure Installation</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AppInstallModal;

