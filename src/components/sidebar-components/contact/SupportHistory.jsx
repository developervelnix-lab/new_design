import React, { useState, useEffect } from 'react';
import {
  FaHistory, FaChevronRight, FaClock, FaUser,
  FaHeadset, FaArrowLeft, FaInbox, FaTicketAlt
} from 'react-icons/fa';
import { FONTS } from '../../../constants/theme';
import { API_URL } from '../../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Home page light theme tokens ── */
const C = {
  bg:       '#dde1e7',
  card:     '#ffffff',
  cardAlt:  '#f0f4f8',
  brand:    '#0e2040',
  brandMid: '#1a3668',
  gold:     '#22d3ee',
  goldDim:  'rgba(34,211,238,0.1)',
  goldBorder:'rgba(34,211,238,0.3)',
  text:     '#111827',
  muted:    '#6b7280',
  border:   'rgba(0,0,0,0.08)',
  rose:     '#f43f5e',
  amber:    '#f59e0b',
  blue:     '#3b82f6',
  green:    '#10b981',
};

const statusMeta = {
  open:        { label:'Open',        color:C.amber, bg:'rgba(245,158,11,0.1)'  },
  in_progress: { label:'In Progress', color:C.blue,  bg:'rgba(59,130,246,0.1)' },
  closed:      { label:'Closed',      color:C.green, bg:'rgba(16,185,129,0.1)' },
};
const getSM = s => statusMeta[s?.toLowerCase()] || { label:s, color:C.muted, bg:'rgba(107,114,128,0.1)' };

const SupportHistory = ({ onBack }) => {
  const [tickets, setTickets]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [hoverId, setHoverId]             = useState(null);

  useEffect(()=>{ fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const userId  = localStorage.getItem('account_id');
      const authKey = localStorage.getItem('auth_secret_key');
      if (!userId || !authKey) { setLoading(false); return; }
      const res    = await fetch(`${API_URL}?USER_ID=${userId}`, { method:'GET', headers:{ Route:'route-get-user-tickets', AuthToken:authKey } });
      const result = await res.json();
      if (result.status_code==='success') setTickets(result.data);
    } catch(err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const TicketCard = ({ ticket, idx }) => {
    const sm      = getSM(ticket.status);
    const hovered = hoverId === idx;
    return (
      <motion.div
        layout
        initial={{ opacity:0, y:16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay: idx * 0.04 }}
        onClick={()=>setSelectedTicket(ticket)}
        onMouseEnter={()=>setHoverId(idx)}
        onMouseLeave={()=>setHoverId(null)}
        style={{
          background:   hovered ? '#f8fafc' : C.card,
          border:       `1px solid ${C.border}`,
          borderLeft:   `3px solid ${hovered ? C.gold : C.brand}`,
          borderRadius: 10,
          padding:      '16px 18px',
          cursor:       'pointer',
          transition:   'all 0.2s',
          boxShadow:    hovered ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:36, height:36, borderRadius:8, background: hovered ? C.goldDim : 'rgba(14,32,64,0.07)', border:`1px solid ${hovered ? C.goldBorder : 'rgba(14,32,64,0.12)'}`, display:'flex', alignItems:'center', justifyContent:'center', color: hovered ? C.gold : C.brand, fontSize:13, flexShrink:0, transition:'all 0.2s' }}>
              <FaTicketAlt/>
            </div>
            <div>
              <div style={{ fontFamily:FONTS.head, fontWeight:700, fontSize:13, color: hovered ? C.brand : C.text, transition:'color 0.2s', maxWidth:190, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {ticket.subject}
              </div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>#{ticket.ticket_id}</div>
            </div>
          </div>
          <div style={{ padding:'3px 10px', borderRadius:20, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', background:sm.bg, color:sm.color, border:`1px solid ${sm.color}25`, flexShrink:0 }}>
            {sm.label}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:C.muted }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <FaClock size={10}/>
            <span>{new Date(ticket.created_at).toLocaleDateString('en-US',{ day:'numeric', month:'short', year:'numeric' })}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, color: hovered ? C.brand : C.muted, transition:'color 0.2s, transform 0.2s', transform: hovered ? 'translateX(4px)' : 'none' }}>
            <span style={{ fontWeight:600 }}>Open thread</span>
            <FaChevronRight size={10}/>
          </div>
        </div>
      </motion.div>
    );
  };

  const ConversationThread = ({ ticket }) => {
    const sm = getSM(ticket.status);
    return (
      <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <button
            onClick={()=>setSelectedTicket(null)}
            style={{ display:'flex', alignItems:'center', gap:6, background:C.card, border:`1.5px solid ${C.border}`, borderRadius:7, padding:'8px 14px', cursor:'pointer', color:C.brand, fontFamily:FONTS.head, fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.brand;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=C.brand;}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.card;e.currentTarget.style.color=C.brand;e.currentTarget.style.borderColor=C.border;}}
          >
            <FaArrowLeft size={10}/> Back to Tickets
          </button>
          <div style={{ padding:'5px 12px', borderRadius:20, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', background:sm.bg, color:sm.color, border:`1px solid ${sm.color}25` }}>
            {sm.label}
          </div>
        </div>

        {/* Summary card — dark navy brand */}
        <div style={{ background:`linear-gradient(135deg, ${C.brand}, ${C.brandMid})`, borderRadius:12, padding:'20px 22px', marginBottom:16 }}>
          <h3 style={{ fontFamily:FONTS.head, fontSize:16, fontWeight:800, color:'#fff', margin:'0 0 6px' }}>{ticket.subject}</h3>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.6, margin:'0 0 10px' }}>{ticket.message}</p>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(255,255,255,0.4)' }}>
            <FaClock size={10}/>
            <span>Opened {new Date(ticket.created_at).toLocaleDateString('en-US',{ weekday:'short', day:'numeric', month:'short', year:'numeric' })}</span>
          </div>
        </div>

        {/* Replies */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {ticket.replies.map((reply,i)=>{
            const isAdmin = reply.sender_type === 'admin';
            return (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: isAdmin ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  maxWidth:'80%',
                  padding:'12px 16px',
                  borderRadius: isAdmin ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: isAdmin ? C.card : `linear-gradient(135deg, ${C.brand}, ${C.brandMid})`,
                  border: `1px solid ${isAdmin ? C.border : 'rgba(14,32,64,0.3)'}`,
                  fontSize:13, color: isAdmin ? C.text : '#fff', lineHeight:1.6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color: isAdmin ? C.gold : 'rgba(255,255,255,0.6)' }}>
                    {isAdmin ? <FaHeadset size={9}/> : <FaUser size={9}/>}
                    <span>{isAdmin ? 'Support Team' : 'You'}</span>
                    <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color: isAdmin ? C.muted : 'rgba(255,255,255,0.4)' }}>
                      · {new Date(reply.created_at).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  {reply.message}
                </div>
              </div>
            );
          })}
        </div>

        {ticket.status !== 'closed' && (
          <div style={{ marginTop:20, padding:'12px 16px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8 }}>
            <p style={{ fontSize:11, color:'#d97706', margin:0 }}>💬 Dashboard replies coming soon. For urgent help, use live chat.</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div style={{ fontFamily:FONTS.ui, color:C.text }}>

      {/* Header — home page section-title style */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:10, background:'linear-gradient(90deg, #172033 0%, #0e2040 56%, #22d3ee 100%)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 10px 24px rgba(14,32,64,0.22)' }}>
          <div style={{ width:4, height:14, borderRadius:99, background:'rgba(255,255,255,0.85)', boxShadow:'0 0 10px rgba(255,255,255,0.3)' }}/>
          <FaHistory style={{ color:'#fff', fontSize:12 }}/>
          <span style={{ fontFamily:FONTS.head, fontWeight:800, fontSize:13, letterSpacing:'1.2px', textTransform:'uppercase', color:'#fff' }}>My Support Tickets</span>
        </div>
        <button
          onClick={onBack}
          style={{ padding:'8px 16px', background:'transparent', border:`1.5px solid ${C.brand}`, borderRadius:7, cursor:'pointer', color:C.brand, fontFamily:FONTS.head, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background=C.brand;e.currentTarget.style.color='#fff';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.brand;}}
        >
          + New Ticket
        </button>
      </div>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:14 }}>
            <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTopColor:C.brand, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
            <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:C.muted }}>Loading tickets...</p>
          </div>
        ) : selectedTicket ? (
          <AnimatePresence mode="wait">
            <ConversationThread ticket={selectedTicket}/>
          </AnimatePresence>
        ) : tickets.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {tickets.map((ticket,i)=><TicketCard key={i} ticket={ticket} idx={i}/>)}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, textAlign:'center', padding:'0 20px' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(14,32,64,0.07)', border:`1px solid rgba(14,32,64,0.12)`, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(14,32,64,0.25)', fontSize:26, marginBottom:18 }}>
              <FaInbox/>
            </div>
            <h3 style={{ fontFamily:FONTS.head, fontSize:16, fontWeight:800, color:C.text, margin:'0 0 8px' }}>No Tickets Found</h3>
            <p style={{ fontSize:12, color:C.muted, margin:'0 0 20px', lineHeight:1.6 }}>You haven't submitted any support tickets yet.</p>
            <button
              onClick={onBack}
              style={{ padding:'11px 24px', background:`linear-gradient(90deg, ${C.brand}, ${C.brandMid})`, border:'none', borderRadius:8, cursor:'pointer', color:'#fff', fontFamily:FONTS.head, fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', boxShadow:'0 4px 16px rgba(14,32,64,0.35)' }}
            >Submit a Ticket</button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SupportHistory;
