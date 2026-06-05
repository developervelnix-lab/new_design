import React from 'react';
import { FaCalendarAlt, FaHeart, FaPauseCircle, FaShieldAlt, FaUserShield } from 'react-icons/fa';

const ResponsibleGambling = () => {
  const tools = [
    {
      icon: <FaCalendarAlt />,
      title: "Set Deposit Limits",
      text: "Choose a deposit limit per day, week, or month to keep activity within a planned budget.",
    },
    {
      icon: <FaPauseCircle />,
      title: "Use Time Out",
      text: "Temporarily suspend account activity for 24 hours, one week, one month, or another reasonable period up to 6 weeks.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Self Exclusion",
      text: "Block account access for a minimum period of six months. Self-exclusion cannot be undone until the period ends.",
    },
  ];

  return (
    <section className="legal-v2 legal-v2-responsible">
      <div className="legal-v2-hero">
        <div>
          <span className="legal-v2-kicker">Player Welfare</span>
          <h1>Responsible Gambling</h1>
          <p>We aim to provide a safe and fair environment. If gambling feels difficult to control, use the protection tools below.</p>
        </div>
        <div className="legal-v2-hero-icon"><FaUserShield /></div>
      </div>

      <div className="legal-v2-care-panel">
        <FaHeart />
        <div>
          <strong>Play with control</strong>
          <p>Betting should remain entertainment. These tools are available to help customers manage activity, take breaks, and protect themselves from harm.</p>
        </div>
      </div>

      <div className="legal-v2-tool-grid">
        {tools.map((tool, index) => (
          <article key={tool.title} className="legal-v2-tool-card">
            <span>{index + 1}</span>
            <div className="legal-v2-tool-icon">{tool.icon}</div>
            <h2>{tool.title}</h2>
            <p>{tool.text}</p>
          </article>
        ))}
      </div>

      <div className="legal-v2-bottom-callout">
        <strong>Need help?</strong>
        <p>If you feel you may have a gambling problem, contact support and request account limits, timeout, or exclusion assistance.</p>
      </div>
    </section>
  );
};

export default ResponsibleGambling;
