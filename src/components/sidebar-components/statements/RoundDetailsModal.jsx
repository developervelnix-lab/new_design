import React from 'react';
import { createPortal } from 'react-dom';
import { X, Info, Receipt, Trophy, Calendar, Hash, Shield, Monitor, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { useColors } from '../../../hooks/useColors';
import { FONTS } from '../../../constants/theme';

const RoundDetailsModal = ({ isOpen, onClose, transaction }) => {
  const COLORS = useColors();

  if (!isOpen || !transaction) return null;

  const status = (transaction.r_match_status || "").toLowerCase();
  const isCashout = status === "cashout" || status === "settled_cashout";
  const netProfit = (parseFloat(transaction.r_match_profit || 0) - parseFloat(transaction.r_match_bet || transaction.r_match_amount || 0));

  const getDetectedProvider = () => {
    const rawProvider = transaction.r_provider;
    const matchName = (transaction.r_match_name || "").toLowerCase();

    if (matchName.includes('saba')) return 'Saba Sports';
    if (matchName.includes('evolution')) return 'Evolution';
    if (matchName.includes('ezugi')) return 'Ezugi';
    if (matchName.includes('lucky')) return 'Lucky Sports';
    if (matchName.includes('vivogaming')) return 'Vivo Gaming';
    if (matchName.includes('pragmatic')) return 'Pragmatic Play';
    if (matchName.includes('spribe') || matchName.includes('dice') || matchName.includes('aviator')) return 'Spribe';
    if (matchName.includes('tada')) return 'Tada';
    if (matchName.includes('kingmaker') || matchName.includes('km')) return 'King Maker';
    if (matchName.includes('turbo')) return 'Turbo Games';

    if (rawProvider && rawProvider !== 'Standard' && rawProvider !== 'ranamatch') return rawProvider;
    return transaction.r_match_name || 'Velplay365 Official';
  };

  const detectedProvider = getDetectedProvider();

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex justify-between items-start py-2 border-b border-black/5 dark:border-white/5 last:border-0 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-black/30 dark:text-white/30 group-hover:text-brand transition-colors" />}
        <span className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40" style={{ fontFamily: FONTS.ui }}>
          {label}
        </span>
      </div>
      <span className="text-[11px] font-bold text-black dark:text-white text-right max-w-[160px] break-all" style={{ fontFamily: FONTS.ui }}>
        {value || '—'}
      </span>
    </div>
  );

  const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-brand/20">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand/10 text-brand">
        <Icon size={15} />
      </div>
      <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-black dark:text-white" style={{ fontFamily: FONTS.head }}>
        {title}
      </h3>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-[92%] max-w-5xl max-h-[86vh] overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col"
        style={{ backgroundColor: COLORS.bg2 }}
      >
        <div className="p-3 md:p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg text-black dark:text-white text-base"
              style={{ background: COLORS.brandGradient }}>
              <Receipt />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-black dark:text-white" style={{ fontFamily: FONTS.head }}>
                Round Details <span style={{ color: COLORS.brand }}>({detectedProvider})</span>
              </h2>
              <p className="text-[8px] font-bold uppercase tracking-widest text-black/30 dark:text-white/30">Transaction & Settlement Report</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/40 dark:text-white/40 hover:bg-red-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-3 md:p-5 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <SectionTitle title="Round Details" icon={Info} />
              <div className="bg-black/10 dark:bg-black/40 rounded-xl p-4">
                <DetailItem label="Provider" value={detectedProvider} icon={Shield} />
                <DetailItem label="Round Id" value={transaction.r_round_id} icon={Hash} />
                <DetailItem label="Game Type" value={transaction.r_match_name} icon={PlayCircle} />
                <DetailItem label="Match Details" value={transaction.r_match_details} icon={Info} />
                <DetailItem label="Bet Placed At" value={`${transaction.r_date} ${transaction.r_time}`} icon={Calendar} />
                <DetailItem label="Settled At" value={transaction.r_result_time || 'Pending'} icon={Clock} />
                <DetailItem label="Status" value={transaction.r_match_status} icon={CheckCircle} />
                <DetailItem label="Bets TransactionID" value={transaction.r_round_id} icon={Hash} />
                <DetailItem label="Bets Playmode" value={transaction.r_playmode} icon={PlayCircle} />
                <DetailItem label="Bets Channel" value={transaction.r_channel} icon={Monitor} />
              </div>
            </div>

            <div className="space-y-2">
              <SectionTitle title="Bet Details" icon={Receipt} />
              <div className="bg-black/10 dark:bg-black/40 rounded-xl p-4">
                <DetailItem label="Choice / Selection" value={transaction.r_selection} icon={Hash} />
                {transaction.r_bet_type && <DetailItem label="Bet Type" value={transaction.r_bet_type} icon={Shield} />}
                {transaction.r_odds && <DetailItem label="Odds" value={transaction.r_odds} icon={Info} />}
                <DetailItem label="Stake" value={`₹${transaction.r_match_bet || transaction.r_match_amount}`} icon={Receipt} />
                <DetailItem label="Payout" value={`₹${transaction.r_match_profit || '0'}`} icon={Trophy} />
                <DetailItem label="Bet Time" value={`${transaction.r_date} ${transaction.r_time}`} icon={Calendar} />
                <DetailItem label="Description" value={transaction.r_match_name} icon={Info} />
                <DetailItem label="TransactionId" value={transaction.r_uniq_id} icon={Hash} />
              </div>
            </div>

            <div className="space-y-2">
              <SectionTitle title="Results" icon={Trophy} />
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4">
                <DetailItem label="Outcome Number" value={transaction.r_outcome_number} icon={Hash} />
                <DetailItem label="Outcome Type" value={transaction.r_outcome_type} icon={Info} />
                <DetailItem label="Outcome Color" value={transaction.r_outcome_color} icon={Info} />
                <DetailItem label="Wager" value={`₹${transaction.r_match_bet || transaction.r_match_amount}`} icon={Receipt} />
                <DetailItem label="Payout" value={`₹${transaction.r_match_profit || '0'}`} icon={Trophy} />

                {isCashout ? (
                  <div className="mt-5 p-4 rounded-2xl bg-purple-900/10 border border-purple-500/20 flex flex-col items-center justify-center gap-1 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] mb-1">Cashout Payout</div>
                    <div className="text-2xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(153,102,255,0.4)]" style={{ fontFamily: FONTS.head }}>
                      ₹{parseFloat(transaction.r_match_profit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${netProfit < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {netProfit < 0 ? 'Net Loss' : 'Net Profit'}: ₹{Math.abs(netProfit || 0).toFixed(2)}
                    </div>
                  </div>
                ) : (status === 'wait' || status === 'pending') ? (
                  <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full font-black uppercase tracking-[0.16em] text-[9px] bg-white/5 text-white/40 border border-white/10 animate-pulse">
                      <Clock size={16} className="animate-spin-slow" />
                      Pending Settlement
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 text-center">
                    <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full font-black uppercase tracking-[0.16em] text-[9px] ${netProfit < 0 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                      {netProfit < 0 ? 'Net Loss' : 'Net Profit'}:
                      <span className="text-base" style={{ fontFamily: FONTS.head }}>₹{Math.abs(netProfit || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4 bg-brand/5 border-t border-black/5 dark:border-white/5 flex items-center justify-center">
          <p className="text-[8px] text-black/30 dark:text-white/30 uppercase font-black tracking-[0.22em]">
            Official Transaction Record • Verification Code: {transaction.r_uniq_id?.substring(0, 12).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RoundDetailsModal;
