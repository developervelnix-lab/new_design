import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaGift, FaArrowLeft, FaShieldAlt, FaClock, FaCoins, FaGamepad, FaCheckCircle, FaInfoCircle, FaRocket } from 'react-icons/fa';
import { useColors } from '../../hooks/useColors';
import { FONTS } from '../../constants/theme';
import { useSite } from '../../context/SiteContext';
import { useTheme } from '../../context/ThemeContext';
import { API_URL, URL as BASE_URL } from '../../utils/constants';
import Navbar from '../navbar/Navbar';

const BonusDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type') || 'standard';

    const COLORS = useColors();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [bonus, setBonus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${API_URL}?bonus_id=${id}&type=${type}`, {
                    headers: { "Route": "request-bonus-details", "AuthToken": "guest" }
                });
                const result = await response.json();
                if (result.status === "success") {
                    setBonus(result.bonus);
                } else {
                    alert(result.message || 'Failed to load bonus details');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, type]);

    const { setShowLogin, refreshSiteData, accountInfo } = useSite();
    const remainingWager = parseFloat(accountInfo?.tbl_requiredplay_balance || 0);
    const isActiveBonus = accountInfo && (
        (Number(accountInfo.tbl_active_bonus_id) === Number(id)) &&
        ((remainingWager > 0) || type === 'cashback')
    );

    const handleCancelBonus = async () => {
        if (!window.confirm("Are you sure you want to cancel this bonus? Your bonus balance and wagering progress will be lost forever.")) return;

        const authSecretKey = localStorage.getItem('auth_secret_key');
        const userId = localStorage.getItem('account_id');

        setClaiming(true);
        try {
            const response = await fetch(`${API_URL}?USER_ID=${userId}`, {
                headers: {
                    "Route": "request-cancel-bonus",
                    "AuthToken": authSecretKey
                }
            });
            const result = await response.json();

            if (result.status === "success") {
                alert(result.message);
                refreshSiteData();
            } else {
                alert(result.message || 'Cancellation failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        } finally {
            setClaiming(false);
        }
    };

    const handleClaim = async () => {
        const authSecretKey = localStorage.getItem('auth_secret_key');
        const userId = localStorage.getItem('account_id');

        if (!authSecretKey || !userId) {
            setShowLogin(true);
            return;
        }

        setClaiming(true);
        try {
            const response = await fetch(`${API_URL}?bonus_id=${id}&USER_ID=${userId}&type=${type}`, {
                headers: {
                    "Route": "request-claim-bonus",
                    "AuthToken": authSecretKey
                }
            });
            const result = await response.json();

            if (result.status === "success") {
                if (type === 'cashback') {
                    alert('Successfully Enrolled! Your cashback will be calculated based on your net loss at the end of the period.');
                } else {
                    alert('Bonus Claimed! ₹' + result.new_balance + ' has been added to your bonus wallet.');
                }
                refreshSiteData(); // Refresh the global wallet balance
            } else {
                alert(result.message.replace(/_/g, ' ') || 'Claim failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        } finally {
            setClaiming(false);
        }
    };



    if (!bonus) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-[#F8F9FA] text-[#121212]'} p-4`}>
                <h2 className="text-2xl font-black mb-4">Bonus Not Found</h2>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand rounded-lg font-bold text-white" style={{ backgroundColor: COLORS.brand }}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: COLORS.bg }}>
            <Navbar />

            {/* Header / Banner - Clean Full-Width Hero */}
            <div className="relative w-full h-[400px] md:h-[650px] overflow-hidden bg-black -mt-[100px] md:-mt-[144px]">
                {/* Immersive Full-Width Image */}
                <div className="absolute inset-0 z-0 select-none">
                    <img
                        src={`${BASE_URL}${bonus.image_path}`}
                        alt={bonus.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
                </div>

                <div className="relative z-20 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-32">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/40 border border-brand/60 text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md" style={{ color: '#fff', backgroundColor: COLORS.brand }}>
                            <FaShieldAlt /> {bonus.category.toUpperCase()} EXCLUSIVE
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl leading-none" style={{ fontFamily: FONTS.head }}>
                            {bonus.title}
                        </h1>
                    </div>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-[110px] md:top-[160px] left-8 w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl text-white hover:bg-white hover:text-black transition-all shadow-2xl border border-white/10 z-40 flex items-center justify-center group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>


            {/* Content Area - Modern Overlap Layout */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-40">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Columns: Details (3 spans) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className={`p-4 md:p-5 rounded-3xl backdrop-blur-sm border shadow-2xl ${isDark ? 'bg-black/5 border-white/10' : 'bg-white/10 border-black/10'}`}>
                            <h2 className={`text-base font-black uppercase tracking-wide mb-3 border-l-4 border-brand pl-3 ${isDark ? 'text-white' : 'text-[#121212]'}`} style={{ borderColor: COLORS.brand }}>
                                About this Bonus
                            </h2>
                            <p className={`text-xs leading-relaxed font-medium mb-4 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                {bonus.description}
                            </p>

                            {/* Technical Stats Row - High-Contrast Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div className={`group p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10' : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.05]'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: COLORS.brand }}>
                                            <FaCoins className="text-[10px]" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Min Deposit</span>
                                    </div>
                                    <div className="text-sm font-black uppercase tracking-tight flex items-baseline gap-1">
                                        <span className="text-[10px] opacity-50">₹</span>{bonus.min_deposit || 0}
                                    </div>
                                </div>

                                <div className={`group p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10' : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.05]'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center group-hover:rotate-12 transition-transform" style={{ color: COLORS.brand }}>
                                            <FaClock className="text-[10px]" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Wagering</span>
                                    </div>
                                    <div className="text-sm font-black uppercase tracking-tight">
                                        {bonus.providers && bonus.providers.length > 0 ? (
                                            <span className="flex items-center gap-1.5">
                                                {bonus.providers[0].wagering_multiplier}<span className="text-brand" style={{ color: COLORS.brand }}>X</span>
                                                <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest leading-none">Global</span>
                                            </span>
                                        ) : (
                                            'No Wagering'
                                        )}
                                    </div>
                                </div>

                                <div className={`group p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10' : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.05]'} col-span-2 md:col-span-1`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: COLORS.brand }}>
                                            <FaGift className="text-[10px]" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Bonus Value</span>
                                    </div>
                                    <div className="text-sm font-black uppercase tracking-tight" style={{ color: COLORS.brand }}>
                                        {bonus.redemption_type === 'percent' ? `${bonus.amount}% Boost` : `₹${bonus.amount} Flat`}
                                    </div>
                                </div>
                            </div>

                            {/* Supported Providers - Smaller Pills */}
                            {bonus.providers && bonus.providers.length > 0 && (
                                <div className="mb-5">
                                    <h3 className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50 flex items-center gap-2">
                                        <FaGamepad /> Eligible Providers
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {bonus.providers.map((p, idx) => (
                                            <div key={idx} className="px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/20 text-[8px] font-black uppercase tracking-wider" style={{ color: COLORS.brand }}>
                                                {p.provider_name} ({p.wagering_multiplier}x)
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full Explanation - Compact Info Box */}
                            <div className={`p-3 rounded-xl border border-dashed ${isDark ? 'bg-brand/5 border-brand/20' : 'bg-brand/5 border-brand/20'}`}>
                                <h3 className="text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-2" style={{ color: COLORS.brand }}>
                                    <FaInfoCircle /> How it works
                                </h3>
                                <p className={`text-[10px] leading-relaxed font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                    {bonus.type === 'cashback' ? (
                                        "This is a cashback promotion. Your net losses will be tracked, and a percentage will be returned to your wallet at the end of the period."
                                    ) : (
                                        `Deposit ₹${bonus.min_deposit} to qualify. Get ${bonus.redemption_type === 'percent' ? `a ${bonus.amount}%` : `a ₹${bonus.amount}`} bonus. Bonus remains in your bonus wallet until wagering is 100% complete.`
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* How to Claim Steps - Horizontal & Compact */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: <FaCoins />, title: '1. Deposit', desc: `Min. ₹${bonus.min_deposit || 0}` },
                                { icon: <FaCheckCircle />, title: '2. Claim', desc: 'Click claim below' },
                                { icon: <FaRocket />, title: '3. Play', desc: 'Enjoy games' }
                            ].map((step, idx) => (
                                <div key={idx} className={`p-3 rounded-2xl border shadow-lg text-center backdrop-blur-sm ${isDark ? 'bg-black/5 border-white/10' : 'bg-white/10 border-black/10'}`}>
                                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center mx-auto mb-2 text-brand text-sm" style={{ color: COLORS.brand }}>
                                        {step.icon}
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase mb-0.5">{step.title}</h4>
                                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest whitespace-nowrap">{step.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Terms & Conditions - Premium Structured Section */}
                        <div className={`relative overflow-hidden p-6 md:p-8 rounded-[2rem] border transition-all duration-500 shadow-2xl backdrop-blur-md ${isDark ? 'bg-black/20 border-white/5 shadow-white/[0.02]' : 'bg-white/40 border-black/5 shadow-black/[0.02]'}`}>
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: COLORS.brand }}></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: COLORS.brand }}></div>
                                        <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#121212]'}`} style={{ fontFamily: FONTS.head }}>
                                            Terms & <span style={{ color: COLORS.brand }}>Conditions</span>
                                        </h2>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/10 text-black/40'}`}>
                                        Legal Revision 2.1
                                    </div>
                                </div>

                                <div className={`relative group`}>
                                    <div className={`text-[11px] leading-8 whitespace-pre-line font-medium ${isDark ? 'text-white/60' : 'text-black/70'} max-h-[280px] overflow-y-auto pr-6 custom-scrollbar scroll-smooth`}>
                                        <style>{`
                                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                                            .custom-scrollbar::-webkit-scrollbar-thumb { 
                                                background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; 
                                                border-radius: 10px; 
                                            }
                                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${COLORS.brand}; }
                                        `}</style>

                                        {/* Inject some spacing into the content if it's just raw text */}
                                        <div className="space-y-4">
                                            {bonus.terms_conditions
                                                ? bonus.terms_conditions.split('\n\n').map((para, i) => (
                                                    <p key={i} className="mb-2">{para}</p>
                                                ))
                                                : "Standard platform terms and conditions apply to this promotion. Please ensure you have read and understood the wagering requirements before claiming."
                                            }
                                        </div>
                                    </div>

                                    {/* Bottom Fade Effect for Scroll */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t ${isDark ? 'from-black/10' : 'from-white/10'} to-transparent`}></div>
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    <div className={`h-px flex-grow ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${isDark ? 'text-white/20' : 'text-black/30'}`}>
                                        Velplay365 Gaming Group • Fair Play Verified
                                    </p>
                                    <div className={`h-px flex-grow ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Claim Box - Compact Sticky */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 p-5 rounded-3xl border backdrop-blur-sm shadow-2xl text-center`}
                            style={{ background: isDark ? `${COLORS.brand}01` : `${COLORS.brand}02`, borderColor: isDark ? `${COLORS.brand}10` : `${COLORS.brand}15` }}>
                            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand/10 text-white text-lg"
                                style={{ background: COLORS.brandGradient }}>
                                <FaGift />
                            </div>

                            <h3 className={`text-base font-black uppercase tracking-wide mb-0.5 ${isDark ? 'text-white' : 'text-[#121212]'}`}>{isActiveBonus ? 'Active Bonus' : 'Available'}</h3>
                            <div className={`flex items-center justify-center gap-1.5 text-[8px] font-bold uppercase tracking-widest mb-5 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                                <FaClock className="text-[10px]" /> ENDS {new Date(bonus.end_date).toLocaleDateString()}
                            </div>

                            {isActiveBonus ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => navigate('/active-bonus')}
                                        className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white text-[10px] transition-all active:scale-95 shadow-md"
                                    >
                                        View Progress
                                    </button>
                                    <button
                                        onClick={handleCancelBonus}
                                        disabled={claiming}
                                        className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] relative overflow-hidden"
                                        style={{ background: 'linear-gradient(90deg, #ef4444, #b91c1c)', color: 'white' }}
                                    >
                                        {claiming ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Cancel Bonus'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(remainingWager > 0.1) ? () => navigate('/active-bonus') : handleClaim}
                                    disabled={claiming}
                                    className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] relative overflow-hidden"
                                    style={{ background: COLORS.brandGradient, color: 'white' }}
                                >
                                    {claiming ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        (remainingWager > 0.1) ? 'Action Required / View Progress' : 'Claim Now'
                                    )}
                                </button>
                            )}

                            <p className={`mt-4 text-[8px] font-bold uppercase tracking-widest leading-loose ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                                Wagering requirements apply.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Important Note - Ultra Compact Alert Bar */}
                <div className={`mt-8 p-3 rounded-2xl border flex items-center gap-3 backdrop-blur-sm transition-all ${isDark ? 'bg-brand/5 border-brand/10' : 'bg-brand/5 border-brand/5'}`}>
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 text-brand" style={{ color: COLORS.brand }}>
                        <FaInfoCircle className="text-sm" />
                    </div>
                    <p className={`text-[9px] font-bold leading-tight ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                        <span className="text-brand font-black" style={{ color: COLORS.brand }}>IMPORTANT:</span> One active bonus at a time. All bonus money stays in the Sports/Casino bonus wallet and only transfers to your Real Balance after 100% wagering is complete!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BonusDetailsPage;
