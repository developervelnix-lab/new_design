import React from "react";
import { motion } from "framer-motion";
import { useColors } from '../../hooks/useColors';
import { useSite } from '../../context/SiteContext';

const BrandingBanner = () => {
  const COLORS = useColors();
  const { accountInfo } = useSite();
  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-2xl py-4 px-4 md:py-6 md:px-8 border border-black/5 dark:border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] group" style={{ backgroundColor: COLORS.bg2 }}>
      {/* Dynamic Background Elements */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none -translate-y-1/2 transition-colors duration-700"
        style={{ backgroundColor: `${COLORS.brand}1A` }} // 1A is ~10% opacity
      ></div>
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none translate-y-1/2"
        style={{ backgroundColor: `${COLORS.brandDark}0D` }} // 0D is ~5% opacity
      ></div>

      {/* Animated Mesh Gradient Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle_at_50%_50%, ${COLORS.brand}1A, transparent 70%)` }}></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Main Branding Text */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full text-[clamp(0.6rem,2.5vw,2rem)] md:text-2xl lg:text-3xl font-black text-black dark:text-white leading-none uppercase tracking-tighter whitespace-nowrap"
        >
          PREMIER <span className="inline-block text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" style={{ backgroundImage: `linear-gradient(to bottom, ${COLORS.brandLight}, ${COLORS.brand}, ${COLORS.brandDark})` }}>BETTING</span> EXPERIENCE <span className="text-black/20 dark:text-white/20 font-light">—</span> <span className="relative">
            {accountInfo?.service_site_name || "Velplay365"}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-1 md:-bottom-2 left-0 h-0.5 md:h-1 rounded-full"
              style={{ backgroundColor: COLORS.brand, boxShadow: `0 0 20px ${COLORS.brand}` }}
            ></motion.div>
          </span>
        </motion.h2>
      </div>

      {/* Subtle Corner Accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l border-t border-black/10 dark:border-white/10 rounded-tl-xl md:rounded-tl-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r border-b border-black/10 dark:border-white/10 rounded-br-xl md:rounded-br-2xl pointer-events-none"></div>
    </div>
  );
};

export default BrandingBanner;
