import React from 'react'
import { useSearchParams } from 'react-router-dom'
import ContactUs from '../sidebar-components/contact/ContactUs'
import SupportHistory from '../sidebar-components/contact/SupportHistory'
import RanaHeader from '../home/boldvelocity/RanaHeader'
import AuthModalHost from '../common/AuthModalHost'
import '../../assets/css/ranamatch.css'

function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'contact';

  const setShowHistory = () => {
    setSearchParams({ view: 'history' });
  };

  const setShowContact = () => {
    setSearchParams({}); // Back to default
  };

  return (
    <div className="rana-layout category-route support-route">
      <AuthModalHost />
      <RanaHeader />
      <div className="support-header-gap" aria-hidden="true" />
      <main className="support-page-main">
        <div className="support-page-shell">
          {view === 'history' ? (
            <SupportHistory onBack={setShowContact} />
          ) : (
            <ContactUs onShowHistory={setShowHistory} />
          )}
        </div>
      </main>
    </div>
  )
}

export default SupportPage
