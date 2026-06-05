import React from "react";
import { FaCookieBite, FaDatabase, FaLock, FaShieldAlt, FaUserCheck } from "react-icons/fa";
import RanaHeader from "@/components/home/ranamatch/RanaHeader";
import "@/assets/css/ranamatch.css";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <FaUserCheck />,
      title: "About Us",
      content:
        "We are the flagship brand offering services through the Platform. Any person using the Platform or participating in contests is bound by this Privacy Policy.",
    },
    {
      icon: <FaDatabase />,
      title: "Information We Collect",
      content:
        "We collect information supplied by users and information automatically tracked during navigation to improve the platform experience.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Purpose and Usage",
      content:
        "Certain features may require username, email address, date of birth, state, government ID, device details, network information, and location-related information.",
    },
    {
      icon: <FaLock />,
      title: "Disclosure & Sharing",
      content:
        "Information may be shared with affiliates, group entities, or third-party service providers for analytics, storage, and service improvement under protective measures.",
    },
    {
      icon: <FaCookieBite />,
      title: "Cookies",
      content:
        "Cookies and similar electronic tools help us understand preferences, improve services, and provide a better user experience.",
    },
    {
      icon: <FaLock />,
      title: "Security & Retention",
      content:
        "Information is stored in controlled databases with restricted access. Data is retained only as long as necessary for business or legal requirements.",
    },
  ];

  return (
    <div className="finance-route-shell legal-route-shell min-h-screen">
      <RanaHeader />
      <main className="finance-route-main legal-route-main">
        <section className="legal-v2 legal-v2-privacy">
          <div className="legal-v2-hero split">
            <div>
              <span className="legal-v2-kicker">Data Protection</span>
              <h1>Privacy Policy</h1>
              <p>How we collect, protect, use, disclose, retain, and manage information connected with your platform activity.</p>
            </div>
            <div className="legal-v2-hero-icon"><FaLock /></div>
          </div>

          <div className="legal-v2-care-panel privacy">
            <FaShieldAlt />
            <div>
              <strong>Your consent matters</strong>
              <p>By using any part of the Platform, you consent to the collection, use, disclosure, and transfer of your information for the purposes outlined in this policy.</p>
            </div>
          </div>

          <div className="legal-v2-privacy-grid">
            {sections.map((section, index) => (
              <article key={section.title} className="legal-v2-privacy-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="legal-v2-privacy-icon">{section.icon}</div>
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </article>
            ))}
          </div>

          <div className="legal-v2-bottom-callout">
            <strong>Contact Us</strong>
            <p>If you have any queries regarding this Privacy Policy, contact support through the details provided on the platform.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
