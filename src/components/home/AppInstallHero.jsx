import React from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaCheckCircle, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { URL as BASE_URL } from "../../utils/constants";
import { usePWAInstall } from "../../hooks/usePWAInstall";

const AppInstallHero = ({ accountInfo }) => {
  const COLORS = useColors();
  const { isInstallable, installApp, isInstalled, platform } = usePWAInstall();

  const siteName = accountInfo?.service_site_name || "Official Platform";
  const siteLogo = accountInfo?.service_site_logo
    ? (accountInfo.service_site_logo.startsWith('http')
      ? accountInfo.service_site_logo
      : `${BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL}${accountInfo.service_site_logo.startsWith('/') ? accountInfo.service_site_logo : '/' + accountInfo.service_site_logo}`)
    : "/app_logo/app_logo.png";

  const handleInstall = () => {
    if (platform === 'android' && !isInstalled) {
      window.open(accountInfo?.service_apk_url || "/ranamatch.apk", "_blank");
    } else if (isInstallable) {
      installApp();
    } else {
      window.location.href = '/?mode=standalone';
    }
  };

  return (
    <section className="relative py-12 md:py-20 overflow-hidden rounded-[2.5rem] my-8 group">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#004d4d] via-[#002d2d] to-black"></div>

      {/* Animated Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#99f3ff]/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left Side: Content */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <FaRocket className="animate-pulse" /> Official Application
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1]" style={{ fontFamily: FONTS.head }}>
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#99f3ff]">Gaming Experience</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
              Experience {siteName} Gaming & Sports Betting Platform with high odds, fast withdrawals, and exclusive promotions. Optimized for your device.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center lg:justify-start gap-4"
          >
            <button
              onClick={handleInstall}
              className="px-10 py-5 rounded-2xl bg-brand text-black font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(230,160,0,0.3)] flex items-center gap-3"
            >
              <FaDownload /> {isInstalled ? 'Open App' : 'Install Now'}
            </button>
            <div className="flex items-center gap-6 px-4">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-white font-bold text-xl leading-none">5M+</span>
                <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">Downloads</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-white font-bold text-xl leading-none">4.9/5</span>
                <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">Rating</span>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
              <FaCheckCircle className="text-emerald-500" /> Secure SSL
            </div>
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
              <FaCheckCircle className="text-emerald-500" /> Fast Payouts
            </div>
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
              <FaCheckCircle className="text-emerald-500" /> 24/7 Support
            </div>
          </div>
        </div>

        {/* Right Side: Visual (MOCK PWA Prompt) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative w-full max-w-[500px]"
        >
          {/* Mock Window */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10 transform rotate-1 lg:rotate-3 group-hover:rotate-0 transition-transform duration-700">
            {/* Window Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-black/5">
              <h3 className="text-lg font-bold text-black">Install app</h3>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 space-y-5">
              {/* Preview Image in Mock Window - NOW FIRST */}
              <div className="rounded-xl overflow-hidden shadow-inner bg-gray-100 aspect-video relative group/preview">
                <img
                  src={platform === 'android' || platform === 'ios' ? "/screenshots/app_mobile_image.png" : "/screenshots/app_desktop_image.png"}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover/preview:grayscale-0 transition-all duration-500"
                  alt="App Preview"
                  onError={(e) => { e.target.src = "https://img.freepik.com/free-vector/gradient-casino-landing-page-template_23-2149506692.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-white border border-black/5">
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { e.target.src = "/app_logo/app_logo.png"; }}
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-black text-black uppercase tracking-tight">{siteName}</h4>
                  <p className="text-xs text-black/40 font-medium">{window.location.host}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Application Info</p>
                <p className="text-xs text-black/60 leading-relaxed font-medium">
                  Official {siteName} platform optimized for your device. High-speed betting, secure transactions, and instant access to all premium features.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button className="px-6 py-2 rounded-xl bg-[#99f3ff] text-[#004d4d] text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all">Install</button>
                <button className="px-6 py-2 rounded-xl bg-[#004d4d] text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all">Cancel</button>
              </div>
            </div>
          </div>

          {/* Abstract Floating Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-brand/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#99f3ff]/10 blur-3xl rounded-full animate-pulse decoration-1000"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppInstallHero;
