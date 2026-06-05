import React, { useState, useRef } from 'react';
import {
  FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaTelegramPlane,
  FaInstagram, FaFacebookF, FaTwitter, FaPaperPlane,
  FaCheckCircle, FaTicketAlt, FaPaperclip, FaTimes, FaUser,
  FaExclamationTriangle, FaHistory, FaHeadphones,
  FaBolt, FaLock, FaShieldAlt
} from 'react-icons/fa';
import { FONTS } from '../../../constants/theme';
import { useSite } from '../../../context/SiteContext';
import { API_URL } from '../../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Home page light theme tokens ── */
const C = {
  bg:       '#dde1e7',        /* same as .rana-layout */
  card:     '#ffffff',
  cardAlt:  '#f0f4f8',
  brand:    '#0e2040',        /* --brand */
  brandMid: '#1a3668',
  gold:     '#22d3ee',        /* --gold  */
  goldDim:  'rgba(34,211,238,0.12)',
  goldBorder:'rgba(34,211,238,0.3)',
  text:     '#111827',
  muted:    '#6b7280',
  border:   'rgba(0,0,0,0.08)',
  borderBrand: 'rgba(14,32,64,0.15)',
  rose:     '#f43f5e',
  green:    '#10b981',
};

const inputStyle = {
  width: '100%',
  background: '#f8fafc',
  border: `1px solid rgba(0,0,0,0.12)`,
  borderRadius: 8,
  padding: '11px 14px',
  color: C.text,
  fontSize: 13,
  fontFamily: FONTS.ui,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block',
  fontFamily: FONTS.head,
  fontWeight: 700,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: C.muted,
  marginBottom: 6,
};

const ContactUs = (props) => {
  const { accountInfo } = useSite();
  const fileInputRef    = useRef(null);
  const [focus, setFocus] = useState(null);

  const [formData, setFormData]   = useState({ name:'', email:'', subject:'', message:'', priority:'Medium', profile_id:'' });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [ticketId, setTicketId]       = useState('');
  const [notification, setNotification] = useState({ isOpen:false, message:'', type:'success' });

  const handleChange    = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange= e => setAttachments([...attachments, ...Array.from(e.target.files)]);
  const removeAttachment= i => setAttachments(attachments.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userId  = localStorage.getItem('account_id') || 'guest';
      const authKey = localStorage.getItem('auth_secret_key') || 'guest';
      const body    = new FormData();
      Object.keys(formData).forEach(k => body.append(k, formData[k]));
      body.append('USER_ID', userId);
      attachments.forEach(f => body.append('attachments[]', f));
      const res    = await fetch(API_URL, { method:'POST', headers:{ Route:'route-submit-ticket', AuthToken:authKey }, body });
      const result = await res.json();
      if (result.status_code === 'success') {
        setTicketId(result.ticket_id || 'TKT-' + Date.now());
        setNotification({ isOpen:true, message:'Ticket submitted! Our team will contact you shortly.', type:'success' });
        setFormData({ name:'', email:'', subject:'', message:'', priority:'Medium', profile_id:'' });
        setAttachments([]);
      } else {
        setNotification({ isOpen:true, message:`Submission failed: ${result.status_code || 'Unknown Error'}`, type:'error' });
      }
    } catch {
      setNotification({ isOpen:true, message:'Network error. Please check your connection.', type:'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const socialIconMap = {
    whatsapp:  { icon:<FaWhatsapp />,      color:'#25D366', prefix:'https://wa.me/' },
    telegram:  { icon:<FaTelegramPlane />, color:'#0088cc', prefix:'' },
    instagram: { icon:<FaInstagram />,     color:'#E1306C', prefix:'' },
    facebook:  { icon:<FaFacebookF />,     color:'#1877F2', prefix:'' },
    twitter:   { icon:<FaTwitter />,       color:'#1DA1F2', prefix:'' },
  };

  const fs = (name) => focus === name ? { borderColor: C.gold, boxShadow:`0 0 0 3px rgba(34,211,238,0.15)`, background:'#fff' } : {};
  const Inp = ({ style, ...p }) => <input style={{ ...inputStyle, ...style, ...fs(p.name) }} onFocus={()=>setFocus(p.name)} onBlur={()=>setFocus(null)} {...p} />;
  const Sel = ({ style, children, ...p }) => <select style={{ ...inputStyle, ...style, cursor:'pointer', ...fs(p.name) }} onFocus={()=>setFocus(p.name)} onBlur={()=>setFocus(null)} {...p}>{children}</select>;
  const Tex = ({ style, ...p }) => <textarea style={{ ...inputStyle, ...style, resize:'none', ...fs(p.name) }} onFocus={()=>setFocus(p.name)} onBlur={()=>setFocus(null)} {...p} />;

  return (
    <div style={{ fontFamily: FONTS.ui, color: C.text }}>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {notification.isOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(14,32,64,0.7)', backdropFilter:'blur(8px)' }}>
            <motion.div
              initial={{ scale:0.85, opacity:0, y:30 }}
              animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:0.85, opacity:0 }}
              style={{ background:C.card, border:`1px solid ${notification.type==='success' ? C.goldBorder : 'rgba(244,63,94,0.3)'}`, borderRadius:16, padding:'36px 28px', maxWidth:360, width:'90%', textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            >
              <div style={{ width:60, height:60, borderRadius:'50%', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, background: notification.type==='success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', color: notification.type==='success' ? C.green : C.rose }}>
                {notification.type==='success' ? <FaCheckCircle/> : <FaExclamationTriangle/>}
              </div>
              <h3 style={{ fontFamily:FONTS.head, fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>{notification.type==='success' ? 'Ticket Received!' : 'Something Went Wrong'}</h3>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom: notification.type==='success' ? 16 : 24 }}>{notification.message}</p>
              {notification.type==='success' && (
                <div style={{ padding:'10px 16px', background:C.cardAlt, border:`1px solid ${C.border}`, borderRadius:8, marginBottom:22 }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, marginBottom:4 }}>Your Ticket ID</div>
                  <div style={{ fontSize:15, fontWeight:800, color:C.brand, fontFamily:FONTS.head }}>{ticketId}</div>
                </div>
              )}
              <button onClick={()=>setNotification({...notification,isOpen:false})}
                style={{ width:'100%', padding:'13px 0', borderRadius:8, border:'none', cursor:'pointer', background:`linear-gradient(90deg, ${C.brand}, ${C.brandMid})`, color:'#fff', fontFamily:FONTS.head, fontWeight:800, fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase' }}>
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:14, marginBottom:14 }}>
        {/* Left banner */}
        <div style={{ background:`linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 60%, #1e4080 100%)`, borderRadius:14, padding:'32px 28px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-50, right:-50, width:220, height:220, borderRadius:'50%', background:`radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)`, pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.9)', fontFamily:FONTS.head, fontWeight:700, fontSize:10, letterSpacing:'1.5px', textTransform:'uppercase', padding:'5px 12px', borderRadius:4, marginBottom:14, backdropFilter:'blur(4px)' }}>
              <FaHeadphones size={9}/> Support Center
            </div>
            <h1 style={{ fontFamily:FONTS.head, fontWeight:900, fontSize:30, lineHeight:1.2, color:'#fff', margin:'0 0 10px' }}>
              We're here to<br/><span style={{ color:C.gold }}>help you 24/7</span>
            </h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.6, margin:0 }}>
              Submit a support ticket and our dedicated team will get back to you as fast as possible.
            </p>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:22, flexWrap:'wrap', position:'relative' }}>
            {[{icon:<FaBolt/>,label:'Fast Response'},{icon:<FaLock/>,label:'Secure & Private'},{icon:<FaShieldAlt/>,label:'24/7 Available'}].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 11px', background:'rgba(255,255,255,0.1)', borderRadius:6, backdropFilter:'blur(4px)' }}>
                <span style={{ color:C.gold, fontSize:10 }}>{item.icon}</span>
                <span style={{ fontSize:10, fontFamily:FONTS.head, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[{label:'Avg. Response',val:'< 2 hrs',icon:'⚡'},{label:'Issues Solved',val:'98.7%',icon:'✅'},{label:'Support Agents',val:'Always On',icon:'🎧'}].map((s,i)=>(
            <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, flex:1, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily:FONTS.head, fontWeight:800, fontSize:15, color:C.brand }}>{s.val}</div>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:C.muted, marginTop:2 }}>{s.label}</div>
              </div>
            </div>
          ))}
          {localStorage.getItem('account_id') && (
            <button onClick={props.onShowHistory}
              style={{ padding:'12px 0', background:C.card, border:`1.5px solid ${C.brand}`, borderRadius:10, cursor:'pointer', color:C.brand, fontFamily:FONTS.head, fontWeight:700, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.brand;e.currentTarget.style.color='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.card;e.currentTarget.style.color=C.brand;}}
            ><FaHistory size={12}/> View My Tickets</button>
          )}
        </div>
      </div>

      {/* ── INFO TILES ── */}
      {(accountInfo?.service_address || accountInfo?.service_social_links?.length > 0) && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12, marginBottom:14 }}>
          {accountInfo?.service_address && (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ width:34, height:34, borderRadius:8, background:C.goldDim, border:`1px solid ${C.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, flexShrink:0 }}>
                <FaMapMarkerAlt size={13}/>
              </div>
              <div>
                <div style={{ fontFamily:FONTS.head, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:C.muted, marginBottom:4 }}>Our Location</div>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{accountInfo.service_address}</div>
              </div>
            </div>
          )}
          {accountInfo?.service_social_links?.length > 0 && (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:FONTS.head, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:C.muted, marginBottom:12 }}>Connect With Us</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {accountInfo.service_social_links.map((link,i)=>{
                  const platform = link.platform.toLowerCase();
                  let url = link.value;
                  const meta = socialIconMap[platform] || socialIconMap.telegram;
                  if (platform==='whatsapp' && !url.includes('wa.me')) url = meta.prefix + url.replace(/\s+/g,'');
                  else if (!url.startsWith('http')) url = 'https://' + url;
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:`${meta.color}15`, border:`1px solid ${meta.color}30`, color:meta.color, fontSize:15, textDecoration:'none', transition:'transform 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.12)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                    >{meta.icon}</a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FORM ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        {/* Title bar — matches home page section-title gradient */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px', background:'linear-gradient(90deg, #172033 0%, #0e2040 56%, #22d3ee 100%)', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:4, height:16, borderRadius:99, background:'rgba(255,255,255,0.85)', boxShadow:'0 0 10px rgba(255,255,255,0.3)' }}/>
            <FaTicketAlt style={{ color:'#fff', fontSize:12 }}/>
            <span style={{ fontFamily:FONTS.head, fontWeight:800, fontSize:13, letterSpacing:'1.2px', textTransform:'uppercase', color:'#fff' }}>Submit Support Ticket</span>
          </div>
          <span style={{ fontSize:10, fontFamily:FONTS.head, fontWeight:600, color:'rgba(255,255,255,0.55)' }}>Avg. reply in 2 hrs</span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:'22px 22px 26px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <Inp type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Your name"/>
            </div>
            <div>
              <label style={labelStyle}>Profile ID <span style={{ color:'rgba(107,114,128,0.5)' }}>(Optional)</span></label>
              <div style={{ position:'relative' }}>
                <Inp type="text" name="profile_id" value={formData.profile_id} onChange={handleChange} placeholder="User ID" style={{ paddingLeft:36 }}/>
                <FaUser style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.muted, fontSize:11 }}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <Inp type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="your@email.com"/>
            </div>
            <div>
              <label style={labelStyle}>Priority Level</label>
              <Sel name="priority" required value={formData.priority} onChange={handleChange}>
                <option value="Low">🟢  Low Priority</option>
                <option value="Medium">🟡  Medium Priority</option>
                <option value="High">🔴  High Priority</option>
              </Sel>
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>Category / Subject</label>
            <Sel name="subject" required value={formData.subject} onChange={handleChange}>
              <option value="">Choose a category...</option>
              <option value="Deposit Issue">Deposit Issue</option>
              <option value="Withdrawal Issue">Withdrawal Issue</option>
              <option value="Account Issue">Account Issue</option>
              <option value="Game Issue">Game Issue</option>
              <option value="Bonus/Promotion">Bonus / Promotion</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Other">Other</option>
            </Sel>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>Message</label>
            <Tex name="message" required rows={5} value={formData.message} onChange={handleChange} placeholder="Describe your issue in as much detail as possible..."/>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={labelStyle}>Attachments <span style={{ color:'rgba(107,114,128,0.5)' }}>(Optional)</span></label>
            <div
              onClick={()=>fileInputRef.current?.click()}
              style={{ border:`2px dashed rgba(0,0,0,0.12)`, borderRadius:8, padding:'16px', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s, background 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.background='rgba(34,211,238,0.04)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,0,0,0.12)';e.currentTarget.style.background='transparent';}}
            >
              <FaPaperclip style={{ fontSize:18, color:C.muted, display:'block', margin:'0 auto 6px' }}/>
              <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Click to upload files (images, PDF, doc)</span>
              <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} style={{ display:'none' }} accept="image/*,.pdf,.doc,.docx"/>
            </div>
            {attachments.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
                {attachments.map((f,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:C.cardAlt, border:`1px solid ${C.border}`, borderRadius:6 }}>
                    <span style={{ fontSize:11, color:C.text, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                    <button type="button" onClick={()=>removeAttachment(i)} style={{ background:'none', border:'none', cursor:'pointer', color:C.rose, padding:0 }}><FaTimes size={10}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit" disabled={submitting}
            style={{ width:'100%', padding:'14px 0', borderRadius:8, border:'none', cursor:submitting?'not-allowed':'pointer', background:submitting?'rgba(0,0,0,0.15)':`linear-gradient(90deg, ${C.brand} 0%, ${C.brandMid} 100%)`, color:'#fff', fontFamily:FONTS.head, fontWeight:800, fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:submitting?0.7:1, transition:'opacity 0.2s, transform 0.15s', boxShadow:submitting?'none':`0 4px 20px rgba(14,32,64,0.35)` }}
            onMouseEnter={e=>{if(!submitting)e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}
          >
            {submitting
              ? <><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite' }}/> Submitting...</>
              : <><FaPaperPlane style={{ fontSize:13 }}/> Send Support Ticket</>
            }
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #fff; color: #111827; }
      `}</style>
    </div>
  );
};

export default ContactUs;
