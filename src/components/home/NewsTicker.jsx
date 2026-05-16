import React from 'react';
import { motion } from 'framer-motion';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { Newspaper } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

const NewsTicker = () => {
    const COLORS = useColors();
    const { accountInfo } = useSite();

    const scrollingText = accountInfo?.service_marquee
        ? [{ label: "LATEST NEWS", content: accountInfo.service_marquee, icon: "📢" }]
        : [];

    if (scrollingText.length === 0) return null;

    return (
        <div
            className="w-full h-8 md:h-10 flex items-center overflow-hidden border-y border-white/5 relative z-20 group"
            style={{
                backgroundColor: '#000000',
            }}
        >
            {/* Title / Icon Sidebar (LEFT) */}
            <div
                className="absolute left-0 top-0 bottom-0 px-3 md:px-5 flex items-center gap-2 z-40 bg-[#F59E0B]"
                style={{ clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)' }}
            >
                <div className="flex items-center gap-1.5">
                    <Newspaper size={14} className="text-black" />
                    <span
                        className="text-[9px] md:text-[11px] font-black uppercase tracking-wider text-black leading-none whitespace-nowrap"
                        style={{ fontFamily: FONTS.head }}
                    >
                        Latest News
                    </span>
                </div>
            </div>

            {/* Scrolling Container */}
            <div className="flex-grow h-full relative overflow-hidden flex items-center">
                <motion.div
                    className="flex whitespace-nowrap items-center"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                >
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center">
                            <span
                                className="text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-white/90 px-4"
                                style={{ fontFamily: FONTS.ui }}
                            >
                                {accountInfo?.service_marquee || "Welcome to our platform! Experience the best betting and casino experience. Daily rewards and instant withdrawals available now."}
                            </span>
                            <span className="mx-4 text-white/20">I</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default NewsTicker;
