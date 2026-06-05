import React from 'react';
import { FaBan, FaClock, FaHeadset, FaLock, FaShieldAlt } from 'react-icons/fa';

const ExclusionPolicy = () => {
  const questions = [
    {
      q: "What is Self-Exclusion?",
      a: "Self-exclusion helps customers who feel their gambling is out of control. Once agreed, access to the account can be blocked for a specific period selected by the customer.",
    },
    {
      q: "How to self-exclude",
      a: "Submit the request through WhatsApp and mention the period you want. The minimum period is 6 months and the maximum period is 5 years.",
    },
    {
      q: "How fast is it activated?",
      a: "We endeavour to apply exclusion as soon as practically possible. Normally, password access can be reset within 24 hours of the request.",
    },
    {
      q: "Can the account be reactivated?",
      a: "Self-excluded accounts cannot be reactivated during the exclusion period. After the period ends, you must contact support and may be subject to a 24-hour waiting period.",
    },
  ];

  const outcomes = [
    "Marketing messages are stopped.",
    "Customer details are removed from marketing databases.",
    "Site access is suspended for the requested period.",
    "Funds owed can be returned if the account is permanently closed.",
  ];

  return (
    <section className="legal-v2 legal-v2-exclusion">
      <div className="legal-v2-hero split">
        <div>
          <span className="legal-v2-kicker">Player Protection</span>
          <h1>Self Exclusion</h1>
          <p>A structured protection process for customers who need to pause or block account access for a defined period.</p>
        </div>
        <div className="legal-v2-hero-icon"><FaBan /></div>
      </div>

      <div className="legal-v2-process">
        <div><FaHeadset /><strong>Request</strong><span>Contact support via WhatsApp</span></div>
        <div><FaClock /><strong>Review</strong><span>Usually handled within 24 hours</span></div>
        <div><FaLock /><strong>Restrict</strong><span>Account access is suspended</span></div>
      </div>

      <div className="legal-v2-grid">
        <aside className="legal-v2-side-note strong">
          <FaShieldAlt />
          <strong>Important</strong>
          <p>During self-exclusion, customers must not attempt to create new accounts, reopen existing accounts, or place bets using another customer’s account.</p>
        </aside>

        <div className="legal-v2-card-list">
          {questions.map((item, index) => (
            <article key={item.q} className="legal-v2-info-card">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{item.q}</h2>
                <p>{item.a}</p>
              </div>
            </article>
          ))}

          <article className="legal-v2-info-card wide">
            <span>05</span>
            <div>
              <h2>What happens after exclusion?</h2>
              <ul>
                {outcomes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ExclusionPolicy;
