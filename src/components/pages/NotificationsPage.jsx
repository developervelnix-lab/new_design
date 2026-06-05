import React, { useState, useEffect } from 'react';
import RanaHeader from '../home/ranamatch/RanaHeader';
import '../../assets/css/ranamatch.css';
import { useColors } from '../../hooks/useColors';
import { useSite } from '../../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTrash, FaCheckCircle, FaInbox, FaArrowRight } from 'react-icons/fa';
import { format } from 'date-fns';

const NotificationsPage = () => {
    const COLORS = useColors();
    const { accountInfo } = useSite();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("notifications_history") || "[]");
        setNotifications(history);
        
        // Mark all as read when opening the hub
        const ids = history.map(n => n.id);
        localStorage.setItem("acknowledged_notices", JSON.stringify(ids));
    }, []);

    const clearAll = () => {
        localStorage.setItem("notifications_history", "[]");
        localStorage.setItem("acknowledged_notices", "[]");
        setNotifications([]);
    };

    const deleteOne = (id) => {
        const filtered = notifications.filter(n => n.id !== id);
        setNotifications(filtered);
        localStorage.setItem("notifications_history", JSON.stringify(filtered));
    };

    return (
        <div className="rana-layout flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-500/5 blur-[70px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

            <RanaHeader />
            
            <main className="flex-grow py-5 px-4 md:px-8 relative z-10">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xl relative z-10 overflow-hidden" 
                                     style={{ backgroundColor: `${COLORS.brand}20`, color: COLORS.brand }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-transparent"></div>
                                    <FaInbox className="relative z-10" />
                                </div>
                                <div className="absolute -inset-0.5 bg-brand/20 blur-md rounded-xl"></div>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-black dark:text-white uppercase tracking-tight leading-none italic">Notification <span className="text-brand">Hub</span></h1>
                                <p className="text-[9px] text-gray-500 dark:text-white/40 uppercase tracking-[0.2em] font-black">Activity Stream</p>
                            </div>
                        </div>
                        
                        {notifications.length > 0 && (
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={clearAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 dark:text-white/60 hover:text-red-500 transition-all font-black text-[9px] uppercase tracking-widest border border-white/10 hover:border-red-500/30 shadow-lg"
                            >
                                <FaTrash size={10} /> Purge
                            </motion.button>
                        )}
                    </div>

                    {/* Activity Stream */}
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                        {notifications.length > 0 ? (
                            notifications.map((n, i) => (
                                <motion.div 
                                    key={n.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="relative group"
                                >
                                    <div className="p-4 rounded-2xl border transition-all duration-300 hover:bg-white/[0.03] flex gap-4 items-center backdrop-blur-md overflow-hidden"
                                         style={{ 
                                            backgroundColor: `${COLORS.panel}F0`, 
                                            borderColor: `${COLORS.brand}20` 
                                         }}>
                                        
                                        {/* Side Glow */}
                                        <div className="absolute top-0 left-0 w-0.5 h-full bg-brand/50 group-hover:bg-brand transition-all"></div>

                                        {/* Status Icon */}
                                        <div className="flex-shrink-0 relative">
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/80 group-hover:bg-brand group-hover:text-black group-hover:shadow-[0_0_15px_rgba(230,160,0,0.4)] transition-all duration-300">
                                                <FaBell size={15} />
                                            </div>
                                        </div>

                                        {/* Message Content */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-[12px] font-black text-black dark:text-white uppercase tracking-wide truncate max-w-[150px] md:max-w-xs">
                                                        {n.title}
                                                    </h2>
                                                    <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-brand/20 text-brand uppercase tracking-widest border border-brand/30">System</span>
                                                </div>
                                                <span className="text-[9px] font-black text-gray-500 dark:text-white/40 uppercase flex-shrink-0">
                                                    {format(new Date(n.time), 'MMM dd · HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 dark:text-white/70 leading-snug font-bold group-hover:dark:text-white transition-colors line-clamp-2 pr-2">
                                                {n.message}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex-shrink-0">
                                            <button 
                                                onClick={() => deleteOne(n.id)}
                                                className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                                            >
                                                <FaTrash size={11} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-16 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]"
                            >
                                <div className="text-5xl text-gray-200 dark:text-white/10 mb-4 flex justify-center">
                                    <FaInbox />
                                </div>
                                <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-tight mb-1 italic">No Notifications</h3>
                                <p className="text-[9px] text-gray-400 dark:text-white/30 uppercase tracking-widest font-black">Your inbox is empty</p>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Encrypted Marker */}
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-[7px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest">End-to-End Secure Stream</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
