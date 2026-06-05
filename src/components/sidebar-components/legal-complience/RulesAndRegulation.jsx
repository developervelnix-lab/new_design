import React, { useState } from 'react';
import { FaBookOpen, FaChevronDown, FaChevronUp, FaGavel, FaShieldAlt } from 'react-icons/fa';

const Section = ({ title, eyebrow, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={`legal-v2-accordion ${open ? 'open' : ''}`}>
      <button type="button" onClick={() => setOpen(!open)} className="legal-v2-accordion-head">
        <span>
          <small>{eyebrow}</small>
          <strong>{title}</strong>
        </span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {open && <div className="legal-v2-accordion-body">{children}</div>}
    </article>
  );
};

const RulesAndRegulation = () => {
  return (
    <section className="legal-v2 legal-v2-rules">
      <div className="legal-v2-hero">
        <div>
          <span className="legal-v2-kicker">Legal Compliance</span>
          <h1>Rules & Regulations</h1>
          <p>Understand market rules, settlement policies, customer responsibility, and sport-specific betting conditions before placing wagers.</p>
        </div>
        <div className="legal-v2-hero-icon"><FaGavel /></div>
      </div>

      <div className="legal-v2-stats">
        <div><FaBookOpen /><strong>General Rules</strong><span>Platform-wide betting conduct</span></div>
        <div><FaShieldAlt /><strong>Market Safety</strong><span>Fair settlement and integrity</span></div>
        <div><FaGavel /><strong>Sport Rules</strong><span>Cricket and soccer references</span></div>
      </div>

      <div className="legal-v2-grid">
        <aside className="legal-v2-side-note">
          <strong>Read Before Play</strong>
          <p>Customers are responsible for understanding the rules affecting any market they choose to bet on, including in-play and one-click betting actions.</p>
        </aside>

        <div className="legal-v2-stack">
          <Section title="Introduction" eyebrow="Part A" defaultOpen>
            <p>These Rules and Regulations are part of the terms and conditions and apply to all bets placed on this online betting platform.</p>
            <ul>
              <li>Introduction Section, Part A.</li>
              <li>General Rules, Part B.</li>
              <li>Specific Sports Rules, Part C.</li>
            </ul>
            <p>The General Rules apply to all bets unless stated otherwise in the Specific Sports Rules. If there is inconsistency, the Specific Sports Rules prevail.</p>
          </Section>

          <Section title="General Rules" eyebrow="Part B">
            <h3>Matters Beyond Reasonable Control</h3>
            <p>The Site is not liable for loss or damage caused by events outside reasonable control, including power cuts, government action, telecommunication issues, labour disputes, or third-party delays.</p>
            <h3>In-Play Markets</h3>
            <p>If a market is not suspended at the relevant time, bets matched after the scheduled off time may be void. Customers are responsible for managing in-play bets at all times.</p>
            <h3>Settlement</h3>
            <p>Markets are settled according to sport-specific rules. Where not specified, settlement follows the official result of the governing body.</p>
            <h3>Account Integrity</h3>
            <p>Multiple accounts, VPN/proxy masking, cheating, and activity under integrity investigation may result in voided bets or withheld winnings.</p>
          </Section>

          <Section title="Cricket Rules" eyebrow="Part C">
            <p>If a ball is not bowled during a competition, series, or match, all bets will be void except markets already unconditionally determined.</p>
            <p>If weather shortens a match, bets settle according to the official result, including the Duckworth Lewis method where applicable.</p>
            <p>Session, innings, and player run markets are settled according to their stated format. Extras and penalty runs may be included unless stated otherwise.</p>
          </Section>

          <Section title="Soccer Rules" eyebrow="Part C">
            <p>If a market scheduled to be in-play is not suspended at kick-off and does not turn in-play, bets matched after the scheduled kick-off may be void.</p>
            <p>Material Events include goals, penalties, and red cards. Bets unfairly matched after such events may be voided.</p>
            <p>Where a Material Event is cancelled due to VAR, bets matched between the event and cancellation may be void.</p>
          </Section>
        </div>
      </div>
    </section>
  );
};

export default RulesAndRegulation;
